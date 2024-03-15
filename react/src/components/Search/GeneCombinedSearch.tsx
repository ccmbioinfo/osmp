import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { AssemblyId } from '../../types';
import { Flex } from '../Layout';
import GeneNameSearch, { GeneSelectionValue } from './GeneNameSearch';
import GenePositionSearch from './GenePositionSearch';

const Wrapper = styled(Flex)`
    position: relative
    min-height: 38px;
    flex-wrap: nowrap;
    flex-grow: 0;
    position: relative;
    width: 100%;
`;

const Select = styled.select`

`; // TODO: style this

const Option = styled.option`

`; // TODO: style this

interface GeneCombinedSearchProps {
    assembly: AssemblyId;
    geneName: string;
    onNameChange: (geneName: string) => void;
    onNameSelect: (gene: GeneSelectionValue) => void;
    genePosition: string;
    onPositionChange: (genePosition: string) => void;
    onError?: (errorText: string | undefined) => void;
}

/**
 * Combined search component for searching by gene name or by position.
 * Contains a dropdown integrated into the search bar where the user can
 * switch between search modes.
 */
const GeneCombinedSearch: React.FC<GeneCombinedSearchProps> = (props) => {

    const [searchMode, setSearchMode] = useState("name");  // "name" or "pos"

    return (
        <Wrapper>
            <Select value={searchMode} onChange={e => setSearchMode(e.currentTarget.value)}>
                <Option value="name">Gene Name</Option>
                <Option value="pos">Region</Option>
            </Select>
            {searchMode === "name" && 
                <GeneNameSearch 
                assembly={props.assembly}
                geneName={props.geneName}
                onChange={props.onNameChange}
                onSelect={props.onNameSelect}
                />
            }
            {searchMode === "pos" &&
                <GenePositionSearch 
                position={props.genePosition}
                onChange={props.onPositionChange}
                onError={props.onError}
                />
            }
        </Wrapper>
    );
};

export default GeneCombinedSearch;