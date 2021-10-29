import styled from 'styled-components/macro';
import { Checkbox } from './index';

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
            align-items: center;
            justify-content: flex-start;
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
    isMulti?: boolean;
    onSelect: (val: T) => void;
    selection?: T[];
    options: SelectableListItem<T>[];
}

function SelectableList<T>({ onSelect, options, isMulti, selection }: ListProps<T>) {
    console.log('ismulti', isMulti);
    return (
        <StyledList>
            {options.map(item => {
                if (!isMulti) {
                    return (
                        <StyledListItem key={item.id}>
                            <button type="button" onClick={() => onSelect(item.value)}>
                                <span>{item.label}</span>
                            </button>
                        </StyledListItem>
                    );
                } else {
                    console.log('thisis filter', selection, item.value);
                    return (
                        <StyledListItem key={item.id}>
                            <button type="button" onClick={() => onSelect(item.value)}>
                                <Checkbox checked={(selection || []).includes(item.value)} />
                                <span>{item.label}</span>
                            </button>
                        </StyledListItem>
                    );
                }
            })}
        </StyledList>
    );
}

export default SelectableList;
