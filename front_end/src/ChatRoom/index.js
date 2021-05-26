import React from 'react';
import avatar from './avatar.png'
import './index.css'

import InputGroup from 'react-bootstrap/InputGroup'
import Image from 'react-bootstrap/Image'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import {Redirect} from 'react-router-dom'
import ReactWebSocket from '../WebSocket'


const TYPE_MESSAGE = 'chat_message';

function Message(props) {
    const imgSize = {
        width: '48px',
        height: '48px'
    };

    return (
        <div className='d-flex px-3 pb-2'>
            <Image 
                src={props.avatar} 
                roundedCircle 
                style={imgSize}
            />
            <div className='pl-3'>
                <strong>{props.username}</strong>
                <p>{props.text}</p>
            </div>
        </div>
    );
}

function UsernameDialog(props){
    const [show, setShow] = React.useState(true);
    const inputText = React.createRef();
        
    const handleCancel = () => {
        setShow(false);
        props.onCancel();
    }

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === true) {
            event.preventDefault();
            event.stopPropagation();

            setShow(false);
            props.onAccept(inputText.current.value);
        }
    };
    
    return (
        <Modal show={show} onHide={handleCancel} backdrop='static'>
            {/* {cancel && <Redirect to='/' />} */}
            <Modal.Header closeButton>
                <Modal.Title>What's your name?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id='username' onSubmit={handleSubmit}>
                    <Form.Control
                        type='text'
                        placeholder='username...'
                        required
                        ref={inputText}
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type='submit' variant='primary' form='username'>
                    Accept
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function ChatLog({messages}) {
    //TODO uniquely identify each message instead of using index as key
    const messageList = messages.map((msg, key) => (
        <Message 
            avatar={msg.avatar}
            username={msg.username}
            text={msg.text}
            key={key} 
        />
    ));
    return (
        <div className='chat-log py-3'>
            {messageList}
        </div>
    );
}

const ChatBox = React.forwardRef((props, ref) => (
    <InputGroup className='fixed-bottom px-3 pb-3'>
        <Form.Control 
            type='input' 
            placeholder='Type your message...'
            ref={ref}
            onKeyUp={props.onKeyUp}
        />
        <InputGroup.Append>
            <Button variant='primary' onClick={props.handleClick}>Send</Button>
        </InputGroup.Append>
    </InputGroup>
));


class ChatRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            log: [],
            username: null, 
            didCancel: false
        };
        this.textInput = React.createRef();
        this.webSocket = React.createRef();
        this.lastMessage = React.createRef();
        this.handleMessage = this.handleMessage.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    /**
     * Updates chat log and send the message to the other users
     */
    handleClick() {
        const text = this.textInput.current.value;
        const textBox = this.textInput.current;
        const webSocket = this.webSocket.current;

        if (!text)  
            return;

        const message = {
            avatar : avatar,
            username: this.state.username,
            text: text
        };
        // this.setState({
        //     log: [...this.state.log, message]
        // });
        webSocket.sendMessage(JSON.stringify(message));
        textBox.value = null;
    }

    /**
     * updates chat log with the incoming new messages.
     * @param {string} data 
     */
    handleMessage(data){
        const msgInfo = JSON.parse(data);
        const chatLog = this.state.log;
        const newMsg = {
            type: TYPE_MESSAGE,
            avatar: msgInfo.avatar,
            username: msgInfo.username,
            text: msgInfo.text
        };

        this.setState({
            log: [...chatLog, newMsg]
        });

        this.lastMessage.current.scrollIntoView();
    }

    handleKeyPress(e) {
        if (e.key === 'Enter')   
            this.handleClick();
    }
    
    handleJoin(username) {
        this.setState({username:username})
    }

    handleCancel(){
        this.setState({didCancel: true});
    }

    render() { 
        const chatLog = this.state.log;
        const room_name = 'channel-name';
        const username = this.state.username;
        const url = `ws://${window.location.host}/ws/chat/${room_name}/`;
        return (
            <div>
                <ReactWebSocket 
                    url={url} 
                    onMessage={this.handleMessage} 
                    ref={this.webSocket}
                />
                { !username && 
                    <UsernameDialog 
                        onAccept={(name) => this.handleJoin(name)}
                        onCancel={() => this.handleCancel()}
                    />
                }
                { this.state.didCancel && <Redirect to='/' />}
                <ChatLog messages={chatLog}/>
                <div ref={this.lastMessage}></div>
                <ChatBox
                    ref={this.textInput}
                    onKeyUp={this.handleKeyPress}
                    onClick={this.handleClick} 
                />
            </div>
        );
    }
}

export default ChatRoom;