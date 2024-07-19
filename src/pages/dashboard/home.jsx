import { Card } from '@material-tailwind/react';
import React, { useEffect, useMemo, useState } from 'react';
import { RevenueStatisticsChart } from '@/widgets/charts';
import {
    Typography,
    CardHeader,
    CardBody,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Avatar,
    Tooltip,
    Progress,
} from '@material-tailwind/react';
import { EllipsisVerticalIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { StatisticsCard } from '@/widgets/cards';
import { StatisticsChart } from '@/widgets/charts';
import { statisticsChartsData, projectsTableData, ordersOverviewData } from '@/data';
import {
    ArrowDownIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    PlusIcon,
    UserIcon,
} from '@heroicons/react/24/solid';
import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';

export function Home() {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [revenueData, setRevenueData] = useState({});
    const { token } = useAuthStore();

    useEffect(() => {
        apiRequest
            .get('/orders/statistics', { headers: { Authorization: 'Bearer ' + token } })
            .then((res) => {
                const statisticsData = res.data;
                setOrders(statisticsData?.orders);
                setUsers(statisticsData?.users);
                setRevenueData(statisticsData);
            })
            .catch((err) => console.log(err));
    }, []);

    console.log(revenueData);

    const statisticsCardsData = useMemo(() => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        let thisMonthRevenue = 0,
            prevMonthRevenue = 0,
            totalOrderThisMonth = 0,
            totalOrderLastMonth = 0,
            totalCustomerThisMonth = 0,
            totalCustomerPrevMonth = 0;

        orders.forEach((order) => {
            if (
                (order.orderStatus == 'completed' || order.paymentStatus == 'paid') &&
                new Date(order.updatedAt).getMonth() + 1 == currentMonth - 1 &&
                new Date(order.updatedAt).getUTCFullYear() == currentYear
            ) {
                totalOrderLastMonth++;
                prevMonthRevenue += order.totalAmount;
            }
            if (
                (order.orderStatus == 'completed' || order.paymentStatus == 'paid') &&
                new Date(order.updatedAt).getMonth() + 1 == currentMonth &&
                new Date(order.updatedAt).getUTCFullYear() == currentYear
            ) {
                totalOrderThisMonth++;
                thisMonthRevenue += order.totalAmount;
            }
        });

        users.forEach((user) => {
            if (
                new Date(user.createdAt).getMonth() + 1 == currentMonth - 1 &&
                new Date(user.createdAt).getUTCFullYear() == currentYear
            ) {
                totalCustomerPrevMonth++;
            }
            if (
                new Date(user.createdAt).getMonth() + 1 == currentMonth &&
                new Date(user.createdAt).getUTCFullYear() == currentYear
            ) {
                totalCustomerThisMonth++;
            }
        });

        const diffRatioRevenue = Number(
            (prevMonthRevenue ? thisMonthRevenue / prevMonthRevenue : thisMonthRevenue) * 100,
        ).toFixed(2);
        const diffRatioTotalOrder = Number(
            (totalOrderLastMonth ? totalOrderThisMonth / totalOrderLastMonth : totalOrderThisMonth) * 100,
        ).toFixed(2);
        const diffRatioTotalCustomer = Number((totalCustomerThisMonth / totalCustomerPrevMonth) * 100).toFixed(2);

        return [
            {
                color: 'gray',
                icon: BanknotesIcon,
                title: "Month's revenue",
                value: `$${new Intl.NumberFormat('en-US').format(thisMonthRevenue)}`,
                footer: {
                    icon: diffRatioRevenue >= 100 ? ArrowUpIcon : ArrowDownIcon,
                    valueClass: `${
                        diffRatioRevenue >= 100 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                    } p-1 text-sm`,
                    value: `${diffRatioRevenue}%`,
                    label: 'than last month',
                },
            },
            {
                color: 'gray',
                icon: ClipboardDocumentListIcon,
                title: "Month's orders",
                value: `${totalOrderThisMonth}`,
                footer: {
                    icon: diffRatioTotalOrder >= 100 ? ArrowUpIcon : ArrowDownIcon,
                    valueClass: `${
                        diffRatioTotalOrder >= 100 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                    } p-1 text-sm`,
                    value: `${diffRatioTotalOrder}%`,
                    label: 'than last month',
                },
            },
            {
                color: 'gray',
                icon: UserIcon,
                title: "Month's customers",
                value: `${totalCustomerThisMonth}`,
                footer: {
                    icon: diffRatioTotalCustomer >= 100 ? ArrowUpIcon : ArrowDownIcon,
                    valueClass: `${
                        diffRatioTotalCustomer >= 100 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                    } p-1 text-sm`,
                    value: `${diffRatioTotalCustomer == 100 ? 0 : diffRatioTotalCustomer}%`,
                    label: 'than last month',
                },
            },
        ];
    }, [orders, users]);

    return (
        <div className="">
            <div className="mb-4 grid gap-x-4 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
                    <StatisticsCard
                        key={title}
                        {...rest}
                        title={title}
                        icon={React.createElement(icon, {
                            className: 'size-6 text-white',
                        })}
                        footer={
                            <Typography className="flex items-center gap-1 text-sm font-normal text-blue-gray-600">
                                <strong className={`flex items-center gap-1 rounded-md ${footer.valueClass}`}>
                                    {React.createElement(footer.icon, {
                                        className: 'size-4',
                                    })}
                                    {footer.value}
                                </strong>
                                &nbsp;<span>{footer.label}</span>
                            </Typography>
                        }
                    />
                ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <RevenueStatisticsChart data={revenueData} />
                </div>
                <Card className="border border-blue-gray-100 p-4">
                    <h3 className="text-base font-bold text-black">Top Products</h3>
                    <div className="mt-4 flex flex-col">
                        <div className="grid grid-cols-4 gap-2 *:text-sm *:font-bold *:text-black">
                            <span className="col-span-3">Product</span>
                            <span className="text-center">Sold</span>
                        </div>
                        <div className="max-h-[300px] flex-1 overflow-y-auto [scrollbar-width:thin]">
                            {revenueData?.topProducts?.map((item) => {
                                return (
                                    <div key={item.prod} className="mt-2 grid grid-cols-4 gap-2">
                                        <div className="col-span-3 flex items-center gap-2">
                                            <div className="w-14 shrink-0 overflow-hidden rounded-md border border-blue-gray-100 p-1">
                                                <img
                                                    src={item.productImage}
                                                    alt={item.product}
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                            <Tooltip content={item.product}>
                                                <span className="line-clamp-1 text-sm">{item.product}</span>
                                            </Tooltip>
                                        </div>
                                        <span className="flex items-center justify-center font-semibold text-black">
                                            {item.sold}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>
            {/* <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
                {statisticsChartsData.map((props) => (
                    <StatisticsChart
                        key={props.title}
                        {...props}
                        footer={
                            <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                                &nbsp;{props.footer}
                            </Typography>
                        }
                    />
                ))}
            </div>
            <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Card className="overflow-hidden border border-blue-gray-100 shadow-sm xl:col-span-2">
                    <CardHeader
                        floated={false}
                        shadow={false}
                        color="transparent"
                        className="m-0 flex items-center justify-between p-6"
                    >
                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-1">
                                Projects
                            </Typography>
                            <Typography
                                variant="small"
                                className="flex items-center gap-1 font-normal text-blue-gray-600"
                            >
                                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                                <strong>30 done</strong> this month
                            </Typography>
                        </div>
                        <Menu placement="left-start">
                            <MenuHandler>
                                <IconButton size="sm" variant="text" color="blue-gray">
                                    <EllipsisVerticalIcon strokeWidth={3} fill="currenColor" className="h-6 w-6" />
                                </IconButton>
                            </MenuHandler>
                            <MenuList>
                                <MenuItem>Action</MenuItem>
                                <MenuItem>Another Action</MenuItem>
                                <MenuItem>Something else here</MenuItem>
                            </MenuList>
                        </Menu>
                    </CardHeader>
                    <CardBody className="overflow-x-scroll px-0 pb-2 pt-0">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {['companies', 'members', 'budget', 'completion'].map((el) => (
                                        <th key={el} className="border-b border-blue-gray-50 px-6 py-3 text-left">
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-medium uppercase text-blue-gray-400"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {projectsTableData.map(({ img, name, members, budget, completion }, key) => {
                                    const className = `py-3 px-5 ${
                                        key === projectsTableData.length - 1 ? '' : 'border-b border-blue-gray-50'
                                    }`;
                                    return (
                                        <tr key={name}>
                                            <td className={className}>
                                                <div className="flex items-center gap-4">
                                                    <Avatar src={img} alt={name} size="sm" />
                                                    <Typography variant="small" color="blue-gray" className="font-bold">
                                                        {name}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                {members.map(({ img, name }, key) => (
                                                    <Tooltip key={name} content={name}>
                                                        <Avatar
                                                            src={img}
                                                            alt={name}
                                                            size="xs"
                                                            variant="circular"
                                                            className={`cursor-pointer border-2 border-white ${
                                                                key === 0 ? '' : '-ml-2.5'
                                                            }`}
                                                        />
                                                    </Tooltip>
                                                ))}
                                            </td>
                                            <td className={className}>
                                                <Typography
                                                    variant="small"
                                                    className="text-xs font-medium text-blue-gray-600"
                                                >
                                                    {budget}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="w-10/12">
                                                    <Typography
                                                        variant="small"
                                                        className="mb-1 block text-xs font-medium text-blue-gray-600"
                                                    >
                                                        {completion}%
                                                    </Typography>
                                                    <Progress
                                                        value={completion}
                                                        variant="gradient"
                                                        color={completion === 100 ? 'green' : 'blue'}
                                                        className="h-1"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
                <Card className="border border-blue-gray-100 shadow-sm">
                    <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
                        <Typography variant="h6" color="blue-gray" className="mb-2">
                            Orders Overview
                        </Typography>
                        <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                            <ArrowUpIcon strokeWidth={3} className="h-3.5 w-3.5 text-green-500" />
                            <strong>24%</strong> this month
                        </Typography>
                    </CardHeader>
                    <CardBody className="pt-0">
                        {ordersOverviewData.map(({ icon, color, title, description }, key) => (
                            <div key={title} className="flex items-start gap-4 py-3">
                                <div
                                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                                        key === ordersOverviewData.length - 1 ? 'after:h-0' : 'after:h-4/6'
                                    }`}
                                >
                                    {React.createElement(icon, {
                                        className: `!w-5 !h-5 ${color}`,
                                    })}
                                </div>
                                <div>
                                    <Typography variant="small" color="blue-gray" className="block font-medium">
                                        {title}
                                    </Typography>
                                    <Typography
                                        as="span"
                                        variant="small"
                                        className="text-xs font-medium text-blue-gray-500"
                                    >
                                        {description}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>
            <div className="mt-12">
                <h1>Welcome to admin panel</h1>
                <Card className="mt-4 p-4">
                    <RevenueStatisticsChart />
                </Card>
            </div> */}
        </div>
    );
}

export default Home;
