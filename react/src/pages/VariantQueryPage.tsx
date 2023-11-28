import React from 'react';
import { NetworkStatus, useApolloClient } from '@apollo/client';
import { RiInformationFill } from 'react-icons/ri';
import styled from 'styled-components/macro';
import { useFetchVariantsQuery } from '../apollo/hooks';
import {
    Background,
    Body,
    Button,
    ButtonWrapper,
    clearError,
    Column,
    ComboBox,
    ErrorIndicator,
    Flex,
    GeneNameSearch,
    Input,
    RequiredIndicator,
    RequiredTextBox,
    Spinner,
    Table,
    Tooltip,
    Typography,
} from '../components';
import { IconPadder } from '../components/Table/Table.styles';
import SOURCES from '../constants/sources';
import theme from '../constants/theme';
import { useErrorContext, useFormReducer } from '../hooks';
import { formIsValid, FormState, Validator } from '../hooks/useFormReducer';
import { AssemblyId } from '../types';
import { formatErrorMessage, resolveAssembly } from '../utils';

const queryOptionsFormValidator: Validator<QueryOptionsFormState> = {
    assemblyId: {
        required: true,
        displayRequiredError: false,
    },
    gene: {
        required: true,
        displayRequiredError: false,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    !!!state.gene.value || !!state.position.value,
                error: 'Please select a gene from the autocomplete.',
            },
        ],
    },
    maxFrequency: {
        required: true,
        displayRequiredError: false,
        rules: [
            {
                valid: (state: FormState<QueryOptionsFormState>) => !!+state.maxFrequency.value,
                error: 'Value must be a number.',
            },

            {
                valid: (state: FormState<QueryOptionsFormState>) =>
                    +state.maxFrequency.value <= 0.05,
                error: 'Value must be ≤ 0.05.',
            },
        ],
    },

    sources: {
        required: true,
        displayRequiredError: false,
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

const ErrorWrapper = styled.div`
    margin: 0 0 ${props => props.theme.space[2]};
    padding: ${props => props.theme.space[4]} 0.75rem 0;
`;

const ErrorText: React.FC<{ error?: string }> = ({ error }) =>
    error ? (
        <ErrorWrapper>
            <Typography error variant="subtitle" bold condensed>
                {error}
            </Typography>
        </ErrorWrapper>
    ) : null;

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

    const [fetchVariants, { data, networkStatus }] = useFetchVariantsQuery();

    const loading =
        networkStatus === NetworkStatus.loading || networkStatus === NetworkStatus.refetch;

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
        <Body style={{ paddingTop: theme.space[4] }}>
            <Background
                variant="light"
                style={{
                    marginTop: 0,
                    paddingTop: theme.space[2],
                }}
            >
                <Flex style={{ flexWrap: 'nowrap' }}>
                    <Flex alignItems="flex-start" style={{ flexGrow: 1 }}>
                        <Column
                            style={{
                                width: '25%',
                                minWidth: 150,
                            }}
                        >
                            <Typography variant="subtitle" bold>
                                Genome Assembly <RequiredIndicator />
                            </Typography>
                            <ComboBox
                                onSelect={val =>
                                    updateQueryOptionsForm({
                                        assemblyId: val as AssemblyId,
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
                        </Column>
                        <Column
                            alignItems="flex-start"
                            style={{
                                flexGrow: 1,
                                minWidth: 200,
                            }}
                        >
                            <Typography variant="subtitle" bold>
                                Gene Name / Position <RequiredIndicator />
                            </Typography>
                            <GeneNameSearch
                                assembly={resolveAssembly(queryOptionsForm.assemblyId.value)}
                                geneName={queryOptionsForm.gene.value}
                                onChange={geneName => updateQueryOptionsForm({ gene: geneName })}
                                onSelect={({ name, position }) =>
                                    updateQueryOptionsForm({
                                        gene: name,
                                        position,
                                    })
                                }
                            />
                            <ErrorText error={queryOptionsForm.gene.error} />
                        </Column>
                        <Column
                            style={{
                                width: 'min-content',
                                minWidth: 150,
                            }}
                        >
                            <Flex alignItems="center">
                                <Typography variant="subtitle" bold>
                                    Max Frequency <RequiredIndicator />
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
                        <Column
                            style={{
                                width: '25%',
                                minWidth: 150,
                            }}
                        >
                            <Typography variant="subtitle" bold>
                                Contributors <RequiredIndicator />
                            </Typography>
                            <ComboBox
                                isMulti
                                onSelect={val => {
                                    toggleSource(val);
                                }}
                                options={SOURCES.filter(Boolean).map((a, id) => ({
                                    id,
                                    value: a,
                                    label: a,
                                }))}
                                placeholder="Select Contributors"
                                selection={queryOptionsForm.sources.value}
                                value={queryOptionsForm.sources.value.join(', ')}
                            />
                        </Column>
                    </Flex>
                    <Column style={{ rowGap: '0.4rem' }}>
                        <RequiredTextBox />
                        <ButtonWrapper>
                            <Button
                                disabled={
                                    loading ||
                                    !formIsValid(queryOptionsForm, queryOptionsFormValidator)
                                }
                                onClick={() => {
                                    clearAllErrors();
                                    fetchVariants({ variables: getArgs() });
                                }}
                                variant="primary"
                                keyCodes={['Enter', 'NumpadEnter']}
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
                            {loading && (
                                <Column justifyContent="flex-start">
                                    <Spinner />
                                </Column>
                            )}
                        </ButtonWrapper>
                    </Column>
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
