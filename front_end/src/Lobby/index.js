import React, {useEffect, useState} from 'react'
import axios from 'axios'
import Card from 'react-bootstrap/Card'
import JumboTron from 'react-bootstrap/Jumbotron'
import { Link } from 'react-router-dom'

import placeholder from './placeholder.jpg'
import './index.css'


function RoomCard({title, description}){
    const name = title.replace(' ', '-').toLowerCase();
    return (
        <Card>
            <Card.Img src={placeholder}></Card.Img>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>{description}</Card.Text>
                <Link className='card-link' to={`/r/${name}/`}>JOIN ROOM</Link>  
            </Card.Body>        
        </Card>
    );
}

function RoomList(props) {
    return props.rooms.map((room) => (
        <RoomCard 
            title={room.name}
            description={room.description}
            key={room.id}
        />
    ));
}

function Lobby(props) {
    const [rooms, setRooms] = useState([]);
    useEffect(() => {
        axios.get('/api/room')
            .then((response) => setRooms(response.data))
            .catch((error) => console.log(error))
    }, []);

    return (
        <>
            <JumboTron>
                <h1>Meet more people like you!</h1>
                <p>
                    Join a room an engage with a community of like-minded individuals.
                </p>
            </JumboTron>
            <div className='room-list'>
                <RoomList rooms={rooms}/>
            </div>
        </>
);}

export default Lobby;