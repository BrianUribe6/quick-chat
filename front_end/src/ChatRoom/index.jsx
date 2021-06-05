import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { Redirect } from 'react-router-dom';
import ReactWebSocket from './ReactWebSocket';
import AvatarSelector from './AvatarSelector'
import './index.css';


const eventType = {
    CHAT: {
        MESSAGE: 'chat.message',
        JOIN: 'chat.join',
        GET_USERS: 'chat.get.users',
        LEAVE: 'chat.leave'
    }
};

const ERROR_CONNECTION_REJECTED = 4001;

/**
 * Optional parameter 'center' if present the username
 * and avatar will be vertically centered with respect to
 * the children.
 * 
 * @param {center, username, avatar} props 
 * @returns Nameplate Container
 */
function NameTag(props) {
    const imgSize = {
        width: '48px',
        height: '48px'
    };
    const center = props.center ? 'align-items-center': '';
    return (
        <div className={`name-tag ${center}`}>
            <Image 
                src={props.avatar} 
                roundedCircle 
                style={imgSize}
            />
            <div id='name-tag-body' className='pl-3'>
                <strong>{props.username}</strong>
                {props.children}
            </div>
        </div>
    );
}

function Message(props) {
    return (
        <NameTag avatar={props.avatar} username={props.username}>
            <p>{props.text}</p>
        </NameTag>
    );
}

function UsernameDialog(props){
    const [show, setShow] = useState(true);
    // const inputText = useRef(null);
    const formName = "username-form";
    
    const handleCancel = () => {
        setShow(false);
        props.onCancel();
    }

    const handleSubmit = (event, user) => {
        const form = event.currentTarget;
        if (!form.checkValidity()) 
            return;

        event.preventDefault();
        event.stopPropagation();
        // const isValidName = props.onAccept(user);
        setShow(false);
        props.onAccept(user);
    };
    
    return (
        <Modal show={show} onHide={handleCancel} backdrop='static'>
            <Modal.Header closeButton>
                <Modal.Title>Make your avatar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AvatarSelector 
                    formName={formName}
                    onSubmit={handleSubmit}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type='submit' variant='primary' form={formName}>
                    Accept
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const ChatLog = React.forwardRef((props, ref) => {
    //TODO uniquely identify each message instead of using index as key
    const messageList = props.messages.map((msg, key) => (
        <Message 
            avatar={msg.avatar}
            username={msg.username}
            text={msg.text}
            key={key} 
        />
    ));
    return (
        <div className='chat-log m-3'>
            {messageList}
            <div ref={ref}></div>
        </div>
    );
});

const ChatBox = React.forwardRef((props, ref) => (
    <InputGroup className='chat-box px-3'>
        <Form.Control 
            type='input' 
            placeholder='Type your message...'
            ref={ref}
            onKeyUp={props.onKeyUp}
        />
        <InputGroup.Append>
            <Button 
                variant='primary' 
                onClick={props.onClick}
            >Send
            </Button>
        </InputGroup.Append>
    </InputGroup>
));

function OnlineSidebar(props) {
    return (
        <div className='online-sidebar p-3'>
            <div className='pb-2' id='sidebar-header'>
                <strong>
                    • online ({props.users.length})
                </strong>
            </div>
            {props.users.map((user) => 
                <NameTag
                    center
                    key={user.username}  
                    username={user.username}
                    avatar={user.avatar}
                />
            )}
        </div>
    );
}

class ChatRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            log: [],
            username: null,
            onlineUsers: [], 
            didCancel: false
        };
        this.textInput = React.createRef();
        this.webSocket = React.createRef();
        this.lastMessage = React.createRef();

        this.handleClose = this.handleClose.bind(this);
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
            type: eventType.CHAT.MESSAGE,
            avatar : this.state.avatar,
            username: this.state.username,
            text: text
        };

        webSocket.sendMessage(message);
        textBox.value = null;
    }

    /**
     * updates chat log with the incoming new messages.
     * @param {string} data 
     */
    handleMessage(data){
        const msgInfo = JSON.parse(data);
        const onlineUsers = this.state.onlineUsers;
        
        let state = {};
        switch (msgInfo.type) {
            case eventType.CHAT.MESSAGE:
                const chatLog = this.state.log;
                const newMsg = {
                    avatar: msgInfo.avatar,
                    username: msgInfo.username,
                    text: msgInfo.text
                };
                state = {log: [...chatLog, newMsg]};
                this.lastMessage.current.scrollIntoView({
                    block: "end",
                    behavior: "smooth"
                });
                break;

            case eventType.CHAT.JOIN:
                state = {
                    onlineUsers: [...onlineUsers, {
                        avatar: msgInfo.avatar,
                        username: msgInfo.username,
                    }]
                };
                break;

            case eventType.CHAT.GET_USERS:
                state = {onlineUsers: msgInfo.user_list};
                // inform all users that you joined the room
                this.webSocket.current.sendMessage({
                    type: eventType.CHAT.JOIN,
                    avatar: this.state.avatar,
                    username: this.state.username
                });     
                break;
                
            case eventType.CHAT.LEAVE:
                const users = onlineUsers.slice();
                const i = users.findIndex((e) => e.username === msgInfo.username);
                users.splice(i, 1);

                state = {onlineUsers: users};
                break;

            default: break;
        }
        
        this.setState(state);
    }

    handleClose(e) {
        if (e.code !== ERROR_CONNECTION_REJECTED)   
            return;
        
        this.webSocket.current.reconnect = false;          //stop attempting to reconnect
    }

    handleKeyPress(e) {
        if (e.key === 'Enter')   
            this.handleClick();
    }
    
    handleJoin({avatar, username}) {
        const ws = this.webSocket.current;
        // request a list of all active users in this chatroom
        ws.sendMessage( {type: eventType.CHAT.GET_USERS} );
        this.setState({
            avatar: avatar,
            username: username
        });
        return true;
    }

    handleCancel(){
        this.setState({didCancel: true});
    }

    render() { 
        const chatLog = this.state.log;
        const room_name = this.props.match.params.name;
        const username = this.state.username;
        const host = window.location.host;
        const url = `ws://${host}/ws/chat/${room_name}/`;

        return (
            <div className="chat-room">
                <ReactWebSocket 
                    url={url} 
                    onMessage={this.handleMessage}
                    onClose={this.handleClose} 
                    ref={this.webSocket}
                />
                { !username && 
                    <UsernameDialog 
                        onAccept={(user) => this.handleJoin(user)}
                        onCancel={() => this.handleCancel()}
                    />
                }
                {this.state.didCancel && <Redirect to='/' />}
                <ChatLog messages={chatLog} ref={this.lastMessage}/>
                <OnlineSidebar users={this.state.onlineUsers}/>
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