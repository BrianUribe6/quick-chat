import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ReactWebSocket from './ReactWebSocket';
import AvatarSelector from './AvatarSelector';
import './index.css';


const eventType = {
    CHAT: {
        MESSAGE: 'chat.message',
        JOIN: 'chat.join',
        GET_USERS: 'chat.get.users',
        LEAVE: 'chat.leave'
    },
    ERROR: {
        CONNECTION_REJECTED: 4001,
        NAME_UNAVAILABLE: 4002,
    }
};

const breakpoint = {
    MEDIUM: 576,
}

/**
 * Optional parameter 'center' if present the username
 * and avatar will be vertically centered with respect to
 * the children.
 * 
 * @param {center, username, avatar} props 
 * @returns Nameplate Container
 */
function NameTag({centered, ...props}) {
    const imgSize = {
        width: '48px',
        height: '48px'
    };
    const alignCenter = centered ? 'align-items-center': '';
    return (
        <div {...props} className={`name-tag ${alignCenter}`}>
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
    )
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
    const formName = "username-form";
    
    const handleCancel = () => {
        setShow(false);
        props.onCancel();
    }

    const handleSubmit = (user) => {
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
                    onInvalid={props.onInvalid}
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

function renderNameTag(user) {
    const nameTag = (                     
        <NameTag
            key={user.username}
            centered
            username={user.username}
            avatar={user.avatar}
        />
    );
    if (window.screen.width > breakpoint.MEDIUM)
        return nameTag;
    // add tooltip overlay
    return (
        <OverlayTrigger 
            placement='left'
            delay={{ show: 250, hide: 100 }}
            overlay={<Tooltip>{user.username}</Tooltip>}
        >
            {nameTag}
        </OverlayTrigger>  
    );
}

function OnlineSidebar(props) {
    return (
        <div className='online-sidebar p-3'>
            <div className='pb-2' id='sidebar-header'>
                <strong>
                    • online ({props.users.length})
                </strong>
            </div>
            {props.users.map((user) => renderNameTag(user))}
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
        
        switch (msgInfo.type) {
            case eventType.CHAT.MESSAGE:
                const chatLog = this.state.log;
                const newMsg = {
                    avatar: msgInfo.avatar,
                    username: msgInfo.username,
                    text: msgInfo.text
                };
                this.setState({log: [...chatLog, newMsg]});
                this.lastMessage.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
                break;

            case eventType.CHAT.JOIN:
                this.setState({
                    onlineUsers: [...onlineUsers, {
                        avatar: msgInfo.avatar,
                        username: msgInfo.username,
                    }]
                });
                break;

            case eventType.CHAT.GET_USERS:
                this.setState({onlineUsers: msgInfo.user_list}); 
                break;
                
            case eventType.CHAT.LEAVE:
                const users = onlineUsers.slice();
                const i = users.findIndex((e) => e.username === msgInfo.username);
                users.splice(i, 1);

                this.setState({onlineUsers: users});
                break;

            default: break;
        }
    }

    handleClose(e) {
        switch(e.code) {
            case eventType.ERROR.CONNECTION_REJECTED:
                this.webSocket.current.reconnect = false;
                this.props.history.push('/404') ;
                break;
            case eventType.ERROR.NAME_UNAVAILABLE:
                this.setState({
                    username: null,
                    isNameTaken: true,
                });
                window.alert("username is already taken");
                break;
            // default:
            //     this.setState({
            //         username: null,
            //         isNameTaken: true,
            //     });
            //     break;
        }
    }

    handleInvalidName() {
        if (this.state.isNameTaken){
            this.setState({isNameTaken: false});
            return "Username is already taken";
        }
        return "You must provide a username";
    }

    handleKeyPress(e) {
        if (e.key === 'Enter')   
            this.handleClick();
    }
    
    handleJoin({avatar, username}) {
        const ws = this.webSocket.current;
        // inform all users that you joined the room
        ws.sendMessage({
            type: eventType.CHAT.JOIN,
            avatar: avatar,
            username: username,
        });    
        this.setState({
            avatar: avatar,
            username: username,
        });
    }

    render() { 
        const chatLog = this.state.log;
        const onlineUsers = this.state.onlineUsers;
        const room_name = this.props.match.params.name;
        const history = this.props.history;
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
                        onCancel={() => history.push('/')}
                        onInvalid={this.handleInvalidName.bind(this)}
                    />
                }
                <ChatLog messages={chatLog} ref={this.lastMessage}/>
                <OnlineSidebar users={onlineUsers}/>
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