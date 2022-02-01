import { UsePaginationInstanceProps, UsePaginationState } from 'react-table';
import { Typography } from '../../index';
import { SkipToBeginning, SkipToEnd, Footer as StyledFooter } from './Footer.styles';

interface PaginationProps<T extends object = {}>
    extends Omit<UsePaginationInstanceProps<T>, 'page'>,
        UsePaginationState<T> {}

interface FooterProps {
    props: PaginationProps;
}

const Footer: React.FC<FooterProps> = ({
    props: {
        pageSize,
        pageCount,
        pageIndex,
        pageOptions,
        canPreviousPage,
        canNextPage,
        gotoPage,
        previousPage,
        nextPage,
        setPageSize,
    },
}) => {
    console.log(pageSize, pageOptions, pageCount);
    return (
        <StyledFooter>
            <span>
                <Typography variant="subtitle">Rows per page:</Typography>
                <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                    {[10, 25, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            {pageSize}
                        </option>
                    ))}
                </select>
            </span>
            <Typography variant="subtitle">
                Page
                <strong>
                    {pageIndex + 1} of {pageOptions.length}
                </strong>
            </Typography>
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                <SkipToBeginning fontSize="small" />
            </button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                Previous
            </button>
            <button onClick={() => nextPage()} disabled={!canNextPage}>
                Next
            </button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                <SkipToEnd fontSize="small" />
            </button>
        </StyledFooter>
    );
};

export default Footer;
