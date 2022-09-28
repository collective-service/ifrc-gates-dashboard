import {
    ApolloClientOptions,
    NormalizedCacheObject,
    InMemoryCache,
    ApolloLink as ApolloLinkFromClient,
    HttpLink,
    // from,
} from '@apollo/client';
// import { RestLink } from 'apollo-link-rest';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT as string;

const link = new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: 'include',
}) as unknown as ApolloLinkFromClient;

/*
const restLink = new RestLink({
    endpoints: {
        helix: HELIX_ENDPOINT,
        drupal: DRUPAL_ENDPOINT,
    },
    credentials: 'include',
}) as unknown as ApolloLinkFromClient;
*/

const apolloOptions: ApolloClientOptions<NormalizedCacheObject> = {
    // link: from([restLink, link]),
    link,
    cache: new InMemoryCache(),
    assumeImmutableResults: true,
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        watchQuery: {
            fetchPolicy: 'network-only',
            nextFetchPolicy: 'cache-only',
            errorPolicy: 'all',
        },
    },
};

export default apolloOptions;
