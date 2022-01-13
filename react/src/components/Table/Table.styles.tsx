import { BsFillSkipEndFill, BsFillSkipStartFill } from 'react-icons/bs';
import styled from 'styled-components/macro';
import { Flex } from '../index';

interface CellTextProps {
    capitalize?: boolean;
}

export const CellText = styled.span<CellTextProps>`
    overflow: hidden;
    white-space: nowrap;
    display: block;
    text-overflow: ellipsis;
    ${props => props.capitalize && `text-transform: capitalize`}
`;

export const TableFilters = styled(props => <Flex {...props} />)`
    padding: 0;
    margin-bottom: ${props => props.theme.space[4]};
`;

export const Styles = styled.div`
    padding: 1rem;
    display: block;
    max-width: 100%;
    max-height: 60vh;

    table {
        width: 100%;
        border-spacing: 0;
        border-collapse: collapse;

        .tr {
            transition: all 0.3s ease-out;
            :last-child {
                .td {
                    border-bottom: 0;
                }
            }
        }

        thead {
            position: sticky;
            top: -10px;
            z-index: 5;
            background: white;
        }

        th,
        td {
            margin: 0;
            padding: 0.5rem;
            border-bottom: 1px solid lightgrey;
            border-right: 1px solid lavender;
            text-align: center;
            font-size: ${props => props.theme.fontSizes.xs};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.5s ease;

            :last-child {
                border-right: 0;
            }
        }

        tbody {
            display: block;
        }
    }
`;

export const THead = styled.thead`
    box-shadow: ${props => props.theme.boxShadow};
`;

export const TH = styled.th`
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.fontSizes.s};
    font-weight: ${props => props.theme.fontWeights.bold};
    padding: ${props => props.theme.space[3]};
    text-align: center;
    transition: all 0.5s ease;
    border: none;
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
