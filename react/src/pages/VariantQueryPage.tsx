import React from 'react';
import { useFetchVariantsQuery } from '../apollo/hooks';
import { Table, Typography } from '../components';
import { useFormReducer } from '../hooks';
import { formIsValid, FormState } from '../hooks/useFormReducer';
import { VariantQueryResponse, VariantQueryResponseSchemaTableRow } from '../types';

const queryOptionsFormValidator = {
    sources: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!state.sources.value.filter(s => ['local', 'ensembl'].includes(s)).length,
                error: 'Invalid source!',
            },
        ],
    },
    start: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    +state.start.value < +state.end.value,
                error: 'Start must be less than end!',
            },
        ],
    },
    end: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    +state.start.value < +state.end.value,
                error: 'End must be greater than start!',
            },
        ],
    },
};

interface QueryOptionsFormState {
    chromosome: string;
    end: number;
    sources: string[];
    start: number;
}

const ErrorIndicator: React.FC<{ error?: string }> = ({ error }) =>
    error ? (
        <Typography error variant="p">
            {error}
        </Typography>
    ) : null;

const VariantQueryPage: React.FC<{}> = () => {
    const [queryOptionsForm, updateQueryOptionsForm, resetQueryOptionsForm] =
        useFormReducer<QueryOptionsFormState>(
            {
                chromosome: '19',
                end: 44909393,
                sources: [],
                start: 44905791,
            },
            queryOptionsFormValidator
        );

    const getArgs = () => ({
        input: {
            chromosome: queryOptionsForm.chromosome.value,
            start: +queryOptionsForm.start.value,
            end: +queryOptionsForm.end.value,
            sources: queryOptionsForm.sources.value,
        },
    });

    const [fetchVariants, { data, loading }] = useFetchVariantsQuery();

    const toggleSource = (source: 'ensembl' | 'local') => {
        const update = updateQueryOptionsForm('sources');

        queryOptionsForm.sources.value.includes(source)
            ? update(queryOptionsForm.sources.value.filter(s => s !== source))
            : update(queryOptionsForm.sources.value.concat(source));
    };

    return (
        <div>
            <div>
                <form>
                    <fieldset>
                        <legend>
                            <Typography variant="h4" bold>
                                Select Sources
                            </Typography>
                        </legend>
                        <label>
                            Local
                            <input
                                checked={queryOptionsForm.sources.value.includes('local')}
                                onChange={() => toggleSource('local')}
                                type="checkbox"
                            />
                        </label>
                        <label>
                            Ensembl
                            <input
                                checked={queryOptionsForm.sources.value.includes('ensembl')}
                                onChange={() => toggleSource('ensembl')}
                                type="checkbox"
                            />
                        </label>
                        <ErrorIndicator error={queryOptionsForm.sources.error} />
                    </fieldset>
                </form>
                <form>
                    <fieldset>
                        <legend>
                            <Typography variant="h4" bold>
                                Select range
                            </Typography>
                        </legend>
                        <div>
                            <label>Start</label>
                            <input
                                type="text"
                                value={queryOptionsForm.start.value}
                                onChange={e =>
                                    updateQueryOptionsForm('start')(e.currentTarget.value)
                                }
                            />
                            <ErrorIndicator error={queryOptionsForm.start.error} />
                        </div>
                        <div>
                            <label>End</label>
                            <input
                                type="text"
                                value={queryOptionsForm.end.value}
                                onChange={e => updateQueryOptionsForm('end')(e.currentTarget.value)}
                            />
                            <ErrorIndicator error={queryOptionsForm.end.error} />
                        </div>
                        <div>
                            <label>Chromosome</label>
                            <select
                                onChange={e =>
                                    updateQueryOptionsForm('chromosome')(e.currentTarget.value)
                                }
                                value={queryOptionsForm.chromosome.value}
                            >
                                {Array.from(Array(22)).map((v, i) => (
                                    <option key={i} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                                <option value="X">X</option>
                                <option value="Y">Y</option>
                            </select>
                        </div>
                        <button
                            disabled={
                                loading || !formIsValid(queryOptionsForm, queryOptionsFormValidator)
                            }
                            type="button"
                            onClick={() => fetchVariants({ variables: getArgs() })}
                        >
                            Fetch
                        </button>
                        <button type="reset" onClick={() => resetQueryOptionsForm()}>
                            Clear
                        </button>
                    </fieldset>
                </form>
            </div>
            <hr />
            {data ? (
                <Table variantData={prepareData(data.getVariants)} />
            ) : loading ? (
                <Typography variant="h3">Loading...</Typography>
            ) : null}
        </div>
    );
};

const prepareData = (queryResponse: VariantQueryResponse) =>
    queryResponse.data.reduce(
        (acc, curr) => (acc = acc.concat(curr.data.map(d => ({ source: curr.source, ...d })))),
        [] as VariantQueryResponseSchemaTableRow[]
    );

export default VariantQueryPage;
