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

interface HitPositions {
    genomic_pos: HitPosition;
    genomic_pos_hg19: HitPosition;
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
interface SelectionValue {
    ensemblId?: string;
    name: string;
    position: string;
}

interface GeneSearchProps {
    assembly: AssemblyId;
    geneName: string;
    onSelect: (gene: SelectionValue) => void;
    onChange: (geneName: string) => void;
}

/* Typeguard */
const isMultipleGenes = (arg: Gene | Gene[]): arg is Gene[] => (arg as Gene[]).length >= 0;

const getPosition = (assembly: AssemblyId, position: HitPositions) => {
    const is38 = /38/.test(assembly);
    const resolvedPosition = is38 ? position.genomic_pos : position.genomic_pos_hg19;
    return `${resolvedPosition.chr}:${resolvedPosition.start}-${resolvedPosition.end}`;
};

const GeneSearch: React.FC<GeneSearchProps> = ({ assembly, geneName, onChange, onSelect }) => {
    const [options, setOptions] = useState<SelectableListItem<SelectionValue>[]>([]);

    const [fetchAutocompleteResults, { data: autocompleteResults, loading: autocompleteLoading }] =
        useFetchAutocompleteQuery();

    const debouncedAutocompleteFetch = useAsyncDebounce(fetchAutocompleteResults, 500);

    const formatAutocompleteOptions = useCallback(
        (autocompleteResults: AutocompleteResults) =>
            (autocompleteResults.autocompleteResults.hits || [])
                .filter(hit => !!hit.ensembl && !!hit.genomic_pos && !!hit.genomic_pos_hg19)
                .map(hit => {
                    const { symbol, ...rest } = hit;
                    const ensembl = [rest.ensembl].flat();
                    const genomic_pos = [rest.genomic_pos].flat();
                    const genomic_pos_hg19 = [rest.genomic_pos_hg19].flat();
                    return {
                        symbol,
                        ensembl,
                        genomic_pos,
                        genomic_pos_hg19,
                    };
                })
                .map((hit, i) =>
                    hit.ensembl.map((e, eid) => ({
                        value: {
                            name: hit.symbol.toUpperCase(),
                            ensemblId: e.gene,
                            position: getPosition(assembly, {
                                genomic_pos: hit.genomic_pos[eid],
                                genomic_pos_hg19: hit.genomic_pos_hg19[eid],
                            }),
                        },
                        id: i + eid,
                        label: isMultipleGenes(hit.ensembl) ? e.gene : hit.symbol.toUpperCase(),
                    }))
                )
                .flat(),
        [assembly]
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
            console.log(autocompleteResults);
            setOptions(formatAutocompleteOptions(autocompleteResults));
        }
    }, [geneName, assembly, autocompleteResults, formatAutocompleteOptions]);

    return (
        <ComboBox
            options={options}
            loading={autocompleteLoading}
            onChange={term => onChange(term)}
            onSelect={(item: SelectionValue) => onSelect(item)}
            placeholder="Gene Search"
            searchable
            value={geneName || ''}
        />
    );
};

export default GeneSearch;
