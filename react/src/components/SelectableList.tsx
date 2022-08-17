import React from 'react';
import styled from 'styled-components/macro';
import theme from '../constants/theme';
import { Checkbox } from './index';

interface SelectableListWrapperProps {
    fullWidth?: boolean;
}

interface StyledListProps {
    stickyHeader?: React.ReactNode;
}

export const SelectableListWrapper = styled.div<SelectableListWrapperProps>`
    position: absolute;
    top: 100%;
    z-index: 998;
    width: ${props => (props.fullWidth ? '100%' : 'fit-content')};
`;

const StyledList = styled.ul<StyledListProps>`
    box-shadow: ${props => props.theme.boxShadow};
    padding: 0;
    margin: 0;
    list-style-type: none;
    width: inherit;
    max-height: ${props => (props.stickyHeader ? '250' : '200')}px;
    overflow: auto;
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
    stickyHeader?: React.ReactNode;
}

function SelectableListInner<T>(props: ListProps<T>, ref: React.ForwardedRef<HTMLUListElement>) {
    const { onSelect, options, isMulti, selection, stickyHeader } = props;
    return (
        <StyledList {...{ ref, stickyHeader }}>
            {stickyHeader && (
                <StyledListItem
                    style={{
                        position: 'sticky',
                        top: 0,
                    }}
                >
                    {stickyHeader}
                </StyledListItem>
            )}
            {options.map((item, index) => {
                if (!isMulti) {
                    return (
                        <StyledListItem key={item.id}>
                            <button type="button" onClick={() => onSelect(item.value)}>
                                <span>{item.label}</span>
                            </button>
                        </StyledListItem>
                    );
                } else {
                    return (
                        <StyledListItem key={item.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(item.value)}
                                style={{ columnGap: theme.space[2] }}
                            >
                                <Checkbox
                                    key={index}
                                    checked={(selection || []).includes(item.value)}
                                />
                                <span>{item.label}</span>
                            </button>
                        </StyledListItem>
                    );
                }
            })}
        </StyledList>
    );
}

const SelectableList = React.forwardRef(SelectableListInner);

export default SelectableList;
