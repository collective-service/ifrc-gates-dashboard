import {
    formatNumber,
    getDashboardLink,
    parseQueryString,
} from './common';

test ('get dashboard link', () => {
    expect(getDashboardLink()).toBe('/dashboard');
});

test ('parse query string', () => {
    expect(parseQueryString('?page=dashboard&hotReload=true')).toStrictEqual({
        page: 'dashboard',
        hotReload: 'true',
    });
});

test ('format number raw abbreviate', () => {
    expect(formatNumber('raw', 0.9999)).toStrictEqual('<1');
})

test ('format number million abbreviate', () => {
    expect(formatNumber('million', 123455)).toStrictEqual('<1M');
})

test ('format number thousand abbreviate', () => {
    expect(formatNumber('thousand', 1234)).toStrictEqual('1.2K');
})

test ('format number percentage abbreviate', () => {
    expect(formatNumber('percent', 0.0099)).toStrictEqual('<1%');
})

test ('format number raw nonAbbreviate', () => {
    expect(formatNumber('raw', 0.011111111, false)).toStrictEqual('0.011111111');
});

test ('format number thousand nonAbbreviate', () => {
    expect(formatNumber('thousand', 123, false)).toStrictEqual('0.123K');
})

test ('format number million nonAbbreviate', () => {
    expect(formatNumber('million', 12345, false)).toStrictEqual('0.012345M');
})

test ('format number percent nonAbbreviate', () => {
    expect(formatNumber('percent', 0.0099, false)).toStrictEqual('0.99%');
})