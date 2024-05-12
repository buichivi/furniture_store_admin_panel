import { EditBrandForm } from '@/components';
import apiRequest from '@/utils/apiRequest';
import textShort from '@/utils/textShort';
import { InboxIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Switch, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const TABLE_HEAD = ['Name', 'Description', 'Created at', 'Active', 'Action'];

export function Brand() {
    const [brands, setBrands] = useState([]);
    const token = localStorage.getItem('token');
    useEffect(() => {
        apiRequest
            .get('/brands')
            .then((res) => setBrands(res.data.brands))
            .catch((err) => console.log(err));
    }, []);

    const handleChangeActiveBrand = (e, id) => {
        toast.promise(
            apiRequest.patch(
                '/brands/' + id,
                { active: e.target.checked },
                { headers: { Authorization: 'Bearer ' + token } },
            ),
            {
                loading: 'Updating...',
                success: (res) => {
                    return res.data.message;
                },
                error: (err) => {
                    return err.response.data.error || 'Something went wrong';
                },
            },
        );
    };

    const handleDeleteBrand = (id) => {
        toast.promise(apiRequest.delete('/brands/' + id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
                setBrands((brands) => {
                    const newBrands = brands.filter((brand) => brand._id !== id);
                    return newBrands;
                });
                return res.data?.message;
            },
            error: (err) => {
                console.log(err);
                return err?.response?.data?.error || 'Something went wrong';
            },
        });
    };

    const addBrandForm = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            toast.promise(apiRequest.post('/brands/', values, { headers: { Authorization: 'Bearer ' + token } }), {
                loading: 'Creating...',
                success: (res) => {
                    setBrands((brands) => {
                        const newBrands = [...brands, res.data.brand];
                        return newBrands;
                    });
                    resetForm();
                    return res.data.message;
                },
                error: (err) => {
                    console.log(err);
                    return err.response.data.error || 'Something went wrong';
                },
            });
        },
    });

    return (
        <div className="py-6">
            <Button
                variant="gradient"
                className="mb-4"
                onClick={(e) => {
                    e.currentTarget.nextElementSibling.checked = !e.currentTarget.nextElementSibling.checked;
                }}
            >
                Add brand
            </Button>
            <input type="checkbox" id="add-brand" className="hidden [&:checked+div]:flex" />
            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                <label htmlFor="add-brand" className="absolute left-0 top-0 size-full bg-[#000b]"></label>
                <Card className="absolute left-1/2 top-1/2 h-auto w-2/3 -translate-x-1/2 -translate-y-1/2 p-4">
                    <h3 className="font-semibold capitalize">Add brand</h3>
                    <form onSubmit={addBrandForm.handleSubmit} className="mt-6">
                        <label className="block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Name</span>
                                {addBrandForm.errors.name && (
                                    <Typography className="text-sm" color="red">
                                        {addBrandForm.errors.name}
                                    </Typography>
                                )}
                            </div>
                            <input
                                name="name"
                                type="text"
                                value={addBrandForm.values.name}
                                onChange={addBrandForm.handleChange}
                                placeholder="Category name"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                            />
                        </label>
                        <label className="mt-4 block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Desciption</span>
                                {addBrandForm.errors.description && (
                                    <Typography className="text-sm" color="red">
                                        {addBrandForm.errors.description}
                                    </Typography>
                                )}
                            </div>
                            <textarea
                                name="description"
                                spellCheck="false"
                                placeholder="Category name"
                                value={addBrandForm.values.description}
                                onChange={addBrandForm.handleChange}
                                className="w-full resize-y border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                                rows={4}
                            ></textarea>
                        </label>
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <Button
                                color="cyan"
                                variant="filled"
                                type="submit"
                                onClick={(e) => {
                                    e.currentTarget.nextElementSibling.children[0].click();
                                }}
                            >
                                Add
                            </Button>
                            <Button color="red" className="relative" variant="outlined">
                                <label
                                    htmlFor="add-brand"
                                    className="absolute left-0 top-0 size-full cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                ></label>
                                Close
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
            <Card className="h-full w-full overflow-scroll">
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
                        {brands.length === 0 && (
                            <tr>
                                <td colSpan={TABLE_HEAD.length}>
                                    <div className="flex min-h-[50vh] items-center justify-center opacity-50">
                                        <InboxIcon className="size-5 text-black" />
                                        <span className="ml-2 text-sm">Empty</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {brands.map((brand, index) => {
                            const { _id, name, description, createdAt, active } = brand;
                            return (
                                <tr key={name} className="even:bg-blue-gray-50/50">
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {name}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="text-ellipsis font-normal"
                                        >
                                            {textShort(description)}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {createdAt}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Switch
                                            color="green"
                                            defaultChecked={active}
                                            value={active}
                                            onChange={(e) => handleChangeActiveBrand(e, _id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <span
                                            onClick={(e) => {
                                                const inputEdit = e.currentTarget.nextElementSibling;
                                                inputEdit.checked = !inputEdit.checked;
                                            }}
                                        >
                                            <Tooltip content="Edit Category">
                                                <IconButton variant="text">
                                                    <PencilIcon className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="hidden [&:checked+div]:block"
                                            id={`edit-brand-${index}`}
                                        />
                                        <div className="fixed left-0 top-0 z-50 hidden h-full w-full">
                                            <label
                                                htmlFor={`edit-brand-${index}`}
                                                className="block h-full w-full bg-[#000000a1]"
                                            ></label>
                                            <EditBrandForm brand={brand} index={index} setBrands={setBrands} />
                                        </div>
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
                                            id={`delete-brand-${index}`}
                                            className="hidden [&:checked+div]:flex"
                                        />
                                        <div className="fixed left-0 top-0 z-50 hidden h-full w-full items-center justify-center">
                                            <label
                                                htmlFor={`delete-brand-${index}`}
                                                className="absolute left-0 top-0 h-full w-full bg-[#000000a1]"
                                            ></label>
                                            <Card className="h-auto min-w-[50%] px-4 py-6">
                                                <h3 className="text-left font-semibold">Confirm Delete</h3>
                                                <p className="mt-2 text-sm">
                                                    Are you sure you want to delete the brand named "
                                                    <span className="font-bold">{name}</span>"?
                                                </p>
                                                <div className="mt-10 flex items-center justify-center gap-10">
                                                    <Button
                                                        color="red"
                                                        onClick={(e) => {
                                                            e.currentTarget.nextElementSibling.children[0].click();
                                                            handleDeleteBrand(_id);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                    <Button className="relative">
                                                        <label
                                                            htmlFor={`delete-brand-${index}`}
                                                            className="absolute left-0 top-0 size-full cursor-pointer"
                                                        ></label>
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
        </div>
    );
}
