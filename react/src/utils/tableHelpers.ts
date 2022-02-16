import { HeaderGroup } from 'react-table';
import {
    CallsetInfoFields,
    IndividualInfoFields,
    IndividualResponseFields,
    VariantQueryDataResult,
    VariantResponseFields,
    VariantResponseInfoFields,
} from '../types';

type Accessor = string | (() => JSX.Element) | ((state: any) => any);

export type FlattenedQueryResponse = Omit<IndividualResponseFields, 'info' | 'diseases'> &
    IndividualInfoFields & { contactInfo: string } & Omit<
        VariantResponseFields,
        'callsets' | 'info'
    > &
    CallsetInfoFields &
    VariantResponseInfoFields & { source: string; diseases: string };

export interface ResultTableColumns extends FlattenedQueryResponse {
    aaChange: string;
    emptyCaseDetails: string;
    emptyVariationDetails: string;
}

export const flattenBaseResults = (result: VariantQueryDataResult): FlattenedQueryResponse => {
    const { contactInfo, source } = result;
    const { callsets, info: variantInfo, ...restVariant } = result.variant;
    const { diseases, info: individualInfo, ...restIndividual } = result.individual;
    const flattenedDiseases = (diseases || []).reduce(
        (a, c, i) => `${a}${i ? ';' : ''}${c.diseaseLabel}`,
        ''
    );

    return {
        contactInfo,
        diseases: flattenedDiseases,
        ...individualInfo,
        ...restIndividual,
        ...restVariant,
        source,
        ...variantInfo,
    };
};

export const addAdditionalFieldsAndFormatNulls = (
    results: FlattenedQueryResponse
): ResultTableColumns => {
    const reformatted = Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, v === 'NA' ? '' : v])
    ) as FlattenedQueryResponse;
    return {
        ...reformatted,
        emptyCaseDetails: '',
        emptyVariationDetails: '',
        aaChange: reformatted.aaPos?.trim()
            ? `p.${reformatted.aaRef}${reformatted.aaPos}${reformatted.aaAlt}`
            : '',
    };
};

export const calculateColumnWidth = (
    data: ResultTableColumns[],
    accessor: Accessor,
    headerText: string
) => {
    if (typeof accessor === 'string') {
        accessor = d => d[accessor as string]; // eslint-disable-line no-param-reassign
    }
    const maxWidth = 600;
    const magicSpacing = 15;
    const cellLength = Math.max(
        ...data.map(row => (`${(accessor as (state: any) => any)(row)}` || '').length),
        headerText.length
    );
    return Math.min(maxWidth, cellLength * magicSpacing);
};

export const isHeader = (column: HeaderGroup<ResultTableColumns>) => !column.parent;

export const isHeaderExpanded = (column: HeaderGroup<ResultTableColumns>) => {
    if (isHeader(column) && column.columns) {
        const visibleColumns = column.columns.filter(c => c.isVisible).map(c => c.id);
        const intersection = visibleColumns.filter(value =>
            ['emptyVariationDetails', 'emptyCaseDetails', 'emptyCore'].includes(value)
        );
        return !intersection.length;
    }
    return false;
};
