/*
 * Describes the data provided in each column
 */

const HEADERS: { [x: string]: string } = {
    source: 'The institution where the data comes from',
    af: 'Allele frequency from gnomAD, defined as the greater value between the exome allele frequency and the genome allele frequency.',
    ac: 'Allele count from gnomAD. This is calculated as the sum of the genome and exome allele counts (for GRCh38 assemblies, this is only genome allele count).',
    ethnicity:
        'Ethnic background of the individual. Value from NCIT Race ontology (NCIT:C17049), e.g. NCIT:C126531 (Latin American).',
    sex: 'Sex of the individual. Value from NCIT General Qualifier (NCIT:C27993) ontology: UNKNOWN (not assessed or not available) (NCIT:C17998), FEMALE (NCIT:C46113), MALE, (NCIT:C46112) or OTHER SEX (NCIT:C45908).',
    geographicOrigin:
        "Individual's country or region of origin (birthplace or residence place regardless of ethnic origin). Value from GAZ Geographic Location ontology (GAZ:00000448), e.g. GAZ:00002459 (United States of America).",
    diseases:
        'List of disease(s) been diagnosed to the individual, defined by disease ICD10 code, optionally other disease ontology ID(s), age of onset, stage and the presence of family history.',
    contactInfo: 'Contact information for the record owner',
    maleCount:
        "Total number of male participants with this variant returned from all sources. This is NOT retrieved from gnomAD, only what's retrieved from the selected sources.",
};

export default HEADERS;
