import { BsFillSkipEndFill, BsFillSkipStartFill, BsFilter } from 'react-icons/bs';
import styled from 'styled-components';
import { Flex } from '../index';

export const TableFilters = styled(Flex)`
    padding: 0;
    margin: 0;
`;

export const TableStyled = styled.table`
    margin-top: ${props => props.theme.space[5]};
    border-collapse: separate;
    width: 100%;
`;
export const RowStyled = styled.tr`
    thead > & {
        background: #f7f7f7;
        height: 30px;
        margin-bottom: ${props => props.theme.space[2]};
    }

    tbody > & {
        background: #fcfcfc;
        margin-bottom: ${props => props.theme.space[2]};
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

    th > span > * {
        margin: ${props => props.theme.space[3]};
    }

    & > td {
        font-size: ${props => props.theme.fontSizes.s};
        padding: ${props => props.theme.space[3]};
        text-align: left;
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

export const FilterIcon = styled(BsFilter)`
    margin-inline-start: inherit;
`;
