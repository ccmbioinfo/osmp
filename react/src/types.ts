import { Maybe } from 'graphql/jsutils/Maybe';

/* typescript types that map to graphql types, should be updated whenever schema is updated -- note that these are coming from our own server now */
export interface VariantResponseInfoFields {
    af?: Maybe<number>;
    aaAlt?: Maybe<string>;
    aaPos?: Maybe<string>;
    aaRef?: Maybe<string>;
    cdna?: Maybe<string>;
    consequence?: Maybe<string>;
    geneName?: Maybe<string>;
    gnomadHet?: Maybe<string>;
    gnomadHom?: Maybe<number>;
    transcript?: Maybe<string>;
}

export interface CallsetInfoFields {
    ad?: Maybe<number>;
    dp?: Maybe<number>;
    gq?: Maybe<number>;
    qual?: Maybe<number>;
    zygosity?: Maybe<string>;
}

export interface CallSet {
    callsetId: string;
    individualId: string;
    info: CallsetInfoFields;
}

export type AssemblyId = 'gnomAD_GRCh37' | '38' | 'GRCh37' | 'GRCh38' | '37' | 'hg19' | 'hg38';

export interface VariantResponseFields {
    alt: string;
    assemblyId: AssemblyId;
    callsets: CallSet[];
    end: number;
    info?: Maybe<VariantResponseInfoFields>;
    ref: string;
    referenceName: string;
    start: number;
    variantId?: Maybe<string>;
    variantType?: Maybe<string>;
}

export interface AgeOfOnsetFields {
    age: Maybe<number>;
    ageGroup: Maybe<String>;
}

export interface PhenotypicFeaturesFields {
    ageOfOnset?: Maybe<AgeOfOnsetFields>;
    dateOfOnset?: Maybe<string>;
    levelSeverity?: Maybe<string>;
    onsetType?: Maybe<string>;
    phenotypeId?: Maybe<string>;
}

export interface DiseaseFields {
    ageOfOnset?: Maybe<AgeOfOnsetFields>;
    description?: Maybe<string>;
    diseaseId: string;
    levelSeverity?: Maybe<string>;
    outcome?: Maybe<string>;
    stage?: Maybe<string>;
}

export interface IndividualInfoFields {
    candidateGene?: Maybe<string>;
    classifications?: Maybe<string>;
    diagnosis?: Maybe<string>;
}

export interface IndividualResponseFields {
    datasetId?: Maybe<string>;
    diseases?: Maybe<DiseaseFields[]>;
    ethnicity?: Maybe<string>;
    geographicOrigin?: Maybe<string>;
    individualId?: Maybe<string>;
    info?: Maybe<IndividualInfoFields>;
    phenotypicFeatures?: Maybe<PhenotypicFeaturesFields[]>;
    sex?: Maybe<string>;
}

export interface VariantQueryDataResult {
    contactInfo: string;
    individual: IndividualResponseFields;
    source: string;
    variant: VariantResponseFields;
}

export interface VariantQueryInput {
    assemblyId: AssemblyId;
    maxFrequency?: number;
}

export interface GeneQueryInput {
    geneName: string;
    ensemblId: string;
    position: string;
}

export interface QueryInput {
    input: {
        sources: string[];
        gene: GeneQueryInput;
        variant: VariantQueryInput;
    };
}

/* end graphql schema types */
export interface ErrorResponse {
    id: string;
    code: number | string;
    message?: string | null;
    source: string;
}

export interface QueryResult<T> {
    source: string;
    data: T;
    error?: ErrorResponse;
}

export type VariantQueryResponseError = { source: string; error: ErrorResponse };

export interface CombinedVariantQueryResponse {
    data: VariantQueryDataResult[];
    errors: { source: string; error: ErrorResponse }[];
}

export type VariantQueryResponse = QueryResult<VariantQueryDataResult[]>;

export type TableRowIndividual = IndividualResponseFields & CallsetInfoFields & { source: string };
export type TableRowVariant = Omit<VariantResponseFields, 'callsets'>;

// Schema for responses to Phenotips rest/patients/fetch?id={id}&eid={eid} endpoint
export interface G4RDPatientQueryResult {
    date: Date;
    apgar: Apgar;
    notes: Notes;
    ethnicity: Ethnicity;
    date_of_birth: DateOfBirth;
    solved: Solved;
    external_id: string;
    clinicalStatus: 'affected' | 'unaffected';
    features: Feature[];
    disorders: Pick<Feature, 'id' | 'label'>[];
    date_of_death: DateOfDeath;
    contact: Contact;
    last_modification_date: Date;
    patient_name: PatientName;
    specificity: Specificity;
    nonstandard_features: any[];
    links: Link[];
    id: string;
    prenatal_perinatal_history: { [key: string]: number | null };
    family_history: FamilyHistory;
    life_status: string;
    sex: string;
    reporter: string;
    last_modified_by: string;
    report_id: string;
    meta: Meta;
    genes?: Gene[];
}

export interface Apgar {
    apgar1?: number;
    apgar5?: number;
}

export interface Contact {
    institution?: string;
    user_id?: string;
    name?: string;
    email?: string;
}

export interface DateOfBirth {
    year?: number;
    month?: number;
    day?: number;
}

export interface DateOfDeath {
    year?: number;
    range?: {
        years?: number;
    };
}
export interface Ethnicity {
    maternal_ethnicity: string[];
    paternal_ethnicity: string[];
}

export interface FamilyHistory {
    miscarriages: Maybe<boolean>;
    consanguinity: Maybe<boolean>;
    affectedRelatives: Maybe<boolean>;
}

export interface Feature {
    id: string;
    label: string;
    type: string;
    observed: string;
}

export interface Gene {
    gene: string;
    strategy: string[];
    status: string;
}

export interface Link {
    rel: string;
    href: string;
    allowedMethods: string[];
}

export interface Meta {
    hgnc_version: Date;
    omim_version: Date;
    hpo_version: string;
    phenotips_version: string;
}

export interface Notes {
    family_history: string;
    prenatal_development: string;
    indication_for_referral: string;
    medical_history: string;
    diagnosis_notes: string;
}

export interface PatientName {
    last_name: string;
    first_name: string;
}

export interface Solved {
    status?: 'solved' | 'unsolved';
    pubmed_id?: string;
    notes?: string;
}

export interface Specificity {
    date: Date;
    score: number;
    server: string;
}
