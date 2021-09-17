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
    selectedGene: string;
    onSelect: (gene: GeneOption) => void;
}

const GeneSearch: React.FC<GeneSearchProps> = ({ onSelect, selectedGene }) => {
    const [options, setOptions] = useState<GeneOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [fetchAutocompleteResults, { data: autocompleteResults, loading: autocompleteLoading }] =
        useFetchAutocompleteQuery();

    const debouncedAutocompleteFetch = useAsyncDebounce(fetchAutocompleteResults, 500);

    useEffect(() => {
        if (!searchTerm) {
            setOptions([]);
        }
        if (searchTerm.length > 2) {
            debouncedAutocompleteFetch({ variables: { q: searchTerm.toLowerCase() } });
        }
    }, [debouncedAutocompleteFetch, searchTerm]);

    useEffect(() => {
        if (autocompleteResults) {
            setOptions(
                (autocompleteResults.autocompleteResults.hits || []).map((hit, i) => ({
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
            onChange={term => setSearchTerm(term)}
            onClose={() => setOptions([])}
            onSelect={item => {
                setSearchTerm(item.label);
                onSelect(item);
            }}
            placeholder="Gene Search"
            value={selectedGene || ''}
        />
    );
};

export default GeneSearch;
