import React from 'react';
import { useFetchVariantsQuery } from '../apollo/hooks';
import {
    Background,
    Body,
    Button,
    ButtonWrapper,
    Checkbox,
    clearError,
    Column,
    ErrorIndicator,
    Flex,
    Input,
    Spinner,
    Table,
    Typography,
} from '../components';
import { useErrorContext, useFormReducer } from '../hooks';
import { formIsValid, FormState, Validator } from '../hooks/useFormReducer';

const queryOptionsFormValidator: Validator<QueryOptionsFormState> = {
    assemblyId: {
        required: true,
    },
    ensemblId: {
        required: state => !state.gene.value,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    state.ensemblId.value.startsWith('ENSG00'),
                error: 'Invalid ensembl Id.',
            },
        ],
    },
    gene: {
        required: state => !state.ensemblId.value,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) => state.gene.value.length > 3,
                error: 'Gene must be at least three characters long.',
            },
        ],
    },
    maxFrequency: {
        required: false,
    },

    sources: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!state.sources.value.filter(s => ['local', 'remote-test'].includes(s)).length,
                error: 'Please specify a source.',
            },
        ],
    },
};

type Source = 'local' | 'remote-test';

interface QueryOptionsFormState {
    assemblyId: string;
    ensemblId: string;
    gene: string;
    maxFrequency: number;
    sources: Source[];
}

const ErrorText: React.FC<{ error?: string }> = ({ error }) =>
    error ? (
        <Typography error variant="subtitle" bold>
            {error}
        </Typography>
    ) : null;

const VariantQueryPage: React.FC<{}> = () => {
    const [queryOptionsForm, updateQueryOptionsForm, resetQueryOptionsForm] =
        useFormReducer<QueryOptionsFormState>(
            {
                assemblyId: 'GRCh38',
                ensemblId: 'ENSG00000130203',
                gene: '',
                maxFrequency: 1,
                sources: [],
            },
            queryOptionsFormValidator
        );

    const getArgs = () => ({
        input: {
            variant: {
                assemblyId: queryOptionsForm.assemblyId.value,
                maxFrequency: +queryOptionsForm.maxFrequency.value,
            },
            gene: {
                ensemblId: queryOptionsForm.ensemblId.value,
                geneName: queryOptionsForm.gene.value,
            },
            sources: queryOptionsForm.sources.value,
        },
    });

    const [fetchVariants, { data, loading }] = useFetchVariantsQuery();

    const { state: errorState, dispatch } = useErrorContext();

    console.log(errorState);
    const toggleSource = (source: Source) => {
        const update = updateQueryOptionsForm('sources');

        queryOptionsForm.sources.value.includes(source)
            ? update(queryOptionsForm.sources.value.filter(s => s !== source))
            : update(queryOptionsForm.sources.value.concat(source));
    };

    return (
        <Body>
            <Flex alignItems="center">
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
                            checked={queryOptionsForm.sources.value.includes('remote-test')}
                            label="Remote-Test"
                            onClick={toggleSource.bind(null, 'remote-test')}
                        />
                    </Flex>
                    <ErrorText error={queryOptionsForm.sources.error} />
                </Column>
            </Flex>
            <Background variant="light">
                <Flex alignItems="center">
                    <Column alignItems="flex-start">
                        <Typography variant="subtitle" bold={!queryOptionsForm.ensemblId.value}>
                            Gene Name
                        </Typography>
                        <Input
                            disabled={!!queryOptionsForm.ensemblId.value}
                            onChange={e => updateQueryOptionsForm('gene')(e.currentTarget.value)}
                            value={queryOptionsForm.gene.value}
                        />
                        <ErrorText error={queryOptionsForm.gene.error} />
                    </Column>
                    <Column>or</Column>
                    <Column alignItems="flex-start">
                        <Typography variant="subtitle" bold>
                            Ensembl ID
                        </Typography>
                        <Input
                            onChange={e =>
                                updateQueryOptionsForm('ensemblId')(e.currentTarget.value)
                            }
                            value={queryOptionsForm.ensemblId.value}
                        />
                        <ErrorText error={queryOptionsForm.ensemblId.error} />
                    </Column>
                    <Column alignItems="flex-start">
                        <Typography variant="subtitle" bold>
                            Max Frequency
                        </Typography>
                        <Input
                            onChange={e =>
                                updateQueryOptionsForm('maxFrequency')(e.currentTarget.value)
                            }
                            value={queryOptionsForm.maxFrequency.value}
                        />
                        <ErrorText error={queryOptionsForm.maxFrequency.error} />
                    </Column>
                    <Column alignItems="flex-start">
                        <Typography variant="subtitle" bold>
                            Assembly ID
                        </Typography>
                        <Input
                            onChange={e =>
                                updateQueryOptionsForm('assemblyId')(e.currentTarget.value)
                            }
                            value={queryOptionsForm.assemblyId.value}
                        />
                        <ErrorText error={queryOptionsForm.assemblyId.error} />
                    </Column>

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
            {[errorState.nodeErrors, errorState.networkErrors].flat().map(e => (
                <ErrorIndicator
                    key={e.uid}
                    message={`Error: ${e.code} - ${e.message}`}
                    handleCloseError={() => dispatch(clearError(e.uid))}
                />
            ))}
            {data && data.getVariants ? <Table variantData={data.getVariants.data} /> : null}
        </Body>
    );
};

export default VariantQueryPage;
