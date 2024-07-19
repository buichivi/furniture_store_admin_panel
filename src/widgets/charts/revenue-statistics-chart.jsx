import { Card, Tooltip } from '@material-tailwind/react';
import React, { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { Autocomplete, TextField } from '@mui/material';
import moment from 'moment';
import DatePicker from 'react-datepicker';

const formatData = (years, data) => {
    return years.map((year) => {
        const currentYear = new Date().getUTCFullYear();
        return {
            name: `${currentYear == year ? `Current year (${year})` : year}`,
            data: data[year],
        };
    });
};
const options = {
    theme: {
        mode: 'light',
        palette: 'palette2',
        monochrome: {
            enabled: false,
            color: '#255aee',
            shadeTo: 'dark',
            shadeIntensity: 0.65,
        },
    },
    chart: {
        zoom: {
            enabled: true,
        },
        toolbar: {
            show: true,
            offsetX: 0,
            offsetY: 0,
            tools: {
                download: true,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false,
            },
        },
        animations: {
            enabled: true,
            easing: 'easeout',
            speed: 500,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 2,
        curve: 'straight',
    },
    xaxis: {
        categories: Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' })),
        tooltip: { enabled: false },
    },
    yaxis: {
        labels: {
            formatter: (value) => `$${value}`,
        },
    },
    tooltip: {
        shared: true,
        intersect: false,
    },
    legend: {
        position: 'top',
    },
};

const RevenueStatisticsChart = ({ data = {} }) => {
    const { dailyData = [], monthlyData = [] } = data;
    const [selectedType, setSelectedType] = useState('daily');
    const [selectedYears, setSelectedYears] = useState([]);
    const [chartType, setChartType] = useState('area');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        if (monthlyData) setSelectedYears(Object.keys(monthlyData).slice(-1));
    }, [data]);

    const dailyFilteredData = useMemo(() => {
        return dailyData.filter((item) => {
            if (!startDate && !endDate) return item;
            const itemDate = new Date(new Date().getUTCFullYear(), new Date().getMonth(), item.day.split('-')[0]);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }, [dailyData, endDate]);

    const yearlyData = useMemo(() => {
        const data = [];
        Object.keys(monthlyData).forEach((year) => {
            data.push({
                year,
                revenue: monthlyData[year].reduce((acc, cur) => acc + cur, 0),
            });
        });
        return data;
    }, [monthlyData]);

    console.log(yearlyData);

    return (
        <Card className="border border-blue-gray-100 p-4 shadow-sm">
            <h3 className="text-center font-semibold text-black">Revenue Statistics</h3>
            <div className="flex items-center justify-between pt-2">
                <div className="flex flex-1 items-center justify-end gap-4">
                    {Object.keys(monthlyData)?.length > 0 && selectedType == 'monthly' && (
                        <Autocomplete
                            multiple
                            options={Object.keys(monthlyData)?.sort((a, b) => a - b)}
                            size="small"
                            className="max-w-[50%] flex-1 !text-sm"
                            value={selectedYears}
                            getOptionLabel={(op) => op}
                            onChange={(_, value) => {
                                setSelectedYears(value);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Select year"
                                    className="!text-sm"
                                    placeholder="Select year"
                                />
                            )}
                        />
                    )}
                    {selectedType == 'daily' && (
                        <div>
                            <DatePicker
                                selected={startDate}
                                onChange={(dates) => {
                                    const [start, end] = dates;
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                isClearable
                                placeholderText="Select date range"
                                className="w-[200px] rounded-md border-2 bg-gray-100 px-2 py-1 text-sm text-black outline-none transition-colors focus:border-black"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-around gap-1 rounded-md bg-gray-100 p-1 text-sm *:cursor-pointer *:rounded-md *:px-2 *:py-1 *:text-gray-500">
                            {['daily', 'monthly', 'yearly'].map((type) => {
                                return (
                                    <span
                                        key={type}
                                        className={`capitalize ${
                                            selectedType == type && 'bg-white !text-black'
                                        } transition-all`}
                                        onClick={() => setSelectedType(type)}
                                    >
                                        {type}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-gray-100 p-1 *:cursor-pointer *:rounded-md *:p-1 *:text-gray-500">
                            <Tooltip content="Area chart">
                                <span
                                    className={`${chartType == 'area' && 'bg-white !text-black'}`}
                                    onClick={() => setChartType('area')}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M3 3v18h18" />
                                        <path d="M7 12v5h12V8l-5 5-4-4Z" />
                                    </svg>
                                </span>
                            </Tooltip>
                            <Tooltip content="Bar chart">
                                <span
                                    className={`${chartType == 'bar' && 'bg-white !text-black'}`}
                                    onClick={() => setChartType('bar')}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M3 3v18h18" />
                                        <rect width="4" height="7" x="7" y="10" rx="1" />
                                        <rect width="4" height="12" x="15" y="5" rx="1" />
                                    </svg>
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-10 h-[300px]">
                {selectedType == 'daily' && (
                    <>
                        {chartType == 'area' && dailyFilteredData.length > 0 && (
                            <Chart
                                options={{
                                    ...options,
                                    xaxis: {
                                        ...options.xaxis,
                                        categories: dailyFilteredData?.map((item) => item.day),
                                        labels: {
                                            rotate: 0,
                                        },
                                    },
                                }}
                                series={[
                                    {
                                        name: 'Revenue',
                                        data: dailyFilteredData?.map((item) => item.revenue),
                                    },
                                ]}
                                type={chartType}
                                height={300}
                            />
                        )}
                        {chartType == 'bar' && dailyFilteredData.length > 0 && (
                            <Chart
                                options={{
                                    ...options,
                                    xaxis: {
                                        ...options.xaxis,
                                        categories: dailyFilteredData?.map((item) => item.day),
                                        labels: {
                                            rotate: 0,
                                        },
                                    },
                                }}
                                series={[
                                    {
                                        name: 'Revenue',
                                        data: dailyFilteredData?.map((item) => item.revenue),
                                    },
                                ]}
                                type={chartType}
                                height={300}
                            />
                        )}
                    </>
                )}
                {selectedType == 'monthly' && (
                    <>
                        {chartType == 'area' && (
                            <Chart
                                options={options}
                                series={formatData(selectedYears, monthlyData)}
                                type={chartType}
                                height={300}
                            />
                        )}
                        {chartType == 'bar' && (
                            <Chart
                                options={options}
                                series={formatData(selectedYears, monthlyData)}
                                type={chartType}
                                height={300}
                            />
                        )}
                    </>
                )}
                {selectedType == 'yearly' && (
                    <>
                        {chartType == 'area' && yearlyData.length > 0 && (
                            <Chart
                                options={{
                                    ...options,
                                    xaxis: {
                                        ...options.xaxis,
                                        categories: yearlyData?.map((item) => item.year),
                                        labels: {
                                            rotate: 0,
                                        },
                                    },
                                }}
                                series={[
                                    {
                                        name: 'Revenue',
                                        data: yearlyData?.map((item) => item.revenue),
                                    },
                                ]}
                                type={chartType}
                                height={300}
                            />
                        )}
                        {chartType == 'bar' && yearlyData.length > 0 && (
                            <Chart
                                options={{
                                    ...options,
                                    xaxis: {
                                        ...options.xaxis,
                                        categories: yearlyData?.map((item) => item.year),
                                        labels: {
                                            rotate: 0,
                                        },
                                    },
                                }}
                                series={[
                                    {
                                        name: 'Revenue',
                                        data: yearlyData?.map((item) => item.revenue),
                                    },
                                ]}
                                type={chartType}
                                height={300}
                            />
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

export { RevenueStatisticsChart };
