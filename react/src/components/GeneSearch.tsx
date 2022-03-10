import React, { useCallback, useEffect, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { useFetchAutocompleteQuery } from '../apollo/hooks';
import { AssemblyId } from '../types';
import ComboBox from './ComboBox';
import { SelectableListItem } from './SelectableList';
interface HitPosition {
    chr: string;
    start: number;
    end: number;
}

interface Gene {
    gene: string;
}
interface AutocompleteResults {
    autocompleteResults: {
        hits?: {
            symbol: string;
            ensembl: Gene | Gene[];
            genomic_pos: HitPosition | HitPosition[];
            genomic_pos_hg19: HitPosition | HitPosition[];
        }[];
    };
}
export interface GeneSelectionValue {
    ensemblId?: string;
    name: string;
    position: string;
}

interface GeneSearchProps {
    assembly: AssemblyId;
    geneName: string;
    onSelect: (gene: GeneSelectionValue) => void;
    onChange: (geneName: string) => void;
}

const isCanonicalRegion = (chr: string) =>
    ['X', 'Y', ...Array.from({ length: 22 }, (_, i) => (i + 1).toString())].includes(chr);

const GeneSearch: React.FC<GeneSearchProps> = ({ assembly, geneName, onChange, onSelect }) => {
    const [options, setOptions] = useState<SelectableListItem<GeneSelectionValue>[]>([]);

    const [fetchAutocompleteResults, { data: autocompleteResults, loading: autocompleteLoading }] =
        useFetchAutocompleteQuery();

    const debouncedAutocompleteFetch = useAsyncDebounce(fetchAutocompleteResults, 500);

    const formatAutocompleteOptions = useCallback(
        (autocompleteResults: AutocompleteResults, assembly: AssemblyId) =>
            (autocompleteResults.autocompleteResults.hits || [])
                .filter(hit => !!hit.ensembl && !!hit.genomic_pos && !!hit.genomic_pos_hg19)
                .map((hit, i) => {
                    const { symbol, ...rest } = hit;

                    const ensembl = [rest.ensembl].flat();
                    const genomic_pos = [rest.genomic_pos].flat();
                    const genomic_pos_hg19 = [rest.genomic_pos_hg19].flat();
                    const genes = {
                        symbol,
                        ensembl,
                        genomic_pos,
                        genomic_pos_hg19,
                    };

                    const is38 = /38/.test(assembly);

                    return (is38 ? genomic_pos : genomic_pos_hg19)
                        .filter(g => isCanonicalRegion(g.chr))
                        .map((e, eid) => {
                            return {
                                value: {
                                    name: genes.symbol.toUpperCase(),
                                    ensemblId: '',
                                    position: `${e.chr}:${e.start}-${e.end}`,
                                },
                                id: i + eid,
                                label: `${hit.symbol.toUpperCase()} (Chromosome: ${e.chr}, Start: ${
                                    e.start
                                }, End: ${e.end})`,
                            };
                        });
                })
                .flat(),
        []
    );

    useEffect(() => {
        if (options.length) {
            if (!geneName) {
                setOptions([]);
            }
        }
        if (geneName.length > 2 && !options.map(o => o.value.name).includes(geneName)) {
            debouncedAutocompleteFetch({ variables: { q: geneName.toLowerCase() } });
        }
    }, [debouncedAutocompleteFetch, geneName, options]);

    useEffect(() => {
        if (autocompleteResults) {
            setOptions(formatAutocompleteOptions(autocompleteResults, assembly));
        }
    }, [geneName, assembly, autocompleteResults, formatAutocompleteOptions]);

    return (
        <>
            <ComboBox
                options={options}
                loading={autocompleteLoading}
                onChange={term => onChange(term)}
                onSelect={(item: GeneSelectionValue) => onSelect(item)}
                placeholder="Gene Search"
                searchable
                value={geneName || ''}
            />
        </>
    );
};

export default GeneSearch;
