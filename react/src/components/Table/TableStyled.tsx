import styled from 'styled-components';

// To-do: Add theming and parametrize color variables

export const TableStyled = styled.table`
    margin-top: 5px;
    border-collapse: collapse;
`;
export const Row = styled.tr`
    thead > & {
        background: #f7f7f7;
        height: 30px;
        margin-bottom: 2px;
    }

    tbody > & {
        background: #fcfcfc;
        margin-bottom: 2px;
    }

    & > th {
        color: black;
        font-weight: 700;
        padding: 10px;
        text-align: center;
        height: 30px;
        font-size: 14px;
        border: none;
    }

    & > td {
        font-size: 14px;
        text-align: center;
        padding: 10px;
        border: none;
    }

    & > td,
    th > input {
        margin-left: 10px;
        margin-right: 10px;
    }
`;
export const Cell = styled.td`
    color: ${props => props.theme.palette.typography.main};
`;
