import React from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { MdDragHandle } from 'react-icons/md';
import { RiDragMove2Fill } from 'react-icons/ri';
import styled from 'styled-components/macro';
import Tooltip from './Tooltip';

interface ComponentProps {
    isVisible: boolean;
}

const Component = styled.span<ComponentProps>`
    color: ${props => (props.isVisible ? props.theme.colors.primary : 'grey')};
`;

interface DragHandleProps {
    isVisible: boolean;
    dragHandleProps: DraggableProvidedDragHandleProps | undefined;
}

const DragHandle: React.FC<DragHandleProps> = ({ isVisible, dragHandleProps }) => {
    return (
        <>
            {isVisible && (
                <Component {...dragHandleProps} isVisible={isVisible}>
                    <RiDragMove2Fill />
                </Component>
            )}

            {!isVisible && (
                <Tooltip helperText="Only visible columns are draggable.">
                    <Component {...dragHandleProps} isVisible={isVisible}>
                        <MdDragHandle />
                    </Component>
                </Tooltip>
            )}
        </>
    );
};

export default DragHandle;
