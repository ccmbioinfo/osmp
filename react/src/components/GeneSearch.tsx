import React, { useEffect, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { useFetchAutocompleteQuery } from '../apollo/hooks';
import { AssemblyId } from '../types';
import ComboBox from './ComboBox';
import { SelectableListItem } from './SelectableList';

interface SelectionValue {
    ensemblId: string;
    name: string;
    position: string;
}

interface GeneSearchProps {
    assembly: AssemblyId;
    geneName: string;
    onSelect: (gene: SelectionValue) => void;
    onChange: (geneName: string) => void;
}

interface HitPosition {
    chr: string;
    start: number;
    end: number;
}

interface HitPositions {
    genomic_pos: HitPosition;
    genomic_pos_hg19: HitPosition;
}

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
            setOptions(
                (autocompleteResults.autocompleteResults.hits || [])
                    .filter(
                        hit => !!hit.ensembl?.gene && !!hit.genomic_pos && !!hit.genomic_pos_hg19
                    )
                    .map((hit, i) => ({
                        value: {
                            name: hit.symbol.toUpperCase(),
                            ensemblId: hit.ensembl?.gene,
                            position: getPosition(assembly, hit),
                        },
                        id: i,
                        label: hit.symbol.toUpperCase(),
                    }))
            );
        }
    }, [assembly, autocompleteResults]);

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
