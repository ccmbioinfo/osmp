import { BsFillSkipEndFill, BsFillSkipStartFill } from 'react-icons/bs';
import styled from 'styled-components';
import { Flex } from '../index';

export const TableFilters = styled(props => <Flex {...props} />)`
    padding: 0;
    margin: 0;
`;

export const TableStyled = styled.table`
    margin-top: ${props => props.theme.space[5]};
    border-collapse: separate;
    width: 100%;
    table-layout: fixed;
`;

export const THead = styled.thead`
    background: #f7f7f7;
    height: 30px;
    margin-bottom: ${props => props.theme.space[3]};
`;

export interface THProps {
    expanded?: boolean;
    type?: 'groupHeader' | 'columnHeader';
}

export const TH = styled.th<THProps>`
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.fontSizes.s};
    font-weight: ${props => props.theme.fontWeights.bold};
    padding: ${props => props.theme.space[3]};
    text-align: center;
    height: 30px;
    ${props =>
        props.type === 'groupHeader'
            ? props.expanded
                ? `width: 100%`
                : `width: 10%`
            : props.expanded
            ? `width: 60px`
            : `width: 0%`};
    transition: width 0.5s ease;
    border: none;
`;

export const Row = styled.tr`
    thead > & {
        background: #f7f7f7;
        height: 30px;
        margin-bottom: ${props => props.theme.space[3]};
    }

    tbody > * {
        background: #fcfcfc;
        margin-bottom: ${props => props.theme.space[2]};
        font-size: ${props => props.theme.fontSizes.xs};
        text-align: center;
    }

    th > * {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    th > span > * {
        margin: ${props => props.theme.space[3]};
    }

    & > td {
        font-size: ${props => props.theme.fontSizes.xs};
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
    justify-content: flex-end;
    margin-right: ${props => props.theme.space[3]};

    * {
        padding: ${props => props.theme.space[2]};
        margin: ${props => props.theme.space[3]} ${props => props.theme.space[1]};
        font-size: ${props => props.theme.fontSizes.xs}
    }

    span {
        display: flex;
        align-items: center; 
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

export const SkipToEnd = styled(BsFillSkipEndFill)`
    ${Icon}
`;

export const SkipToBeginning = styled(BsFillSkipStartFill)`
    ${Icon}
`;

export const IconPadder = styled(Flex)`
    margin-inline-start: ${props => props.theme.space[3]};
    color: ${props => props.theme.colors.primary};
    transition: all 0.3s ease;
    &:hover {
        transform: scale(1.4);
        cursor: pointer;
    }
`;
