import React from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';
import styled from 'styled-components';
import { PhenotypicFeaturesFields } from '../../types';
import { Divider } from '../index';
import { CellText } from './Table.styles';

interface PhenotypeViewerProps {
    phenotypes: Maybe<PhenotypicFeaturesFields[]>;
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
    text-decoration: underline dotted;
    color: blue;
`;

const PhenotypeViewer: React.FC<PhenotypeViewerProps> = ({ phenotypes, expanded, onClick }) => {
    return !!phenotypes && !!phenotypes.length ? (
        expanded ? (
            <>
                {phenotypes.map((p, key) => (
                    <>
                        <Text key={key} onClick={onClick}>
                            {p.phenotypeLabel || ''}
                        </Text>
                        {!isLastElement(key, phenotypes) && <CellBorder />}
                    </>
                ))}
            </>
        ) : (
            <Text onClick={onClick}>{`${phenotypes.length} phenotypes`}</Text>
        )
    ) : null;
};

const isLastElement = (index: number, list: Array<any>) => index === list.length - 1;

export default PhenotypeViewer;
