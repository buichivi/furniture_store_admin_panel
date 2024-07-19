import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { ArrowLeftIcon, CloudArrowUpIcon, PencilIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button, Card, IconButton, Tooltip } from '@material-tailwind/react';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

const AddColor = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [model, setModel] = useState();

    const addColorForm = useFormik({
        initialValues: {
            name: '',
            thumb: '',
            stock: 0,
            images: [],
            model3D: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            thumb: Yup.mixed().required('This field is required'),
            stock: Yup.number().min(0).required('This field is required'),
            images: Yup.array().min(1).required('This field is required'),
            model3D: Yup.mixed(),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            for (const key in values) {
                if (key == 'images') {
                    for (const file of values.images) {
                        formData.append('images', file);
                    }
                    continue;
                }
                formData.append(key, values[key]);
            }
            toast.promise(
                apiRequest.post('/colors/' + slug, formData, {
                    headers: {
                        Authorization: `Bearer ` + token,
                    },
                }),
                {
                    loading: 'Creating...',
                    success: (res) => {
                        navigate('/dashboard/product/edit/' + slug);
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

    const ImageProduct = ({ src = '', index = 0 }) => {
        return (
            <div
                key={src}
                className="relative cursor-pointer [&:hover>span]:opacity-100"
                onClick={() => {
                    addColorForm.setFieldValue(
                        'images',
                        addColorForm.values.images.filter((img, idx) => idx != index),
                    );
                    // setImages((images) => images.filter((img, idx) => idx != index));
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
        <div className="py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to={`/dashboard/product/edit/${slug}`}>
                        <Tooltip content="Back">
                            <IconButton>
                                <ArrowLeftIcon className="size-4" />
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <h3 className="text-xl">Add color</h3>
                </div>
                <Button type="submit" className="mt-4" onClick={addColorForm.handleSubmit}>
                    Add color
                </Button>
            </div>
            <form onSubmit={addColorForm.handleSubmit} className="mt-4">
                <div className="flex gap-4">
                    <Card className="flex-1 p-4">
                        <div className="">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Name</span>
                                {addColorForm.errors.name && (
                                    <span className="text-sm text-red-500">{addColorForm.errors.name}</span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={addColorForm.values.name}
                                onChange={addColorForm.handleChange}
                                placeholder="Color name"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Stock</span>
                                {addColorForm.errors.stock && (
                                    <span className="text-sm text-red-500">{addColorForm.errors.stock}</span>
                                )}
                            </div>
                            <input
                                type="number"
                                min="0"
                                name="stock"
                                value={addColorForm.values.stock}
                                onChange={addColorForm.handleChange}
                                placeholder="Price"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Color thumb</span>
                                {addColorForm.errors.thumb && (
                                    <span className="text-sm text-red-500">{addColorForm.errors.thumb}</span>
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
                                        addColorForm.setFieldValue('thumb', e.currentTarget.files[0]);
                                    }}
                                    accept="image/*"
                                    id="add-color-thumb"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </Card>
                    <Card className="flex-1 p-4">
                        <div className="flex items-center justify-between">
                            <span className="block text-sm font-medium">Images</span>
                            {addColorForm.errors.images && (
                                <span className="text-sm text-red-500">{addColorForm.errors.images}</span>
                            )}
                        </div>
                        <div className="mt-2 ">
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {addColorForm.values.images.map((img, index) => (
                                    <ImageProduct key={index} src={URL.createObjectURL(img)} index={index} />
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
                                                addColorForm.setFieldValue('images', [
                                                    ...addColorForm.values.images,
                                                    ...files,
                                                ]);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <Card className="mt-4 p-4">
                    <div className="flex items-center justify-between">
                        <span className="block text-sm font-medium">Model 3D</span>
                    </div>

                    <div className="mt-2 size-[400px] overflow-hidden rounded-md border">
                        {!model ? (
                            <label
                                htmlFor="upload-3d-model"
                                className="flex size-full cursor-pointer items-center justify-center bg-gray-200 text-sm text-gray-400 transition-colors duration-500 hover:bg-gray-400 hover:text-black"
                            >
                                <div className="flex flex-col items-center">
                                    <CloudArrowUpIcon className="size-8" />
                                    <p>Upload your model here</p>
                                </div>
                            </label>
                        ) : (
                            <model-viewer
                                src={model}
                                ar
                                shadow-intensity="1"
                                camera-controls
                                auto-rotate
                                camera-orbit="0deg 90deg 5m"
                                touch-action="pan-y"
                                style={{ width: '100%', height: '100%' }}
                            ></model-viewer>
                        )}
                    </div>
                    {model && (
                        <div className="mt-4 flex items-center gap-6 text-sm">
                            <Button
                                size="sm"
                                className="normal-case"
                                variant="outlined"
                                onClick={(e) => e.currentTarget.parentElement.nextElementSibling.click()}
                            >
                                Change model
                            </Button>
                            <Button
                                color="red"
                                size="sm"
                                className="normal-case"
                                onClick={(e) => {
                                    setModel();
                                    e.currentTarget.parentElement.nextElementSibling.value = '';
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    )}
                    <input
                        type="file"
                        id="upload-3d-model"
                        className="hidden"
                        accept=".gltf,.glb"
                        onChange={(e) => {
                            const modelUrl = URL.createObjectURL(e.currentTarget.files[0]);
                            addColorForm.setFieldValue('model3D', e.currentTarget.files[0]);
                            setModel(modelUrl);
                        }}
                    />
                </Card>
            </form>
        </div>
    );
};

export default AddColor;
