import React, { useEffect, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { useFetchAutocompleteQuery } from '../apollo/hooks';
import ComboBox from './ComboBox';
import { SelectableListItem } from './SelectableList';

interface SelectionValue {
    ensemblId: string;
    name: string;
    position: string;
}

interface GeneSearchProps {
    geneName: string;
    onSelect: (gene: SelectionValue) => void;
    onChange: (geneName: string) => void;
}

const GeneSearch: React.FC<GeneSearchProps> = ({ geneName, onChange, onSelect }) => {
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
                    .filter(hit => !!hit.ensembl?.gene && !!hit.genomic_pos)
                    .map((hit, i) => ({
                        value: {
                            name: hit.symbol.toUpperCase(),
                            ensemblId: hit.ensembl?.gene,
                            position: `${hit.genomic_pos.chr}:${hit.genomic_pos.start}-${hit.genomic_pos.end}`,
                        },
                        id: i,
                        label: hit.symbol.toUpperCase(),
                    }))
            );
        }
    }, [autocompleteResults]);

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
