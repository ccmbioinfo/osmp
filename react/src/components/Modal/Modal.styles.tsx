import styled from 'styled-components/macro';

export const ModalBlock = styled.div`
    align-items: center;
    bottom: 0;
    justify-content: center;
    left: 0;
    overflow: hidden;
    padding: 0.4rem;
    position: fixed;
    right: 0;
    top: 0;
    display: flex;
    opacity: 1;
    z-index: 999;
`;

export const ModalOverlay = styled.a`
    background: rgba(247, 248, 249, 0.5);
    bottom: 0;
    cursor: default;
    display: block;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
`;

export const ModalClose = styled.a`
    float: right !important;
    text-decoration: none !important;
    cursor: pointer;
    font-size: 1rem;
`;

export const ModalContainer = styled.div`
    background: #ffffff;
    border-radius: ${props => props.theme.radii.base};
    display: flex;
    flex-direction: column;
    max-height: 75vh;
    padding: 0 1.75rem;
    width: 60vh;
    animation: slide-down 0.2s ease 1;
    z-index: 999;
    box-shadow: 0 0.2rem 0.5rem rgba(48, 55, 66, 0.3);
`;

export const ModalBody = styled.div`
    overflow-y: auto;
    padding: 30px 10px;
    position: relative;
`;

export const ModalHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: #303742;
    padding: 20px 5px 10px 5px;
`;

export const ModalTitle = styled.span`
    font-size: ${props => props.theme.fontSizes.m};
    font-weight: 500;
    margin-inline-end: ${props => props.theme.space[4]};
`;

export const ModalFooter = styled.div`
    padding: 10px 0px;
    text-align: right;
`;

export const Button = styled.button`
    background: #7b2cbf;
    color: white;
    font-size: 1em;
    margin: 10px;
    padding: 5px 10px;
    border: 2px solid #7b2cbf;
    border-radius: 3px;
    cursor: pointer;
`;
