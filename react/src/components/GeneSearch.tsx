import React, { useEffect, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { useFetchAutocompleteQuery } from '../apollo/hooks';
import { DropdownItem } from '../types';
import ComboBox from './ComboBox/ComboBox';

export type GeneOption = DropdownItem<SelectionValue>;

interface SelectionValue {
    ensemblId: string;
    name: string;
}

interface GeneSearchProps {
    geneName: string;
    onSelect: (gene: GeneOption) => void;
    onChange: (geneName: string) => void;
}

const GeneSearch: React.FC<GeneSearchProps> = ({ geneName, onChange, onSelect }) => {
    const [options, setOptions] = useState<GeneOption[]>([]);

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
                    .filter(hit => !!hit.ensembl?.gene)
                    .map((hit, i) => ({
                        value: {
                            name: hit.symbol.toUpperCase(),
                            ensemblId: hit.ensembl?.gene,
                        },
                        id: i,
                        label: hit.symbol.toUpperCase(),
                    }))
            );
        }
    }, [autocompleteResults]);

    return (
        <ComboBox
            items={options}
            loading={autocompleteLoading}
            onChange={term => onChange(term)}
            onSelect={item => onSelect(item)}
            placeholder="Gene Search"
            value={geneName || ''}
        />
    );
};

export default GeneSearch;
