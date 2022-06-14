import styled from 'styled-components/macro';

const Component = styled.sup`
  border-radius: ${props => props.theme.radii.base};
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  padding: ${props => props.theme.space[1]} ${props => props.theme.space[2]};
`;

const RequiredIndicator = () => <Component>Required</Component>;

export default RequiredIndicator;