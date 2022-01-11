import { IdType } from 'react-table';
import getKeys from '../utils/getKeys';

const objectToCsv = <T extends object>(data: T[]) => {
    const csvRows = [];
    const headers = getKeys(data[0]);
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const escaped = row[header] ? ('' + row[header]).replace(/"/g, '\\"') : '';
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

const formatFileName = (filename: string) =>
    filename.endsWith('.csv') ? filename : `${filename}.csv`;

const download = (data: BlobPart, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', formatFileName(filename));
    a.click();
    window.URL.revokeObjectURL(url);
};

/**
 * @param rows The values of the table rows
 * @param headers A list of column ids that user wants to download
 */

const downloadCsv = <T extends object>(
    rows: T[],
    selectedHeaders: IdType<T>[],
    filename: string
) => {
    const selectedRows = rows.map(r =>
        selectedHeaders.reduce((acc, curr) => ({ ...acc, ...{ [curr]: r[curr as keyof T] } }), {})
    );

    const csvData = objectToCsv(selectedRows);
    download(csvData, filename);
};

export default downloadCsv;
