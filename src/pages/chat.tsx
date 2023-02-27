import React, { useState, useEffect } from 'react';
import SocketIOClient from "socket.io-client";
import Message from '../components/Message';
import Navigation from '../components/Navbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



type Msg = {
    avatar?: string;
    message: string;
    message_id: number;
    sender_id: number;
    time: string;
    username: string;
}


export default function Chat() {
    const [messages, setMessages] = useState(Array<Msg>);
    const [newBody, setBody] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [senderId, setSenderId] = useState(null);
    const [senderAvatar, setSenderAvatar] = useState(null);
    const [connected, setConnected] = useState<boolean>(false);
  
    useEffect(() => {
      const socket = SocketIOClient.connect('localhost:3000', {
        path: "/api/socket",
        });

      // log socket connection
        socket.on("connect", () => {
        console.log("SOCKET CONNECTED!", socket.id);
        setConnected(true);
      });

      // update chat on new message dispatched
        socket.on("message", (message: Msg) => {
        if (message.message) {
            fetchAllMessages();
          }
      });

      const fetchAndSetSenderId = async () => {
        try {
          const response = await fetch('/api/userid'); // update endpoint when ready
          const userId = await response.json();
          setSenderId(userId.user_id); // update properties to match up if needed
          setSenderAvatar(userId.avatar);
        } catch (err) {
          console.log(err);
        }
      };

      const startAiTransmit = async () => {
        try {
          const response = await fetch('/api/ai'); // update endpoint when ready
          console.log(response);
        } catch (err) {
          console.log(err);
        }
      };
  
      const fetchAllMessages = async () => {
        try {
          const response = await fetch('/api/messages');
          if (response.status === 200) {
            const body = await response.json();
            setBody(body);
            console.log(body)
            setMessages(body.messages);
          } else {
            const error = await response.json();
            throw new Error(error.message);
          }
        } catch (err) {
          console.log(err);
        }
      };
      setTimeout(async () => {
        await fetch('/api/ai');
      }, Math.random() * 10000 + 40000);
  
      fetchAndSetSenderId();
      fetchAllMessages();
      startAiTransmit();
    }, []);
    
    const messageElementList = newBody.map((message: any) => (
      <Message
            key={message.message_id}
            message={message.message}
            avatar={message.avatar} 
            message_id={message.message_id} 
            sender_id={message.sender_id} 
            time={message.time} 
            username={message.username} />
    ));
  
    // Handler to update state of controlled input
    const handleMessageInput = (e: { target: { value: React.SetStateAction<string>; }; }) => setMessageInput(e.target.value);
  
    // Handler to create a new message
    const handleMessageSend = async () => {
    const message = {
        sender_id: '254',
        message: messageInput,
        avatar: senderAvatar,
        };
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      // reset field if OK
      if (resp.ok) setMessageInput("");
    }
  
    return (
      <>
        <Navigation/>
        <div className="chatroom">
          <div className="messages">
            <div>{messageElementList}</div>
          </div>
  
          <div className="message-input">
            <Form.Control
              placeholder="Say something to the chat..."
              value={messageInput}
              onChange={handleMessageInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMessageSend();
              }}
            />
            <Button variant="dark" onClick={handleMessageSend}>
              Send
            </Button>
          </div>
        </div>
      </>
    );
  };
  