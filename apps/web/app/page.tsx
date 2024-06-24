"use client";
import { useState } from "react";
import { useSocket } from "../context/SocketProvider";
import '../../../packages/ui/global.css';

export default function Page() {
  const { sendMessage, messages, socketID, sendRoomId } = useSocket();
  const [message, setMessage] = useState("");
  const [roomId, setRoomId] = useState("")

  const handleSendMessage = () => {
    sendMessage(message , roomId);
    setMessage(""); 
  };

  const handleSendRoomId = () => {
    sendRoomId(roomId);
    // setRoomId("")
  };

  return (
    <div>
      <div style={{
         backgroundColor: '#f7fafc',
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         justifyContent: 'center',
         height: '10vh',
      }}> User-ID : {socketID}</div>
      <div
        style={{
          backgroundColor: '#f7fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '28rem',
            backgroundColor: '#ffffff',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <input
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #d2d6dc',
                borderRadius: '0.5rem',
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.5)',
                marginRight: '0.5rem',
              }}
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              placeholder="Type your message"
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: '0.5rem',
                backgroundColor: '#4299e1',
                color: '#ffffff',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = '#3182ce';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = '#4299e1';
              }}
            >
              Send Message
            </button>
          </div>
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <input
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #d2d6dc',
                borderRadius: '0.5rem',
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.5)',
                marginRight: '0.5rem',
              }}
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              placeholder="Enter room ID"
            />
            <button
              onClick={handleSendRoomId}
              style={{
                padding: '0.5rem',
                backgroundColor: '#4299e1',
                color: '#ffffff',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = '#3182ce';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = '#4299e1';
              }}
            >
              Join Room
            </button>
          </div>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem' }}>
            {messages.map((e, index) => (
              <li key={index} style={{ color: '#4a5568' }}>
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
