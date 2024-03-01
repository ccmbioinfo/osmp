import React, { useCallback, useEffect, useState } from 'react';
import { Input } from '..';
import ErrorText from '../ErrorText';
import isCanonicalRegion from '../../utils/isCanonicalRegion';

interface GenePositionSearchProps {
    position: string;
    onChange: (position: string) => void;
    onError?: (errorText: string | undefined) => void;
    validatePosition?: (position: string) => boolean;
}

const GenePositionSearch: React.FC<GenePositionSearchProps> = (props) => {

    const [errorText, setErrorText] = useState<string | undefined>(undefined);

    // Update error text based on position format
    const validatePosition = (position: string) => {
        const chromStartEnd = position.split(":");
        if (chromStartEnd.length !== 2) {
            setErrorText("Invalid format: expected 1 ':' separator between chromosome and start-end");
            return;
        }

        const [chrom, region] = position;
        const startEnd = region.split("-");
        if (startEnd.length !== 2) {
            setErrorText("Invalid format: expected 1 '-' separator between start and end positions");
            return;
        }
        if (!isCanonicalRegion(chrom)) {
            setErrorText("Invalid chromosome: expected '1'-'22', 'X' or 'Y'");
            return;
        }

        const [start, end] = startEnd;
        if (start > end) {
            setErrorText("Invalid region: start position should be less than or equal to end position");
            return;
        }

        setErrorText("");
    }

    const handlePositionChange = (position: string) => {
        validatePosition(position);
        props.onChange(position);
    };

    return (
        <>
            <Input 
                variant="outlined"
                onChange={e => handlePositionChange(e.currentTarget.value)}
                value={props.position}
                placeholder="eg. 1:10,000,000-20,000,000"
            />
            <ErrorText error={errorText} />
        </>
    );
};

export default GenePositionSearch;
