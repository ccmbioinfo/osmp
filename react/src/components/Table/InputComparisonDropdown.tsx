import React, { useState } from 'react';
import { FaEquals, FaGreaterThanEqual, FaLessThanEqual } from 'react-icons/fa';
import { SelectableList } from '..';
import { useClickAway } from '../../hooks';
import { IconButton } from '../index';

export type ComparisonType = {
    less: boolean;
    greater: boolean;
    equal: boolean;
};

export type ComparisonOption = {
    id: number;
    value: keyof ComparisonType;
    label: string;
};

export interface FilterComparison {
    start: ComparisonType;
    end: ComparisonType;
}

interface InputComparisonDropdownProps {
    columnId: keyof FilterComparison;
    filterComparison: FilterComparison;
    setFilterComparison: React.Dispatch<React.SetStateAction<FilterComparison>>;
}

const Icons = Object.freeze({
    equal: <FaEquals size={7} />,
    less: <FaLessThanEqual size={7} />,
    greater: <FaGreaterThanEqual size={7} />,
});

export const InputComparisonDropdown: React.FC<InputComparisonDropdownProps> = ({
    columnId,
    filterComparison,
    setFilterComparison,
}) => {
    const [open, setOpen] = useState(false);
    const [sign, setSign] = useState<keyof ComparisonType>('equal');

    const COMPARISON_OPTIONS: ComparisonOption[] = [
        {
            id: 1,
            value: 'less',
            label: '<',
        },
        {
            id: 2,
            value: 'greater',
            label: '>',
        },
        {
            id: 3,
            value: 'equal',
            label: '=',
        },
    ];

    const ref = React.useRef() as React.MutableRefObject<HTMLDivElement>;

    useClickAway(ref, () => setOpen(false));

    return (
        <div ref={ref}>
            <IconButton variant="light" onClick={() => setOpen(true)}>
                {Icons[sign]}
            </IconButton>
            {open && (
                <SelectableList
                    options={COMPARISON_OPTIONS}
                    onSelect={value => {
                        setSign(value);
                        const newComparison = filterComparison;
                        Object.keys(newComparison[columnId]).forEach(v => {
                            newComparison[columnId][v as keyof ComparisonType] =
                                v === value ? true : false;
                        });
                        console.log(value);
                        console.log(newComparison);
                        setFilterComparison(newComparison);
                    }}
                />
            )}
        </div>
    );
};
