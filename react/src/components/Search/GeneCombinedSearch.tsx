import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { AssemblyId } from '../../types';
import ComboBox from '../ComboBox';
import { Flex } from '../Layout';
import GeneNameSearch, { GeneSelectionValue } from './GeneNameSearch';
import GenePositionSearch from './GenePositionSearch';

const Wrapper = styled(Flex)`
    position: relative
    min-height: 40px;
    flex-wrap: nowrap;
    flex-grow: 1;
    position: relative;
    width: 100%;
`;

interface DropdownProps {
    options: {
        id: number,
        value: string;
        label: string;
    }[];

}

const Dropdown: React.FC<DropdownProps> = (props) => {
    return <></>;
};

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

    const [searchMode, setSearchMode] = useState("Gene Name");
    return (
        <Wrapper>
            <ComboBox 
            options={["Gene Name", "Region"].map((a, id) => ({
                id,
                label: a,
                value: a,
            }))}
            onSelect={setSearchMode}
            value={searchMode}
            placeholder="Select"
            />
            {searchMode === "Gene Name" && 
                <GeneNameSearch 
                assembly={props.assembly}
                geneName={props.geneName}
                onChange={props.onNameChange}
                onSelect={props.onNameSelect}
                />
            }
            {searchMode === "Region" &&
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