interface Bounds {
    region: string;
    boundingBox: [number, number, number, number];
}

// eslint-disable-next-line import/prefer-default-export
export const regionBounds: Bounds[] = [
    {
        region: 'Europe',
        boundingBox: [
            27.63882,
            -25.53273,
            83.62742,
            83.62742,
        ],
    },
    {
        region: 'Americas',
        boundingBox: [
            -59.48429,
            30.77829,
            83.13753,
            -100,
        ],
    },
    {
        region: 'AsiaPacific',
        boundingBox: [
            -54.77829,
            34.10764,
            40.5585,
            117,
        ],
    },
    {
        region: 'ESAR',
        boundingBox: [
            -34.83417,
            11.66938,
            18.00309,
            72.49316,
        ],
    },
    {
        region: 'MENA',
        boundingBox: [
            8.63756,
            -17.10318,
            39.78168,
            75.38293,
        ],
    },
    {
        region: 'WCAR',
        boundingBox: [
            -40.36714,
            -25.36111,
            27.31322,
            31.31461,
        ],
    },
];
