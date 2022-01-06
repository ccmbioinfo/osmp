import { useState } from 'react';
import { ColumnInstance, Row } from 'react-table';
import { downloadCsv } from '../../utils';
import { Button, Input, Modal } from '../index';
import { InlineFlex } from '../Layout';

interface DownloadModalProps<T extends object> {
    rows: Row<T>[];
    visibleColumns: ColumnInstance<T>[];
}

export default function DownloadModal<T extends {}>({
    rows,
    visibleColumns,
}: DownloadModalProps<T>) {
    const [filename, setFilename] = useState<string>('');
    const [showDownload, setShowDownload] = useState<boolean>(false);

    return (
        <InlineFlex>
            <Button variant="primary" onClick={() => setShowDownload(true)}>
                Export Data
            </Button>
            <Modal
                active={showDownload}
                hideModal={() => {
                    setShowDownload(false);
                    setFilename('');
                }}
                title="Save Variants"
                footer="Download CSV"
                onClick={() =>
                    downloadCsv(
                        rows.map(r => r.values as T),
                        visibleColumns
                            .filter(c => c.id && !c.id.match(/^empty/i))
                            .map(c => c.id as keyof T),
                        filename
                    )
                }
            >
                <Input
                    variant="outlined"
                    value={filename}
                    placeholder="Enter filename..."
                    onChange={e => setFilename(e.target.value)}
                />
            </Modal>
        </InlineFlex>
    );
}
