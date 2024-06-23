import React from 'react';
import { Card, Button, Select, Option } from '@material-tailwind/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import apiRequest from '@/utils/apiRequest';
import PropTypes from 'prop-types';
import useAuthStore from '@/stores/authStore';

const EditPromoCode = ({ promoCode, setPromoCodes }) => {
    const { token } = useAuthStore();

    const editPromoCode = useFormik({
        initialValues: {
            code: promoCode?.code,
            type: promoCode?.type,
            discount: promoCode?.discount,
            startDate: promoCode?.startDate,
            endDate: promoCode?.endDate,
            maxUsage: promoCode?.maxUsage,
        },
        enableReinitialize: true,
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
                .min(new Date(), 'Start date cannot be in the past')
                .required('This field is required'),
            endDate: Yup.date()
                .required('This field is required')
                .min(Yup.ref('startDate'), 'End date cannot be before start date'),
            maxUsage: Yup.number().min(1, 'Max usage must be at least 1').required('This field is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            toast.promise(
                apiRequest.put('/promo-code/' + promoCode._id, values, {
                    headers: {
                        Authorization: `Bearer ` + token,
                    },
                }),
                {
                    loading: 'Updating...',
                    success: (res) => {
                        setPromoCodes((promoCodes) =>
                            promoCodes.map((promo) => (promo._id == promoCode._id ? { ...promo, ...values } : promo)),
                        );
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
            <input type="checkbox" className="hidden [&:checked+div]:flex" id={`edit-promo-code-${promoCode._id}`} />
            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                <label
                    htmlFor={`edit-promo-code-${promoCode._id}`}
                    className="absolute left-0 top-0 size-full bg-[#0000009a]"
                ></label>
                <Card className="min-w-[50%] p-8">
                    <h3 className="font-semibold text-black">Edit promo code</h3>
                    <form onSubmit={editPromoCode.handleSubmit}>
                        <div className="flex items-center justify-between gap-10">
                            <div className="mt-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">Code</span>
                                    {editPromoCode.errors.code && (
                                        <span className="text-sm text-red-500">{editPromoCode.errors.code}</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    name="code"
                                    value={editPromoCode.values.code}
                                    onChange={editPromoCode.handleChange}
                                    placeholder="Promo code"
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                />
                            </div>
                            <div className="mt-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">Type</span>
                                    {editPromoCode.errors.type && (
                                        <span className="text-sm text-red-500">{editPromoCode.errors.type}</span>
                                    )}
                                </div>
                                <Select
                                    label="Select type"
                                    name="type"
                                    value={editPromoCode.values.type}
                                    onChange={(value) => editPromoCode.setFieldValue('type', value)}
                                >
                                    <Option value="coupon">Coupon</Option>
                                    <Option value="voucher">Voucher</Option>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Discount</span>
                                {editPromoCode.errors.discount && (
                                    <span className="text-sm text-red-500">{editPromoCode.errors.discount}</span>
                                )}
                            </div>
                            <input
                                type="number"
                                name="discount"
                                min="1"
                                max={editPromoCode.values.type == 'coupon' ? 100 : 9999}
                                value={editPromoCode.values.discount}
                                onChange={editPromoCode.handleChange}
                                placeholder={
                                    editPromoCode.values.type
                                        ? editPromoCode.values.type == 'coupon'
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
                                    {editPromoCode.errors.startDate && (
                                        <span className="text-sm text-red-500">{editPromoCode.errors.startDate}</span>
                                    )}
                                </div>
                                <DatePicker
                                    name="startDate"
                                    selected={editPromoCode.values.startDate}
                                    onChange={(date) => editPromoCode.setFieldValue('startDate', date)}
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    placeholderText="Select start date"
                                />
                            </div>
                            <div className="mt-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">End date</span>
                                    {editPromoCode.errors.endDate && (
                                        <span className="text-sm text-red-500">{editPromoCode.errors.endDate}</span>
                                    )}
                                </div>
                                <DatePicker
                                    name="endDate"
                                    selected={editPromoCode.values.endDate}
                                    onChange={(date) => editPromoCode.setFieldValue('endDate', date)}
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    placeholderText="Select end date"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Max usage</span>
                                {editPromoCode.errors.maxUsage && (
                                    <span className="text-sm text-red-500">{editPromoCode.errors.maxUsage}</span>
                                )}
                            </div>
                            <input
                                type="number"
                                name="maxUsage"
                                value={editPromoCode.values.maxUsage}
                                onChange={editPromoCode.handleChange}
                                placeholder="Max usage"
                                className="no-spinner w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-6">
                            <Button
                                type="submit"
                                onClick={(e) => {
                                    if (!Object.keys(editPromoCode.errors).length)
                                        e.currentTarget.nextElementSibling.click();
                                }}
                            >
                                Edit
                            </Button>
                            <label htmlFor={`edit-promo-code-${promoCode._id}`} className="hidden"></label>
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

EditPromoCode.propTypes = {
    promoCode: PropTypes.object,
    setPromoCodes: PropTypes.func,
};

export default EditPromoCode;
