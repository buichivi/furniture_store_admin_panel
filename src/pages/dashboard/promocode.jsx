import { AddPromoCode, DeletePromoCode, EditPromoCode } from '@/components';
import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { InboxIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Switch, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
const TABLE_HEAD = ['Code', 'Type', 'Discount', 'Start Date', 'End Date', 'Usage', 'Active', 'Action'];

const PromoCode = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const { token } = useAuthStore();

    useEffect(() => {
        apiRequest
            .get('/promo-code/')
            .then((res) => setPromoCodes(res.data.promoCodes))
            .catch((err) => console.log(err));
    }, []);
    const handleActiveProduct = (e, id) => {
        toast.promise(
            apiRequest.patch(
                '/promo-code/' + id,
                { active: e.currentTarget.checked },
                { headers: { Authorization: 'Bearer ' + token } },
            ),
            {
                loading: 'Updating...',
                success: (res) => res.data.message,
                error: (err) => err.response.data.error,
            },
        );
    };

    return (
        <div>
            <Button
                onClick={(e) => {
                    const ip = e.currentTarget.nextElementSibling;
                    ip.checked = !ip.checked;
                }}
            >
                Add promo code
            </Button>
            <AddPromoCode setPromoCodes={setPromoCodes} />
            <Card className="mt-4 h-full w-full overflow-scroll">
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            {TABLE_HEAD.map((head) => (
                                <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
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
                        {promoCodes.length === 0 && (
                            <tr>
                                <td colSpan={TABLE_HEAD.length}>
                                    <div className="flex min-h-[50vh] items-center justify-center opacity-50">
                                        <InboxIcon className="size-5 text-black" />
                                        <span className="ml-2 text-sm">Empty</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {promoCodes.map((promoCode, index) => {
                            const { _id, code, type, discount, startDate, endDate, currentUses, maxUsage, active } =
                                promoCode;
                            const isLast = index === promoCodes.length - 1;
                            const classes = isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50';

                            return (
                                <tr key={code}>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal uppercase">
                                            {code}
                                        </Typography>
                                    </td>
                                    <td className={`${classes} capitalize`}>{type}</td>
                                    <td className={classes}>
                                        {discount}
                                        {type == 'coupon' ? '%' : '$'}
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {new Date(startDate).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {new Date(endDate).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {currentUses}/{maxUsage}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Switch
                                            defaultChecked={active}
                                            onChange={(e) => handleActiveProduct(e, _id)}
                                            color="green"
                                            name="active"
                                        />
                                    </td>
                                    <td className={classes}>
                                        <div className="flex items-center gap-2">
                                            <Tooltip content="Edit promo code">
                                                <IconButton
                                                    variant="text"
                                                    onClick={(e) => {
                                                        const ip = e.currentTarget.nextElementSibling;
                                                        ip.checked = !ip.checked;
                                                    }}
                                                >
                                                    <PencilIcon className="size-4" />
                                                </IconButton>
                                            </Tooltip>
                                            <EditPromoCode promoCode={promoCode} setPromoCodes={setPromoCodes} />
                                            <Tooltip content="Delete promo code">
                                                <IconButton
                                                    variant="text"
                                                    className="hover:text-red-500"
                                                    onClick={(e) => {
                                                        const ip = e.currentTarget.nextElementSibling;
                                                        ip.checked = !ip.checked;
                                                    }}
                                                >
                                                    <TrashIcon className="size-4" />
                                                </IconButton>
                                            </Tooltip>
                                            <DeletePromoCode id={_id} code={code} setPromoCodes={setPromoCodes} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export { PromoCode };
