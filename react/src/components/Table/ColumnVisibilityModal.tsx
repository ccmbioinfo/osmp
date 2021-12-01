import React, { useState } from 'react';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { ColumnInstance, HeaderGroup, Row, UseTableInstanceProps } from 'react-table';
import { downloadCsv } from '../../hooks';
import { Button, Checkbox, InlineFlex, Modal } from '../index';
import { IconPadder } from './Table.styles';
import { camelize } from '../../utils';

interface ColumnVisibilityModalProps<T extends object>
    extends Pick<UseTableInstanceProps<T>, 'toggleHideColumn'> {
    rows: Row<T>[];
    visibleColumns: ColumnInstance<T>[];
    headerGroups: HeaderGroup<T>[];
    toggleGroupVisibility: (g: HeaderGroup<T>) => void;
}

export default function ColumnVisibilityModal<T extends {}>({
    rows,
    visibleColumns,
    headerGroups,
    toggleGroupVisibility,
    toggleHideColumn,
}: ColumnVisibilityModalProps<T>) {
    const [showModal, setShowModal] = useState<boolean>(false);

    return (
        <InlineFlex>
            <Button variant="secondary" onClick={() => setShowModal(!showModal)}>
                Customize columns
                <IconPadder>{showModal ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}</IconPadder>
            </Button>
            <Button
                variant="primary"
                onClick={() =>
                    downloadCsv(
                        rows.map(r => r.values as T),
                        visibleColumns
                            .filter(c => c.id && !c.id.match(/^empty/i))
                            .map(c => c.id as keyof T)
                    )
                }
            >
                Export Data
            </Button>
            <Modal
                active={showModal}
                hideModal={() => setShowModal(false)}
                title="Customize Columns"
            >
                {headerGroups[0].headers
                    .filter(header => header.Header !== 'Core')
                    .map((g, id) => (
                        <div key={id}>
                            <Checkbox
                                label={g.Header as string}
                                checked={g.isVisible}
                                onClick={() => toggleGroupVisibility(g)}
                            />
                            {g.columns?.map(
                                (c, id) =>
                                    c.type !== 'fixed' &&
                                    c.type !== 'empty' && (
                                        <div key={id} style={{ paddingLeft: 20 }}>
                                            <Checkbox
                                                label={c.Header as string}
                                                checked={c.isVisible}
                                                onClick={() => {
                                                    if (
                                                        c.parent &&
                                                        g.columns?.filter(c => c.isVisible)
                                                            .length === 1
                                                    ) {
                                                        toggleHideColumn(c.id, c.isVisible);
                                                        toggleHideColumn(
                                                            camelize(`empty ${c.parent.id}`),
                                                            !c.isVisible
                                                        );
                                                    } else {
                                                        toggleHideColumn(c.id, c.isVisible);
                                                    }
                                                }}
                                            />
                                        </div>
                                    )
                            )}
                        </div>
                    ))}
            </Modal>
        </InlineFlex>
    );
}
