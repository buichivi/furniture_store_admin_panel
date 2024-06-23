import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, Card, IconButton, Tooltip, Typography, useTabs } from '@material-tailwind/react';
import useCategoryStore from '@/stores/categoryStore';
import { useEffect, useState } from 'react';
import apiRequest from '@/utils/apiRequest';
import toast from 'react-hot-toast';
import { EditCategoryForm } from '@/components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useAuthStore from '@/stores/authStore';

const getCategoryTree = (categories) => {
    const categoryMap = {};
    categories.forEach((cate) => (categoryMap[cate._id] = { ...cate, child: [] }));

    const categoryTree = [];
    categories.forEach((cate) => {
        if (cate.parentId === '') {
            categoryTree.push(categoryMap[cate._id]);
        } else {
            categoryMap[cate.parentId]?.child.push(categoryMap[cate._id]);
        }
    });
    return categoryTree;
};

export const CategoryTree = () => {
    const { token } = useAuthStore();
    const { categories, setCategories } = useCategoryStore();

    useEffect(() => {
        apiRequest
            .get('/categories')
            .then((res) => setCategories(res.data.categories))
            .catch((err) => console.log(err));
    }, []);

    const addCateForm = useFormik({
        initialValues: {
            name: '',
            description: '',
            imageUrl: '',
            parentId: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
            parentId: Yup.string(),
            imageUrl: Yup.mixed(),
        }),
        onSubmit: (values, { resetForm }) => {
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            toast.promise(
                apiRequest.post('/categories/', formData, { headers: { Authorization: 'Bearer ' + token } }),
                {
                    loading: 'Creating...',
                    success: (res) => {
                        setCategories([...categories, res.data.category]);
                        resetForm();
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
            <input
                type="checkbox"
                id="add-cate"
                className="hidden [&:checked+div]:flex"
                onChange={(e) => {
                    if (!e.currentTarget.checked) {
                        addCateForm.resetForm();
                    }
                }}
            />
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
                            <span className="mb-2 block text-sm">Category parent</span>
                            {addCateForm.errors.parentId && (
                                <Typography className="text-sm" color="red">
                                    {addCateForm.errors.parentId}
                                </Typography>
                            )}
                            <div>
                                {categories.length > 0 && (
                                    <select
                                        name="parentId"
                                        value={addCateForm.values.parentId}
                                        onChange={addCateForm.handleChange}
                                        className="w-full rounded-md border border-black px-2 py-2 outline-none"
                                    >
                                        <option value="">Select category</option>
                                        {categories
                                            .filter((cate) => cate.parentId == '')
                                            .map((cate, index) => {
                                                return (
                                                    <option key={index} value={cate._id}>
                                                        {cate?.name}
                                                    </option>
                                                );
                                            })}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="mb-2 block text-sm">Image</span>
                            {addCateForm.errors.imageUrl && (
                                <Typography className="text-sm" color="red">
                                    {addCateForm.errors.imageUrl}
                                </Typography>
                            )}
                            <div className="relative w-fit [&:hover_label]:opacity-100">
                                <img
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
                                        addCateForm.setFieldValue('imageUrl', e.currentTarget.files[0]);
                                        e.currentTarget.previousElementSibling.previousElementSibling.src =
                                            URL.createObjectURL(e.currentTarget.files[0]);
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <Button color="cyan" variant="outlined" type="submit">
                                Add
                            </Button>
                            <Button color="red" className="relative">
                                <label
                                    htmlFor="add-cate"
                                    className="absolute left-0 top-0 size-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                ></label>
                                Close
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
            {getCategoryTree(categories).map((cate, index) => {
                return <CategoryItem key={index} category={cate} />;
            })}
        </div>
    );
};

const CategoryItem = ({ category = {}, className = '', isParent = true, drag = false }) => {
    const { dragCate, setDragCate, moveCate, categories, setCategories } = useCategoryStore();
    const [drop, setDrop] = useState(false);
    const { token } = useAuthStore();
    console.log(category, drag);

    const handleDeleteCate = (id) => {
        toast.promise(apiRequest.delete('/categories/' + id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
                setCategories(
                    categories
                        .map((cate) => (cate.parentId == id ? { ...cate, parentId: '' } : cate))
                        .filter((cate) => cate._id !== id),
                );
                return res.data?.message;
            },
            error: (err) => {
                console.log(err);
                return err?.response?.data?.error || 'Something went wrong';
            },
        });
    };
    return (
        <div
            className={`${className} border-2 border-dotted ${
                category?.parentId == '' && drop ? '!border-black' : '!border-transparent'
            }`}
            onDragOver={(e) => {
                e.preventDefault();
                if (category.parentId == '') setDrop(true);
            }}
            onDragLeave={() => {
                if (category.parentId == '') setDrop(false);
            }}
            onDrop={() => {
                if (category.parentId == '') {
                    toast.promise(
                        apiRequest.patch(
                            '/categories/' + dragCate._id,
                            { parentId: category._id },
                            { headers: { Authorization: 'Bearer ' + token } },
                        ),
                        {
                            loading: 'Updating...',
                            success: (res) => {
                                moveCate(category._id);
                                return res.data.message;
                            },
                            error: (err) => err.response.data.error,
                        },
                    );
                    setDrop(false);
                }
            }}
        >
            <div className="relative mb-4 flex items-stretch gap-2">
                {isParent && (
                    <div className="flex items-center">
                        <span>------</span>
                    </div>
                )}
                {!isParent && (
                    <div className="flex items-center border-l-2 border-dotted border-[#00000060]">
                        <span className="color-black opacity-40 ">-------</span>
                    </div>
                )}
                <div
                    className={`flex items-center gap-2 ${drag ? 'select-auto' : 'select-none'}`}
                    draggable={drag}
                    onDragStart={() => setDragCate(category)}
                >
                    <div className="flex min-h-5 min-w-[200px] cursor-default items-center justify-between gap-2 rounded-md bg-white p-2 text-black shadow-lg">
                        {category?.name}
                        <div className="flex items-center gap-2">
                            <span
                                onClick={(e) => {
                                    const inputEdit = e.currentTarget.nextElementSibling;
                                    inputEdit.checked = !inputEdit.checked;
                                }}
                            >
                                <Tooltip content="Edit Category">
                                    <PencilIcon className="h-4 w-4 cursor-pointer" />
                                </Tooltip>
                            </span>
                            <input
                                type="checkbox"
                                className="hidden [&:checked+div]:block"
                                id={`edit-cate-${category._id}`}
                            />
                            <div className="fixed left-0 top-0 z-50 hidden h-full w-full">
                                <label
                                    htmlFor={`edit-cate-${category._id}`}
                                    className="block h-full w-full bg-[#000000a1]"
                                ></label>
                                <EditCategoryForm category={category} index={category._id} />
                            </div>
                            <span
                                onClick={(e) => {
                                    const inputDelete = e.currentTarget.nextElementSibling;
                                    inputDelete.checked = !inputDelete.checked;
                                }}
                            >
                                <Tooltip content="Delete Category">
                                    <TrashIcon className="h-4 w-4 cursor-pointer transition-colors hover:text-red-500" />
                                </Tooltip>
                            </span>
                            <input
                                type="checkbox"
                                id={`delete-cate-${category._id}`}
                                className="hidden [&:checked+div]:flex"
                            />
                            <div className="fixed left-0 top-0 z-50 hidden h-full w-full items-center justify-center">
                                <label
                                    htmlFor={`delete-cate-${category._id}`}
                                    className="absolute left-0 top-0 h-full w-full bg-[#000000a1]"
                                ></label>
                                <Card className="h-auto min-w-[50%] px-4 py-6">
                                    <h3 className="text-left font-semibold">Confirm Delete</h3>
                                    <p className="mt-2 text-sm">
                                        Are you sure you want to delete the category named "
                                        <span className="font-bold">{category?.name}</span>"?
                                    </p>
                                    <div className="mt-10 flex items-center justify-center gap-10">
                                        <Button
                                            color="red"
                                            onClick={(e) => {
                                                e.currentTarget.nextElementSibling.children[0].click();
                                                handleDeleteCate(category._id);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                        <Button className="relative">
                                            <label
                                                htmlFor={`delete-cate-${category._id}`}
                                                className="absolute left-0 top-0 size-full cursor-pointer"
                                            ></label>
                                            Cancel
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                    <IconButton
                        variant="filled"
                        color="white"
                        onClick={(e) => {
                            toast.promise(
                                apiRequest.patch(
                                    '/categories/' + category._id,
                                    { active: !category.active },
                                    { headers: { Authorization: 'Bearer ' + token } },
                                ),
                                {
                                    loading: 'Updating...',
                                    success: (res) => {
                                        setCategories(
                                            categories.map((cate) => {
                                                return cate._id == category._id
                                                    ? { ...cate, active: !category.active }
                                                    : cate;
                                            }),
                                        );
                                        return res.data.message;
                                    },
                                    error: (err) => err?.response?.data.error,
                                },
                            );
                        }}
                    >
                        {category?.active ? <EyeIcon className="size-4" /> : <EyeSlashIcon className="size-4" />}
                    </IconButton>
                </div>
            </div>
            <div>
                {category?.child?.map((cate) => {
                    return (
                        <CategoryItem
                            key={cate._id}
                            category={cate}
                            className={`${category?.child?.length && 'ml-14'}`}
                            isParent={category?.child?.length && false}
                            drag={true}
                        />
                    );
                })}
            </div>
        </div>
    );
};
