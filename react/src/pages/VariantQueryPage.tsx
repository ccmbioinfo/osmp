import React, { useState } from 'react';
import { useFetchVariantsQuery } from '../apollo/hooks';
import {
    Background,
    Body,
    Button,
    ButtonWrapper,
    Column,
    ComboBox,
    Flex,
    GeneSearch,
    Input,
    Spinner,
    Table,
    Typography,
} from '../components';
import { GeneOption } from '../components/GeneSearch';
import { useFormReducer } from '../hooks';
import { formIsValid, FormState, Validator } from '../hooks/useFormReducer';
import { DropdownItem, VariantQueryResponse, VariantQueryResponseSchemaTableRow } from '../types';

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

const queryOptionsFormValidator: Validator<QueryOptionsFormState> = {
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
    chromosome: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!chromosomes.map(c => c.value).includes(state.chromosome.value),
                error: 'Chromosome is invalid.',
            },
        ],
    },
};

interface QueryOptionsFormState {
    chromosome: string;
    end: number;
    ensemblId: string;
    gene: string;
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
                ensemblId: '',
                gene: '',
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

    const [geneQuery, setGeneQuery] = useState<boolean>(false);

    // Todo: Enable typings for only 'emsembl' | 'local'
    const toggleSource = (source: string) => {
        const update = updateQueryOptionsForm('sources');

        queryOptionsForm.sources.value.includes(source)
            ? update(queryOptionsForm.sources.value.filter(s => s !== source))
            : update(queryOptionsForm.sources.value.concat(source));
    };

    return (
        <Body>
            <div>
                <Flex alignItems="center">
                    <Typography variant="h4" bold>
                        Search by:
                    </Typography>
                    <Button
                        variant={geneQuery ? 'secondary' : 'primary'}
                        onClick={() => setGeneQuery(!geneQuery)}
                    >
                        Region
                    </Button>
                    <Button
                        variant={geneQuery ? 'primary' : 'secondary'}
                        onClick={() => setGeneQuery(!geneQuery)}
                    >
                        Gene
                    </Button>
                </Flex>
                <Background variant="light">
                    <Flex>
                        {!geneQuery && (
                            <>
                                <Column>
                                    <Typography variant="subtitle" bold>
                                        Sources
                                    </Typography>
                                    <ComboBox
                                        placeholder="Find a source"
                                        value=""
                                        items={sources}
                                        onSelect={item => toggleSource(item.value)}
                                    />
                                    <ErrorIndicator error={queryOptionsForm.sources.error} />
                                </Column>
                                <Column>
                                    <Typography variant="subtitle" bold>
                                        Chromosome
                                    </Typography>
                                    <ComboBox
                                        value={queryOptionsForm.chromosome.value}
                                        placeholder="Select Chromosome"
                                        items={chromosomes}
                                        onSelect={e =>
                                            updateQueryOptionsForm('chromosome')(e.value)
                                        }
                                    />
                                    <ErrorIndicator error={queryOptionsForm.chromosome.error} />
                                </Column>
                                <Column>
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
                                <Column>
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
                        {geneQuery && (
                            <Column>
                                <Typography variant="subtitle" bold>
                                    Gene
                                </Typography>
                                <GeneSearch
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
                                />
                                <ErrorIndicator error={queryOptionsForm.end.error} />
                            </Column>
                        )}

                        <ButtonWrapper>
                            <Button
                                disabled={
                                    loading ||
                                    !formIsValid(queryOptionsForm, queryOptionsFormValidator)
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
            </div>
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
