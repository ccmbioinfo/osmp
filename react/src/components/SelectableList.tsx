import styled from 'styled-components';

const StyledList = styled.ul`
    box-shadow: ${props => props.theme.boxShadow};
    padding: 0;
    list-style-type: none;
    width: inherit;
    margin-top: ${props => props.theme.space[5]};
    max-height: 200px;
    overflow: auto;
    position: absolute;
    top: 20px;
    z-index: 1;
`;

const StyledListItem = styled.li`        
        &:first-of-type {
            > button {
                border-top: ${props => props.theme.borders.thin}
                    ${props => props.theme.colors.muted};
                border-top-left-radius: ${props => props.theme.radii.base};
                border-top-right-radius: ${props => props.theme.radii.base};
            }
        }
        &:last-of-type > button {
            border-bottom-left-radius: ${props => props.theme.radii.base};
            border-bottom-right-radius: ${props => props.theme.radii.base};
        }
        button {
            display: flex;
            justify-content: space-between;
            background-color: ${props => props.theme.colors.background};
            font-size: ${props => props.theme.fontSizes.s};
            padding: 15px 20px 15px 20px;
            border: 0;
            border-bottom: ${props => props.theme.borders.thin} ${props =>
    props.theme.colors.muted};
            width: 100%;
            text-align: left;
            border-left: ${props => props.theme.borders.thin} ${props => props.theme.colors.muted};
            border-right: ${props => props.theme.borders.thin} ${props => props.theme.colors.muted};
            &:hover {
                cursor: pointer;
                font-weight: bold;
                color: ${props => props.theme.colors.accent};
                background-color: ${props => props.theme.background.light};
            }
        }
    }
`;

export interface SelectableListItem<T> {
    id: number;
    value: T;
    label: string;
}

interface ListProps<T> {
    onSelect: (val: T) => void;
    options: SelectableListItem<T>[];
}

function SelectableList<T>({ onSelect, options }: ListProps<T>) {
    return (
        <StyledList>
            {options.map(item => (
                <StyledListItem key={item.id}>
                    <button type="button" onClick={() => onSelect(item.value)}>
                        <span>{item.label}</span>
                    </button>
                </StyledListItem>
            ))}
        </StyledList>
    );
}

export default SelectableList;
