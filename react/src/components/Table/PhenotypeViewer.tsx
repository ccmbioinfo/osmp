import React from 'react';
import styled from 'styled-components';
import { CellText } from './Table.styles';

interface PhenotypeViewerProps {
    phenotypes: string;
    expanded: Boolean;
    onClick: () => void;
}

const Text = styled(props => <CellText {...props} />)`
    white-space: break-spaces;
    cursor: pointer;
    &:hover {
        text-decoration: underline dotted;
    }
`;

const PhenotypeViewer: React.FC<PhenotypeViewerProps> = ({ phenotypes, expanded, onClick }) => {
    const phenotypicFeatures = phenotypes.split(';');
    return phenotypicFeatures.length > 1 ? (
        expanded ? (
            <>
                {phenotypicFeatures.map((p, key) => (
                    <Text key={key} onClick={onClick}>
                        {p}
                    </Text>
                ))}
            </>
        ) : (
            <Text onClick={onClick}>{`${phenotypicFeatures.length} phenotypes`}</Text>
        )
    ) : (
        <span>{phenotypes}</span>
    );
};

export default PhenotypeViewer;
