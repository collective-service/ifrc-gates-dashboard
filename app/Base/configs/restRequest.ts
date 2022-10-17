import {
    apiEndpoint,
    apiHttps,
} from '#base/configs/env';

export const reactAppApiHttps = location.protocol === 'https:' // eslint-disable-line no-restricted-globals
    ? 'https'
    : apiHttps;

export const wsEndpoint = !apiEndpoint
    ? 'http://localhost:7020/api/v1'
    : `${reactAppApiHttps}://${apiEndpoint}/api/v1`;

export const adminEndpoint = !apiEndpoint
    ? 'http://localhost:7020/admin/'
    : `${reactAppApiHttps}://${apiEndpoint}/admin/`;
