import React from 'react';
import { BsX } from 'react-icons/bs';
import styled from 'styled-components';
import { Button, Flex, Typography } from './index';

export const ChipContainer = styled(props => <Flex {...props} />)`
    border-radius: ${props => props.theme.radii.round};
    background: ${props => props.theme.background.main};
    border-color: ${props => props.theme.colors.muted};
    align-items: center;
`;
export const ChipDeleteContainer = styled(props => <Button {...props} />)`
    border-radius: ${props => props.theme.radii.round};
    height: 20px;
    width: 20px;
    padding: 0;
    margin: 0;
    align-items: center;
    justify-content: center;
    background: lightgrey;
    border: none;
`;

interface ChipProps {
    title: string;
    onDelete: () => void;
}

const Chip: React.FC<ChipProps> = ({ title, onDelete }) => {
    return (
        <ChipContainer>
            <Typography variant="subtitle">{title}</Typography>
            <ChipDeleteContainer variant="primary" onClick={onDelete}>
                <BsX />
            </ChipDeleteContainer>
        </ChipContainer>
    );
};

export default Chip;
