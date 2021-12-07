import React from 'react';
import styled from 'styled-components';
import { Divider } from '../index';
import { CellText } from './Table.styles';

interface PhenotypeViewerProps {
    phenotypes: string;
    expanded: Boolean;
    onClick: () => void;
}

const CellBorder = styled(Divider)`
    width: 200px;
    margin: 1rem 0;
`;

const Text = styled(props => <CellText {...props} />)`
    margin-inline-start: 0;
    margin-inline-end: 0;
    white-space: break-spaces;
    cursor: pointer;
    &:hover {
        text-decoration: underline dotted;
    }
`;

const PhenotypeViewer: React.FC<PhenotypeViewerProps> = ({ phenotypes, expanded, onClick }) => {
    const phenotypicFeatures = phenotypes.split(';');
    return phenotypicFeatures.length ? (
        expanded ? (
            <>
                {phenotypicFeatures.map((p, key) => (
                    <>
                        <Text key={key} onClick={onClick}>
                            {p.includes('null') ? p.replace(': null', '') : p}
                        </Text>
                        {!isLastElement(key, phenotypicFeatures) && <CellBorder />}
                    </>
                ))}
            </>
        ) : (
            <Text onClick={onClick}>{`${phenotypicFeatures.length} phenotypes`}</Text>
        )
    ) : (
        <span>{phenotypes}</span>
    );
};

const isLastElement = (index: number, list: Array<any>) => index === list.length - 1;

export default PhenotypeViewer;
