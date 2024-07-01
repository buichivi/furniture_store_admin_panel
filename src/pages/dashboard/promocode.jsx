import { AddPromoCode, DeletePromoCode, EditPromoCode } from '@/components';
import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, IconButton, Switch, Tooltip } from '@material-tailwind/react';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const PromoCode = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [promoCodeEdit, setPromoCodeEdit] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const { token } = useAuthStore();
    const tableGrid = useRef();

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
        <div className="mt-6">
            <div className="flex items-center justify-between">
                <Button
                    onClick={(e) => {
                        const ip = e.currentTarget.nextElementSibling;
                        ip.checked = !ip.checked;
                    }}
                >
                    Add promo code
                </Button>
                <AddPromoCode setPromoCodes={setPromoCodes} />
                <input
                    className="max-w-1/2 min-w-[300px] rounded-md border-2 p-2 text-sm outline-none transition-colors focus:border-black"
                    placeholder="Search..."
                    onChange={(e) => {
                        if (tableGrid.current) {
                            tableGrid.current.api.setQuickFilter(e.target.value);
                        }
                    }}
                />
            </div>
            {/* <Card className="mt-4 h-full w-full overflow-scroll">
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
            </Card> */}
            <div
                className="ag-theme-quartz mt-4" // applying the grid theme
                style={{ height: 500 }}
            >
                <AgGridReact
                    ref={tableGrid}
                    rowData={promoCodes}
                    columnDefs={[
                        { field: 'code', headerName: 'Code', flex: 1.5 },
                        {
                            field: 'type',
                            headerName: 'Type',
                            cellClass: 'capitalize',
                        },
                        {
                            field: 'discount',
                            headerName: 'Discount',
                        },
                        {
                            field: 'startDate',
                            headerName: 'Start Date',
                            valueFormatter: ({ data }) => {
                                return new Date(data.startDate).toLocaleDateString('vi-VN');
                            },
                        },
                        {
                            field: 'endDate',
                            headerName: 'End Date',
                            valueFormatter: ({ data }) => {
                                return new Date(data.endDate).toLocaleDateString('vi-VN');
                            },
                        },
                        {
                            field: 'usage',
                            headerName: 'Usage',
                            valueFormatter: ({ data }) => {
                                return data.currentUses + '/' + data.maxUsage;
                            },
                        },
                        {
                            field: 'active',
                            headerName: 'Active',
                            cellRenderer: ({ data }) => {
                                return (
                                    <Switch
                                        defaultChecked={data?.active}
                                        onChange={(e) => handleActiveProduct(e, data?._id)}
                                        color="green"
                                        name="active"
                                    />
                                );
                            },
                        },
                        {
                            field: 'action',
                            cellRenderer: ({ data: promoCode }) => {
                                return (
                                    <div className="flex items-center gap-2">
                                        <Tooltip content="Edit promo code">
                                            <IconButton
                                                variant="text"
                                                onClick={() => {
                                                    setIsEdit(true);
                                                    setPromoCodeEdit(promoCode);
                                                }}
                                            >
                                                <PencilIcon className="size-4" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip content="Delete promo code">
                                            <IconButton
                                                variant="text"
                                                className="hover:text-red-500"
                                                onClick={() => {
                                                    setIsDelete(true);
                                                    setPromoCodeEdit(promoCode);
                                                }}
                                            >
                                                <TrashIcon className="size-4" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                );
                            },
                        },
                    ]}
                    defaultColDef={{ flex: 1 }}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 15, 20, 25]}
                    className="pb-5"
                />
            </div>
            {isEdit && <EditPromoCode promoCode={promoCodeEdit} setPromoCodes={setPromoCodes} setIsEdit={setIsEdit} />}
            {isDelete && (
                <DeletePromoCode promoCode={promoCodeEdit} setPromoCodes={setPromoCodes} setIsDelete={setIsDelete} />
            )}
        </div>
    );
};

export { PromoCode };
