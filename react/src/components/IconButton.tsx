import styled from 'styled-components';
import { Button } from './index';

const IconButton = styled(props => <Button {...props} />)`
    border-radius: ${props => props.theme.radii.round};
    padding: 0.75rem;
    &:hover:not(:disabled) {
        outline: 0;
        color: ${props => props.theme.colors.text};
        background-color: rgba(91, 76, 223, 0.1);
        padding: 0.75rem;
        cursor: pointer;
    }
`;
export default IconButton;
