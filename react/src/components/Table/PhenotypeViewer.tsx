import React from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';
import { PhenotypicFeaturesFields } from '../../types';
import CellViewer, { ViewerProps } from './CellViewer';

interface PhenotypeViewerProps extends ViewerProps {
    phenotypes: Maybe<PhenotypicFeaturesFields[]>;
    clinicalStatus: Maybe<String>;
}

const PhenotypeViewer: React.FC<PhenotypeViewerProps> = ({
    phenotypes,
    rowExpanded,
    toggleRowExpanded,
    clinicalStatus,
}) => {
    return (
        <CellViewer<PhenotypicFeaturesFields>
            {...{ rowExpanded, toggleRowExpanded }}
            formatText={phenotype => phenotype.phenotypeLabel || ''}
            itemName="Phenotype"
            items={phenotypes}
            text={clinicalStatus === 'unaffected' ? 'This patient is clinically normal' : ''}
        />
    );
};

export default PhenotypeViewer;
