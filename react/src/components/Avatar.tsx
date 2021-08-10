import styled from "styled-components";

const Circle = styled.div`
    height: auto;
    width: 100%; 
    border-radius: ${props => props.theme.radii.round};
    text-align: center; 
`

interface AvatarProps {
    username: string
}

const Avatar: React.FC<AvatarProps> = ({ username }) => {
    return (
        <Circle>
            {username[0].toUpperCase()}
        </Circle>
    )
}

export default Avatar; 