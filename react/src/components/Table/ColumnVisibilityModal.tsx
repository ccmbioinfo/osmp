import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { ColumnInstance, HeaderGroup, UseTableInstanceProps } from 'react-table';
import { Button, Checkbox, DragHandle, Flex, InlineFlex, Modal } from '../index';
import { IconPadder } from './Table.styles';

interface ColumnVisibilityModalProps<T extends object>
    extends Pick<UseTableInstanceProps<T>, 'toggleHideColumn'> {
    headerGroups: HeaderGroup<T>[];
    allColumns: ColumnInstance<T>[];
    visibleColumns: ColumnInstance<T>[];
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
    visibleColumns,
    setColumnOrder,
}: ColumnVisibilityModalProps<T>) {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [order, setOrder] = useState<ColumnInstance<T>[]>([]);
    // Cache a column's latest "check" status independent of the column's group status. Does not contain columns with type "empty".
    const [cachedVisibility, setCachedVisibility] = useState<Record<string, boolean>>({});
    useEffect(() => {
        setCachedVisibility(cached);
    }, [cached, showModal]);

    // State to represent the current "check" status.
    const [checkedColumns, setCheckedColumns] = useState<Record<string, boolean>>({});
    useEffect(() => {
        setCheckedColumns(
            Object.fromEntries(
                allColumns.filter(c => c.type !== 'fixed').map(c => [c.id, c.isVisible])
            )
        );
    }, [allColumns, visibleColumns, showModal]);

    const groupMapping: Record<string, string> = {
        Variant: 'emptyCore',
        'Variant Details': 'emptyVariationDetails',
        'Case Details': 'emptyCaseDetails',
    };

    const isGroupExpanded = (header: string | undefined) => {
        if (!header) return false;
        return !checkedColumns[groupMapping[header]];
    };

    // Find a column's group: "Variant", "Variant Details" or "Case Details".
    const columnToGroup = (columnId: string) => {
        for (let i = 0; i < headerGroups[0].headers.length; i++) {
            if (headerGroups[0].headers[i].columns?.find(c => c.id === columnId)) {
                return headerGroups[0].headers[i];
            }
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

    const onGroupClick = (g: HeaderGroup<T>) => {
        const checkedColumnsCopy = Object.assign({}, checkedColumns);
        const columnsInGroup = g.columns?.filter(c => c.type !== 'fixed');
        // When user makes a group invisible, uncheck all columns in the group except the column with type "empty"
        if (isGroupExpanded(g.Header as string)) {
            columnsInGroup?.forEach(c => (checkedColumnsCopy[c.id] = c.type === 'empty'));
        } else {
            const cacheColumns = columnsInGroup?.filter(c => cachedVisibility[c.id] === true);
            // If some columns in this group are visible in the cache, only check the columns visible in the cache.
            if (cacheColumns && cacheColumns.length > 0) {
                columnsInGroup?.forEach(
                    c => (checkedColumnsCopy[c.id] = c.type !== 'empty' && cachedVisibility[c.id])
                );
            } else {
                // Else, check all columns by default. Update the cache.
                const cachedVisibilityCopy = Object.assign({}, cachedVisibility);
                columnsInGroup?.forEach(c => {
                    checkedColumnsCopy[c.id] = c.type !== 'empty';
                    cachedVisibilityCopy[c.id] = c.type !== 'empty';
                });
                setCachedVisibility(cachedVisibilityCopy);
            }
        }
        setCheckedColumns(checkedColumnsCopy);
    };

    const onColumnClick = (c: ColumnInstance<T>) => {
        const checkedColumnsCopy = Object.assign({}, checkedColumns);
        const cachedVisibilityCopy = Object.assign({}, cachedVisibility);
        const group = columnToGroup(c.id)!;
        checkedColumnsCopy[c.id] = !checkedColumns[c.id];
        // If user checks a column and none of the other columns in the group were visible, check the group, clear the cache for this group.
        if (!checkedColumns[c.id] && !isGroupExpanded(group.Header as string)) {
            checkedColumnsCopy[groupMapping[group.Header as string]] = false;
            group.columns?.forEach(column => (cachedVisibilityCopy[column.id] = false));
        }
        // If user unchecks a column and none of the other columns in the group were visible, uncheck the group.
        else if (
            checkedColumns[c.id] &&
            isGroupExpanded(group.Header as string) &&
            group.columns?.filter(column => checkedColumnsCopy[column.id])?.length === 0
        ) {
            checkedColumnsCopy[groupMapping[group.Header as string]] = true;
        }
        cachedVisibilityCopy[c.id] = !checkedColumns[c.id];
        setCachedVisibility(cachedVisibilityCopy);
        setCheckedColumns(checkedColumnsCopy);
    };

    const renderTable = (
        cachedVisibility: Record<string, boolean>,
        checkedColumns: Record<string, boolean>
    ) => {
        setCached(cachedVisibility);
        allColumns.forEach(
            c => c.type !== 'fixed' && toggleHideColumn(c.id, !checkedColumns[c.id])
        );
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
                                            onGroupClick(g);
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
                                                                        onColumnClick(c);
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
