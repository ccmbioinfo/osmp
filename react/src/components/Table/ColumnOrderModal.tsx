import { useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { ColumnInstance, HeaderGroup } from 'react-table';
import { Button, InlineFlex, Modal, Typography } from '../index';
import { IconPadder } from './Table.styles';

interface ColumnOrderModalProps<T extends object> {
    allColumns: ColumnInstance<T>[];
    headerGroups: HeaderGroup<T>[];
    setColumnOrder: (update: string[] | ((columnOrder: string[]) => string[])) => void;
}

export default function ColumnOrderModal<T extends {}>({
    headerGroups,
    allColumns,
    setColumnOrder,
}: ColumnOrderModalProps<T>) {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [order, setOrder] = useState<ColumnInstance<T>[]>([]);
    const reorder = (startIndex: number, endIndex: number): ColumnInstance<T>[] => {
        const result: ColumnInstance<T>[] = order;
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }
        console.log(source.index, destination.index);
        const columnOrder = reorder(source.index, destination.index);
        setOrder(columnOrder);
    };
    const saveModal = () => {
        console.log('saveModal', order);
        setColumnOrder(order.map(o => o.id));
        setShowModal(false);
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
                Order Columns
                <IconPadder>{showModal ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}</IconPadder>
            </Button>
            <Modal
                active={showModal}
                hideModal={() => setShowModal(false)}
                title="Order Columns"
                footer="save"
                onClick={saveModal}
            >
                {headerGroups[0].headers.map((g, id) => (
                    <DragDropContext key={id} onDragEnd={onDragEnd}>
                        <Droppable key={id} droppableId={JSON.stringify(id)}>
                            {(droppableProvided, snapshot) => (
                                <div
                                    ref={droppableProvided.innerRef}
                                    {...droppableProvided.droppableProps}
                                    style={{ paddingLeft: '10px' }}
                                >
                                    <Typography variant="p" bold>
                                        {g.Header}
                                    </Typography>

                                    {order.map(
                                        (c, id) =>
                                            g.columns?.find(column => column.id === c.id) &&
                                            c.isVisible && (
                                                <Draggable key={c.id} draggableId={c.id} index={id}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                paddingTop: '2px',
                                                                paddingBottom: '2px',
                                                                paddingLeft: '25px',
                                                                userSelect: 'none',
                                                                backgroundColor: snapshot.isDragging
                                                                    ? 'lightgrey'
                                                                    : 'white',
                                                                ...provided.draggableProps.style,
                                                            }}
                                                        >
                                                            <Typography variant="p">
                                                                {c.Header}
                                                            </Typography>
                                                        </div>
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
