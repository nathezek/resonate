/**
 * Handles Audio Input (Microphone) and Output (Speaker) for Gemini Multimodal Live.
 * Input: Converts Microphone -> Float32 -> PCM 16kHz Int16 -> Stream
 * Output: Receives PCM 16kHz Int16 -> Float32 -> AudioContext Destination
 */
export class AudioStreamer {
    private context: AudioContext | null = null;
    private worklet: AudioWorkletNode | null = null;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private gainNode: GainNode | null = null;

    private isRecording: boolean = false;
    private isPlaying: boolean = false;

    // Queue for incoming audio chunks to play
    private nextStartTime: number = 0;

    private onData: (data: ArrayBuffer) => void;
    private onError: (err: Error) => void;

    constructor(
        onData: (data: ArrayBuffer) => void,
        onError: (err: Error) => void
    ) {
        this.onData = onData;
        this.onError = onError;
    }

    public async initialize() {
        if (this.context) return;

        // Gemini outputs 24kHz audio, so we need to match that sample rate
        this.context = new window.AudioContext({ sampleRate: 24000 });

        await this.context.resume();
        await this.loadWorklet();
    }

    private async loadWorklet() {
        if (!this.context) return;

        // Inline AudioWorklet Processor for processing input audio
        // This converts Float32 input to Int16 PCM
        const workletCode = `
      class PCMProcessor extends AudioWorkletProcessor {
        process(inputs, outputs, parameters) {
          const input = inputs[0];
          if (input.length > 0) {
            const float32Data = input[0];
            const int16Data = new Int16Array(float32Data.length);
            for (let i = 0; i < float32Data.length; i++) {
              const s = Math.max(-1, Math.min(1, float32Data[i]));
              int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
          }
          return true;
        }
      }
      registerProcessor("pcm-processor", PCMProcessor);
    `;

        const blob = new Blob([workletCode], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        await this.context.audioWorklet.addModule(url);
    }

    public async startRecording() {
        if (this.isRecording || !this.context) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                },
            });

            this.inputSource = this.context.createMediaStreamSource(stream);
            this.worklet = new AudioWorkletNode(this.context, "pcm-processor");

            this.worklet.port.onmessage = (event) => {
                this.onData(event.data);
            };

            this.inputSource.connect(this.worklet);
            this.worklet.connect(this.context.destination); // Connect to mute? No, don't connect to destination if we don't want self-monitoring.
            // Actually we usually DON'T want to hear ourselves.
            // So disconnect logic:
            // this.worklet.connect(this.context.destination); // REMOVED for echoless experience.

            this.isRecording = true;
        } catch (err: any) {
            this.onError(err);
        }
    }

    public stopRecording() {
        if (!this.isRecording) return;
        this.inputSource?.disconnect();
        this.worklet?.disconnect();
        this.isRecording = false;
    }

    public playAudioChunk(base64Audio: string) {
        if (!this.context) return;

        // Convert Base64 -> ArrayBuffer -> Float32Audio -> Play
        // Simple approach: Decode PCM16 manually (since we know format) or use decodeAudioData if it was a file, but here it's raw PCM usually.
        // Gemini WebSocket sends raw PCM usually in base64.

        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // bytes is Int16 (Little Endian)
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);

        for (let i = 0; i < int16Data.length; i++) {
            const int = int16Data[i];
            // Convert Int16 to Float32
            float32Data[i] = int < 0 ? int / 0x8000 : int / 0x7FFF;
        }

        // Schedule play - Gemini outputs 24kHz audio
        const buffer = this.context.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.context.destination);

        // Naive queuing to prevent overlap
        const now = this.context.currentTime;
        // If nextStartTime is in the past, reset it to now (plus small buffer)
        const playTime = Math.max(now, this.nextStartTime);

        source.start(playTime);
        this.nextStartTime = playTime + buffer.duration;
    }

    public async resumeContext() {
        if (this.context?.state === 'suspended') {
            await this.context.resume();
        }
    }
}
