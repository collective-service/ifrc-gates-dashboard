import { ProgressBarRendererProps } from '#views/Dashboard/CombinedIndicators';

type Bounds = [number, number, number, number];

export interface PercentageStatsProps {
    id: number;
    heading: string;
    statValue: number;
    suffix: string;
}

export const progressDataOne: ProgressBarRendererProps[] = [
    {
        barName: 'Cameroon',
        id: '1',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 130,
        totalValue: 200,
    },
    {
        barName: 'Algeria',
        id: '2',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 50,
        totalValue: 200,
    },
    {
        barName: 'Bulgaria',
        id: '3',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 99.5,
        totalValue: 200,
    },
    {
        barName: 'Democratic Republic of Congo',
        id: '4',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 105,
        totalValue: 200,
    },
    {
        barName: 'Belarus',
        id: '5',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 125,
        totalValue: 200,
    },
];

export const progressDataTwo: ProgressBarRendererProps[] = [
    {
        barName: 'Oman',
        id: '13',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 160,
        totalValue: 200,
    },
    {
        barName: 'Malaysia',
        id: '29',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 140,
        totalValue: 200,
    },
    {
        barName: 'Viet Nam',
        id: '23',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
        value: 135,
        totalValue: 200,
    },
    {
        barName: 'Lao PDR',
        id: '26',
        title: 'Vulnerable cases',
        color: 'var(--dui-color-progress-alt)',
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

export const lineChartData = [
    {
        name: 'Mar',
        Covid: 70,
        MonkeyPox: 24,
        Ebola: 35,
    },
    {
        name: 'Apr',
        Covid: 30,
        MonkeyPox: 13,
        Ebola: 10,
    },
    {
        name: 'May',
        Covid: 90,
        MonkeyPox: 98,
        Ebola: 58,
    },
    {
        name: 'June',
        Covid: 178,
        MonkeyPox: 90,
        Ebola: 30,
    },
    {
        name: 'July',
        Covid: 89,
        MonkeyPox: 48,
        Ebola: 26,
    },
    {
        name: 'Aug',
        Covid: 90,
        MonkeyPox: 80,
        Ebola: 39,
    },
    {
        name: 'Sept',
        Covid: 90,
        MonkeyPox: 43,
        Ebola: 29,
    },
];

export const barChartData = [
    {
        name: 'Americas',
        range: '400M',
        pv: 2400,
        amt: 2010,
    },
    {
        name: 'Asia',
        range: '300M',
        pv: 1398,
        amt: 1710,
    },
    {
        name: 'ESAR',
        range: '200M',
        pv: 9800,
        amt: 1500,
    },
    {
        name: 'Europe',
        range: '270M',
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'MENA',
        range: '170M',
        pv: 4800,
        amt: 1601,
    },
    {
        name: 'WCAR',
        range: '290M',
        pv: 3800,
        amt: 1520,
    },
];

export const totalCasesBarChart = [
    {
        id: 1,
        name: 'COVID-19',
        range: '500M',
        pv: 2100,
        amt: 2010,
        color: 'red',
    },
    {
        id: 23,
        name: 'Ebola',
        range: '300M',
        pv: 3098,
        amt: 1450,
        color: 'blue',
    },
    {
        id: 34,
        name: 'MonkeyPox',
        range: '400M',
        pv: 5800,
        amt: 1900,
        color: 'green',
    },
    {
        id: 56,
        name: 'Cholera',
        range: '200M',
        pv: 3908,
        amt: 1500,
        color: 'purple',
    },
    {
        id: 78,
        name: 'Spanish Flu',
        range: '300M',
        pv: 4800,
        amt: 1881,
        color: 'yellow',
    },
];

export const regionalBreakdownPieData = [
    {
        regionId: '1',
        country: 'USA',
        outbreak: 'COVID-19',
        color: '#C09A57',
        regionalData: [
            {
                id: 21,
                status: 'Severe',
                percentage: 40,
            },
            {
                id: 24,
                status: 'Normal',
                percentage: 30,
            },
            {
                id: 34,
                status: 'Average',
                percentage: 20,
            },
            {
                id: 45,
                status: 'Good',
                percentage: 30,
            },
            {
                id: 12,
                status: 'severe',
                percentage: 20,
            },
        ],
    },
    {
        regionId: '2',
        country: 'EUR',
        outbreak: 'Monkey-pox',
        color: '#FFDD98',
        regionalData: [
            {
                id: 21,
                status: 'Severe',
                percentage: 40,
            },
            {
                id: 24,
                status: 'Normal',
                percentage: 30,
            },
            {
                id: 34,
                status: 'Average',
                percentage: 20,
            },
            {
                id: 45,
                status: 'Good',
                percentage: 30,
            },
            {
                id: 12,
                status: 'severe',
                percentage: 20,
            },
        ],
    },
    {
        regionId: '3',
        country: 'ASIA',
        outbreak: 'Cholera',
        color: '#C7BCA9',
        regionalData: [
            {
                id: 21,
                status: 'Severe',
                percentage: 40,
            },
            {
                id: 24,
                status: 'Normal',
                percentage: 30,
            },
            {
                id: 34,
                status: 'Average',
                percentage: 20,
            },
            {
                id: 45,
                status: 'Good',
                percentage: 30,
            },
            {
                id: 12,
                status: 'severe',
                percentage: 20,
            },
        ],
    },
    {
        regionId: '4',
        country: 'IRE',
        outbreak: 'Spanish Flu',
        color: '#ACA28E',
        regionalData: [
            {
                id: 21,
                status: 'Severe',
                percentage: 40,
            },
            {
                id: 24,
                status: 'Normal',
                percentage: 30,
            },
            {
                id: 34,
                status: 'Average',
                percentage: 20,
            },
            {
                id: 45,
                status: 'Good',
                percentage: 30,
            },
            {
                id: 12,
                status: 'severe',
                percentage: 20,
            },
        ],
    },
    {
        regionId: '5',
        country: 'POL',
        outbreak: 'Ebola',
        color: '#CCB387',
        regionalData: [
            {
                id: 21,
                status: 'Severe',
                percentage: 40,
            },
            {
                id: 24,
                status: 'Normal',
                percentage: 30,
            },
            {
                id: 34,
                status: 'Average',
                percentage: 20,
            },
            {
                id: 45,
                status: 'Good',
                percentage: 30,
            },
            {
                id: 12,
                status: 'severe',
                percentage: 20,
            },
        ],
    },
    {
        regionId: '6',
        country: 'WCAR',
        regionalData: [
            {
                id: 21,
                status: 'Severe',
                percentage: 40,
            },
            {
                id: 24,
                status: 'Normal',
                percentage: 30,
            },
            {
                id: 34,
                status: 'Average',
                percentage: 20,
            },
            {
                id: 45,
                status: 'Good',
                percentage: 30,
            },
            {
                id: 12,
                status: 'severe',
                percentage: 20,
            },
        ],
    },
];

export const sourcesProgressBarData: ProgressBarRendererProps[] = [
    {
        title: 'communication',
        barName: 'Demand all',
        id: '1',
        totalValue: 100,
        value: 76,
        color: '#8DD2B1',
        subValue: 30,
    },
    {
        title: 'communication',
        barName: 'Officials',
        id: '2',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 76,
    },
    {
        title: 'communication',
        barName: 'WHO',
        id: '3',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 26,
    },
    {
        title: 'communication',
        barName: 'Demand Evolution',
        id: '4',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 26,
    },
    {
        title: 'communication',
        barName: 'Newspapers',
        id: '5',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 26,
    },
    {
        title: 'communication',
        barName: 'Officials',
        id: '6',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 26,
    },
    {
        title: 'communication',
        barName: 'Demand prevention',
        id: '7',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 26,
    },
    {
        title: 'communication',
        barName: 'Radio',
        id: '8',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 26,
    },
    {
        title: 'communication',
        barName: 'Social media',
        id: '9',
        totalValue: 100,
        value: 56,
        color: '#8DD2B1',
        subValue: 26,
    },
];

export const overviewTableData = [
    {
        id: '12',
        country: 'Nepal',
        valueOne: '10%',
        valueTwo: '',
        month: 'Jan',
        high: false,
    },
    {
        id: '10',
        country: 'India',
        valueOne: '',
        valueTwo: '30%',
        month: 'Feb',
        high: false,
    },
    {
        id: '21',
        country: 'China',
        valueOne: '50',
        valueTwo: '23%',
        month: 'Jan',
        high: true,
    },
    {
        id: '32',
        country: 'Bangladesh',
        valueOne: '20%',
        valueTwo: '',
        month: 'Mar',
        high: false,
    },
    {
        id: '56',
        country: 'SriLanka',
        valueOne: '25%',
        valueTwo: '',
        month: 'Apr',
        high: false,
    },
    {
        id: '45',
        country: 'Afganisthan',
        valueOne: '56',
        valueTwo: '',
        month: 'May',
        high: true,
    },
    {
        id: '22',
        country: 'Maldives',
        valueOne: '34%',
        valueTwo: '',
        month: 'June',
        high: false,
    },
    {
        id: '27',
        country: 'Nambia',
        valueOne: '34%',
        valueTwo: '21%',
        month: 'June',
        high: false,
    },
    {
        id: '42',
        country: 'Mongolia',
        valueOne: '6.7%',
        valueTwo: '30.6%',
        month: 'June',
        high: true,
    },
    {
        id: '58',
        country: 'Nigeria',
        valueOne: '74',
        valueTwo: '',
        month: 'June',
        high: true,
    },
    {
        id: '20',
        country: 'Congo',
        valueOne: '94%',
        valueTwo: '',
        month: 'June',
        high: true,
    },
];
