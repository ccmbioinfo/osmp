import React from 'react';
import { BodyAbout, Column, Divider, Flex, Typography } from '../components';
import { useUserInfo } from '../hooks';

const AboutPage: React.FC<{}> = () => {
    const userInfo = useUserInfo();

    return (
        <BodyAbout>
            <Flex>
                {userInfo && (
                    <Typography variant="subtitle" bold>
                        Hi, {userInfo.preferred_username}!
                    </Typography>
                )}
            </Flex>
            <Flex>
                <Typography variant="h3" bold>
                    Welcome to the One-sided Matching Portal.
                </Typography>
            </Flex>
            <Divider />
            <Flex>
                <Typography variant="p">
                    This web-based portal supports “one-sided” matchmaking, in which variants in
                    novel candidate genes are identified directly from the genome-wide sequencing
                    data within RD databases. An OSMP user may query a gene of interest across
                    participating databases. Using application programming interfaces (APIs), the
                    OSMP returns rare variants in the gene, along with participant-level phenotypic
                    (HPO terms) and genotypic (zygosity, inheritance, variant quality) information.
                    The portal’s user-friendly design allows the queriors to filter and sort
                    variant/participant information to rule matches in or out, reducing the need for
                    time-consuming email correspondence. A pilot querying the last 6 months of new
                    gene-disease associations in OMIM is being conducted using OSMP to explore its
                    ability to improve the false positive ratio and identify matches of interest in
                    the RD databases Genomics4RD (Canada) and Genomic Answers for Kids (United
                    States). We anticipate that through robust data sharing practices, the OSMP will
                    provide a more accessible and efficient solution to genomic matchmaking for RD
                    researchers, and foster future connections with additional international
                    repositories.
                </Typography>
                <Typography variant="h3" bold>
                    Features
                </Typography>
                <ul>
                    <li>
                        <Typography variant="h4" bold>
                            Search for a gene of interest
                        </Typography>
                        <Typography variant="p">
                            To search for a gene of interest, please specify the gene name, maximum
                            allele frequency, genome assembly and one or multiple contributors. The
                            result table will display variant and patient information as well as
                            variant annotations.
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="h4" bold>
                            Variant data annotation on the fly
                        </Typography>
                        <Typography variant="p">
                            OSMP uses <a href="https://cadd.gs.washington.edu/download">CADD VEP annotations of all possible SNVs</a> 
                            and <a href="https://gnomad.broadinstitute.org/downloads#v2-variants">gnomAD annotations</a>
                            for both
                            exomes and whole genomes. This is because different variant stores may
                            use different annotation tools and versions, hindering comparison across
                            institutions.
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="h4" bold>
                            LiftOver
                        </Typography>
                        <Typography variant="p">
                            For variants that are not in the user-specified genome assembly, the
                            OSMP "liftover" these variants from their original genome assembly to
                            the desired one using the <a href="https://hgdownload.soe.ucsc.edu/downloads.html"> UCSC liftOver tool </a>.
                            
                        </Typography>
                    </li>
                </ul>
            </Flex>
            <Divider />
            <Flex justifyContent="space-around" alignItems="flex-start">
                <Column>
                    <Typography variant="subtitle" bold>
                        Contributors
                    </Typography>
                    <Typography variant="subtitle">
                        The Center for Computational Medicine
                    </Typography>
                    <Typography variant="subtitle">
                        Children’s Hospital of Eastern Ontario
                    </Typography>
                    <Typography variant="subtitle">PhenoTips</Typography>
                </Column>
                <Column>
                    <Typography variant="subtitle" bold>
                        Community
                    </Typography>
                    <Typography variant="subtitle">Feedback</Typography>
                </Column>
                <Column>
                    <Typography variant="subtitle" bold>
                        Contact
                    </Typography>
                </Column>
                <Column>
                    <Typography variant="subtitle" bold>
                        Terms of Service
                    </Typography>
                </Column>
            </Flex>
        </BodyAbout>
    );
};
export default AboutPage;
