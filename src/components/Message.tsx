import React, { useState } from 'react';

interface Props {
    avatar?: string;
    message: string;
    message_id: number;
    sender_id: number;
    time: string;
    username: string;
  }
  // @ts-ignore
  const Message: React.FunctionComponent<Props> = (props) => {
  const dateTime = new Date(props.time);
  let containerMessage: string = props.message;

  if (props.message) {
    if (
        props.message[0].match(/[/\"/]/gi) &&
        props.message[props.message.length - 1].match(/[/\"/]/gi)
    ) {
      containerMessage = containerMessage.slice(1, containerMessage.length - 1);
    }else if (props.message[0] == '.'){
      containerMessage = containerMessage.slice(1, containerMessage.length);
    }
 

  return (
    <div className="messageContainer">
      <div className="message">
        <div>
          {props.avatar && <img src={props.avatar} />}
          {!props.avatar && (
            <img
              src={
                'https://vssmn.org/wp-content/uploads/2018/12/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'
              }
            />
          )}
          <span className="message-user">{props.username}</span>
        </div>
        <span className="message-timestamp">
          {dateTime.toLocaleTimeString()}
        </span>
      </div>
      <span className="message-message">{containerMessage}</span>
    </div>
  );
};
}

export default Message;
