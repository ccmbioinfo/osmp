import React from 'react';
import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im';
import styled from 'styled-components/macro';
import Typography from './Typography';

interface CheckboxStyledProps {
    disabled?: boolean;
}
interface CheckboxProps extends CheckboxStyledProps {
    checked: boolean;
    label?: string;
    onClick: () => void;
}

const Component = styled.span<CheckboxStyledProps>`
    align-items: center;
    display: flex;
    cursor: pointer;
`;

const CheckboxIcon = styled.span`
    color: ${props => props.theme.colors.primary};
    display: flex;
    padding: ${props => props.theme.space[1]};
`;

const Checkbox: React.FC<CheckboxProps> = ({ checked, disabled, label, onClick }) => {
    return (
        <Component disabled={disabled} onClick={() => !disabled && onClick()}>
            <CheckboxIcon>{checked ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}</CheckboxIcon>
            <Typography variant="p">{label}</Typography>
        </Component>
    );
};

export default Checkbox;
