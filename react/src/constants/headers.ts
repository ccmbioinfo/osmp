/**
 * Describes the data provided in each column.
 * Keys are column ids defined in Table.tsx.
 */

const HEADERS: { [x: string]: string } = {
    source: 'The institution where the data comes from.',
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
    ref: 'Reference allele. More than one nucleotide listed as the reference allele means there is a deletion at this position.',
    alt: 'Alternative allele. More than one nucleotide listed as the alternative allele means there is a deletion at this position.',
    currentAssembly: 'The assembly that variants were annotated with in the source database.',
    originalAssembly: 'The assembly used to annotate variants in the OSMP query results.',
    homozygousCount:
        'Number of individuals in the OSMP results who are homozygous for this variant.',
    heterozygousCount:
        'Number of individuals in the OSMP results who are heterozygous for this variant.',
    cdna: 'Coding DNA change according to the Ensembl transcript.',
    aaChange: 'Amino acid change according to the Ensembl transcript.',
    consequence: 'Calculated variant consequence according to the Ensembl Sequence Ontology.',
    gnomadHom:
        'Number of individuals in gnomAD homozygous for this variant. Note that this is a sum of the homozygotes from the exome and genome data.',
    phred: 'Scaled score for predicting the deleteriousness of single nucleotide variants, insertions, and deletions. A score of 20 or greater indicates a variant in the top 1% for likelihood of being deleterious.',
    spliceAIScore:
        'SpliceAI probability of a variant being splice altering (scale of 0 to 1). Closer to 1 means a greater probability of a splicing change, recommended cutoff is normally 0.5.',
    spliceAIType:
        'SpliceAI type of splicing change predicted for this variant. Can be a gain or a loss of a splice acceptor or splice donor. If the SpliceAI score is 0, this will be NA.',
    zygosity:
        'Zygosity for the variant in this individual. Note that hemizygous variants in this column will appear as "homozygous".',
    burdenCount:
        'Number of variants an individual has in this gene. Note that this is calculated AFTER variants have been returned by the search query, meaning that variants more common than the "Max Frequency" will NOT be included in the burden calculation.',
    ad: 'Allele depth. This is the number of reads in which a variant is called for a given sample.',
    dp: 'Total depth. If the sample is from singleton data, provides the total depth from just that sample. If the sample was annotated as part of a family, provides the sum of total depths across all samples in that family.',
    qual: 'QUAL is the Phred-scaled probability that a variant exists given sequencing data. QUAL is annotated in the Quality field in the reports.',
    individualId: 'Identifier for this individual in its source database.',
    familyId: "Identifier for this individual's family in its source database.",
    affectedStatus:
        'Flag for whether an individual is clinically affected or unaffected. Note that individuals are only listed as unaffected if "This patient is clinically normal" is checked off in Phenotips.',
    flaggedGenes:
        'Gene(s) explicitly flagged for this individual record, along with their classification. Note that genes flagged as "solved" may be only a partial explanation for an individual\'s phenotype.',
    phenotypicFeaturesPresent:
        'HPO phenotypes listed as present in this individual (click on text to expand field).',
    phenotypicFeaturesAbsent:
        'HPO phenotypes explicitly listed as absent from this individual (click on text to expand field).',
};

export default HEADERS;
