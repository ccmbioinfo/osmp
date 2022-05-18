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
}) => {
    return (
        <CellViewer<PhenotypicFeaturesFields>
            {...{ rowExpanded, toggleRowExpanded }}
            formatText={phenotype => phenotype.phenotypeLabel || ''}
            itemName="Phenotype"
            items={phenotypes}
        />
    );
};

export default PhenotypeViewer;
