import React from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import Card from 'react-bootstrap/Card'
import { Link } from 'react-router-dom'
import placeholder from './placeholder.jpg'

function RoomCard({title, text}){
    const style = {
        width: '18rem'
    };
    const name = title.replace(' ', '-').toLowerCase();
    return (
        <Card style={style}>
            <Card.Img src={placeholder}></Card.Img>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>{text}</Card.Text>
                <Link className='card-link' to={`/r/${name}/`}>JOIN ROOM</Link>  
            </Card.Body>        
        </Card>
    );
}

class Lobby extends React.Component {
    // eslint-disable-next-line
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <RoomCard 
                        title="Channel Name" 
                        text="Lorem ipsum"
                    />
                </ListGroup.Item>
            </ListGroup>
        );
    }
}

export default Lobby;