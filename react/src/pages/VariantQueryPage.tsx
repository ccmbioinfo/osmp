import React from 'react';
import { useFetchVariantsQuery } from '../apollo/hooks';
import {
    Background,
    Body,
    Button,
    ButtonWrapper,
    Checkbox,
    Column,
    ComboBox,
    Flex,
    Input,
    Spinner,
    Table,
    Typography,
} from '../components';
import { useFormReducer } from '../hooks';
import { formIsValid, FormState, Validator } from '../hooks/useFormReducer';
import { DropdownItem, VariantQueryResponse, VariantQueryResponseSchemaTableRow } from '../types';

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

const queryOptionsFormValidator: Validator<QueryOptionsFormState> = {
    chromosome: {
        required: state => state.searchType.value === 'region',
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!chromosomes.map(c => c.value).includes(state.chromosome.value),
                error: 'Chromosome is invalid.',
            },
        ],
    },
    gene: {
        required: state => state.searchType.value === 'gene',
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!chromosomes.map(c => c.value).includes(state.chromosome.value),
                error: 'Chromosome is invalid.',
            },
        ],
    },
    end: {
        required: state => state.searchType.value === 'region',
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    +state.start.value < +state.end.value,
                error: 'End must be greater than start!',
            },
        ],
    },
    searchType: {
        required: true,
    },
    sources: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!state.sources.value.filter(s => ['local', 'ensembl'].includes(s)).length,
                error: 'Please specify a source.',
            },
        ],
    },
    start: {
        required: state => state.searchType.value === 'region',
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    +state.start.value < +state.end.value,
                error: 'Start must be less than end!',
            },
        ],
    },
};

type Source = 'ensembl' | 'local';

interface QueryOptionsFormState {
    chromosome: string;
    end: number;
    ensemblId: string;
    gene: string;
    sources: Source[];
    start: number;
    searchType: string;
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
                ensemblId: '',
                gene: '',
                searchType: 'region',
                sources: [],
                start: 44905791,
            },
            queryOptionsFormValidator
        );

    const getArgs = () => ({
        input: {
            chromosome: queryOptionsForm.chromosome.value,
            end: +queryOptionsForm.end.value,
            sources: queryOptionsForm.sources.value,
            start: +queryOptionsForm.start.value,
        },
    });

    const [fetchVariants, { data, loading }] = useFetchVariantsQuery();

    const toggleSource = (source: Source) => {
        const update = updateQueryOptionsForm('sources');

        queryOptionsForm.sources.value.includes(source)
            ? update(queryOptionsForm.sources.value.filter(s => s !== source))
            : update(queryOptionsForm.sources.value.concat(source));
    };

    return (
        <Body>
            <div>
                {userInfo ? (
                    <Typography variant="h3" bold>
                        Hi, {userInfo.preferred_username}!
                    </Typography>
                ) : null}
                <Typography variant="p">
                    The Single-Sided Matching Portal is a resource developed by CCM to make data
                    summary for gene and region query accessible across multiple collaborating
                    organizations. To get started, try searching for a region or a gene.
                </Typography>
            <Flex alignItems="center">
                <Column>
                    <Flex>
                        <Typography variant="h4" bold>
                            Search by:
                        </Typography>
                        <Button
                            variant={
                                queryOptionsForm.searchType.value === 'region'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() => updateQueryOptionsForm('searchType')('region')}
                        >
                            Region
                        </Button>
                        <Button
                            variant={
                                queryOptionsForm.searchType.value === 'gene'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() => updateQueryOptionsForm('searchType')('gene')}
                        >
                            Gene
                        </Button>
                    </Flex>
                </Column>
                <Column alignItems="flex-start">
                    <Flex alignItems="center">
                        <Typography variant="h4" bold>
                            Select Sources:
                        </Typography>
                        <Checkbox
                            checked={queryOptionsForm.sources.value.includes('local')}
                            label="Local"
                            onClick={toggleSource.bind(null, 'local')}
                        />
                        <Checkbox
                            checked={queryOptionsForm.sources.value.includes('ensembl')}
                            label="Ensembl"
                            onClick={toggleSource.bind(null, 'ensembl')}
                        />
                    </Flex>
                    <ErrorIndicator error={queryOptionsForm.sources.error} />
                </Column>
            </Flex>
            <Background variant="light">
                <Flex alignItems="center">
                    {queryOptionsForm.searchType.value === 'region' && (
                        <>
                            <Column alignItems="flex-start">
                                <Typography variant="subtitle" bold>
                                    Chromosome
                                </Typography>
                                <ComboBox
                                    value={queryOptionsForm.chromosome.value}
                                    placeholder="Select Chromosome"
                                    items={chromosomes}
                                    onSelect={e => updateQueryOptionsForm('chromosome')(e.value)}
                                />
                                <ErrorIndicator error={queryOptionsForm.chromosome.error} />
                            </Column>
                            <Column alignItems="flex-start">
                                <Typography variant="subtitle" bold>
                                    Start Range
                                </Typography>
                                <Input
                                    value={queryOptionsForm.start.value}
                                    onChange={e =>
                                        updateQueryOptionsForm('start')(e.currentTarget.value)
                                    }
                                />
                                <ErrorIndicator error={queryOptionsForm.start.error} />
                            </Column>
                            <Column alignItems="flex-start">
                                <Typography variant="subtitle" bold>
                                    End Range
                                </Typography>
                                <Input
                                    value={queryOptionsForm.end.value}
                                    onChange={e =>
                                        updateQueryOptionsForm('end')(e.currentTarget.value)
                                    }
                                />
                                <ErrorIndicator error={queryOptionsForm.end.error} />
                            </Column>
                        </>
                    )}
                    {queryOptionsForm.searchType.value === 'gene' && (
                        <Column alignItems="flex-start">
                            <Typography variant="subtitle" bold>
                                Gene
                            </Typography>
                            {/* todo: find out why this isn't working */}
                            {/* <GeneSearch
                                onSearch={term => {
                                    updateQueryOptionsForm('gene')(term);
                                    updateQueryOptionsForm('ensemblId')('');
                                }}
                                onSelect={({ ensemblId, name }: GeneOption) => {
                                    updateQueryOptionsForm('gene')(name);
                                    updateQueryOptionsForm('ensemblId')(ensemblId);
                                }}
                                value={{
                                    name: queryOptionsForm.gene.value,
                                    ensemblId: queryOptionsForm.ensemblId.value,
                                }}
                            /> */}
                            <Input
                                onChange={e =>
                                    updateQueryOptionsForm('gene')(e.currentTarget.value)
                                }
                                value={queryOptionsForm.gene.value}
                            />
                            <ErrorIndicator error={queryOptionsForm.gene.error} />
                        </Column>
                    )}

                    <ButtonWrapper>
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
                                resetQueryOptionsForm();
                            }}
                            variant="primary"
                        >
                            Clear
                        </Button>
                    </ButtonWrapper>
                    <Column justifyContent="center">{loading && <Spinner />}</Column>
                </Flex>
            </Background>
            {data ? <Table variantData={prepareData(data.getVariants)} /> : null}
        </div>
        </Body>
    );
};

const prepareData = (queryResponse: VariantQueryResponse) =>
    queryResponse.data.reduce(
        (acc, curr) => (acc = acc.concat(curr.data.map(d => ({ source: curr.source, ...d })))),
        [] as VariantQueryResponseSchemaTableRow[]
    );

export default VariantQueryPage;
