import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const TABLE_HEAD = ['Order ID', 'Customer', 'Date', 'Total', 'Order Status', 'Payment status', 'Payment', 'Action'];
const ORDER_STATUS = [
    { status: 'pending', color: 'orange' },
    { status: 'completed', color: '#06D001' },
    { status: 'failed', color: '#FF3838' },
    { status: 'processing', color: '#2DCCFF' },
    { status: 'shipping', color: '#A4ABB6' },
    { status: 'delivered', color: '#5cb85c' },
    { status: 'cancelled', color: '#d9534f' },
];

const Order = () => {
    const { token } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        apiRequest
            .get('/orders', { headers: { Authorization: 'Bearer ' + token } })
            .then((res) => setOrders(res.data?.orders))
            .catch((err) => console.log(err));
    }, []);

    const handleDeleteOrder = (id) => {
        console.log('Call');
        toast.promise(apiRequest.delete('/orders/' + id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
                setOrders((orders) => orders.filter((order) => order._id != id));
                return res.data?.message;
            },
            error: (err) => err?.response?.data?.error,
        });
    };

    return (
        <Card className="mt-4 h-full w-full overflow-scroll">
            <table>
                <thead>
                    <tr>
                        {TABLE_HEAD.map((head) => (
                            <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-left">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal leading-none opacity-70"
                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => {
                        const isLast = index === orders.length - 1;
                        const orderStatusColor = ORDER_STATUS.find(
                            (orderStatus) => orderStatus.status == order.orderStatus,
                        ).color;
                        const classes = `text-sm ` + (isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50');
                        return (
                            <tr>
                                <td className={`${classes} font-semibold`}>#{order._id}</td>
                                <td className={classes}>{order?.user?.firstName + ' ' + order?.user?.lastName}</td>
                                <td className={classes}>{order?.createdAt}</td>
                                <td className={classes}>${order?.totalAmount}</td>
                                <td className={`${classes} capitalize`} style={{ color: orderStatusColor }}>
                                    {order?.orderStatus}
                                </td>
                                <td
                                    className={`${classes} capitalize`}
                                    style={{
                                        color: order?.paymentStatus == 'paid' ? '#00ec00' : 'orange',
                                    }}
                                >
                                    {order?.paymentStatus}
                                </td>
                                <td className={`${classes} uppercase`}>{order?.paymentMethod}</td>
                                <td className={classes}>
                                    <Link to={`/dashboard/order/edit/${order?._id}`}>
                                        <Tooltip content="Edit">
                                            <IconButton variant="text">
                                                <PencilIcon className="size-4" />
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                    <span
                                        onClick={(e) => {
                                            const inputDelete = e.currentTarget.nextElementSibling;
                                            inputDelete.checked = !inputDelete.checked;
                                        }}
                                    >
                                        <Tooltip content="Delete Brand">
                                            <IconButton variant="text" className="ml-2 hover:text-red-600">
                                                <TrashIcon className="h-4 w-4 " />
                                            </IconButton>
                                        </Tooltip>
                                    </span>
                                    <input
                                        type="checkbox"
                                        id={`delete-order-${index}`}
                                        className="hidden [&:checked+div]:flex"
                                    />
                                    <div className="fixed left-0 top-0 z-50 hidden h-full w-full items-center justify-center">
                                        <label
                                            htmlFor={`delete-order-${index}`}
                                            className="absolute left-0 top-0 h-full w-full bg-[#000000a1]"
                                        ></label>
                                        <Card className="h-auto min-w-[50%] px-4 py-6">
                                            <h3 className="text-left font-semibold">Confirm Delete</h3>
                                            <p className="mt-2 text-sm">Are you sure you want to delete this order?</p>
                                            <div className="mt-10 flex items-center justify-center gap-10">
                                                <Button
                                                    color="red"
                                                    onClick={(e) => {
                                                        e.currentTarget.nextElementSibling.click();
                                                        handleDeleteOrder(order?._id);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                                <label htmlFor={`delete-order-${index}`} className="hidden"></label>
                                                <Button onClick={(e) => e.currentTarget.previousElementSibling.click()}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Card>
    );
};

export default Order;
