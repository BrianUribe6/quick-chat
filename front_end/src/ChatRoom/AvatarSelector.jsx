import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import { TwitterPicker } from 'react-color'
import './AvatarSelector.css'


const avatarOptions = [
    "human",
    "male",
    "female",
    "avataaars",
    "bottts",
    "initials",
    "identicon",
];

export default
function AvatarSelector(props) {
    const [username, setUsername] = useState('');
    const [sprite, setSprite] = useState('human');
    const [color, setColor] = useState(encodeURIComponent('#fff'));
    const apiHostname = "https://avatars.dicebear.com/api"
    const avatar = `${apiHostname}/${sprite}/${username}.svg?b=${color}`;

    const handleChange = (e) => setUsername(e.target.value);
    const handleSelect = (e) => setSprite(e.target.value);
    const handleColorChange = (color) => setColor(encodeURIComponent(color.hex));
    const handleSubmit = (e) => {
        const user = {
            avatar: avatar,
            username: username
        };
        props.onSubmit(e, user);
    };

    return (
        <Form className='avatar-selector' id={props.formName} onSubmit={handleSubmit}>
            <Image
                className='avatar-preview-size' 
                src={avatar}
                roundedCircle
                thumbnail
            />
            <TwitterPicker 
                triangle='hide'
                onChangeComplete={handleColorChange}
            />
            <Form.Control id="sprite-selector" as='select' onChange={handleSelect}>
                {avatarOptions.map((sprite) =>
                    <option key={sprite}>{sprite}</option>
                )}
            </Form.Control>
            <Form.Control
                type='text'
                placeholder='username...'
                required
                onChange={handleChange}
            />
        </Form>
    );
};