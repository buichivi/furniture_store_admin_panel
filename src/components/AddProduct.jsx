import apiRequest from '@/utils/apiRequest';
import { Button, Card, IconButton, Tooltip } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import { Autocomplete, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CloudArrowUpIcon, Square2StackIcon } from '@heroicons/react/24/outline';

const modules = {
    toolbar: [
        [{ header: [6, 5, 4, 3, 2, 1, false] }],
        ['bold', 'italic', 'underline', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link'],
        ['clean'],
    ],
};

const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'video',
];

const EditProductForm = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [tags, setTags] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([apiRequest.get('/categories'), apiRequest.get('/tags'), apiRequest.get('/brands')]).then((res) => {
            setCategories(res[0].data.categories);
            setTags(res[1].data.tags);
            setBrands(res[2].data.brands);
        });
    }, []);

    const productForm = useFormik({
        initialValues: {
            name: '',
            description: '',
            SKU: '',
            price: '',
            discount: '',
            brand: '',
            category: '',
            material: '',
            tags: '',
            width: '',
            height: '',
            depth: '',
            weight: '',
            colorName: '',
            thumb: '',
            stock: 0,
            images: [],
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
            SKU: Yup.string().required('This field is required'),
            price: Yup.string().required('This field is required'),
            discount: Yup.string().required('This field is required'),
            brand: Yup.string().required('This field is required'),
            category: Yup.string().required('This field is required'),
            material: Yup.string().required('This field is required'),
            tags: Yup.array().min(1, 'Product must have at least 1 tag').required('This field is required'),
            width: Yup.string().required('This field is required'),
            height: Yup.string().required('This field is required'),
            depth: Yup.string().required('This field is required'),
            weight: Yup.string().required('This field is required'),
            colorName: Yup.string().required('This field is required'),
            thumb: Yup.mixed().required('This field is required'),
            stock: Yup.number().min(0).required('This field is required'),
            images: Yup.array().min(1, 'This field is required'),
        }),
        onSubmit: (values) => {
            console.log(values);
            const formData = new FormData();
            for (const key in values) {
                if (key == 'images') {
                    for (const file of values.images) {
                        formData.append('images', file);
                    }
                    continue;
                }
                if (key == 'tags') {
                    formData.append('tags', JSON.stringify(values.tags.map((tag) => tag._id)));
                    continue;
                }
                formData.append(key, values[key]);
            }
            toast.promise(apiRequest.post('/products', formData), {
                loading: 'Creating...',
                success: (res) => {
                    navigate('/dashboard/product');
                    return res.data.message;
                },
                error: (err) => err?.response?.data?.error || 'Something went wrong',
            });
        },
    });

    const ImageProduct = ({ src = '', index = 0 }) => {
        return (
            <div
                key={src}
                className="relative cursor-pointer [&:hover>span]:opacity-100"
                onClick={() => {
                    productForm.setFieldValue(
                        'images',
                        productForm.values.images.filter((img, idx) => idx != index),
                    );
                }}
            >
                <img src={src} alt="" className="size-full object-cover" />
                <span className="absolute left-0 top-0 z-10 flex size-full items-center justify-center bg-[#0007] text-white opacity-0 transition-all">
                    <TrashIcon className="size-4" />
                    <span className="text-sm">Delete</span>
                </span>
            </div>
        );
    };

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
                    <h3 className="font-semibold">Create product</h3>
                </div>
                <Button type="submit" className="mt-4 flex items-center gap-2">
                    <Square2StackIcon className="size-5" />
                    Create
                </Button>
            </div>
            <div className="mt-4 flex gap-4">
                <div className="flex shrink-0 basis-3/5 flex-col">
                    <Card className="h-fit p-4">
                        <div className="">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Name</span>
                                {productForm.errors.name && (
                                    <span className="text-sm text-red-500">{productForm.errors.name}</span>
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
                                <span className="block text-sm font-medium">Description</span>
                                {productForm.errors.description && (
                                    <span className="text-sm text-red-500">{productForm.errors.description}</span>
                                )}
                            </div>
                            <ReactQuill
                                modules={modules}
                                formats={formats}
                                theme="bubble"
                                name="description"
                                value={productForm.values.description}
                                onChange={(value) => {
                                    productForm.setFieldValue('description', value);
                                }}
                                placeholder="Description"
                                className="mt-1 bg-white [&_.ql-editor]:min-h-[250px] [&_.ql-tooltip-arrow]:!left-[8%] [&_.ql-tooltip]:!left-0"
                            />
                        </div>
                    </Card>
                    <Card className="mt-4 flex-1 p-4">
                        <span className="text-sm font-medium">Dimension & Weight</span>
                        <div className="mt-4 flex gap-4">
                            <div className="flex-1">
                                <div className="">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">Width (cm)</span>
                                        {productForm.errors.width && (
                                            <span className="text-sm text-red-500">{productForm.errors.width}</span>
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
                                        <span className="block text-sm font-medium">Height (cm)</span>
                                        {productForm.errors.height && (
                                            <span className="text-sm text-red-500">{productForm.errors.height}</span>
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
                                        <span className="block text-sm font-medium">Depth (cm)</span>
                                        {productForm.errors.depth && (
                                            <span className="text-sm text-red-500">{productForm.errors.depth}</span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        name="depth"
                                        value={productForm.values.depth}
                                        onChange={productForm.handleChange}
                                        min="0"
                                        placeholder="Product depth"
                                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    />
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">Weight (kg)</span>
                                        {productForm.errors.weight && (
                                            <span className="text-sm text-red-500">{productForm.errors.weight}</span>
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
                                    <span className="text-sm text-red-500">{productForm.errors.SKU}</span>
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
                                <span className="block text-sm font-medium">Base price ($)</span>
                                {productForm.errors.price && (
                                    <span className="text-sm text-red-500">{productForm.errors.price}</span>
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
                                <span className="block text-sm font-medium">Discount (%)</span>
                                {productForm.errors.discount && (
                                    <span className="text-sm text-red-500">{productForm.errors.discount}</span>
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
                                    <span className="text-sm text-red-500">{productForm.errors.brand}</span>
                                )}
                            </div>
                            <div className="mt-4">
                                {brands?.length > 0 && (
                                    <select
                                        name="brand"
                                        value={productForm.values.brand}
                                        onChange={(e) => {
                                            productForm.setFieldValue('brand', e.currentTarget.value);
                                        }}
                                        className="w-full rounded-md border border-black px-2 py-2 outline-none"
                                    >
                                        <option value="">Select brand</option>
                                        {brands.map((brand, index) => {
                                            return (
                                                <option key={index} value={brand._id}>
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
                                <span className="block text-sm font-medium">Category</span>
                                {productForm.errors.category && (
                                    <span className="text-sm text-red-500">{productForm.errors.category}</span>
                                )}
                            </div>
                            <div className="mt-4">
                                {categories.length > 0 && (
                                    <select
                                        name="category"
                                        value={productForm.values.category}
                                        onChange={(e) => {
                                            productForm.setFieldValue('category', e.currentTarget.value);
                                        }}
                                        className="w-full rounded-md border border-black px-2 py-2 outline-none"
                                    >
                                        <option value="">Select category</option>
                                        {categories
                                            .filter((cate) => cate.parentId != '')
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
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Tags</span>
                                {productForm.errors.tags && (
                                    <span className="text-sm text-red-500">{productForm.errors.tags}</span>
                                )}
                            </div>
                            <div className="mt-4">
                                {tags.length > 0 && (
                                    <Autocomplete
                                        fullWidth
                                        multiple
                                        value={productForm.values.tags || []}
                                        options={tags}
                                        getOptionLabel={(option) => option.name}
                                        isOptionEqualToValue={(op, val) => op._id == val._id}
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
                                <span className="block text-sm font-medium">Material</span>
                                {productForm.errors.material && (
                                    <span className="text-sm text-red-500">{productForm.errors.material}</span>
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
                    <div className="mt-4">
                        <div className="flex gap-4">
                            <div className="flex-1 p-4">
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">Color Name</span>
                                        {productForm.errors.colorName && (
                                            <span className="text-sm text-red-500">{productForm.errors.colorName}</span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="colorName"
                                        value={productForm.values.colorName}
                                        onChange={productForm.handleChange}
                                        placeholder="Color name"
                                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    />
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">Stock</span>
                                        {productForm.errors.stock && (
                                            <span className="text-sm text-red-500">{productForm.errors.stock}</span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        name="stock"
                                        value={productForm.values.stock}
                                        onChange={productForm.handleChange}
                                        placeholder="Price"
                                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                                    />
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="block text-sm font-medium">Color thumb</span>
                                        {productForm.errors.thumb && (
                                            <span className="text-sm text-red-500">{productForm.errors.thumb}</span>
                                        )}
                                    </div>
                                    <div className="relative mt-2 w-fit [&:hover_label]:opacity-100">
                                        <img
                                            src="https://placehold.co/600x600?text=Color+Thumb"
                                            alt=""
                                            className="size-28 object-cover"
                                        />
                                        <label
                                            htmlFor="add-color-thumb"
                                            className="absolute left-0 top-0 z-50 flex size-full cursor-pointer items-center justify-center bg-[#000000ab] opacity-0 transition-all"
                                        >
                                            <span className="mr-1 text-sm text-white">Add image</span>
                                            <PencilIcon className="size-4" color="white" />
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const previewImg =
                                                    e.currentTarget.previousElementSibling.previousElementSibling;
                                                previewImg.src = URL.createObjectURL(e.currentTarget.files[0]);
                                                productForm.setFieldValue('thumb', e.currentTarget.files[0]);
                                            }}
                                            accept="image/*"
                                            id="add-color-thumb"
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="block text-sm font-medium">Images</span>
                                    {productForm.errors.images && (
                                        <span className="text-sm text-red-500">{productForm.errors.images}</span>
                                    )}
                                </div>
                                <div className="mt-2 ">
                                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                        {productForm.values.images
                                            .map((img) => URL.createObjectURL(img))
                                            .map((img, index) => (
                                                <ImageProduct key={index} src={img} index={index} />
                                            ))}
                                        <div
                                            className="relative mt-2 rounded-md border-2 border-dotted border-black"
                                            style={{ aspectRatio: 1 }}
                                        >
                                            <label
                                                htmlFor="add-color-image"
                                                className="flex size-full cursor-pointer flex-col items-center justify-center text-black transition-all"
                                            >
                                                <CloudArrowUpIcon className="size-10" />
                                                <span className="mr-1 text-sm">Add image</span>
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="add-color-image"
                                                multiple
                                                onChange={(e) => {
                                                    const files = e.currentTarget.files;
                                                    if (files.length) {
                                                        productForm.setFieldValue('images', [
                                                            ...productForm.values.images,
                                                            ...files,
                                                        ]);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </form>
    );
};

export default EditProductForm;
