import React from 'react';
import { BsX } from 'react-icons/bs';
import styled from 'styled-components';
import { Button, Flex, Typography } from './index';

export const ChipContainer = styled(props => <Flex {...props} />)`
    border-radius: ${props => props.theme.radii.round};
    background: ${props => props.theme.background.light};
    border-color: ${props => props.theme.colors.muted};
    align-items: center;
    padding: 0 ${props => props.theme.space[3]};
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
export const ChipTitle = styled(props => <Typography {...props} />)`
    margin-inline-end: ${props => props.theme.space[4]};
`;

interface ChipProps {
    title: string;
    onDelete: () => void;
}

const Chip: React.FC<ChipProps> = ({ title, onDelete }) => {
    return (
        <ChipContainer>
            <ChipTitle variant="subtitle">{title}</ChipTitle>
            <ChipDeleteContainer variant="primary" onClick={onDelete}>
                <BsX />
            </ChipDeleteContainer>
        </ChipContainer>
    );
};

export default Chip;
