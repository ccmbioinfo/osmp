import React from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';
import CellViewer, { ViewerProps } from './CellViewer';

interface DiseasesViewerProps extends ViewerProps {
    disorders: Maybe<string[]>;
}

const DiseasesViewer: React.FC<DiseasesViewerProps> = ({
    disorders,
    rowExpanded,
    toggleRowExpanded,
}) => {
    return (
        <CellViewer<string>
            {...{ rowExpanded, toggleRowExpanded }}
            itemName={{ singular: 'Disease' }}
            items={disorders}
        />
    );
};

export default DiseasesViewer;
