import React, { useCallback, useState } from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';
import styled from 'styled-components/macro';
import { Divider } from '../index';
import { CellText } from './Table.styles';

export interface ViewerProps {
    rowExpanded: boolean;
    toggleRowExpanded: (value?: boolean) => void;
}

interface CellViewerProps<T> extends ViewerProps {
    formatText: (item: T) => React.ReactNode;
    itemName: string;
    items: Maybe<T[]>;
    text?: string;
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

const CellViewer = <T extends {}>({
    formatText,
    items,
    itemName,
    rowExpanded,
    toggleRowExpanded,
    text,
}: CellViewerProps<T>) => {
    const [cellExpanded, setCellExpanded] = useState<boolean>(false);

    const isLastElement = (index: number, list: Array<T>) => index === list.length - 1;

    const onClick = useCallback(() => {
        toggleRowExpanded(!rowExpanded);
        setCellExpanded(cellExpanded => !cellExpanded);
    }, [rowExpanded, toggleRowExpanded]);

    if (!!items && !!items.length)
        return cellExpanded ? (
            <>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <Text onClick={onClick}>{formatText(item)}</Text>
                        {!isLastElement(index, items) && <CellBorder />}
                    </React.Fragment>
                ))}
            </>
        ) : (
            <Text onClick={onClick}>{`${items.length} ${itemName}${
                items.length === 1 ? '' : 's'
            }`}</Text>
        );
    else return <CellText>{text}</CellText>;
};

export default CellViewer;
