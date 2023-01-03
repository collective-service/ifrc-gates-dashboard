interface Bounds {
    region: string;
    boundingBox: [number, number, number, number];
}

// eslint-disable-next-line import/prefer-default-export
export const regionBounds: Bounds[] = [
    {
        region: 'Europe',
        boundingBox: [
            -25.53273,
            27.63882,
            83.62742,
            83.62742,
        ],
    },
    {
        region: 'Americas',
        boundingBox: [
            -54.77829,
            -59.48429,
            83.62742,
            83.13753,
        ],
    },
    {
        region: 'AsiaPacific',
        boundingBox: [
            -117,
            53.5585,
            34.10764,
            -54.77829,
        ],
    },
    {
        region: 'ESAR',
        boundingBox: [
            11.66938,
            -34.83417,
            72.49316,
            18.00309,
        ],
    },
    {
        region: 'MENA',
        boundingBox: [
            -17.10318,
            8.63756,
            75.38293,
            39.78168,
        ],
    },
    {
        region: 'WCAR',
        boundingBox: [
            -25.36111,
            -40.36714,
            31.31461,
            27.31322,
        ],
    },
];
