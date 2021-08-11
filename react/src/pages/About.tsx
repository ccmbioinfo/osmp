import React from 'react';
import styled from 'styled-components';
import { Body, Column, Flex, Typography } from '../components';
import { useUserInfo } from '../hooks';

const Divider = styled.div`
    background-color: lightgrey;
    height: 1px;
    margin: ${props => props.theme.space[3]} 0;
`;

const AboutPage: React.FC<{}> = () => {
    const userInfo = useUserInfo();

    return (
        <Body>
            <Flex>
                {userInfo && (
                    <Typography variant="subtitle" bold>
                        Hi, {userInfo.preferred_username}!
                    </Typography>
                )}
            </Flex>
            <Flex>
                <Typography variant="h3" bold>
                    Welcome to the Single-sided Matching Portal.
                </Typography>
            </Flex>
            <Divider />
            <Flex>
                <Typography variant="h4" bold>
                    What is SSMP?
                </Typography>
                <Typography variant="p">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed suscipit nibh ut
                    elementum suscipit. Quisque tristique ut leo a luctus. Sed sed nulla massa.
                    Aenean vitae tincidunt enim, vitae venenatis nisl. Nam a mauris id risus
                    elementum pretium. Phasellus arcu purus, convallis vel eros sed, condimentum
                    facilisis ligula. Fusce ut sagittis neque. Suspendisse aliquam consectetur
                    sapien, sit amet aliquet tortor congue nec. Etiam pulvinar neque nec diam
                    tincidunt dignissim. Aliquam euismod neque eget est luctus, sit amet luctus
                    neque feugiat. Sed imperdiet congue sodales. Praesent sodales laoreet arcu.
                </Typography>
                <Typography variant="h4" bold>
                    Problems SSMP Solves
                </Typography>
                <Typography variant="p">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed suscipit nibh ut
                    elementum suscipit. Quisque tristique ut leo a luctus. Sed sed nulla massa.
                    Aenean vitae tincidunt enim, vitae venenatis nisl. Nam a mauris id risus
                    elementum pretium. Phasellus arcu purus, convallis vel eros sed, condimentum
                    facilisis ligula. Fusce ut sagittis neque. Suspendisse aliquam consectetur
                    sapien, sit amet aliquet tortor congue nec. Etiam pulvinar neque nec diam
                    tincidunt dignissim. Aliquam euismod neque eget est luctus, sit amet luctus
                    neque feugiat. Sed imperdiet congue sodales. Praesent sodales laoreet arcu.
                </Typography>
                <Typography variant="p">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed suscipit nibh ut
                    elementum suscipit. Quisque tristique ut leo a luctus. Sed sed nulla massa.
                    Aenean vitae tincidunt enim, vitae venenatis nisl. Nam a mauris id risus
                    elementum pretium. Phasellus arcu purus, convallis vel eros sed, condimentum
                    facilisis ligula. Fusce ut sagittis neque. Suspendisse aliquam consectetur
                    sapien, sit amet aliquet tortor congue nec. Etiam pulvinar neque nec diam
                    tincidunt dignissim. Aliquam euismod neque eget est luctus, sit amet luctus
                    neque feugiat. Sed imperdiet congue sodales. Praesent sodales laoreet arcu.
                </Typography>
                <Typography variant="p">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed suscipit nibh ut
                    elementum suscipit. Quisque tristique ut leo a luctus. Sed sed nulla massa.
                    Aenean vitae tincidunt enim, vitae venenatis nisl. Nam a mauris id risus
                    elementum pretium. Phasellus arcu purus, convallis vel eros sed, condimentum
                    facilisis ligula. Fusce ut sagittis neque. Suspendisse aliquam consectetur
                    sapien, sit amet aliquet tortor congue nec. Etiam pulvinar neque nec diam
                    tincidunt dignissim. Aliquam euismod neque eget est luctus, sit amet luctus
                    neque feugiat. Sed imperdiet congue sodales. Praesent sodales laoreet arcu.
                </Typography>
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
                    <Typography variant="subtitle">Connor Klamann</Typography>
                    <Typography variant="subtitle">Hannah Le</Typography>
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
        </Body>
    );
};
export default AboutPage;
