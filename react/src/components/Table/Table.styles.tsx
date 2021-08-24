import { BsFillSkipEndFill, BsFillSkipStartFill } from 'react-icons/bs';
import styled from 'styled-components';
import { Flex } from '../index';

export const TableFilters = styled(props => <Flex {...props} />)`
    padding: 0;
    margin: 0;
`;

export const Styles = styled.div`
    padding: 1rem;
    display: block;
    max-width: 100%;

    > table {
        width: 100%;
        border-spacing: 0;

        .tr {
            transition: width 0.3s ease-out;
            :last-child {
                .td {
                    border-bottom: 0;
                }
            }
        }

        th,
        td {
            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid lightgrey;
            text-align: center;
            font-size: ${props => props.theme.fontSizes.xs};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: width 0.5s ease;

            :last-child {
                border-right: 0;
            }
        }
    }
`;

export const THead = styled.thead`
    background: #f7f7f7;
    height: 30px;
    margin-bottom: ${props => props.theme.space[3]};
`;

export interface THProps {
    // expanded?: boolean;
    // type?: 'groupHeader' | 'columnHeader';
    // maxWidth?: number;
    // minWidth?: number;
    // width?: number | string;

    variant: string
}

export const TH = styled.th<THProps>`
    ${props => {
        switch (props.variant) {
            case 'pureCssAnimation':
                return `color: ${props.theme.colors.text};
                font-size: ${props.theme.fontSizes.s};
                font-weight: ${props.theme.fontWeights.bold};
                padding: ${props.theme.space[3]};
                text-align: center;
                transition: width 0.3s ease-out;
                border: none;`
            default:
                return 'inherit';
        }
    }};
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

export const IconPadder = styled.span`
    margin-inline-start: ${props => props.theme.space[3]};
    color: ${props => props.theme.colors.primary};
    transition: all 0.3s ease;
    &:hover {
        transform: scale(1.4);
        cursor: pointer;
    }
`;
