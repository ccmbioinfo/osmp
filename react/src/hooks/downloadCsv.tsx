import { TableRow } from '../types';

function getKeys<O extends {}>(o: O) {
    return Object.keys(o) as Array<keyof O>;
}

const objectToCsv = (data: TableRow[]) => {
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

const download = (data: BlobPart) => {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ssmp.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// /**
//  * @param json The variant query response data
//  * @param headers A list of column ids that user wants to download
//  */

const downloadCsv = (json: TableRow[], headers: (keyof TableRow)[]) => {
    const redux = (array: TableRow[]) =>
        array.map(o =>
            headers.reduce((acc, curr) => {
                acc[curr] = o[curr];
                return acc;
            }, {})
        );

    const filtered = redux(json);

    const csvData = objectToCsv(filtered);
    console.log(filtered);
    download(csvData);
};

export default downloadCsv;
