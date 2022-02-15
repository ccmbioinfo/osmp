import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFilter } from 'react-icons/fa';
import { useLayer } from 'react-laag';
import { ColumnInstance, Filters, Row } from 'react-table';
import { Background } from '../Layout';
import AdvancedFilters from './AdvancedFilters';
import { ResultTableColumns } from './Table';

interface FilterPopoverProps<T extends {}> {
    state?: T;
    id?: keyof T;
    columns: ColumnInstance<T>[];
    preFilteredRows: Row<T>[];
    filters: Filters<T>;
    setFilter: (columndId: string, updater: any) => void;
}

const FilterPopover: React.FC<FilterPopoverProps<ResultTableColumns>> = ({
    state,
    id,
    columns,
    preFilteredRows,
    filters,
    setFilter,
}) => {
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState<boolean>(false);

    const handleClosePopover = () => {
        setAdvancedFilterOpen(false);
    };

    const { renderLayer, triggerProps, layerProps } = useLayer({
        isOpen: advancedFilterOpen,
        onOutsideClick: handleClosePopover,
        auto: true,
    });

    const { style, ...restLayerProps } = layerProps;

    return (
        <>
            <div {...triggerProps} onClick={() => setAdvancedFilterOpen(true)}>
                <FaFilter />
            </div>
            {renderLayer(
                <div>
                    {advancedFilterOpen && (
                        <motion.div
                            {...restLayerProps}
                            initial={{ opacity: 0, scale: 0.85, x: 0, y: 20 }} // animate from
                            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} // animate to
                            exit={{ opacity: 0, scale: 0.85, x: 0, y: 20 }} // animate exit
                            transition={{
                                type: 'spring',
                                stiffness: 800,
                                damping: 35,
                            }}
                            style={{
                                ...style,
                                ...{
                                    zIndex: 999,
                                    background: '#f8f8f8',
                                    borderRadius: '0.5rem',
                                },
                            }}
                        >
                            <AdvancedFilters
                                columns={columns}
                                preFilteredRows={preFilteredRows}
                                filters={filters}
                                setFilter={setFilter}
                            />
                        </motion.div>
                    )}
                </div>
            )}
        </>
    );
};

export default FilterPopover;
