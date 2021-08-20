import React from 'react';
import { useFetchVariantsQuery } from '../apollo/hooks';
import {
    Background,
    Body,
    Button,
    ButtonWrapper,
    Checkbox,
    Column,
    Flex,
    Input,
    Snackbar,
    Spinner,
    Table,
    Typography,
} from '../components';
import { useFormReducer, useSnackbar } from '../hooks';
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
                    !!state.sources.value.filter(s => ['local', 'ensembl', 'random'].includes(s)).length,
                error: 'Please specify a source.',
            },
        ],
    },
};

type Source = 'ensembl' | 'local' | 'random';

interface QueryOptionsFormState {
    assemblyId: string;
    ensemblId: string;
    gene: string;
    maxFrequency: number;
    sources: Source[];
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

    const [fetchVariants, { error, data, loading }] = useFetchVariantsQuery();

    console.log({error})

    const { isActive, message, openSnackBar, closeSnackbar } = useSnackbar();

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
                    {/* <button
                        onClick={() => {
                            openSnackBar('Did you click the button?');
                        }}
                    >
                        Click To Open To Snackbar
                    </button> */}
                    <Snackbar
                        handleCloseSnackbar={closeSnackbar}
                        isActive={isActive}
                        message={message}
                        variant="success"
                    />
                    <Flex alignItems="center">
                        <Typography variant="h4" bold>
                            Select Sources:
                        </Typography>
                        <Checkbox
                            checked={queryOptionsForm.sources.value.includes('local')}
                            label="Node 1"
                            onClick={toggleSource.bind(null, 'local')}
                        />
                        <Checkbox
                            checked={queryOptionsForm.sources.value.includes('ensembl')}
                            label="Node 2"
                            onClick={toggleSource.bind(null, 'ensembl')}
                        />
                        <Checkbox
                            checked={queryOptionsForm.sources.value.includes('random')}
                            label="Node Random"
                            onClick={toggleSource.bind(null, 'random')}
                        />
                    </Flex>
                    <ErrorIndicator error={queryOptionsForm.sources.error} />
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
                        <ErrorIndicator error={queryOptionsForm.gene.error} />
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
                        <ErrorIndicator error={queryOptionsForm.ensemblId.error} />
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
                        <ErrorIndicator error={queryOptionsForm.maxFrequency.error} />
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
                        <ErrorIndicator error={queryOptionsForm.assemblyId.error} />
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
            {data ? <Table variantData={data.getVariants.data} /> : null}
        </Body>
    );
};

export default VariantQueryPage;
