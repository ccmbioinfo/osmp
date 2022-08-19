import React from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';
import { PhenotypicFeaturesFields } from '../../types';
import CellViewer, { ViewerProps } from './CellViewer';

interface PhenotypeViewerProps extends ViewerProps {
    phenotypes: Maybe<PhenotypicFeaturesFields[]>;
}

const PhenotypeViewer: React.FC<PhenotypeViewerProps> = ({
    phenotypes,
    rowExpanded,
    toggleRowExpanded,
    color,
}) => {
    return (
        <CellViewer<PhenotypicFeaturesFields>
            {...{ rowExpanded, toggleRowExpanded }}
            formatItemText={phenotype => phenotype.phenotypeLabel || ''}
            itemName={{ singular: 'Phenotype' }}
            items={phenotypes}
            color={color}
        />
    );
};

export default PhenotypeViewer;
