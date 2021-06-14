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

function OptionList(props) {
    return (
        props.options.map((opt) =>
            <option key={opt}>{opt}</option>
        )
    );
}

export default
function AvatarSelector(props) {
    const [valid, setValid] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [username, setUsername] = useState('');
    const [sprite, setSprite] = useState(avatarOptions[0]);
    const [color, setColor] = useState(encodeURIComponent('#fff'));
    const apiHostname = "https://avatars.dicebear.com/api"
    const margin = 6;
    const avatar = `${apiHostname}/${sprite}/${username}.svg?b=${color}&m=${margin}`;

    const handleChange = (e) => {
        const username = e.target.value;
        const isValid = username.length > 0;
        setUsername(username);
        setValid(isValid);
        setInvalid(!isValid);
    }
    
    const handleSelect = (e) => setSprite(e.target.value);
    const handleColorChange = (color) => setColor(encodeURIComponent(color.hex));
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (!form.checkValidity()) {
            e.stopPropagation();
            setInvalid(true);
        }
        else {
            const user = {
                avatar: avatar,
                username: username
            };
            props.onSubmit(user);
        }
    };

    return (
        <Form
            noValidate 
            className='avatar-selector' 
            id={props.formName} 
            onSubmit={handleSubmit}
        >
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
            <Form.Control 
                id="sprite-selector" 
                as='select' 
                onChange={handleSelect}
            >
                <OptionList options={avatarOptions} />
            </Form.Control>
            <Form.Group>
                <Form.Control
                    type='text'
                    placeholder='username...'
                    required
                    onChange={handleChange}
                    isInvalid={invalid}
                    isValid={valid}
                />
                <Form.Control.Feedback>
                    I like your name 😊
                </Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                    {props.onInvalid()}
                </Form.Control.Feedback>
            </Form.Group>
        </Form>
    );
};