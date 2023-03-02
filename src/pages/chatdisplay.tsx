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
    ai?: boolean;
}

export default function Chat() {
    const [messages, setMessages] = useState(Array<Msg>);
    const [newBody, setBody] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [senderId, setSenderId] = useState(null);
    const [senderAvatar, setSenderAvatar] = useState(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [topic, setTopic] = useState('');
    const [csvfile, setCSVFile] = useState<File>();

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
            sendProducerMessage(message.message, message.ai);
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

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
      console.log(event.target.files);
      const target = event.target;
      if (target.files !== null && target.files[0] !== undefined)
        setCSVFile(target.files[0]);
    };

    const handleOnSubmitFile = (event: MouseEvent): void => {
      event.preventDefault();
      const reader = new FileReader();
  
      if (csvfile) {
        reader.onload = async (event) => {
          if (event.target === null) return;
          const text = event.target.result;
          if (text !== null) {
            const messageArray = text.toString().split('\n');
            for (const msg of messageArray) {
              fetch('/api/kite/connect/kafka', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  method: 'sendMessages',
                  topics: [topic !== '' ? topic : 'testTopic'],
                  messages: [
                    {
                      key: 'timestamp',
                      value: new Date().toISOString(),
                    },
                    {
                      key: 'message',
                      value: msg,
                    },
                  ],
                }),
              })
                .then((data) => console.log(data))
                .catch((error) => console.error(error));
            }
          }
        };
  
        const file = reader.readAsText(csvfile);
        setTopic('');
      }
    };

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

    const sendProducerMessage = async (message: String, ai?: boolean) => {
      const sendMessage = {
          message,
          ai
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
          </div>
          <Form.Control
                type='text'
                placeholder='Set mock stream topic...'
                onChange={(e) => setTopic(e.target.value)}
                value={topic}
                className='topicInput'
              />
          <Form.Group className='col-4' controlId='uploadCSV'>
              <Form.Control
                type='file'
                accept='.csv'
                onChange={handleFileChange}
              />
              <Button
                variant='primary'
                type='submit'
                onClick={handleOnSubmitFile}
              >
                Import CSV File
              </Button>
            </Form.Group>
          <div className='metrics2'>
          <div>
            <h3 className='metric-header'>Messages/Second</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=683&kiosk'
              width='600'
              height='300'
              className='needMargin'
            ></iframe>
          </div>
          <div>
            <h3 className='metric-header'>Message Throughput</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&kiosk&viewPanel=152'
              width='600'
              height='300'
              className='needMargin'
            ></iframe>
          </div>
          <div>
            <h3 className='metric-header'>Count Partition per Broker</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=603&kiosk'
              width='600'
              height='300'
              className='needMargin'
            ></iframe>
          </div>
          <div>
            <h3 className='metric-header'>Bytes in Per Topic</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=155&kiosk'
              width='600'
              height='300'
              className='needMargin'
            ></iframe>
          </div>
        </div>
        </div>
      </>
    );
  };
  