import { SkipNext, SkipPrevious } from '@material-ui/icons';
import styled from 'styled-components';
import { Flex } from '../index';

export const TableFilters = styled(Flex)`
    align-items: center;
`;

export const TableStyled = styled.table`
    margin-top: ${props => props.theme.space[2]};
    border-collapse: collapse;
    width: 100%;
`;
export const Row = styled.tr`
    thead > & {
        background: #f7f7f7;
        height: 30px;
        margin-bottom: ${props => props.theme.space[1]};
    }

    tbody > & {
        background: #fcfcfc;
        margin-bottom: ${props => props.theme.space[1]};
    }

    & > th {
        color: ${props => props.theme.colors.text};
        font-size: ${props => props.theme.fontSizes.s};
        font-weight: ${props => props.theme.fontWeights.bold};
        padding: ${props => props.theme.space[4]};
        text-align: center;
        height: 30px;
        border: none;
    }

    th > * {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    & > td {
        font-size: ${props => props.theme.fontSizes.s};
        padding: ${props => props.theme.space[3]};
        text-align: center;
        border: none;
    }

    & > td,
    th > input {
        margin-left: ${props => props.theme.space[3]};
        margin-right: ${props => props.theme.space[3]};
    }
`;

export const Footer = styled.div`
    display: flex; 
    align-items: center;

    * {
        padding: ${props => props.theme.space[2]};
        margin: ${props => props.theme.space[3]} ${props => props.theme.space[1]};
        font-size: ${props => props.theme.fontSizes.xs}
    }

    span {
        display: flex;
        margin-right: ${props => props.theme.space[4]}
    }
    
    select {
        border: none;
        border-radius: ${props => props.theme.radii.base};
        box-shadow: ${props => props.theme.boxShadow};
    }

    button {
        background-color: ${props => props.theme.background.main};
        color: ${props => props.theme.colors.text};
        border: none;
        padding: ${props => props.theme.space[3]};
        border-radius: ${props => props.theme.radii.round};
        &:hover:not(:disabled) {
            cursor: pointer;
            background-color: whitesmoke;
        }
        &:disabled {
            color:lightgrey;
        }
`;

const Icon = `
    padding: 0;
    margin: 0;
`;

export const SkipToEnd = styled(SkipNext)`
    ${Icon}
`;

export const SkipToBeginning = styled(SkipPrevious)`
    ${Icon}
`;
