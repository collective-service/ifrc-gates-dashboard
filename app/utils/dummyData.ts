import { Props as StatusCardProps } from '#components/StatusCard';

type Bounds = [number, number, number, number];

export const progressDataOne = [
    {
        countryName: 'Cameroon',
        id: '1',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 130,
        totalValue: 200,
    },
    {
        countryName: 'Algeria',
        id: '2',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 50,
        totalValue: 200,
    },
    {
        countryName: 'Bulgaria',
        id: '3',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 99.5,
        totalValue: 200,
    },
    {
        countryName: 'Democratic Republic of Congo',
        id: '4',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 105,
        totalValue: 200,
    },
    {
        countryName: 'Belarus',
        id: '5',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 125,
        totalValue: 200,
    },
];

export const progressDataTwo = [
    {
        countryName: 'Oman',
        id: '13',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 180,
        totalValue: 200,
    },
    {
        countryName: 'Malaysia',
        id: '29',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 190,
        totalValue: 200,
    },
    {
        countryName: 'Viet Nam',
        id: '23',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 195,
        totalValue: 200,
    },
    {
        countryName: 'Bangladesh',
        id: '34',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 175,
        totalValue: 200,
    },
    {
        countryName: 'Lao PDR',
        id: '26',
        title: 'Vulnerable cases',
        color: 'var(--color-success)',
        value: 156,
        totalValue: 200,
    },
];

export const boundsData: Bounds = [80.088425, 26.397898, 88.174804, 30.422717];

export const indicatorData = [
    {
        id: 1,
        month: 'Jan',
        percentage: 10,
    },
    {
        id: 2,
        month: 'Feb',
        percentage: 15,
    },
    {
        id: 3,
        month: 'Mar',
        percentage: 20,
    },
    {
        id: 4,
        month: 'Apr',
        percentage: 25,
    },
    {
        id: 5,
        month: 'May',
        percentage: 35,
    },
    {
        id: 6,
        month: 'Jun',
        percentage: 15,
    },
    {
        id: 7,
        month: 'Jul',
        percentage: 25,
    },
    {
        id: 8,
        month: 'Aug',
        percentage: 55,
    },
    {
        id: 9,
        month: 'Sept',
        percentage: 50,
    },
    {
        id: 10,
        month: 'Oct',
        percentage: 45,
    },
    {
        id: 11,
        month: 'Nov',
        percentage: 65,
    },
    {
        id: 12,
        month: 'Dec',
        percentage: 5,
    },
];

export const outbreakData = [
    {
        month: 'Jan',
        covid: 20,
        monkeyPox: 5,
    },
    {
        month: 'Feb',
        covid: 30,
        monkeyPox: 15,
    },
    {
        month: 'Mar',
        covid: 35,
        monkeyPox: 20,
    },
    {
        month: 'Apr',
        covid: 25,
        monkeyPox: 25,
    },
    {
        month: 'May',
        covid: 40,
        monkeyPox: 35,
    },
    {
        month: 'Jun',
        covid: 45,
        monkeyPox: 15,
    },
    {
        month: 'Jul',
        covid: 55,
        monkeyPox: 25,
    },
    {
        month: 'Aug',
        covid: 65,
        monkeyPox: 55,
    },
    {
        month: 'Sept',
        covid: 70,
        monkeyPox: 50,
    },
    {
        month: 'Oct',
        covid: 65,
        monkeyPox: 45,
    },
    {
        month: 'Nov',
        covid: 80,
        monkeyPox: 65,
    },
    {
        month: 'Dec',
        covid: 60,
        monkeyPox: 5,
    },

];

export const statusData: StatusCardProps[] = [
    {
        statusId: 1,
        title: 'Total number of deaths',
        value: 189050,
        regionalValue: 1,
    },
    {
        statusId: 2,
        title: 'Total outbreaks for country',
        value: 2,
        regionalValue: 167.3,
    },
    {
        statusId: 3,
        title: 'Total number of cases',
        value: 2,
        regionalValue: 65,
    },
    {
        statusId: 4,
        title: 'New cases per million',
        value: 56.8,
        regionalValue: 167.3,
    },
];

export const genderDisaggregationData = [
    {
        id: 1,
        gender: 'Male',
        percentage: 40,
    },
    {
        id: 2,
        gender: 'Female',
        percentage: 40,
    },
    {
        id: 3,
        gender: 'other',
        percentage: 20,
    },
];

export const sourcesProgressBarData = [
    {
        source: 'Demand all',
        id: '1',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'officials',
        id: '2',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'WHO',
        id: '3',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'Demand Evolution',
        id: '4',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'Newspapers',
        id: '5',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'officials',
        id: '6',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'Demand prevention',
        id: '7',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'Radio',
        id: '8',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
    {
        source: 'Social media',
        id: '9',
        title: 'communication',
        color: 'var(--color-text-regional)',
        value: 56,
        totalValue: 100,
    },
];
