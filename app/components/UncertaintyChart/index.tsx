import React, { useMemo } from 'react';
import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Line,
    ResponsiveContainer,
} from 'recharts';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import { isDefined, _cs } from '@togglecorp/fujs';
import { getShortMonth } from '#utils/common';
import styles from './styles.css';

export interface UncertainData {
    id: string;
    emergency?: string;
    indicatorValue?: number | null;
    date: string;
    uncertainRange?: number[];
    minimumValue?: number,
    maximumValue?: number,
    region?: string;
}
const dateTickFormatter = (d: string) => getShortMonth(d);
interface Props {
    className?: string;
    uncertainData: UncertainData[] | undefined;
    emergencyFilterValue?: string;
    headingDescription?: React.ReactNode;
    heading?: React.ReactNode;
}

interface Payload {
    name?: string;
    value?: number;
    payload?: UncertainData;
}
interface TooltipProps {
    active?: boolean;
    payload?: Payload[]
}

function UncertaintyChart(props: Props) {
    const {
        className,
        uncertainData,
        emergencyFilterValue,
        headingDescription,
        heading,
    } = props;

    const minDomain = useMemo(() => {
        const minimum = uncertainData?.map((min) => (
            Number(min.minimumValue)
        ));
        const dataMin = minimum?.filter((value) => (
            !Number.isNaN(value)
        ));

        return (dataMin && dataMin?.length > 0)
            ? Math.min(...(dataMin || []))
            : 0;
    }, [uncertainData]);

    const maxDomain = useMemo(() => {
        const maximum = uncertainData?.map((max) => (
            Number(max.maximumValue)
        ));
        const dataMax = maximum?.filter((value) => (
            !Number.isNaN(value)
        ));

        return (dataMax && dataMax?.length > 0)
            ? Math.max(...(dataMax || []))
            : 100;
    }, [uncertainData]);

    const customTooltip = (tooltipProps: TooltipProps) => {
        const {
            active,
            payload: data,
        } = tooltipProps;
        if (active && data && data.length > 0) {
            return (
                <div className={styles.tooltipCard}>
                    <div>
                        {`${data[0].payload?.emergency}`}
                    </div>
                    <div>
                        {isDefined(data[0].payload?.region)
                            ? `${data[0].payload?.region} - `
                            : null}
                        {dateTickFormatter(data[0].payload?.date ?? '')}
                    </div>
                    <div>
                        {data[0].payload?.indicatorValue}
                        {isDefined(data[0].payload?.minimumValue
                            && isDefined(data[0].payload.maximumValue))
                            ? ` [${data[0].payload?.minimumValue} - ${data[0].payload?.maximumValue}] `
                            : null}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <ContainerCard
            className={_cs(className, styles.areaChart)}
            contentClassName={styles.responsiveContent}
            heading={heading}
            headingSize="extraSmall"
            headerDescription={headingDescription}
        >
            <ResponsiveContainer
                className={styles.responsiveContainer}
            >
                <ComposedChart
                    data={uncertainData}
                >
                    <XAxis
                        dataKey="date"
                        padding={{
                            left: 30,
                            right: 30,
                        }}
                        tickFormatter={dateTickFormatter}
                    />
                    <YAxis
                        domain={[minDomain, maxDomain]}
                    />
                    <Area
                        dataKey="uncertainRange"
                        name="Uncertainty Range"
                        stroke="#8DD2B1"
                        fill="#8DD2B1"
                    />
                    <Line
                        dataKey="indicatorValue"
                        name={emergencyFilterValue}
                        stroke="#2F9C67"
                        strokeWidth={2}
                        dot={{
                            stroke: '#2F9C67',
                            strokeWidth: 2,
                        }}
                    />
                    <Tooltip content={customTooltip} />
                </ComposedChart>
            </ResponsiveContainer>
        </ContainerCard>
    );
}
export default UncertaintyChart;
