import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { ArrowLeftIcon, CloudArrowUpIcon, PencilIcon, Square2StackIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button, Card, IconButton, Tooltip } from '@material-tailwind/react';
import { useFormik } from 'formik';
import { doc } from 'prettier';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

const EditColor = () => {
    const [color, setColor] = useState({});
    const { slug, colorId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [model, setModel] = useState();

    useEffect(() => {
        apiRequest
            .get('/products/colors/' + slug + '/' + colorId)
            .then((res) => setColor(res.data.color))
            .catch((err) => console.log(err));
    }, [colorId]);

    useEffect(() => {
        if (color?.model3D) {
            setModel(color?.model3D);
        }
    }, [color]);

    const editColorForm = useFormik({
        initialValues: {
            name: color?.name || '',
            thumb: '',
            stock: color?.stock || 0,
            images: [],
            existedImages: color?.images || [],
            model3D: '',
            isDeleteModel: false,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            thumb: Yup.mixed(),
            stock: Yup.number().min(0).required('This field is required'),
            images: Yup.array(),
            model3D: Yup.mixed(),
            isDeleteModel: Yup.bool(),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            const existedImages = values.existedImages.map((img) => {
                return 'public/uploads' + img.split('uploads')[1];
            });
            for (const key in values) {
                if (key == 'images') {
                    for (const file of values.images) {
                        formData.append('images', file);
                    }
                    continue;
                }
                if (key == 'existedImages') {
                    formData.append(key, JSON.stringify(existedImages));
                    continue;
                }
                formData.append(key, values[key]);
            }
            toast.promise(
                apiRequest.put('/products/colors/' + slug + '/' + colorId, formData, {
                    headers: {
                        Authorization: `Bearer ` + token,
                    },
                }),
                {
                    loading: 'Updating...',
                    success: (res) => {
                        navigate('/dashboard/product/edit/' + slug);
                        console.log(res.data.value);
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

    useEffect(() => {
        if (!model) {
            editColorForm.setFieldValue('isDeleteModel', true);
        }
    }, [model]);

    useEffect(() => {
        const modelViewer = document.querySelector('model-viewer');
        const onProgress = (e) => {
            const progressBar = modelViewer.querySelector('#progress-bar');
            if (e.detail.totalProgress == 1) {
                progressBar.classList.add('hidden');
            } else progressBar.classList.remove('hidden');
        };

        if (modelViewer) {
            modelViewer.addEventListener('progress', onProgress);
        }
        return () => {
            if (modelViewer) {
                modelViewer.removeEventListener('progress', onProgress);
            }
        };
    }, [model]);

    const ImageProduct = ({ src = '', index = 0, type = '' }) => {
        return (
            <div
                key={src}
                className={`relative ${
                    editColorForm.values.existedImages.length + editColorForm.values.images.length > 1 &&
                    'cursor-pointer'
                } [&:hover>span]:opacity-100`}
                onClick={() => {
                    if (editColorForm.values.existedImages.length + editColorForm.values.images.length > 1) {
                        if (type == 'url') {
                            editColorForm.setFieldValue(
                                'existedImages',
                                editColorForm.values.existedImages.filter((img, idx) => idx != index),
                            );
                        } else if (type == 'file') {
                            editColorForm.setFieldValue(
                                'images',
                                editColorForm.values.images.filter((img, idx) => idx != index),
                            );
                        }
                    }
                }}
            >
                <img src={src} alt="" className="size-full object-cover" />
                {editColorForm.values.existedImages.length + editColorForm.values.images.length > 1 && (
                    <span className="absolute left-0 top-0 z-10 flex size-full items-center justify-center bg-[#0007] text-white opacity-0 transition-all">
                        <TrashIcon className="size-4" />
                        <span className="text-sm">Delete</span>
                    </span>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={editColorForm.handleSubmit} className="py-6">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Link to={`/dashboard/product/edit/${slug}`}>
                        <Tooltip content="Back">
                            <IconButton>
                                <ArrowLeftIcon className="size-4" />
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <h3 className="text-xl">Edit color</h3>
                </div>
                <Button type="submit" className="mt-4 flex items-center gap-2" onClick={() => {}}>
                    <Square2StackIcon className="size-5" />
                    Save
                </Button>
            </div>
            <div className="mt-4">
                <div className="flex gap-4">
                    <Card className="flex-1 p-4">
                        <div className="">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Name</span>
                                {editColorForm.errors.name && (
                                    <span className="text-sm text-red-500">{editColorForm.errors.name}</span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={editColorForm.values.name}
                                onChange={editColorForm.handleChange}
                                placeholder="Color name"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Stock</span>
                                {editColorForm.errors.stock && (
                                    <span className="text-sm text-red-500">{editColorForm.errors.stock}</span>
                                )}
                            </div>
                            <input
                                type="number"
                                min="0"
                                name="stock"
                                value={editColorForm.values.stock}
                                onChange={editColorForm.handleChange}
                                placeholder="Quantity"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-all focus:border-b-black"
                            />
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="block text-sm font-medium">Color thumb</span>
                                {editColorForm.errors.thumb && (
                                    <span className="text-sm text-red-500">{editColorForm.errors.thumb}</span>
                                )}
                            </div>
                            <div className="relative mt-2 w-fit [&:hover_label]:opacity-100">
                                <img
                                    src={color.thumb || 'https://placehold.co/600x400?text=Color+Thumb'}
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
                                        editColorForm.setFieldValue('thumb', e.currentTarget.files[0]);
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
                            {editColorForm.errors.images && (
                                <span className="text-sm text-red-500">{editColorForm.errors.images}</span>
                            )}
                        </div>
                        <div className="mt-2 ">
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {editColorForm.values.existedImages.map((img, index) => (
                                    <ImageProduct key={index} src={img} index={index} type="url" />
                                ))}
                                {editColorForm.values.images.map((img, index) => (
                                    <ImageProduct
                                        key={index}
                                        type="file"
                                        src={URL.createObjectURL(img)}
                                        index={index}
                                    />
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
                                                editColorForm.setFieldValue('images', [
                                                    ...editColorForm.values.images,
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
                                poster={color?.images?.length && color.images[0]}
                                ar
                                shadow-intensity="1"
                                camera-controls
                                auto-rotate
                                camera-orbit="0deg 90deg 5m"
                                touch-action="pan-y"
                                crossorigin="anonymous"
                                style={{ width: '100%', height: '100%', backgroudColor: '#fefefe' }}
                            >
                                <div
                                    slot="progress-bar"
                                    id="progress-bar"
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                                        <g stroke="black">
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9.5"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeWidth="3"
                                            >
                                                <animate
                                                    attributeName="stroke-dasharray"
                                                    calcMode="spline"
                                                    dur="1.5s"
                                                    keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                                                    keyTimes="0;0.475;0.95;1"
                                                    repeatCount="indefinite"
                                                    values="0 150;42 150;42 150;42 150"
                                                />
                                                <animate
                                                    attributeName="stroke-dashoffset"
                                                    calcMode="spline"
                                                    dur="1.5s"
                                                    keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
                                                    keyTimes="0;0.475;0.95;1"
                                                    repeatCount="indefinite"
                                                    values="0;-16;-59;-59"
                                                />
                                            </circle>
                                            <animateTransform
                                                attributeName="transform"
                                                dur="2s"
                                                repeatCount="indefinite"
                                                type="rotate"
                                                values="0 12 12;360 12 12"
                                            />
                                        </g>
                                    </svg>
                                </div>
                            </model-viewer>
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
                            editColorForm.setFieldValue('model3D', e.currentTarget.files[0]);
                            console.log(modelUrl);
                            setModel(modelUrl);
                        }}
                    />
                </Card>
            </div>
        </form>
    );
};

export default EditColor;
