import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { FunnelIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import DatePicker from 'react-datepicker';
import moment from 'moment';

const ORDER_STATUS = [
    { status: 'pending', color: '#FFDE4D' },
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
    const [filterOrders, setFilterOrders] = useState([]);
    const tableGrid = useRef();

    useEffect(() => {
        apiRequest
            .get('/orders', { headers: { Authorization: 'Bearer ' + token } })
            .then((res) => {
                setOrders(res.data?.orders);
                setFilterOrders(res.data?.orders);
            })
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
        <div className="mt-4 h-full w-full">
            <div className="flex items-center justify-between">
                <input
                    className="max-w-1/2 mb-4 min-w-[300px] rounded-md border-2 p-2 text-sm outline-none transition-colors focus:border-black"
                    placeholder="Search..."
                    onChange={(e) => {
                        if (tableGrid.current) {
                            tableGrid.current.api.setQuickFilter(e.target.value);
                        }
                    }}
                />
                <div className="relative">
                    <Button
                        variant="outlined"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={(e) => {
                            const ip = e.currentTarget.nextElementSibling;
                            ip.checked = !ip.checked;
                        }}
                    >
                        <FunnelIcon className="size-5" />
                        <span>Filters</span>
                    </Button>
                    <input
                        type="checkbox"
                        id="filter-order"
                        className="hidden [&:checked+div]:pointer-events-auto [&:checked+div]:translate-y-0  [&:checked+div]:opacity-100"
                    />
                    <Filter
                        orders={orders}
                        onFilter={({ customerName, orderStatus, paymentMethod, fromDate, toDate }) => {
                            setFilterOrders((filterOrders) => {
                                return filterOrders.filter((order) => {
                                    // Lấy thông tin khách hàng và chuyển thành chuỗi
                                    const cusName = `${order?.user?.firstName ?? ''} ${order?.user?.lastName ?? ''}`
                                        .trim()
                                        .toLowerCase();
                                    const filterCusName = customerName ? customerName.toLowerCase() : null;

                                    // Lấy thời gian tạo đơn hàng dưới dạng timestamp
                                    const orderCreatedAtTime = new Date(order?.createdAt).getTime();

                                    console.log(orderCreatedAtTime, new Date(fromDate).getTime());

                                    // Kiểm tra từng điều kiện, nếu điều kiện đó có giá trị thì so sánh, ngược lại bỏ qua
                                    const matchesCustomerName = filterCusName ? cusName === filterCusName : true;
                                    const matchesOrderStatus = orderStatus ? order?.orderStatus === orderStatus : true;
                                    const matchesPaymentMethod = paymentMethod
                                        ? order?.paymentMethod === paymentMethod
                                        : true;
                                    const matchesFromDate = fromDate
                                        ? orderCreatedAtTime >= new Date(fromDate).getTime()
                                        : true;
                                    const matchesToDate = toDate
                                        ? orderCreatedAtTime <= new Date(toDate).getTime()
                                        : true;

                                    // Tất cả các điều kiện phải thỏa mãn
                                    return (
                                        matchesCustomerName &&
                                        matchesOrderStatus &&
                                        matchesPaymentMethod &&
                                        matchesFromDate &&
                                        matchesToDate
                                    );
                                });
                            });
                        }}
                        onReset={() => {
                            setFilterOrders(orders);
                        }}
                    />
                </div>
            </div>
            <div
                className="ag-theme-quartz" // applying the grid theme
                style={{ height: 500 }} // the grid will fill the size of the parent container
            >
                <AgGridReact
                    ref={tableGrid}
                    rowData={filterOrders}
                    columnDefs={[
                        { field: '_id', headerName: 'Order Id', flex: 2 },
                        {
                            headerName: 'Customer',
                            field: 'customer',
                            valueFormatter: ({ data }) => {
                                return `${data.user?.firstName} ${data.user?.lastName}`;
                            },
                        },
                        {
                            field: 'createdAt',
                            headerName: 'Date',
                            valueFormatter: ({ data }) => {
                                return moment(data.createdAt).format('DD/MM/YYYY HH:mm');
                            },
                            flex: 1.3,
                        },
                        {
                            field: 'totalAmount',
                            headerName: 'Total',
                            valueFormatter: ({ data }) => {
                                return '$' + data.totalAmount;
                            },
                        },
                        {
                            field: 'orderStatus',
                            headerName: 'Order Status',
                            cellClass: 'capitalize',
                            flex: 1.2,
                            cellRenderer: ({ data }) => {
                                return (
                                    <span
                                        style={{
                                            color: 'black',
                                            background:
                                                ORDER_STATUS.find((ot) => ot.status == data.orderStatus).color + '80',
                                        }}
                                        className="rounded-md px-2 py-1 !text-xs"
                                    >
                                        {data.orderStatus}
                                    </span>
                                );
                            },
                        },
                        {
                            field: 'paymentMethod',
                            headerName: 'Payment Method',
                            cellClass: 'uppercase',
                        },
                        {
                            field: 'paymentStatus',
                            headerName: 'Payment Status',
                            cellClass: 'capitalize',
                        },
                        {
                            field: 'action',
                            headerName: 'Action',
                            cellRenderer: ({ data: order }) => {
                                return (
                                    <div className="flex items-center justify-center px-2 py-1">
                                        <Link to={`/dashboard/order/edit/${order?._id}`}>
                                            <Tooltip content="Edit">
                                                <IconButton variant="text">
                                                    <PencilIcon className="size-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </Link>
                                        <span
                                            onClick={() => {
                                                if (confirm('Are you sure to delete this order?')) {
                                                    handleDeleteOrder(order?._id);
                                                }
                                            }}
                                        >
                                            <Tooltip content="Delete Brand">
                                                <IconButton variant="text" className="ml-2 hover:text-red-600">
                                                    <TrashIcon className="h-4 w-4 " />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                    </div>
                                );
                            },
                            flex: 1.3,
                        },
                    ]}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 15, 20, 25]}
                    className=""
                    defaultColDef={{ flex: 1, autoHeight: true }}
                    columnMenu="new"
                />
            </div>
        </div>
    );
};

const Filter = ({ orders, onFilter, onReset }) => {
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [customerName, setCustomerName] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const customerNames = useMemo(() => {
        const customersSet = new Set();
        for (const order of orders) {
            if (!customersSet.has(order?.user?.firstName + ' ' + order?.user?.lastName)) {
                console.log(order?.user?.firstName + ' ' + order?.user?.lastName);
                customersSet.add(order?.user?.firstName + ' ' + order?.user?.lastName);
            }
        }
        return Array.from(customersSet);
    }, [orders]);

    const orderStatuses = useMemo(() => {
        const orderStatusSet = new Set();
        for (const order of orders) {
            if (!orderStatusSet.has(order?.orderStatus)) {
                orderStatusSet.add(order?.orderStatus);
            }
        }
        return Array.from(orderStatusSet);
    }, [orders]);
    const paymentMethods = useMemo(() => {
        const paymentMethodsSet = new Set();
        for (const order of orders) {
            if (!paymentMethodsSet.has(order?.paymentMethod)) {
                paymentMethodsSet.add(order?.paymentMethod);
            }
        }
        return Array.from(paymentMethodsSet);
    }, [orders]);

    const handleFilter = () => {
        onFilter({ customerName, orderStatus, paymentMethod, fromDate, toDate });
    };
    const handleReset = () => {
        onReset();
        setCustomerName('');
        setOrderStatus('');
        setPaymentMethod('');
        setFromDate();
        setToDate();
    };

    return (
        <div className="top-ful pointer-events-none absolute right-0 z-50 mt-2 min-h-[300px] w-[400px] translate-y-10 rounded-md border bg-white text-sm opacity-0 shadow-lg transition-all duration-500">
            <div className="p-4">
                <div className="*:block">
                    <span>Customer</span>
                    <select
                        value={customerName}
                        onChange={(e) => setCustomerName(e.currentTarget.value)}
                        className="mt-2 w-full rounded-md border-2 p-1 outline-none transition-colors focus:border-black"
                    >
                        <option value="">Select customer name</option>
                        {customerNames.map((name, index) => {
                            return (
                                <option key={index} value={name}>
                                    {name}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div className="mt-4 *:block">
                    <span>Order Status</span>
                    <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.currentTarget.value)}
                        className="mt-2 w-full rounded-md border-2 p-1 capitalize outline-none transition-colors focus:border-black"
                    >
                        <option value="">Select order status</option>
                        {orderStatuses.map((name, index) => {
                            return (
                                <option key={index} value={name}>
                                    {name}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div className="mt-4 *:block">
                    <span>Payment Methods</span>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.currentTarget.value)}
                        className="mt-2 w-full rounded-md border-2 p-1 outline-none transition-colors focus:border-black"
                    >
                        <option value="">Select payment method</option>
                        {paymentMethods.map((name, index) => {
                            return (
                                <option key={index} value={name} className="uppercase">
                                    {name}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div className="mt-4 *:block">
                    <span>From</span>
                    <DatePicker
                        selected={fromDate}
                        onChange={(date) => {
                            setFromDate(date);
                        }}
                        dateFormat={'dd/MM/YYYY'}
                        placeholderText="From"
                        className="mt-2 w-full rounded-md border-2 p-1 outline-none transition-colors focus:border-black"
                    />
                </div>
                <div className="mt-4 *:block">
                    <span>To</span>
                    <DatePicker
                        selected={toDate}
                        onChange={(date) => {
                            setToDate(date);
                        }}
                        minDate={fromDate}
                        dateFormat={'dd/MM/YYYY'}
                        placeholderText="From"
                        className="mt-2 w-full rounded-md border-2 p-1 outline-none transition-colors focus:border-black"
                    />
                </div>
                <div className="mt-4 flex items-center justify-center gap-4">
                    <Button variant="outlined" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleFilter}>Save changes</Button>
                </div>
            </div>
        </div>
    );
};

export default Order;
