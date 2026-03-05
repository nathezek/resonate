import { useEffect, useRef, useState } from 'react';
import './App.css'

type AGENT_MESSAGE = {
    data: string;
    type: string;
}

function App() {

    const [input, setInput] = useState('');
    const [agent_response, setAgentResponse] = useState<AGENT_MESSAGE>();
    const ws = useRef < WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:3001/ws");
        ws.current.onmessage = (event) => {
            const data : AGENT_MESSAGE = JSON.parse(event.data);
            console.log("Agent:", data);
            setAgentResponse(data);

            return () => {
                ws.current?.close();
            };
        };
    }, []);

    const sendMessage = (e: React.SubmitEvent) => {
        e.preventDefault();
        ws.current?.send(input);
        setInput('');
    };



  return (
      <>
          <form onSubmit={sendMessage}>
              <input type="text" placeholder='Write a message...' value={input} onChange={(e) => setInput(e.target.value)} />
              <button>Send</button>
          </form>
       <h1>Agent response</h1>
          <span className='lg:max-w-3xl'>
              {agent_response?.data}
          </span>
    </>
  )
}

export default App;
