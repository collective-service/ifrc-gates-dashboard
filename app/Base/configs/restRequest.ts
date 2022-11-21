import {
    apiEndpoint,
    apiHttps,
} from '#base/configs/env';

const reactAppApiHttps = location.protocol === 'https:' // eslint-disable-line no-restricted-globals
    ? 'https'
    : apiHttps;

// eslint-disable-next-line import/prefer-default-export
export const wsEndpoint = !apiEndpoint
    ? 'http://localhost:7020/api/v1'
    : `${reactAppApiHttps}://${apiEndpoint}/api/v1`;
