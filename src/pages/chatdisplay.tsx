import React, { useState, useEffect, SyntheticEvent, ChangeEvent, MouseEvent, } from 'react';
import SocketIOClient from "socket.io-client";
import Message from '../components/Message';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Navbar } from 'react-bootstrap';

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
    const [topic, setTopic] = useState('');

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
            sendProducerMessage(message.message);
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
  
      const fetchAllMessages = async () => {
        try {
          const response = await fetch('/api/messages');
          if (response.status === 200) {
            const body = await response.json();
            setBody(body);
            //console.log(body)
            setMessages(body.messages);
          } else {
            const error = await response.json();
            throw new Error(error.message);
          }
        } catch (err) {
          console.log(err);
        }
      };
     
      startAiTransmit();
      fetchAndSetSenderId();
      fetchAllMessages();
    }, []);

    const submitHandler = (event: SyntheticEvent): void => {
        event.preventDefault();
        fetch('/api/kite/connect/kafka', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method: 'createTopics',
            topics: [topic !== '' ? topic : 'testTopic'],
          }),
        })
          .then((data) => console.log(data))
          .catch((error) => console.error(error));
          setTopic('');
      };


    const startAiTransmit = (): void => {
      setInterval(async () => {
        try {
          await fetch('/api/ai'); // update endpoint when ready
          //console.log(response);
        } catch (err) {
          console.log(err);
        }
      }, Math.random() * 10000 + 40000);
      
    };
    
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

    const sendProducerMessage = async (message: String) => {
      const sendMessage = {
          message
          };
        const resp = await fetch("/api/producer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendMessage),
        });
  
        // reset field if OK
        if (resp.ok) setMessageInput("");
      }
  
    return (
      <>
        <Navbar/>
        <div className='metrics1'>
          <div>
            <h3 className='metric-header'>Brokers Online</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=647&kiosk'
            width='300'
            height='200'></iframe>
          </div>
          <div>
            <h3 className='metric-header'>Active Controllers</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=233&kiosk'
            width='300'
            height='200'></iframe>
          </div>
          <div>
            <h3 className='metric-header'>Total Topics</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=625&kiosk'
            width='300'
            height='200'></iframe>
          </div>
          <div>
            <h3 className='metric-header'>Online Partitions</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=40&kiosk'
            width='300'
            height='200'></iframe>
          </div>
        </div>
        <div className="chatroom">
          <div className="messages">
            <div>{messageElementList}</div>
          </div>
        
          <div className="message-input">
            <Form.Control
              placeholder="Send a message..."
              value={messageInput}
              onChange={handleMessageInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMessageSend();
              }}
            />
            <Button variant="dark" onClick={handleMessageSend}>
              Send
            </Button>
            <Form.Control
                type='text'
                placeholder='Set new topic...'
                onChange={(e) => setTopic(e.target.value)}
                value={topic}
              />
            <Button variant="dark" onClick={submitHandler}>
              Send
            </Button>
          </div>
          <div className='metrics2'>
          <div>
            <h3 className='metric-header'>Producer Latency</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=192&kiosk'
              width='800'
              height='300'
            ></iframe>
          </div>
          <div>
            <h3 className='metric-header'>Message Throughput</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&kiosk&viewPanel=152'
              width='800'
              height='300'
            ></iframe>
          </div>
        </div>
        </div>
      </>
    );
  };
  