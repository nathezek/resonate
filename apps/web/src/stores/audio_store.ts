import { create } from "zustand";
import { useKeyboardStore } from "./keyboard_store";
import { AudioStreamer } from "../lib/audio/audio_streamer";

export interface AudioState {
    micEnabled: boolean;
    streamer: AudioStreamer | null;
    socket: WebSocket | null;
    isConnected: boolean;
    initialize: () => void;
    toggleMic: () => void;
    turnMicOff: () => void;
    turnMicOn: () => void;
    connect: () => void;
    disconnect: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    micEnabled: false,
    streamer: null,
    socket: null,
    isConnected: false,

    initialize: () => {
        if (get().streamer) return;

        console.log("Initializing Audio Streamer...");
        const streamer = new AudioStreamer(
            (data: ArrayBuffer) => {
                // On Data Recorded (PCM 16kHz) -> Send to Socket
                const socket = get().socket;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    const base64 = btoa(
                        new Uint8Array(data)
                            .reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );

                    socket.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: "audio/pcm;rate=16000",
                                data: base64
                            }]
                        }
                    }));
                }
            },
            (err) => console.error("Audio Streamer Error:", err)
        );
        set({ streamer });
    },

    connect: () => {
        const { socket } = get();
        if (socket) return;

        console.log("Connecting to Backend WS...");
        const ws = new WebSocket("ws://localhost:8080/ws");

        ws.onopen = () => {
            console.log("WS Connected");
            set({ isConnected: true });
            get().initialize(); // Ensure streamer is ready
            get().streamer?.initialize(); // Init AudioContext
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const parts = data?.serverContent?.modelTurn?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData && part.inlineData.mimeType.startsWith("audio/pcm")) {
                            get().streamer?.playAudioChunk(part.inlineData.data);
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing WS message", e);
            }
        };

        ws.onclose = () => {
            console.log("WS Closed");
            set({ isConnected: false, socket: null });
        };

        set({ socket: ws });
    },

    disconnect: () => {
        const { socket, streamer } = get();
        if (socket) {
            socket.close();
        }
        if (streamer) {
            streamer.stopRecording();
        }
        set({ socket: null, isConnected: false });
    },

    toggleMic: () =>
        set((state) => {
            const nextState = !state.micEnabled;
            if (nextState) {
                // Turning ON
                useKeyboardStore.getState().disableKeyboard();
                state.streamer?.resumeContext();
                state.streamer?.startRecording();
            } else {
                // Turning OFF
                state.streamer?.stopRecording();
            }
            return { micEnabled: nextState };
        }),

    turnMicOff: () => {
        get().streamer?.stopRecording();
        set({ micEnabled: false });
    },

    turnMicOn: () => {
        const state = get();
        useKeyboardStore.getState().disableKeyboard();
        state.streamer?.resumeContext();
        state.streamer?.startRecording();
        set({ micEnabled: true });
    },
}));
