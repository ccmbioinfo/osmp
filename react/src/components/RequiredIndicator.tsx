import styled from 'styled-components/macro';

const RequiredIndicatorComponent = styled.sup`
    color: ${props => props.theme.colors.error};
`;

const RequiredTextBoxComponent = styled.span`
    align-self: end;
    width: fit-content;
    height: 1.25rem;
    margin: ${props => props.theme.space[4]} ${props => props.theme.space[2]} 0;
    border-radius: ${props => props.theme.radii.base};
    background-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.background};
    font-size: ${props => props.theme.fontSizes.xs};
    line-height: 1.25rem;
    white-space: nowrap;
    padding-inline: ${props => props.theme.space[3]};
`;

export const RequiredIndicator = () => <RequiredIndicatorComponent>*</RequiredIndicatorComponent>;
export const RequiredTextBox = () => (
    <RequiredTextBoxComponent>* Required Field</RequiredTextBoxComponent>
);
