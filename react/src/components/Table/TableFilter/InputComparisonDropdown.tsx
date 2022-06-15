import React, { useEffect, useMemo, useState } from 'react';
import { FaEquals, FaGreaterThan, FaLessThan } from 'react-icons/fa';
import { UseFiltersColumnProps } from 'react-table';
import { SelectableList, SelectableListWrapper } from '../..';
import { useClickAway } from '../../../hooks';
import getKeys from '../../../utils/getKeys';
import { IconButton } from '../../index';
import { ResultTableColumns } from '../Table';

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

export type FilterComparison = { [K in keyof ResultTableColumns]?: ComparisonType };

interface InputComparisonDropdownProps<T extends {}>
    extends Pick<UseFiltersColumnProps<T>, 'setFilter'> {
    setFilterComparison: React.Dispatch<React.SetStateAction<ComparisonType>>;
    comparison: ComparisonType;
    ignoreRef: React.MutableRefObject<HTMLDivElement>;
}

const Icons = Object.freeze({
    equal: <FaEquals size={7} />,
    less: <FaLessThan size={7} />,
    greater: <FaGreaterThan size={7} />,
});

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

export function InputComparisonDropdown<T extends {}>({
    ignoreRef,
    comparison,
    setFilterComparison,
    setFilter,
}: InputComparisonDropdownProps<T>) {
    const value = useMemo(
        () => getKeys(comparison).find(key => comparison[key]) as keyof ComparisonType,
        [comparison]
    );

    const [open, setOpen] = useState(false);
    const [sign, setSign] = useState<keyof ComparisonType>(value);

    const ref = React.useRef() as React.MutableRefObject<HTMLDivElement>;

    useClickAway(ref, () => setOpen(false), ignoreRef);

    // Ensure value returned is a number and not undefined
    const getFiniteNumber = (n: number) => (Number.isFinite(n) ? n : undefined);

    useEffect(() => {
        setSign(value);
    }, [value, setSign]);

    return (
        <div ref={ref}>
            <IconButton variant="light" onClick={() => setOpen(true)}>
                {Icons[sign]}
            </IconButton>
            {open && (
                <SelectableListWrapper>
                    <SelectableList
                        options={COMPARISON_OPTIONS}
                        onSelect={value => {
                            setSign(value as keyof ComparisonType);

                            setOpen(false);

                            setFilterComparison({
                                less: false,
                                greater: false,
                                equal: false,
                                ...{ [value as keyof ComparisonType]: true },
                            });

                            setFilter((old = []) => {
                                const min = old[0] ? parseFloat(old[0]) : old[0];
                                const max = old[1] ? parseFloat(old[1]) : old[1];
                                const n = getFiniteNumber(min) || getFiniteNumber(max);
                                switch (value) {
                                    case 'equal':
                                        return [n, n];
                                    case 'less':
                                        return [undefined, n];
                                    case 'greater':
                                        return [n, undefined];
                                }
                            });
                        }}
                    />
                </SelectableListWrapper>
            )}
        </div>
    );
}
