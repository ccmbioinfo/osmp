import React from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';
import CellViewer, { ViewerProps } from './CellViewer';

interface FlaggedGenesViewerProps extends ViewerProps {
    flaggedGenes: Maybe<string[]>;
}

const FlaggedGenesViewer: React.FC<FlaggedGenesViewerProps> = ({
    flaggedGenes,
    rowExpanded,
    toggleRowExpanded,
}) => {
    return (
        <CellViewer<string>
            {...{ rowExpanded, toggleRowExpanded }}
            formatText={flaggedGene => flaggedGene}
            itemName="Flagged Gene"
            items={flaggedGenes}
        />
    );
};

export default FlaggedGenesViewer;
