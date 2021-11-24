/*
 * Describes the data provided in each column
 */

const HEADERS: { [x: string]: string } = {
    start: '',
    end: '',
    ref: '',
    alt: '',
    source: 'The institution where the data comes from',
    af: 'Allele frequency of exomes from gnomAD',
    aaChange: '',
    cdna: '',
    consequence: '',
    gnomadHom: '',
    transcript: '',
    datasetId: '',
    dp: '',
    ad: '',
    gq: '',
    ethnicity:
        'Ethnic background of the individual. Value from NCIT Race ontology (NCIT:C17049), e.g. NCIT:C126531 (Latin American).',
    phenotypes: '',
    sex: 'Sex of the individual. Value from NCIT General Qualifier (NCIT:C27993) ontology: UNKNOWN (not assessed or not available) (NCIT:C17998), FEMALE (NCIT:C46113), MALE, (NCIT:C46112) or OTHER SEX (NCIT:C45908).',
    zygosity: '',
    geographicOrigin:
        "Individual's country or region of origin (birthplace or residence place regardless of ethnic origin). Value from GAZ Geographic Location ontology (GAZ:00000448), e.g. GAZ:00002459 (United States of America).",
    candidateGene: '',
    classifications: '',
    diseases:
        'List of disease(s) been diagnosed to the individual, defined by disease ICD10 code, optionally other disease ontology ID(s), age of onset, stage and the presence of family history.',
    diagnosis: '',
    contactInfo: 'Contact information for the record owner',
};

export default HEADERS;
