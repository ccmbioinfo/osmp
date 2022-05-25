import { isGroup } from '@storybook/api';
import { check } from 'prettier';
import { useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { MdOutlineTapAndPlay } from 'react-icons/md';
import { ColumnInstance, HeaderGroup, UseTableInstanceProps } from 'react-table';
import { camelize } from '../../utils';
import { Button, Checkbox, DragHandle, Flex, InlineFlex, Modal } from '../index';
import { IconPadder } from './Table.styles';

interface ColumnVisibilityModalProps<T extends object>
    extends Pick<UseTableInstanceProps<T>, 'toggleHideColumn'> {
    headerGroups: HeaderGroup<T>[];
    allColumns: ColumnInstance<T>[];
    setColumnOrder: (update: string[] | ((columnOrder: string[]) => string[])) => void;
    cached: Record<string, boolean>;
    setCached: (value: Record<string, boolean>) => void;
}

export default function ColumnVisibilityModal<T extends {}>({
    headerGroups,
    toggleHideColumn,
    cached,
    setCached,
    allColumns,
    setColumnOrder,
}: ColumnVisibilityModalProps<T>) {
    const columns = allColumns.filter(c => c.type !== 'fixed');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [order, setOrder] = useState<ColumnInstance<T>[]>([]);
    const [cachedVisibility, setCachedVisibility] = useState(cached); // Does not contain empty columns
    const [checkedColumns, setCheckedColumns] = useState(
        // Contains empty columns
        Object.fromEntries(columns.map(c => [c.id, c.isVisible]))
    );
    const isGroupExpanded = (header: string | undefined) => {
        if (!header) {
            return false;
        } else if (header === 'Variant') {
            return !checkedColumns['emptyCore'];
        } else if (header === 'Variant Details') {
            return !checkedColumns['emptyVariationDetails'];
        } else {
            return !checkedColumns['emptyCaseDetails'];
        }
    };
    const reorder = (prevPos: number, newPos: number): ColumnInstance<T>[] => {
        const result: ColumnInstance<T>[] = order;
        const [removed] = result.splice(prevPos, 1);
        result.splice(newPos, 0, removed);
        return result;
    };
    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }
        const columnOrder = reorder(source.index, destination.index);
        setOrder(columnOrder);
    };

    const groupClick = (g: HeaderGroup<T>) => {
        // User makes a group invisible
        const checkedColumnsCopy = Object.assign({}, checkedColumns);
        if (isGroupExpanded(g.Header as string)) {
            // All column checkboxes are turned off, empty columns are turned on
            g.columns
                ?.filter(c => c.type !== 'fixed')
                .map(column =>
                    column.type !== 'empty'
                        ? (checkedColumnsCopy[column.id] = false)
                        : (checkedColumnsCopy[column.id] = true)
                );
        }
        // User makes a group visible
        else {
            const cacheColumns = g.columns?.filter(
                c => c.type !== 'fixed' && cachedVisibility[c.id] === true
            );
            // If some columns in this group in the cache are visible
            if (cacheColumns && cacheColumns.length > 0) {
                g.columns
                    ?.filter(c => c.type !== 'fixed')
                    .map(c =>
                        c.type !== 'empty' && cachedVisibility[c.id]
                            ? (checkedColumnsCopy[c.id] = true)
                            : (checkedColumnsCopy[c.id] = false)
                    );
            } else {
                // Else by default make all columns visible
                g.columns
                    ?.filter(c => c.type !== 'fixed')
                    .map(c =>
                        c.type !== 'empty'
                            ? (checkedColumnsCopy[c.id] = true)
                            : (checkedColumnsCopy[c.id] = false)
                    );
            }
        }
        setCheckedColumns(checkedColumnsCopy);
    };

    const columnClick = (c: ColumnInstance<T>) => {
        const checkedColumnsCopy = Object.assign({}, checkedColumns);
        const cachedVisibilityCopy = Object.assign({}, cachedVisibility);
        // If user checks a checkbox, update checkedColumns state and cachedVisibility
        if (!checkedColumnsCopy[c.id]) {
            checkedColumnsCopy[c.id] = true;
            cachedVisibilityCopy[c.id] = true;
            headerGroups[0].headers.forEach(header => {
                if (
                    header.columns?.find(column => column.id === c.id) &&
                    !isGroupExpanded(header.Header as string)
                ) {
                    if ((header.Header as string) === 'Variant') {
                        checkedColumnsCopy['emptyCore'] = false;
                    } else if ((header.Header as string) === 'Variant Details') {
                        checkedColumnsCopy['emptyVariationDetails'] = false;
                    } else {
                        checkedColumnsCopy['emptyCaseDetails'] = false;
                    }
                }
            });
        } else {
            // If user unchecks a checkbox, update checkedColumns state and cachedVisibility
            checkedColumnsCopy[c.id] = false;
            cachedVisibilityCopy[c.id] = false;
            headerGroups[0].headers.forEach(header => {
                if (
                    isGroupExpanded(header.Header as string) &&
                    header.columns?.filter(column => checkedColumnsCopy[column.id]) &&
                    header.columns?.filter(column => checkedColumnsCopy[column.id]).length === 0
                ) {
                    if ((header.Header as string) === 'Variant') {
                        checkedColumnsCopy['emptyCore'] = true;
                    } else if ((header.Header as string) === 'Variant Details') {
                        checkedColumnsCopy['emptyVariationDetails'] = true;
                    } else {
                        checkedColumnsCopy['emptyCaseDetails'] = true;
                    }
                }
            });
        }
        setCachedVisibility(cachedVisibilityCopy);
        setCheckedColumns(checkedColumnsCopy);
    };

    const renderTable = (
        cachedVisibility: Record<string, boolean>,
        checkedColumns: Record<string, boolean>
    ) => {
        setCached(cachedVisibility);
        allColumns.map(c => c.type !== 'fixed' && toggleHideColumn(c.id, !checkedColumns[c.id]));
    };

    return (
        <InlineFlex>
            <Button
                variant="secondary"
                onClick={() => {
                    setShowModal(!showModal);
                    setOrder(allColumns);
                }}
            >
                Customize columns
                <IconPadder>{showModal ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}</IconPadder>
            </Button>
            <Modal
                active={showModal}
                hideModal={() => setShowModal(false)}
                title="Customize Columns"
                footer="Apply"
                onClick={() => {
                    setColumnOrder(order.map(o => o.id));
                    renderTable(cachedVisibility, checkedColumns);
                    setShowModal(false);
                }}
                helperText="Please check or uncheck the boxes next to each column to toggle the columns' visibility. To reorder the columns, please drag the columns to their desired position. Note that only columns within the same group can be reordered."
            >
                {headerGroups[0].headers.map((g, id) => (
                    <DragDropContext key={id} onDragEnd={onDragEnd}>
                        <Droppable key={id} droppableId={JSON.stringify(id)}>
                            {(droppableProvided, snapshot) => (
                                <div
                                    ref={droppableProvided.innerRef}
                                    {...droppableProvided.droppableProps}
                                >
                                    <Checkbox
                                        label={g.Header as string}
                                        checked={isGroupExpanded(g.Header as string)}
                                        onClick={() => {
                                            groupClick(g);
                                        }}
                                    />
                                    {order.map(
                                        (c, id) =>
                                            g.columns?.find(column => column.id === c.id) &&
                                            c.type !== 'fixed' &&
                                            c.type !== 'empty' && (
                                                <Draggable
                                                    key={c.id}
                                                    draggableId={c.id}
                                                    index={id}
                                                    isDragDisabled={
                                                        checkedColumns[c.id] ? false : true
                                                    }
                                                >
                                                    {(provided, snapshot) => (
                                                        <Flex
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            fullWidth={true}
                                                        >
                                                            <div
                                                                style={{
                                                                    paddingLeft: 20,
                                                                    background: 'white',
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    label={c.Header as string}
                                                                    checked={checkedColumns[c.id]}
                                                                    onClick={() => {
                                                                        columnClick(c);
                                                                    }}
                                                                />
                                                            </div>

                                                            <DragHandle
                                                                isVisible={checkedColumns[c.id]}
                                                                dragHandleProps={
                                                                    provided.dragHandleProps
                                                                }
                                                            />
                                                        </Flex>
                                                    )}
                                                </Draggable>
                                            )
                                    )}
                                    {droppableProvided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ))}
            </Modal>
        </InlineFlex>
    );
}
