import styled from 'styled-components/macro';

interface BackgroundProps {
    variant?: 'success' | 'error' | 'main' | 'light';
}

export interface FlexProps {
    alignItems?: 'flex-start' | 'baseline' | 'flex-end' | 'center';
    justifyContent?:
        | 'flex-start'
        | 'baseline'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around';
    variant?: 'success' | 'main' | 'light';
    fullWidth?: boolean;
    nowrap?: boolean;
}

export const Background = styled.div<BackgroundProps>`
    background: ${props => {
        switch (props.variant) {
            case 'success':
                return props.theme.background.success;
            case 'error':
                return props.theme.background.error;
            case 'light':
                return props.theme.background.light;
            default:
                return 'inherit';
        }
    }};
    margin: ${props => props.theme.space[4]} 0;
    padding: ${props => props.theme.space[4]};
    border-radius: ${props => props.theme.radii.base};
`;

export const Flex = styled.div<FlexProps>`
    align-items: ${props => props.alignItems ?? 'inherit'};
    display: flex;
    flex-wrap: ${props => (props.nowrap ? 'nowrap' : 'wrap')};
    justify-content: ${props => props.justifyContent ?? 'inherit'};
    ${props => props.fullWidth && `width: 100%;`}
`;

export const InlineFlex = styled.div`
    display: inline-flex;
    align-items: center;
`;

export const Body = styled.div`
    padding: ${props => props.theme.space[5]};
`;

export const Column = styled(Flex)<FlexProps>`
    flex-direction: column;
    margin: 0 ${props => props.theme.space[2]};
`;

export const ButtonWrapper = styled(Flex)`
    align-self: flex-start;
    justify-content: flex-end;
    align-items: center;
    row-gap: ${props => props.theme.space[2]};
    display: inline-flex;
    height: min-content;
    flex-shrink: 0;
`;

export const Container = styled.div`
    margin: 0 auto;
    padding: 0 ${props => props.theme.space[6]};
    width: 100%;
`;
