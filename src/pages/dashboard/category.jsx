import apiRequest from '@/utils/apiRequest';
import textShort from '@/utils/textShort';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Input, Switch, Textarea, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { EditCategoryForm } from '@/components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InboxIcon } from '@heroicons/react/24/solid';
const TABLE_HEAD = ['Name', 'Image', 'Description', 'Active', 'Action'];

export function Category() {
    const [categories, setCategories] = useState([]);
    const previewCateImage = useRef();
    const token = localStorage.getItem('token');
    useEffect(() => {
        apiRequest
            .get('/categories')
            .then((res) => {
                setCategories(res.data.categories);
            })
            .catch((err) => console.log(err));
    }, []);

    // Handle create/edit/delete catogory

    const handleActiveCate = (e, id) => {
        toast.promise(
            apiRequest.patch(
                '/categories/' + id,
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

    const handleDeleteCate = (id) => {
        toast.promise(apiRequest.delete('/categories/' + id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
                setCategories((categories) => {
                    const newCategories = categories.filter((cate) => cate._id !== id);
                    return newCategories;
                });
                return res.data?.message;
            },
            error: (err) => {
                console.log(err);
                return err?.response?.data?.error || 'Something went wrong';
            },
        });
    };

    const addCateForm = useFormik({
        initialValues: {
            name: '',
            description: '',
            imageUrl: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
            imageUrl: Yup.mixed().required('This field is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            const formData = new FormData();
            for (const key in values) {
                console.log(key);
                formData.append(key, values[key]);
            }
            toast.promise(
                apiRequest.post('/categories/', formData, { headers: { Authorization: 'Bearer ' + token } }),
                {
                    loading: 'Creating...',
                    success: (res) => {
                        setCategories((categories) => {
                            const newCategories = [...categories, res.data.category];
                            return newCategories;
                        });
                        resetForm();
                        previewCateImage.current.src = 'https://placehold.co/600x400?text=Select%20image';
                        return res.data.message;
                    },
                    error: (err) => {
                        console.log(err);
                        return err.response.data.error || 'Something went wrong';
                    },
                },
            );
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
                Add category
            </Button>
            <input type="checkbox" id="add-cate" className="hidden [&:checked+div]:flex" />
            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                <label htmlFor="add-cate" className="absolute left-0 top-0 size-full bg-[#000b]"></label>
                <Card className="absolute left-1/2 top-1/2 h-auto w-2/3 -translate-x-1/2 -translate-y-1/2 p-4">
                    <h3 className="font-semibold capitalize">Add category</h3>
                    <form onSubmit={addCateForm.handleSubmit} className="mt-6">
                        <label className="block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Name</span>
                                {addCateForm.errors.name && (
                                    <Typography className="text-sm" color="red">
                                        {addCateForm.errors.name}
                                    </Typography>
                                )}
                            </div>
                            <input
                                name="name"
                                type="text"
                                value={addCateForm.values.name}
                                onChange={addCateForm.handleChange}
                                placeholder="Category name"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                            />
                        </label>
                        <label className="mt-4 block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Desciption</span>
                                {addCateForm.errors.description && (
                                    <Typography className="text-sm" color="red">
                                        {addCateForm.errors.description}
                                    </Typography>
                                )}
                            </div>
                            <textarea
                                name="description"
                                spellCheck="false"
                                placeholder="Category name"
                                value={addCateForm.values.description}
                                onChange={addCateForm.handleChange}
                                className="w-full resize-y border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                                rows={4}
                            ></textarea>
                        </label>
                        <div className="mt-4">
                            <span className="mb-2 block text-sm">Image</span>
                            {addCateForm.errors.imageUrl && (
                                <Typography className="text-sm" color="red">
                                    {addCateForm.errors.imageUrl}
                                </Typography>
                            )}
                            <div className="relative w-fit [&:hover_label]:opacity-100">
                                <img
                                    ref={previewCateImage}
                                    src="https://placehold.co/600x400?text=Select%20image"
                                    alt=""
                                    className="size-28 object-cover"
                                />
                                <label
                                    htmlFor="add-cate-image"
                                    className="absolute left-0 top-0 z-50 flex size-full cursor-pointer items-center justify-center bg-[#000000ab] opacity-0 transition-all"
                                >
                                    <span className="mr-1 text-sm text-white">Select image</span>
                                    <PencilIcon className="size-4" color="white" />
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="add-cate-image"
                                    onChange={(e) => {
                                        addCateForm.setFieldValue('imageUrl', e.target.files[0]);
                                        previewCateImage.current.src = URL.createObjectURL(e.currentTarget.files[0]);
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <Button
                                color="cyan"
                                variant="outlined"
                                type="submit"
                                onClick={(e) => {
                                    e.currentTarget.nextElementSibling.children[0].click();
                                }}
                            >
                                Add
                            </Button>
                            <Button color="red" className="relative">
                                <label
                                    htmlFor="add-cate"
                                    className="absolute left-0 top-0 size-full"
                                    onClick={(e) => e.stopPropagation()}
                                ></label>
                                Close
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
            <Card className="h-full w-full overflow-scroll">
                <table className="w-full min-w-max table-fixed text-left">
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
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <div className="flex min-h-[50vh] items-center justify-center opacity-50">
                                        <InboxIcon className="size-5 text-black" />
                                        <span className="ml-2 text-sm">Empty</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {categories?.map((category, index) => {
                            const { _id, name, imageUrl, description, active } = category;
                            return (
                                <tr key={name} className="even:bg-blue-gray-50/50">
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {name}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <img src={imageUrl} alt="" className="w-24 object-contain" />
                                    </td>

                                    <td className="p-4">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="line-clamp-1 text-ellipsis font-normal"
                                        >
                                            {textShort(description)}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Switch
                                            color="green"
                                            defaultChecked={active}
                                            value={active}
                                            onChange={(e) => handleActiveCate(e, _id)}
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
                                            id={`edit-cate-${index}`}
                                        />
                                        <div className="fixed left-0 top-0 z-50 hidden h-full w-full">
                                            <label
                                                htmlFor={`edit-cate-${index}`}
                                                className="block h-full w-full bg-[#000000a1]"
                                            ></label>
                                            <EditCategoryForm
                                                category={category}
                                                index={index}
                                                setCategories={setCategories}
                                            />
                                        </div>
                                        <span
                                            onClick={(e) => {
                                                const inputDelete = e.currentTarget.nextElementSibling;
                                                inputDelete.checked = !inputDelete.checked;
                                            }}
                                        >
                                            <Tooltip content="Delete Category">
                                                <IconButton variant="text" className="ml-2 hover:text-red-600">
                                                    <TrashIcon className="h-4 w-4 " />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                        <input
                                            type="checkbox"
                                            id={`delete-cate-${index}`}
                                            className="hidden [&:checked+div]:flex"
                                            onChange={(e) => console.log(e.target.checked)}
                                        />
                                        <div className="fixed left-0 top-0 z-50 hidden h-full w-full items-center justify-center">
                                            <label
                                                htmlFor={`delete-cate-${index}`}
                                                className="absolute left-0 top-0 h-full w-full bg-[#000000a1]"
                                            ></label>
                                            <Card className="h-auto min-w-[50%] px-4 py-6">
                                                <h3 className="text-left font-semibold">Confirm Delete</h3>
                                                <p className="mt-2 text-sm">
                                                    Are you sure you want to delete the category named "
                                                    <span className="font-bold">{name}</span>"?
                                                </p>
                                                <div className="mt-10 flex items-center justify-center gap-10">
                                                    <Button
                                                        color="red"
                                                        onClick={(e) => {
                                                            e.currentTarget.nextElementSibling.children[0].click();
                                                            handleDeleteCate(_id);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                    <Button className="relative">
                                                        <label
                                                            htmlFor={`delete-cate-${index}`}
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
