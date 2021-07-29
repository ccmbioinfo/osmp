import styled from 'styled-components';

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
