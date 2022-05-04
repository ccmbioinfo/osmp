import React from 'react';
import { useApolloClient } from '@apollo/client';
import { RiInformationFill } from 'react-icons/ri';
import styled from 'styled-components/macro';
import { useFetchVariantsQuery } from '../apollo/hooks';
import {
    Background,
    Body,
    Button,
    ButtonWrapper,
    Checkbox,
    clearError,
    Column,
    ComboBox,
    ErrorIndicator,
    Flex,
    GeneSearch,
    Input,
    Spinner,
    Table,
    Tooltip,
    Typography,
} from '../components';
import { IconPadder } from '../components/Table/Table.styles';
import SOURCES from '../constants/sources';
import { useErrorContext, useFormReducer } from '../hooks';
import { formIsValid, FormState, Validator } from '../hooks/useFormReducer';
import { AssemblyId } from '../types';
import { formatErrorMessage, resolveAssembly } from '../utils';

const queryOptionsFormValidator: Validator<QueryOptionsFormState> = {
    assemblyId: {
        required: true,
    },
    gene: {
        required: state => !state.gene.value,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) => state.gene.value.length > 3,
                error: 'Too few characters.',
            },
        ],
    },
    maxFrequency: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) => !!+state.maxFrequency.value,
                error: 'Value must be a number!',
            },

            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    +state.maxFrequency.value <= 0.05,
                error: 'Value must be <= .05.',
            },
        ],
    },

    sources: {
        required: true,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!state.sources.value.filter(s => SOURCES.includes(s)).length,
                error: 'Please specify a source.',
            },
        ],
    },
};

interface QueryOptionsFormState {
    assemblyId: string;
    gene: string;
    maxFrequency: string;
    position: string;
    sources: string[];
}

/* ensure consistent height regardless of error visibility */
const ErrorWrapper = styled.div`
    min-height: 2.5rem;
`;

const ErrorText: React.FC<{ error?: string }> = ({ error }) => (
    <ErrorWrapper>
        <Typography error variant="subtitle" bold>
            {error}
        </Typography>
    </ErrorWrapper>
);
const VariantQueryPage: React.FC<{}> = () => {
    const [queryOptionsForm, updateQueryOptionsForm, resetQueryOptionsForm] =
        useFormReducer<QueryOptionsFormState>(
            {
                assemblyId: 'GRCh37',
                gene: '',
                maxFrequency: '0.01',
                sources: [],
                position: '',
            },
            queryOptionsFormValidator
        );

    const getArgs = () =>
        ({
            input: {
                variant: {
                    assemblyId: resolveAssembly(queryOptionsForm.assemblyId.value),
                    maxFrequency: +queryOptionsForm.maxFrequency.value,
                },
                gene: {
                    geneName: queryOptionsForm.gene.value,
                    position: queryOptionsForm.position.value,
                },
                sources: queryOptionsForm.sources.value,
            },
        } as const);

    const [fetchVariants, { data, loading }] = useFetchVariantsQuery();

    const { state: errorState, dispatch } = useErrorContext();

    const client = useApolloClient();

    const clearCache = () => {
        const cache = client.cache;
        if (data) {
            data.getVariants.errors.forEach(e => {
                let id = cache.identify({ ...e.error });
                cache.evict({ id: id });
                cache.gc();
            });
        }
    };

    const clearAllErrors = () => {
        [errorState.nodeErrors, errorState.networkErrors, errorState.graphQLErrors]
            .flat()
            .forEach(e => {
                clearCache();
                dispatch(clearError(e.uid));
            });
    };

    const toggleSource = (source: string) =>
        queryOptionsForm.sources.value.includes(source)
            ? updateQueryOptionsForm({
                  sources: queryOptionsForm.sources.value.filter(s => s !== source),
              })
            : updateQueryOptionsForm({ sources: queryOptionsForm.sources.value.concat(source) });

    return (
        <Body>
            <Flex alignItems="center">
                <Column alignItems="flex-start">
                    <Column alignItems="center">
                        <Typography variant="h4" bold>
                            Select Contributors
                        </Typography>
                        <Flex>
                            {SOURCES.filter(Boolean).map(source => (
                                <Checkbox
                                    key={source}
                                    checked={queryOptionsForm.sources.value.includes(source)}
                                    label={source.toLocaleLowerCase()}
                                    onClick={toggleSource.bind(null, source)}
                                />
                            ))}
                        </Flex>
                        {!!queryOptionsForm.sources.error.length && (
                            <ErrorText error={queryOptionsForm.sources.error} />
                        )}
                    </Column>
                </Column>
            </Flex>

            <Background variant="light">
                <Flex alignItems="flex-start">
                    <Column
                        alignItems="flex-start"
                        style={{
                            width: '30%',
                        }}
                    >
                        <Typography variant="subtitle" bold>
                            Gene Name
                        </Typography>
                        <GeneSearch
                            assembly={resolveAssembly(queryOptionsForm.assemblyId.value)}
                            geneName={queryOptionsForm.gene.value}
                            onChange={geneName => updateQueryOptionsForm({ gene: geneName })}
                            onSelect={val => {
                                const { position } = val;
                                updateQueryOptionsForm({
                                    gene: val.name,
                                    position,
                                });
                            }}
                        />
                        <ErrorText error={queryOptionsForm.gene.error} />
                    </Column>
                    <Column alignItems="flex-start">
                        <Flex alignItems="center">
                            <Typography variant="subtitle" bold>
                                Max Frequency
                            </Typography>
                            <Tooltip helperText="The maximum allele frequency within each selected database">
                                <IconPadder>
                                    <RiInformationFill color="grey" />
                                </IconPadder>
                            </Tooltip>
                        </Flex>
                        <Input
                            variant="outlined"
                            onChange={e =>
                                updateQueryOptionsForm({ maxFrequency: e.currentTarget.value })
                            }
                            value={queryOptionsForm.maxFrequency.value}
                        />
                        <ErrorText error={queryOptionsForm.maxFrequency.error} />
                    </Column>
                    <Column alignItems="flex-start">
                        <Typography variant="subtitle" bold>
                            Genome Assembly
                        </Typography>
                        <ComboBox
                            onSelect={val =>
                                updateQueryOptionsForm({
                                    assemblyId: val as AssemblyId,
                                    gene: '',
                                })
                            }
                            options={['GRCh37', 'GRCh38'].map((a, id) => ({
                                id,
                                value: a,
                                label: a,
                            }))}
                            placeholder="Select"
                            value={queryOptionsForm.assemblyId.value}
                        />
                        <ErrorText error={queryOptionsForm.assemblyId.error} />
                    </Column>

                    <ButtonWrapper>
                        <Button
                            disabled={
                                loading || !formIsValid(queryOptionsForm, queryOptionsFormValidator)
                            }
                            onClick={() => {
                                clearAllErrors();
                                fetchVariants({ variables: getArgs() });
                            }}
                            variant="primary"
                        >
                            Search
                        </Button>
                        <Button
                            onClick={() => {
                                resetQueryOptionsForm();
                            }}
                            variant="primary"
                        >
                            Clear
                        </Button>
                        <Column justifyContent="flex-start">{loading && <Spinner />}</Column>
                    </ButtonWrapper>
                </Flex>
            </Background>
            {[errorState.nodeErrors, errorState.networkErrors, errorState.graphQLErrors]
                .flat()
                .map(e => (
                    <ErrorIndicator
                        key={e.uid}
                        message={formatErrorMessage(e.code, e.message, e.source)}
                        handleCloseError={() => {
                            clearCache();
                            dispatch(clearError(e.uid));
                        }}
                    />
                ))}
            {data && data.getVariants ? <Table variantData={data.getVariants.data} /> : null}
        </Body>
    );
};

export default VariantQueryPage;
