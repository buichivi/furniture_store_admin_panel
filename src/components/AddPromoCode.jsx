import React from 'react';
import { Card, Button, Select, Option } from '@material-tailwind/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import apiRequest from '@/utils/apiRequest';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import useAuthStore from '@/stores/authStore';

const formatDateForApi = (date) => {
    // Chuyển đổi thời gian sang UTC và định dạng lại
    const formattedDate = moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
    return formattedDate;
};

const AddPromoCode = ({ setPromoCodes }) => {
    const { token } = useAuthStore();

    const addPromoCode = useFormik({
        initialValues: {
            code: '',
            type: '',
            discount: '',
            startDate: '',
            endDate: '',
            maxUsage: '',
        },
        validationSchema: Yup.object({
            code: Yup.string().required('This field is required'),
            type: Yup.string().oneOf(['coupon', 'voucher']).required('This field is required'),
            discount: Yup.number()
                .required('This field is required')
                .when('type', {
                    is: 'coupon',
                    then: (schema) =>
                        schema
                            .min(0, 'Discount must be at least 0%')
                            .max(100, 'Discount cannot exceed 100%')
                            .integer('Discount must be an integer'),
                    otherwise: (schema) =>
                        schema.positive('Discount must be a positive number').integer('Discount must be an integer'),
                }),
            startDate: Yup.date()
                .transform(function (value, originalValue) {
                    // Loại bỏ phần thời gian, chỉ lấy phần ngày
                    return originalValue ? new Date(new Date(originalValue).setHours(0, 0, 0, 0)) : null;
                })
                .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Start date cannot be in the past')
                .required('This field is required'),
            endDate: Yup.date()
                .required('This field is required')
                .min(Yup.ref('startDate'), 'End date cannot be before start date'),
            maxUsage: Yup.number().min(1, 'Max usage must be at least 1').required('This field is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            const formattedEndDate = formatDateForApi(values.endDate);
            const formattedStartDate = formatDateForApi(values.startDate); // Nếu bạn cần xử lý startDate tương tự

            const payload = {
                ...values,
                endDate: formattedEndDate,
                startDate: formattedStartDate,
            };
            console.log(payload);
            toast.promise(
                apiRequest.post('/promo-code', payload, {
                    headers: {
                        Authorization: `Bearer ` + token,
                    },
                }),
                {
                    loading: 'Creating...',
                    success: (res) => {
                        setPromoCodes((promoCodes) => [...promoCodes, res.data.promoCode]);
                        resetForm();
                        return res.data?.message;
                    },
                    error: (err) => {
                        return err.response.data.error;
                    },
                },
            );
        },
    });

    return (
        <>
            <input type="checkbox" className="hidden [&:checked+div]:flex" id="add-promo-code" />
            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                <label htmlFor="add-promo-code" className="absolute left-0 top-0 size-full bg-[#0000009a]"></label>
                <Card className="min-w-[50%] p-8">
                    <h3 className="font-semibold text-black">Add promo code</h3>
                    <form onSubmit={addPromoCode.handleSubmit}>
                        <div className="flex items-center justify-between gap-10">
                            <div className="mt-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">Code</span>
                                    {addPromoCode.errors.code && (
                                        <span className="text-sm text-red-500">{addPromoCode.errors.code}</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    name="code"
                                    value={addPromoCode.values.code}
                                    onChange={addPromoCode.handleChange}
                                    placeholder="Promo code"
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                />
                            </div>
                            <div className="mt-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">Type</span>
                                    {addPromoCode.errors.type && (
                                        <span className="text-sm text-red-500">{addPromoCode.errors.type}</span>
                                    )}
                                </div>
                                <Select
                                    label="Select type"
                                    name="type"
                                    value={addPromoCode.values.type}
                                    onChange={(value) => addPromoCode.setFieldValue('type', value)}
                                >
                                    <Option value="coupon">Coupon</Option>
                                    <Option value="voucher">Voucher</Option>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Discount</span>
                                {addPromoCode.errors.discount && (
                                    <span className="text-sm text-red-500">{addPromoCode.errors.discount}</span>
                                )}
                            </div>
                            <input
                                type="number"
                                name="discount"
                                min="1"
                                max={addPromoCode.values.type == 'coupon' ? 100 : 9999}
                                value={addPromoCode.values.discount}
                                onChange={addPromoCode.handleChange}
                                placeholder={
                                    addPromoCode.values.type
                                        ? addPromoCode.values.type == 'coupon'
                                            ? 'Percentage (%)'
                                            : 'Value ($)'
                                        : 'Discount'
                                }
                                className="no-spinner w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="flex w-full items-center justify-between gap-10">
                            <div className="mt-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">Start date</span>
                                    {addPromoCode.errors.startDate && (
                                        <span className="text-sm text-red-500">{addPromoCode.errors.startDate}</span>
                                    )}
                                </div>
                                <DatePicker
                                    name="startDate"
                                    selected={addPromoCode.values.startDate}
                                    onChange={(date) => {
                                        console.log(date);
                                        addPromoCode.setFieldValue('startDate', date);
                                    }}
                                    minDate={new Date()}
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    placeholderText="Select start date"
                                />
                            </div>
                            <div className="mt-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">End date</span>
                                    {addPromoCode.errors.endDate && (
                                        <span className="text-sm text-red-500">{addPromoCode.errors.endDate}</span>
                                    )}
                                </div>
                                <DatePicker
                                    name="endDate"
                                    selected={addPromoCode.values.endDate}
                                    onChange={(date) => addPromoCode.setFieldValue('endDate', date)}
                                    minDate={
                                        addPromoCode.values.startDate
                                            ? moment(addPromoCode.values.startDate).add(1, 'days').toDate()
                                            : null
                                    }
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    placeholderText="Select end date"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Max usage</span>
                                {addPromoCode.errors.maxUsage && (
                                    <span className="text-sm text-red-500">{addPromoCode.errors.maxUsage}</span>
                                )}
                            </div>
                            <input
                                type="number"
                                name="maxUsage"
                                value={addPromoCode.values.maxUsage}
                                onChange={addPromoCode.handleChange}
                                placeholder="Max usage"
                                className="no-spinner w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-6">
                            <Button
                                type="submit"
                                onClick={(e) => {
                                    if (!Object.keys(addPromoCode.errors).length)
                                        e.currentTarget.nextElementSibling.click();
                                }}
                            >
                                Add
                            </Button>
                            <label htmlFor="add-promo-code" className="hidden"></label>
                            <Button color="red" onClick={(e) => e.currentTarget.previousElementSibling.click()}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    );
};

AddPromoCode.propTypes = {
    setPromoCodes: PropTypes.func,
};

export default AddPromoCode;
