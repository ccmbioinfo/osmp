import React, { useState } from 'react';
import { useFetchVariantsQuery } from '../apollo/hooks';
import {
    Body,
    Button,
    Column,
    Dropdown,
    Flex,
    Input,
    Spinner,
    Table,
    Typography,
} from '../components';
import { useFormReducer } from '../hooks';
import { formIsValid, FormState } from '../hooks/useFormReducer';
import { DropdownItem, VariantQueryResponse, VariantQueryResponseSchemaTableRow } from '../types';

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
        <Typography error variant="subtitle" bold>
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
    const [reset, setReset] = useState<Boolean>(false);

    // Todo: Enable typings for only 'emsembl' | 'local'
    const toggleSource = (source: string) => {
        const update = updateQueryOptionsForm('sources');

        queryOptionsForm.sources.value.includes(source)
            ? update(queryOptionsForm.sources.value.filter(s => s !== source))
            : update(queryOptionsForm.sources.value.concat(source));
    };

    const sources: DropdownItem[] = [
        {
            id: 1,
            value: 'local',
            label: 'Local',
        },
        {
            id: 2,
            value: 'ensembl',
            label: 'Ensembl',
        },
    ];

    const chromosomes: DropdownItem[] = Array.from(Array(22))
        .map((v, i) => ({
            id: i,
            value: (i + 1).toString(),
            label: (i + 1).toString(),
        }))
        .concat(
            ['X', 'Y'].map((v, i) => ({
                id: 22 + i,
                value: v,
                label: v,
            }))
        );

    return (
        <Body>
            <div>
                <Flex>
                    <Column>
                        <Typography variant="subtitle" bold>Sources</Typography>
                        <Dropdown
                            title="Select Sources"
                            items={sources}
                            multiSelect
                            onChange={item => {
                                toggleSource(item.value);
                                setReset(false);
                            }}
                            reset={reset}
                        />
                        <ErrorIndicator error={queryOptionsForm.sources.error} />
                    </Column>
                    <Column>
                        <Typography variant="subtitle" bold>Chromosomes</Typography>
                        <Dropdown
                            title="Select Chromosome"
                            items={chromosomes}
                            onChange={e => {
                                setReset(false);
                                updateQueryOptionsForm('chromosome')(e.value);
                            }}
                            reset={reset}
                        />
                    </Column>
                    <Column>
                        <Typography variant="subtitle" bold>Start Range</Typography>
                        <Input
                            value={queryOptionsForm.start.value}
                            onChange={e => updateQueryOptionsForm('start')(e.currentTarget.value)}
                        />
                        <ErrorIndicator error={queryOptionsForm.start.error} />
                    </Column>
                    <Column>
                        <Typography variant="subtitle" bold>End Range</Typography>
                        <Input
                            value={queryOptionsForm.end.value}
                            onChange={e => updateQueryOptionsForm('end')(e.currentTarget.value)}
                        />
                        <ErrorIndicator error={queryOptionsForm.end.error} />
                    </Column>
                </Flex>
                <Flex>
                    <Button
                        disabled={
                            loading || !formIsValid(queryOptionsForm, queryOptionsFormValidator)
                        }
                        onClick={() => fetchVariants({ variables: getArgs() })}
                        variant="primary"
                    >
                        Fetch
                    </Button>
                    <Button
                        onClick={() => {
                            setReset(true);
                            resetQueryOptionsForm();
                        }}
                        variant="primary"
                    >
                        Clear
                    </Button>
                    <Column>{loading ? <Spinner /> : null}</Column>
                </Flex>
                {/* <form>
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
                            <Input
                                value={queryOptionsForm.start.value}
                                onChange={e =>
                                    updateQueryOptionsForm('start')(e.currentTarget.value)
                                }
                            />
                            <ErrorIndicator error={queryOptionsForm.start.error} />
                        </div>
                        <div>
                            <label>End</label>
                            <Input
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
                </form> */}
            </div>
            {/* <hr /> */}
            {data ? <Table variantData={prepareData(data.getVariants)} /> : null}
        </Body>
    );
};

const prepareData = (queryResponse: VariantQueryResponse) =>
    queryResponse.data.reduce(
        (acc, curr) => (acc = acc.concat(curr.data.map(d => ({ source: curr.source, ...d })))),
        [] as VariantQueryResponseSchemaTableRow[]
    );

export default VariantQueryPage;
