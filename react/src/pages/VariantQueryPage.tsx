import React from 'react';
import { useFetchVariantsQuery } from '../apollo/hooks';
import { Table, Typography } from '../components';
import { VariantQueryResponse, VariantQueryResponseSchemaTableRow } from '../types';

const VariantQueryPage: React.FC<{}> = () => {
    const { data } = useFetchVariantsQuery({
        input: { chromosome: '2', start: 50000, end: 70000, sources: ['local', 'ensembl'] },
    });

    return data && data.getVariants ? (
        <div>
            <h3>This is the Variant Query Page</h3>
            <hr />
            <Table variantData={prepareData(data.getVariants)} />
        </div>
    ) : (
        <Typography variant="p">Loading...</Typography>
    );
};

const prepareData = (queryResponse: VariantQueryResponse) =>
    queryResponse.data.reduce(
        (acc, curr) => (acc = acc.concat(curr.data.map(d => ({ source: curr.source, ...d })))),
        [] as VariantQueryResponseSchemaTableRow[]
    );

export default VariantQueryPage;
