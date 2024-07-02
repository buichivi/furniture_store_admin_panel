import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { ArrowLeftIcon, BookmarkIcon } from '@heroicons/react/24/solid';
import {
    Button,
    Card,
    IconButton,
    Input,
    Option,
    Select,
    Textarea,
    Tooltip,
} from '@material-tailwind/react';
import axios from 'axios';
import { useFormik } from 'formik';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

const EditOrder = () => {
    const { id } = useParams();
    const { token } = useAuthStore();
    const [order, setOrder] = useState({ items: [] });
    const navigate = useNavigate();

    useEffect(() => {
        apiRequest
            .get('orders/' + id, { headers: { Authorization: 'Bearer ' + token } })
            .then((res) => setOrder(res.data?.order))
            .catch((err) => console.log(err));
    }, [id]);

    const orderInfoForm = useFormik({
        initialValues: {
            firstName: order?.shippingAddress?.firstName,
            lastName: order?.shippingAddress?.lastName,
            email: order?.shippingAddress?.email,
            phoneNumber: order?.shippingAddress?.phoneNumber,
            city: order?.shippingAddress?.city,
            district: order?.shippingAddress?.district,
            ward: order?.shippingAddress?.ward,
            addressLine: order?.shippingAddress?.addressLine,
            orderStatus: order?.orderStatus,
            paymentStatus: order?.paymentStatus,
        },
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            firstName: Yup.string().required('First name is required'),
            lastName: Yup.string().required('Last name is required'),
            email: Yup.string()
                .email('Invalid email format')
                .required('Email is required'),
            phoneNumber: Yup.string()
                .matches(/^[0-9]{10}$/, 'Phone number should be 10 digits')
                .required('Phone number is required'),
            city: Yup.object().required('City is required'),
            district: Yup.object().required('District is required'),
            ward: Yup.object().required('Province is required'),
            addressLine: Yup.string().required('Address line is required'),
            orderStatus: Yup.string().required('Order status is required'),
            paymentStatus: Yup.string().required('Payment status is required'),
        }),
        onSubmit: (values) => {
            toast.promise(
                apiRequest.put('/orders/' + order?._id, values, {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    },
                }),
                {
                    loading: 'Updating...',
                    success: (res) => {
                        navigate('/dashboard/order');
                        return res.data?.message;
                    },
                    error: (err) => err?.response?.data?.error,
                },
            );
        },
    });

    return (
        <form className="mt-4" onSubmit={orderInfoForm.handleSubmit}>
            <div className="flex items-center justify-between">
                <Link to="/dashboard/order">
                    <Tooltip content="Back">
                        <IconButton>
                            <ArrowLeftIcon className="size-4" />
                        </IconButton>
                    </Tooltip>
                </Link>
                <Button type="submit" className="flex items-center gap-1">
                    <BookmarkIcon className="size-4" />
                    <span>Save</span>
                </Button>
            </div>
            <Card className="mt-4 min-h-10 p-4">
                <div className="flex items-center gap-10">
                    <h3 className="font-bold text-black">Order ID: #{order?._id}</h3>
                    <p>
                        Order date: {moment(order?.createdAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                </div>
                <div className="mt-4 flex w-full items-center gap-10">
                    <div className="flex flex-1 items-center gap-2">
                        <span className="shrink-0 font-bold text-black">
                            Order status:{' '}
                        </span>
                        <select
                            className="w-full rounded-md border-2 p-2 text-sm capitalize transition-colors focus:border-black"
                            name="orderStatus"
                            value={orderInfoForm.values.orderStatus}
                            onChange={orderInfoForm.handleChange}
                            disabled={order?.orderStatus == 'completed'}
                        >
                            {[
                                'pending',
                                'failed',
                                'processing',
                                'shipped',
                                'delivered',
                                'cancelled',
                                'completed',
                            ].map((status) => {
                                return (
                                    <option
                                        key={status}
                                        value={status}
                                        className="capitalize"
                                    >
                                        {status}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                        <span className="shrink-0 font-bold text-black">
                            Payment status:{' '}
                        </span>
                        <select
                            name="paymentStatus"
                            className="w-full rounded-md border-2 p-2 text-sm capitalize transition-colors focus:border-black"
                            value={orderInfoForm.values.paymentStatus}
                            onChange={orderInfoForm.handleChange}
                            disabled={order?.paymentStatus == 'paid'}
                        >
                            {['paid', 'unpaid'].map((status) => {
                                return (
                                    <option
                                        key={status}
                                        value={status}
                                        className="capitalize"
                                    >
                                        {status}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex items-start gap-6">
                    <div className="flex-1">
                        <h3 className="font-bold text-black">Shipping detail</h3>
                        <ShippingAddress order={order} form={orderInfoForm} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-black">Order items</h3>
                        <ul className="mt-2 flex w-full flex-col gap-2">
                            {order.items.map((item, index) => {
                                return (
                                    <li
                                        key={index}
                                        className="flex items-center gap-4 rounded-md border-2 p-2"
                                    >
                                        <div className="w-1/4">
                                            <img
                                                src={item?.productImage}
                                                alt=""
                                                className="size-full object-contain"
                                            />
                                        </div>
                                        <div className="flex flex-col items-start gap-2 text-black">
                                            <h3>{item?.product?.name}</h3>
                                            <span className="text-sm">
                                                {item?.color?.name}
                                            </span>
                                            <span className="text-sm">
                                                x{item?.quantity}
                                            </span>
                                        </div>
                                        <span className="flex-1 text-right font-semibold text-black">
                                            ${item?.itemPrice}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                        <div>
                            <span>Total: </span>
                            <span className="mt-6 inline-block text-xl font-bold text-black">
                                ${order?.totalAmount}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </form>
    );
};

const ShippingAddress = ({ form, order }) => {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([{ value: '', name: 'Select district' }]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        axios
            .get('https://esgoo.net/api-tinhthanh/1/0.htm')
            .then((res) => setCities(res.data?.data))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        if (form.values.city?.id) {
            if (form.values.city?.id != order?.shippingAddress?.city?.id) {
                form.setFieldValue('district', '');
                form.setFieldValue('ward', '');
            }
            axios
                .get(`https://esgoo.net/api-tinhthanh/2/${form.values.city.id}.htm`)
                .then((res) => setDistricts(res.data?.data))
                .catch((err) => console.log(err));
        }
        setDistricts([]);
        setWards([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.city?.id]);

    useEffect(() => {
        if (form.values.district?.id) {
            if (form.values.district?.id != order?.shippingAddress?.district?.id) {
                form.setFieldValue('ward', '');
            }
            axios
                .get(`https://esgoo.net/api-tinhthanh/3/${form.values.district.id}.htm`)
                .then((res) => setWards(res.data?.data))
                .catch((err) => console.log(err));
        }
        setWards([]);
    }, [form.values.district?.id]);

    return (
        <div className="mt-4">
            <div className="flex items-center gap-6">
                <div className="relative flex-1 pb-6">
                    <Input
                        className="p-2"
                        variant="standard"
                        label="First name"
                        name="firstName"
                        value={form.values.firstName}
                        onChange={form.handleChange}
                        disabled={form.values.orderStatus == 'completed'}
                    />
                    {form.errors.firstName && (
                        <span className="absolute bottom-0 left-0 text-sm text-red-400">
                            {form.errors.firstName}
                        </span>
                    )}
                </div>
                <div className="relative flex-1 pb-6">
                    <Input
                        className="p-2"
                        variant="standard"
                        label="Last name"
                        name="lastName"
                        value={form.values.lastName}
                        onChange={form.handleChange}
                        disabled={form.values.orderStatus == 'completed'}
                    />
                    {form.errors.lastName && (
                        <span className="absolute bottom-0 left-0 text-sm text-red-400">
                            {form.errors.lastName}
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-2 flex items-center gap-6 ">
                <div className="relative flex-1 pb-6">
                    <Input
                        className="p-2"
                        variant="standard"
                        label="Email"
                        type="email"
                        name="email"
                        value={form.values.email}
                        onChange={form.handleChange}
                        disabled={form.values.orderStatus == 'completed'}
                    />
                    {form.errors.email && (
                        <span className="absolute bottom-0 left-0 text-sm text-red-400">
                            {form.errors.email}
                        </span>
                    )}
                </div>
                <div className="relative flex-1 pb-6">
                    <Input
                        className="p-2"
                        variant="standard"
                        label="Phone number"
                        type="text"
                        name="phoneNumber"
                        value={form.values.phoneNumber}
                        onChange={form.handleChange}
                        disabled={form.values.orderStatus == 'completed'}
                    />
                    {form.errors.phoneNumber && (
                        <span className="absolute bottom-0 left-0 text-sm text-red-400">
                            {form.errors.phoneNumber}
                        </span>
                    )}
                </div>
            </div>
            <div className="relative mt-2 pb-6">
                <span className="text-sm">Province/City</span>
                <select
                    name="city"
                    value={form.values.city?.id}
                    onChange={(e) => {
                        const city = cities.find(
                            (city) => city.id == e.currentTarget.value,
                        );
                        form.setFieldValue('city', city);
                    }}
                    className="w-full rounded-md border-2 p-2 text-sm transition-colors focus:border-black"
                    disabled={form.values.orderStatus == 'completed'}
                >
                    {cities.map((city) => {
                        return (
                            <option key={city?.id} value={city?.id}>
                                {city?.name}
                            </option>
                        );
                    })}
                </select>
                {form.errors.city && (
                    <span className="absolute bottom-0 left-0 text-sm text-red-400">
                        {form.errors.city}
                    </span>
                )}
            </div>
            <div className="mt-2 flex items-center gap-6">
                <div className="relative flex-1 pb-6">
                    <span className="text-sm">District</span>
                    <select
                        name="district"
                        value={form.values.district?.id}
                        onChange={(e) => {
                            const district = districts.find(
                                (district) => district.id == e.currentTarget.value,
                            );
                            form.setFieldValue('district', district);
                        }}
                        className="w-full rounded-md border-2 p-2 text-sm transition-colors focus:border-black"
                        disabled={form.values.orderStatus == 'completed'}
                    >
                        <option value="">Select district</option>
                        {districts.map((district) => {
                            return (
                                <option key={district?.id} value={district?.id}>
                                    {district?.name}
                                </option>
                            );
                        })}
                    </select>
                    {form.errors.district && (
                        <span className="absolute bottom-0 left-0 text-sm text-red-400">
                            {form.errors.district}
                        </span>
                    )}
                </div>
                <div className="relative flex-1 pb-6">
                    <span className="text-sm">Ward</span>
                    <select
                        name="ward"
                        value={form.values.ward?.id}
                        onChange={(e) => {
                            const ward = wards.find(
                                (ward) => ward.id == e.currentTarget.value,
                            );
                            form.setFieldValue('ward', ward);
                        }}
                        disabled={form.values.orderStatus == 'completed'}
                        className="w-full rounded-md border-2 p-2 text-sm transition-colors focus:border-black"
                    >
                        <option value="">Select ward</option>
                        {wards.map((ward) => {
                            return (
                                <option key={ward?.id} value={ward?.id}>
                                    {ward?.name}
                                </option>
                            );
                        })}
                    </select>
                    {form.errors.ward && (
                        <span className="absolute bottom-0 left-0 text-sm text-red-400">
                            {form.errors.ward}
                        </span>
                    )}
                </div>
            </div>
            <div className="relative mt-2 pb-6">
                <Textarea
                    className="p-2"
                    variant="standard"
                    label="Address line"
                    name="addressLine"
                    value={form.values.addressLine}
                    onChange={form.handleChange}
                    disabled={form.values.orderStatus == 'completed'}
                />
                {form.errors.addressLine && (
                    <span className="absolute bottom-0 left-0 text-sm text-red-400">
                        {form.errors.addressLine}
                    </span>
                )}
            </div>
        </div>
    );
};

export default EditOrder;
