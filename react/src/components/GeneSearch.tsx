import React, { useEffect, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { useFetchAutocompleteQuery, useFetchEnsemblIdQuery } from '../apollo/hooks';
import { DropdownItem } from '../types';
import ComboBox from './ComboBox/ComboBox';

export interface GeneOption {
    ensemblId: string;
    name: string;
}

interface GeneSearchProps {
    value: GeneOption;
    onSelect: (gene: GeneOption) => void;
    onSearch: (name: string) => void;
}

const GeneSearch: React.FC<GeneSearchProps> = ({ onSearch, onSelect, value: { name } }) => {
    const [options, setOptions] = useState<DropdownItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');

    const [fetchAutocompleteResults, { data: autocompleteResults, loading: autocompleteLoading }] =
        useFetchAutocompleteQuery();

    const [fetchEnsemblIdResults, { data: ensemblIdResults, loading: ensemblIdLoading }] =
        useFetchEnsemblIdQuery();

    const debouncedAutocompleteFetch = useAsyncDebounce(fetchAutocompleteResults, 500);

    useEffect(() => {
        if (!searchTerm) {
            setOptions([]);
        }
        if (searchTerm.length > 2) {
            debouncedAutocompleteFetch({ variables: { term: searchTerm.toLowerCase() } });
        }
    }, [debouncedAutocompleteFetch, searchTerm]);

    useEffect(() => {
        if (autocompleteResults) {
            setOptions(
                (autocompleteResults.autocompleteResults.suggestions || []).map(
                    (s: { suggestion: string }, i: number) => ({
                        value: s.suggestion.toUpperCase(),
                        id: i,
                        label: s.suggestion.toUpperCase(),
                    })
                )
            );
        }
    }, [autocompleteResults]);

    useEffect(() => {
        if (ensemblIdResults && selectedTerm) {
            onSelect({
                ensemblId: ensemblIdResults.fetchEnsemblIdResults.entries[0]['id'],
                name: selectedTerm,
            });
            setSelectedTerm('');
        }
    }, [ensemblIdResults, onSelect, selectedTerm]);

    return (
        <ComboBox
            items={options}
            loading={autocompleteLoading || ensemblIdLoading}
            onChange={term => setSearchTerm(term)}
            onClose={() => setOptions([])}
            onSelect={item => {
                setSearchTerm(item.label);
                setSelectedTerm(item.label);
                fetchEnsemblIdResults({ variables: { query: item.value } });
            }}
            placeholder="Gene Search"
            value={name || ''}
        />
    );
};

export default GeneSearch;
