import styled from 'styled-components';

export const Wrapper = styled.div`
    display: flex;
    min-height: 38px;
    flex-wrap: wrap;
`;

export const Header = styled.div`
    background-color: white;
    border-color: #ccc;
    color: #ccc;
    border-radius: 4px;
    border-style: solid;
    border-width: 1px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    width: 100%;
    padding: 0 20px;
`;

export const Title = styled.p`
    font-size: 14px;
    margin-inline-end: 5px;
`;

export const List = styled.div`
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
    padding: 0;
    margin: 0;
    width: 100%;
    margin-top: 20px;

    /* Dropdown List Styling */

    li {
        list-style-type: none;

        &:first-of-type {
            > button {
                border-top: 1px solid #ccc;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
        }

        &:last-of-type > button {
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        button {
            display: flex;
            justify-content: space-between;
            background-color: white;
            font-size: 14px;
            padding: 15px 20px 15px 20px;
            border: 0;
            border-bottom: 1px solid #ccc;
            width: 100%;
            text-align: left;
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;

            &:hover {
                cursor: pointer;
                font-weight: bold;
                color: #78d380;
                background-color: #effbef;
            }
        }
    }
`;
