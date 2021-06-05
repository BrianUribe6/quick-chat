import React from 'react'

class ReactWebSocket extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ws: new WebSocket(props.url),
            attempts: 1
        }
        this.reconnect = props.reconnect; 
    }
    
    sendMessage(data) {
        const msg = JSON.stringify(data);
        this.state.ws.send(msg);
    }

    handleClose(e) {
        this.props.onClose(e);
        if (!this.reconnect)
            return;
        
        const attempts = this.state.attempts;
        const maxTimeout = ReactWebSocket.maxTimeOut;
        const timeOut = Math.min(maxTimeout, 1 << (attempts - 1)) * 1000;
        
        setTimeout(() => {
            this.setState({
                ws: new WebSocket(this.props.url),
                attempts: attempts + 1,
            });
            this.initWebSocket();
        }, timeOut);
    }
    
    initWebSocket() {
        const ws = this.state.ws;
        const {onMessage, onError, onOpen} = this.props;

        if (ws.readyState === ws.OPEN) {
            // Restart timeout counter on successful connection
            this.setState({attempts: 1})
        }

        ws.onmessage = e => onMessage(e.data);
        ws.onerror = e => onError(e);
        ws.onopen = e => onOpen(e);
        ws.onclose =  this.handleClose.bind(this);
    }

    componentDidMount() {
        this.initWebSocket()
    }

    componentWillUnmount() {
        this.reconnect = false;
        this.state.ws.close();
    }

    render() {
        return <></>
    }
}

ReactWebSocket.defaultProps = {
    onMessage : e => {},
    onError : e => {},
    onOpen : e => {},
    onClose : e => {},
    reconnect : true,
}

ReactWebSocket.maxTimeOut = 60;

export default ReactWebSocket;
