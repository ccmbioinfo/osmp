import React from 'react';
import portal from '../assets/osmp_1.png';
import workflow from '../assets/osmp_2.png';
import { BodyAbout, Container, Divider, Flex, InlineFlex, Typography } from '../components';

const AboutPage: React.FC<{}> = () => {
    return (
        <BodyAbout>
            <Flex justifyContent="center">
                <Typography variant="h3" bold>
                    Welcome to the One-sided Matching Portal.
                </Typography>
            </Flex>
            <Divider />

            <InlineFlex>
                <Container>
                    <Typography variant="h4" lineHeight={1.6}>
                        OSMP is a web-based portal that supports “one-sided” matchmaking, in which
                        variants in novel candidate genes are identified directly from the
                        genome-wide sequencing data within RD databases. An OSMP user may query a
                        gene of interest across participating databases. Using application
                        programming interfaces (APIs), the OSMP returns rare variants in the gene,
                        along with participant-level phenotypic (HPO terms) and genotypic (zygosity,
                        inheritance, variant quality) information. The portal’s user-friendly design
                        allows the queriors to filter and sort variant/participant information to
                        rule matches in or out, reducing the need for time-consuming email
                        correspondence. We anticipate that through robust data sharing practices,
                        the OSMP will provide a more accessible and efficient solution to genomic
                        matchmaking for RD researchers, and foster future connections with
                        additional international repositories.
                    </Typography>
                </Container>
                <Container>
                    <img src={portal} alt="OSMP portal" width="80%" height="80%" />
                </Container>
            </InlineFlex>

            <InlineFlex>
                <Container display="block" width="20%">
                    <img src={workflow} alt="OSMP portal" />
                </Container>
                <Container>
                    <Typography variant="h3" bold>
                        Features
                    </Typography>

                    <ul>
                        <li>
                            <Typography variant="h4" bold>
                                Search for a gene of interest
                            </Typography>

                            <Typography variant="h4" lineHeight={1.4} customMargin>
                                To search for a gene of interest, please specify the genome assembly
                                (GRCh37 or GRCh38), gene name, maximum allele frequency and variants
                                stores from one or multiple contributors. The result table will
                                display variant details including variant annotations and patient
                                information.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="h4" bold>
                                Variant data annotation on the fly
                            </Typography>
                            <Typography variant="h4" lineHeight={1.4} customMargin>
                                OSMP uses{' '}
                                <a href="https://cadd.gs.washington.edu/download">
                                    CADD VEP annotations of all possible SNVs{' '}
                                </a>
                                and{' '}
                                <a href="https://gnomad.broadinstitute.org/downloads#v2-variants">
                                    gnomAD annotations{' '}
                                </a>
                                for both exomes and whole genomes annotations. Since different
                                variant stores may use different annotation tools and versions thus
                                hindering comparison across institutions, OSMP performs data
                                annotation on the fly to standardize the results.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="h4" bold>
                                LiftOver
                            </Typography>
                            <Typography variant="h4" lineHeight={1.4} customMargin>
                                For variants that are not in the user-specified genome assembly, the
                                OSMP "liftOver" these variants from their original genome assembly
                                to the desired one using the{' '}
                                <a href="https://hgdownload.soe.ucsc.edu/downloads.html">
                                    {' '}
                                    UCSC liftOver tool{' '}
                                </a>
                                . The column "Original Assembly" displays the variant's genome
                                assembly in the variant store. The column "Current Assembly"
                                displays the genome assembly for the data shown in the result table.
                            </Typography>
                        </li>
                    </ul>
                </Container>
            </InlineFlex>

            <Divider />

            <Container>
                <Typography variant="p" bold>
                    Contributors
                </Typography>
                <Typography variant="p">The Center for Computational Medicine</Typography>
                <Typography variant="p">Children’s Hospital of Eastern Ontario</Typography>
                <Typography variant="p">PhenoTips</Typography>
            </Container>
        </BodyAbout>
    );
};
export default AboutPage;
