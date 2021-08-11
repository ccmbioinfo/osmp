import styled from 'styled-components';
import { Flex } from '../components';

const Circle = styled(props => <Flex {...props} />)`
    height: 40px;
    width: 40px;
    border-radius: ${props => props.theme.radii.round};
    background: ${props => props.theme.background.light};
    margin-inline-start: ${props => props.theme.space[5]};
`;

interface AvatarProps {
    username: string;
}

const Avatar: React.FC<AvatarProps> = ({ username }) => {
    return (
        <Circle alignItems="center" justifyContent="center">
            {username[0].toUpperCase()}
        </Circle>
    );
};

export default Avatar;
