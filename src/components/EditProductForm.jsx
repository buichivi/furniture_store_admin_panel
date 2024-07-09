import apiRequest from '@/utils/apiRequest';
import { Button, Card, IconButton, Tooltip } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, Square2StackIcon } from '@heroicons/react/24/outline';
import useAuthStore from '@/stores/authStore';
import { TextEditor } from './CKEditor';

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
function getLeafCategories(categories) {
    let leaves = [];
    categories.forEach((category) => {
        if (!category.child || category.child.length === 0) {
            leaves.push(category);
        } else {
            leaves = leaves.concat(getLeafCategories(category.child));
        }
    });
    return leaves;
}

const EditProductForm = () => {
    const { slug } = useParams();
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [product, setProduct] = useState({});
    const [tags, setTags] = useState([]);
    const { token } = useAuthStore();

    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            apiRequest.get('/categories'),
            apiRequest.get('/tags'),
            apiRequest.get('/products/' + slug),
            apiRequest.get('/brands'),
        ]).then((res) => {
            setCategories(res[0].data.categories);
            setTags(res[1].data.tags);
            setProduct(res[2].data.product);
            setBrands(res[3].data.brands);
        });
    }, []);

    const handleDeleteColor = (colorId) => {
        toast.promise(
            apiRequest.delete('/colors/' + product._id + '/' + colorId, {
                headers: {
                    Authorization: `Bearer ` + token,
                },
            }),
            {
                loading: 'Deleting...',
                success: (res) => {
                    setProduct((product) => {
                        return {
                            ...product,
                            colors: product.colors.filter(
                                (color) => color._id != colorId,
                            ),
                        };
                    });
                    return res.data.message;
                },
                error: (err) => {
                    return err?.response?.data?.error || 'Somthing went wrong';
                },
            },
        );
    };

    const productForm = useFormik({
        initialValues: {
            name: product?.name,
            description: product?.description,
            SKU: product?.SKU,
            price: product?.price,
            discount: product?.discount,
            brand: product?.brand?._id || '',
            category: product?.category?._id || '',
            material: product?.material || '',
            tags: product?.tags,
            width: product?.dimensions?.width,
            height: product?.dimensions?.height,
            depth: product?.dimensions?.depth,
            weight: product?.weight,
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
            SKU: Yup.string().required('This field is required'),
            price: Yup.number().required('This field is required'),
            discount: Yup.number().required('This field is required'),
            brand: Yup.string().required('This field is required'),
            category: Yup.string().required('This field is required'),
            material: Yup.string().required('This field is required'),
            tags: Yup.array()
                .min(1, 'Product must have at least 1 tag')
                .required('This field is required'),
            width: Yup.number().required('This field is required'),
            height: Yup.number().required('This field is required'),
            depth: Yup.number().required('This field is required'),
            weight: Yup.number().required('This field is required'),
        }),
        enableReinitialize: true,
        onSubmit: (values) => {
            toast.promise(
                apiRequest.put('/products/' + product._id, values, {
                    headers: {
                        Authorization: `Bearer ` + token,
                    },
                }),
                {
                    loading: 'Editing...',
                    success: (res) => {
                        console.log(values);
                        navigate('/dashboard/product');
                        return res.data.message;
                    },
                    error: (err) =>
                        err?.response?.data?.message || 'Something went wrong',
                },
            );
        },
    });

    return (
        <form className="py-6" onSubmit={productForm.handleSubmit}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/dashboard/product">
                        <Tooltip content="Back">
                            <IconButton>
                                <ArrowLeftIcon className="size-4" />
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <h3 className="font-semibold">Edit product</h3>
                </div>
                <Button type="submit" className="mt-4 flex items-center gap-2">
                    <Square2StackIcon className="size-5" />
                    Save
                </Button>
            </div>
            <div className="mt-4 flex gap-4">
                <div className="flex shrink-0 basis-3/5 flex-col">
                    <Card className="h-fit p-4">
                        <div className="">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Name</span>
                                {productForm.errors.name && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.name}
                                    </span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={productForm.values.name}
                                onChange={productForm.handleChange}
                                placeholder="Product name"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">
                                    Description
                                </span>
                                {productForm.errors.description && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.description}
                                    </span>
                                )}
                            </div>
                            <div className="mt-2">
                                <TextEditor
                                    initialValue={product?.description}
                                    onChange={({ content }) => {
                                        if (content) {
                                            productForm.setFieldValue(
                                                'description',
                                                content,
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
                    <Card className="mt-4 flex-1 p-4">
                        <span className="text-sm font-medium">Dimension & Weight</span>
                        <div className="mt-4 flex gap-4">
                            <div className="flex-1">
                                <div className="">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">
                                            Width (cm)
                                        </span>
                                        {productForm.errors.width && (
                                            <span className="text-sm text-red-500">
                                                {productForm.errors.width}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        name="width"
                                        value={productForm.values.width}
                                        onChange={productForm.handleChange}
                                        min="0"
                                        placeholder="Product width"
                                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    />
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">
                                            Height (cm)
                                        </span>
                                        {productForm.errors.height && (
                                            <span className="text-sm text-red-500">
                                                {productForm.errors.height}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        name="height"
                                        value={productForm.values.height}
                                        onChange={productForm.handleChange}
                                        min="0"
                                        placeholder="Product height"
                                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">
                                            Depth (cm)
                                        </span>
                                        {productForm.errors.depth && (
                                            <span className="text-sm text-red-500">
                                                {productForm.errors.depth}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        name="depth"
                                        value={productForm.values.depth}
                                        onChange={(e) => {
                                            productForm.setFieldValue(
                                                'depth',
                                                Number(e.target.value),
                                            );
                                        }}
                                        min="0"
                                        placeholder="Product depth"
                                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    />
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">
                                            Weight (kg)
                                        </span>
                                        {productForm.errors.weight && (
                                            <span className="text-sm text-red-500">
                                                {productForm.errors.weight}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={productForm.values.weight}
                                        onChange={productForm.handleChange}
                                        min="0"
                                        placeholder="Product weight"
                                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="flex flex-1 flex-col">
                    <Card className="p-4">
                        <div className="">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">SKU</span>
                                {productForm.errors.SKU && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.SKU}
                                    </span>
                                )}
                            </div>
                            <input
                                name="SKU"
                                value={productForm.values.SKU}
                                onChange={productForm.handleChange}
                                type="text"
                                placeholder="SKU"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">
                                    Base price ($)
                                </span>
                                {productForm.errors.price && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.price}
                                    </span>
                                )}
                            </div>
                            <input
                                type="number"
                                name="price"
                                value={productForm.values.price}
                                onChange={productForm.handleChange}
                                min="0"
                                placeholder="Price"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">
                                    Discount (%)
                                </span>
                                {productForm.errors.discount && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.discount}
                                    </span>
                                )}
                            </div>
                            <input
                                type="number"
                                name="discount"
                                value={productForm.values.discount}
                                onChange={productForm.handleChange}
                                min="0"
                                max="100"
                                placeholder="Price"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                    </Card>
                    <Card className="mt-4 flex-1 p-4">
                        <div className="">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Brand</span>
                                {productForm.errors.brand && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.brand}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4">
                                {product?.brand?.name && brands.length > 0 && (
                                    <select
                                        name="brand"
                                        value={productForm.values.brand}
                                        onChange={(e) => {
                                            productForm.setFieldValue(
                                                'brand',
                                                e.currentTarget.value,
                                            );
                                        }}
                                        className="w-full rounded-md border border-black px-2 py-2 outline-none"
                                    >
                                        <option value="">Select brand</option>
                                        {brands.map((brand, index) => {
                                            return (
                                                <option
                                                    key={index}
                                                    value={brand._id}
                                                    selected={
                                                        brand._id === product?.brand?._id
                                                    }
                                                >
                                                    {brand?.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">
                                    Category
                                </span>
                                {productForm.errors.category && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.category}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4">
                                {product?.category?.name && categories.length > 0 && (
                                    <select
                                        name="category"
                                        value={productForm.values.category}
                                        onChange={(e) => {
                                            productForm.setFieldValue(
                                                'category',
                                                e.currentTarget.value,
                                            );
                                        }}
                                        className="w-full rounded-md border border-black px-2 py-2 outline-none"
                                    >
                                        <option value="">Select category</option>
                                        {getLeafCategories(
                                            getCategoryTree(categories),
                                        ).map((cate, index) => {
                                            return (
                                                <option
                                                    key={index}
                                                    value={cate._id}
                                                    selected={
                                                        cate._id === product?.category._id
                                                    }
                                                >
                                                    {cate?.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Tags</span>
                                {productForm.errors.tags && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.tags}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4">
                                {product?.tags && tags.length > 0 && (
                                    <Autocomplete
                                        fullWidth
                                        multiple
                                        value={productForm.values.tags || []}
                                        options={tags}
                                        getOptionLabel={(option) => option.name}
                                        isOptionEqualToValue={(op, val) =>
                                            op._id == val._id
                                        }
                                        disableCloseOnSelect
                                        onChange={(_, value) => {
                                            productForm.setFieldValue('tags', value);
                                        }}
                                        renderInput={(params) => {
                                            return (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    variant="outlined"
                                                    label="Select Tags"
                                                    className="!text-sm placeholder:text-sm"
                                                />
                                            );
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">
                                    Material
                                </span>
                                {productForm.errors.material && (
                                    <span className="text-sm text-red-500">
                                        {productForm.errors.material}
                                    </span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="material"
                                value={productForm.values.material}
                                onChange={productForm.handleChange}
                                min="0"
                                max="100"
                                placeholder="Material"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                    </Card>
                </div>
            </div>
            <div className="mt-4">
                <Card className="mt-4 p-4">
                    <span className="text-sm font-medium">Colors</span>
                    <div className="mt-4 flex gap-4">
                        {product?.colors?.map(({ _id, name, thumb }, index) => (
                            <div key={index}>
                                <div className="relative">
                                    {product?.colors?.length >= 2 && (
                                        <Tooltip content="Delete color">
                                            <span
                                                className="absolute -right-3 -top-3 flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black"
                                                onClick={(e) => {
                                                    const ip =
                                                        e.currentTarget.parentElement
                                                            .nextElementSibling;
                                                    ip.checked = !ip.checked;
                                                }}
                                            >
                                                <XMarkIcon className="size-4 text-white" />
                                            </span>
                                        </Tooltip>
                                    )}
                                    <Link
                                        to={`/dashboard/product/${slug}/edit-color/${_id}`}
                                    >
                                        <Tooltip content="Edit color">
                                            <img
                                                src={thumb}
                                                alt={name}
                                                className="size-14 cursor-pointer border border-black object-cover"
                                            />
                                        </Tooltip>
                                    </Link>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden [&:checked+div]:flex"
                                    id={`delete-color-${index}`}
                                />
                                <div
                                    className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center bg-[#000000a4]"
                                    onClick={(e) => {
                                        const ip = e.currentTarget.previousElementSibling;
                                        ip.checked = !ip.checked;
                                    }}
                                >
                                    <Card
                                        className="min-w-[30%] p-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <h3 className="font-semibold text-black">
                                            Delete color
                                        </h3>
                                        <p>Are you sure to delete this color?</p>
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <Button
                                                color="red"
                                                onClick={() => handleDeleteColor(_id)}
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                color="black"
                                                onClick={(e) => {
                                                    e.currentTarget.parentElement.parentElement.parentElement.click();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        ))}
                        <Tooltip content="Add color">
                            <Link
                                to={`/dashboard/product/edit/${slug}/add-color`}
                                className="flex size-14 cursor-pointer items-center justify-center border-2 border-dotted border-black"
                            >
                                <PlusIcon className="size-6 text-black" />
                            </Link>
                        </Tooltip>
                    </div>
                </Card>
            </div>
        </form>
    );
};

export default EditProductForm;
