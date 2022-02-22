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
type Variant = Pick<VariantResponseFields, 'ref' | 'alt' | 'start' | 'end'>;

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
    homozygousCount?: number;
    heterozygousCount?: number;
    uniqueId: number;
}

const flattenBaseResults = (result: VariantQueryDataResult): FlattenedQueryResponse => {
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

const addAdditionalFieldsAndFormatNulls = (
    results: FlattenedQueryResponse,
    uniqueId: number
): ResultTableColumns => {
    const reformatted = Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, v === 'NA' ? '' : v])
    ) as FlattenedQueryResponse;
    return {
        ...reformatted,
        emptyCaseDetails: '',
        emptyVariationDetails: '',
        uniqueId,
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

export const isCaseDetailsCollapsed = (headers: HeaderGroup<ResultTableColumns>[]) => {
    const caseDetailsCol = headers.find(header => header.Header === 'Case Details');
    return caseDetailsCol && !isHeaderExpanded(caseDetailsCol);
};

const sortQueryResult = (queryResult: VariantQueryDataResult[]) => {
    const sortedQueryResult = [...queryResult].sort(
        (a, b) =>
            a.variant.ref.localeCompare(b.variant.ref) ||
            a.variant.alt.localeCompare(b.variant.alt) ||
            a.variant.start - b.variant.start ||
            a.variant.end - b.variant.end
    );
    return sortedQueryResult;
};

export const isHeterozygous = (zygosity: string | null | undefined) => {
    return !!zygosity?.toLowerCase().includes('het');
};

export const isHomozygous = (zygosity: string | null | undefined) => {
    return !!zygosity?.toLowerCase().includes('hom');
};

// 1, Sort queryResult in ascending order according to variant's ref, alt, start, end.
// 2, Flatten data and compute values as needed (note that column display formatting function should not alter values for ease of export). Assign uniqueId, homozygousCount, heterozygousCount to each row.
export const prepareData = (
    queryResult: VariantQueryDataResult[]
): [ResultTableColumns[], number[]] => {
    const sortedQueryResult = sortQueryResult(queryResult);

    const result: Array<ResultTableColumns> = [];

    // contains indices of first encountered rows that represent unique variants.
    const uniqueVariantIndices: Array<number> = [];

    var currVariant = {} as Variant;
    var currUniqueId = 0;
    var currRowId = 0;
    var currHomozygousCount = 0;
    var currHeterozygousCount = 0;

    sortedQueryResult.forEach(d => {
        const { ref, alt, start, end } = d.variant;

        if (
            currVariant.ref !== ref ||
            currVariant.alt !== alt ||
            currVariant.start !== start ||
            currVariant.end !== end
        ) {
            if (uniqueVariantIndices.length) {
                result
                    .slice(uniqueVariantIndices[uniqueVariantIndices.length - 1], currRowId)
                    .forEach(row => {
                        row.homozygousCount = currHomozygousCount;
                        row.heterozygousCount = currHeterozygousCount;
                    });
            }

            currHomozygousCount = 0;
            currHeterozygousCount = 0;
            currVariant = { ref, alt, start, end };
            currUniqueId += 1;
            uniqueVariantIndices.push(currRowId);
        }

        if (d.variant.callsets.length) {
            result.push.apply(
                result,
                d.variant.callsets
                    .filter(cs => cs.individualId === d.individual.individualId)
                    .map(cs =>
                        addAdditionalFieldsAndFormatNulls(
                            {
                                ...cs.info,
                                ...flattenBaseResults(d),
                            },
                            currUniqueId
                        )
                    )
            );
            currRowId += d.variant.callsets.length;
            d.variant.callsets.forEach(cs =>
                isHeterozygous(cs.info.zygosity)
                    ? (currHeterozygousCount += 1)
                    : isHomozygous(cs.info.zygosity)
                    ? (currHomozygousCount += 1)
                    : {}
            );
        } else {
            result.push(addAdditionalFieldsAndFormatNulls(flattenBaseResults(d), currUniqueId));
            currRowId += 1;
        }
    });
    result.slice(uniqueVariantIndices[uniqueVariantIndices.length - 1], currRowId).forEach(row => {
        row.homozygousCount = currHomozygousCount;
        row.heterozygousCount = currHeterozygousCount;
    });

    return [result, uniqueVariantIndices];
};
