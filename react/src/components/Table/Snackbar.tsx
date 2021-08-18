import React, { useState } from 'react';
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiInfo,
    FiX
} from 'react-icons/fi';
import styled from 'styled-components';
import { Typography } from '../index';

type Variant = "success" | "error" | "warning" | "info";

interface Variant {
    
}

interface SnackbarProps {
    open: boolean;
    variant: Variant;
    message?: string;
}

const Container = styled.div<SnackbarProps>`
    display: flex;
    border-radius: ${props => props.theme.radii.base};
    box-shadow: ${props => props.theme.boxShadow};
    color: ${props => props.theme.colors.background};
    background-color: ${props => props.theme.colors[props.variant]};
`

const Snackbar: React.FC<SnackbarProps> = ({ open, variant, message }) => {

    return (
        <Container variant={variant}>
            <Typography variant="p" bold>
                {message}
            </Typography>
        </Container>
    )
}