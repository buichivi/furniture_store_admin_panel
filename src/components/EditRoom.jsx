import apiRequest from '@/utils/apiRequest';
import { Avatar, Button, Card, IconButton, Tooltip } from '@material-tailwind/react';
import { Autocomplete, Box, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ArrowLeftIcon, BookmarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const EditRoom = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [room, setRoom] = useState();
    const [isAddInspiration, setIsAddInspiration] = useState(false);
    const [isEditInspiration, setIsEditInspiration] = useState(false);
    const [selectedInspiration, setSelectedInspiration] = useState();

    useEffect(() => {
        apiRequest
            .get('/rooms/' + slug)
            .then((res) => {
                setRoom(res.data?.room);
            })
            .catch((err) => console.log(err));
        apiRequest
            .get('/products')
            .then((res) => {
                const sortedProducts = res.data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setProducts(sortedProducts);
            })
            .catch((error) => console.log(error));
    }, []);

    const editRoomForm = useFormik({
        initialValues: {
            name: room?.name ?? '',
            description: room?.description ?? '',
            inspirations: room?.inspirations ?? [],
        },
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Name is required'),
            description: Yup.string().required('Description is required'),
            inspirations: Yup.array().required('Inspirations is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            console.log(values);
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Tooltip content="Back">
                        <IconButton>
                            <ArrowLeftIcon className="size-5" />
                        </IconButton>
                    </Tooltip>
                    <h3 className="text-lg font-bold text-black">Edit Room</h3>
                </div>
                <Tooltip content="Save">
                    <Button className="flex items-center gap-2">
                        <BookmarkIcon className="size-5" />
                        <span>Save</span>
                    </Button>
                </Tooltip>
            </div>
            <Card className="mt-4 p-4">
                <form onSubmit={editRoomForm.handleSubmit}>
                    <div className="mt-4">
                        <div className="w-full">
                            <div className="flex w-full items-center justify-between">
                                <span>Name</span>
                                {editRoomForm.errors.name && (
                                    <span className="text-sm text-red-500">{editRoomForm.errors.name}</span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={editRoomForm.values.name}
                                onChange={editRoomForm.handleChange}
                                placeholder="Name"
                                className="w-full border-b p-1 outline-none transition-all focus:border-black"
                            />
                        </div>
                        <div className="mt-4 w-full">
                            <div className="flex w-full items-center justify-between">
                                <span>Description</span>
                                {editRoomForm.errors.description && (
                                    <span className="text-sm text-red-500">{editRoomForm.errors.description}</span>
                                )}
                            </div>
                            <textarea
                                name="description"
                                value={editRoomForm.values.description}
                                onChange={editRoomForm.handleChange}
                                className="size-full resize-y border-b p-1 outline-none transition-all focus:border-black"
                                rows={5}
                            ></textarea>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between gap-10">
                                <div className="flex w-full items-center justify-between">
                                    <span>Inspirations</span>
                                    {editRoomForm.errors.inspirations && (
                                        <span className="text-sm text-red-500">{editRoomForm.errors.inspirations}</span>
                                    )}
                                </div>
                                <Button onClick={() => setIsAddInspiration(true)}>Add</Button>
                                <AddInspiration
                                    setIsAddInspiration={setIsAddInspiration}
                                    products={products}
                                    className={`${
                                        isAddInspiration
                                            ? 'pointer-events-auto opacity-100'
                                            : 'pointer-events-none opacity-0'
                                    } transition-all`}
                                    setRoom={setRoom}
                                />
                            </div>
                            <div
                                className="ag-theme-quartz mt-4" // applying the grid theme
                                style={{ height: 500 }} // the grid will fill the size of the parent container
                            >
                                <AgGridReact
                                    columnDefs={[
                                        {
                                            field: 'Image',
                                            cellRenderer: ({ data }) => {
                                                return <img src={data?.image} className="size-20" />;
                                            },
                                        },
                                        {
                                            field: 'Products',
                                            cellRenderer: ({ data }) => {
                                                return data?.items.map((item, index) => {
                                                    const product = products.find((prod) => prod?._id == item.product);
                                                    return (
                                                        <Tooltip
                                                            key={index}
                                                            content={product?.name}
                                                            className="capitalize"
                                                        >
                                                            <Avatar
                                                                src={product?.colors[0]?.images[0]}
                                                                size="sm"
                                                                variant="circular"
                                                                className={`cursor-pointer border shadow-sm ${
                                                                    index === 0 ? '' : '-ml-2.5'
                                                                }`}
                                                            />
                                                        </Tooltip>
                                                    );
                                                });
                                            },
                                        },
                                        {
                                            field: 'Action',
                                            cellRenderer: ({ data }) => {
                                                return (
                                                    <React.Fragment>
                                                        <IconButton
                                                            size="sm"
                                                            variant="text"
                                                            onClick={() => {
                                                                setIsEditInspiration(true);
                                                                setSelectedInspiration(data);
                                                            }}
                                                        >
                                                            <PencilIcon className="size-4" />
                                                        </IconButton>
                                                        <IconButton size="sm" variant="text" className="ml-4">
                                                            <TrashIcon className="size-4 transition-all hover:text-red-500" />
                                                        </IconButton>
                                                    </React.Fragment>
                                                );
                                            },
                                        },
                                    ]}
                                    rowData={editRoomForm.values.inspirations}
                                    defaultColDef={{
                                        flex: 1,
                                        autoHeight: true,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </Card>
            {isEditInspiration && (
                <EditInspiration
                    inspiration={selectedInspiration}
                    products={products}
                    setIsEditInspiration={setIsEditInspiration}
                    setRoom={setRoom}
                />
            )}
        </div>
    );
};

const AddInspiration = ({ setIsAddInspiration, products, className = '', setRoom }) => {
    const { slug } = useParams();
    const [isCreatingDot, setIsCreatingDot] = useState(false);
    const [isDeletingDot, setIsDeletingDot] = useState(false);
    const [dots, setDots] = useState([]);
    const [items, setItems] = useState([]);
    const { token } = useAuthStore();

    const inspirationForm = useFormik({
        initialValues: {
            image: '',
            items: [],
        },
        validationSchema: Yup.object().shape({
            image: Yup.mixed().required('Image is required'),
            items: Yup.array().required('Need at least 1 dot'),
        }),
        onSubmit: (values, { resetForm }) => {
            console.log(values);
            const formData = new FormData();
            for (const key in values) {
                if (key == 'items') {
                    formData.append('items', JSON.stringify(items));
                    continue;
                }
                formData.append(key, values[key]);
            }
            toast.promise(
                apiRequest.post('/rooms/' + slug, formData, { headers: { Authorization: 'Bearer ' + token } }),
                {
                    loading: 'Adding new inspiration...',
                    success: (res) => {
                        setRoom(res.data?.room);
                        resetForm();
                        setIsAddInspiration(false);
                        return res.data?.message;
                    },
                    error: (err) => err?.response?.data?.error || 'Somthing went wrong',
                },
            );
        },
    });

    useEffect(() => {
        inspirationForm.setFieldValue('items', items);
    }, [items]);

    return (
        <div className={`fixed left-0 top-0 z-50 flex size-full items-center justify-center ${className}`}>
            <div
                className="absolute left-0 top-0 size-full bg-[#00000083]"
                onClick={() => setIsAddInspiration(false)}
            ></div>
            <Card className="max-h-[90vh] overflow-y-auto p-4">
                <form onSubmit={inspirationForm.handleSubmit}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start gap-4">
                            <Button
                                disabled={!inspirationForm.values.image}
                                color="blue"
                                onClick={() => setIsCreatingDot(true)}
                            >
                                Create dot
                            </Button>
                            <Button
                                disabled={!inspirationForm.values.image}
                                variant="outlined"
                                color="red"
                                onClick={() => setIsDeletingDot(true)}
                            >
                                Delete dot
                            </Button>
                            {inspirationForm.values.image && (
                                <Button>
                                    <label htmlFor="uploadImage">Change image</label>
                                </Button>
                            )}
                        </div>
                        {(inspirationForm.errors.image || inspirationForm.errors.items) && (
                            <span className="text-sm text-red-500">
                                {inspirationForm.errors.image || inspirationForm.errors.items}
                            </span>
                        )}
                    </div>
                    <div
                        className={`relative mt-4 w-[600px] rounded-md ${isCreatingDot && 'cursor-crosshair'}`}
                        onMouseMove={(e) => {
                            const dot = e.target.closest(`[data-type^="dot-"]`);
                            if (dot && isDeletingDot) dot.style.cursor = 'not-allowed';
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.target.getBoundingClientRect();
                            const x = ((e.clientX - rect.left - 12) * 100) / rect.width;
                            const y = ((e.clientY - rect.top - 12) * 100) / rect.height;
                            if (isCreatingDot) {
                                const dot = React.createElement(Dot, {
                                    className: `absolute z-10`,
                                    x,
                                    y,
                                    type: `dot-${x}-${y}`,
                                    products,
                                    setItems,
                                    key: (Math.random() - 0.5) * x * y,
                                });
                                setDots((dots) => [...dots, dot]);
                                setIsCreatingDot(false);
                            }
                            if (isDeletingDot) {
                                const dot = e.target.closest(`[data-type^="dot-"]`);
                                const type = dot?.dataset?.type;
                                const dot_x = type?.split('-')[1];
                                const dot_y = type?.split('-')[2];
                                setItems((items) => items.filter((item) => item.x != dot_x && item.y != dot_y));
                                setDots((dots) => dots.filter((dot) => dot.props.type != type));
                                setIsDeletingDot(false);
                            }
                        }}
                    >
                        {!inspirationForm.values.image && (
                            <label
                                htmlFor="uploadImage"
                                className="flex h-[300px] w-full cursor-pointer flex-col items-center justify-center border bg-gray-300"
                            >
                                <CloudArrowUpIcon className="size-8" />
                                <span>Upload image</span>
                            </label>
                        )}
                        <img src="" alt="" className={`${!inspirationForm.values.image && 'hidden'}`} />
                        <input
                            id="uploadImage"
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.currentTarget.files[0];
                                inspirationForm.setFieldValue('image', file);
                                setDots([]);
                                setItems([]);
                                const img = e.currentTarget.previousElementSibling;
                                img.src = URL.createObjectURL(file);
                            }}
                        />
                        {dots}
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-10">
                        <Button type="submit" onClick={inspirationForm.handleSubmit}>
                            Add
                        </Button>
                        <Button color="red" onClick={() => setIsAddInspiration(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
const EditInspiration = ({ inspiration, setIsEditInspiration, products, className = '', setRoom }) => {
    const { slug } = useParams();
    const [isCreatingDot, setIsCreatingDot] = useState(false);
    const [isDeletingDot, setIsDeletingDot] = useState(false);
    const [items, setItems] = useState(inspiration?.items ?? []);
    const [dots, setDots] = useState(
        inspiration.items.map((item, index) => {
            const product = products.find((prod) => prod._id == item.product);
            return (
                <Dot
                    key={index}
                    x={item.x}
                    y={item.y}
                    products={products}
                    type={`dot-${item.x}-${item.y}`}
                    setItems={setItems}
                    product={product}
                />
            );
        }),
    );
    const { token } = useAuthStore();

    const inspirationForm = useFormik({
        initialValues: {
            image: inspiration?.image ?? '',
            items: inspiration?.items ?? [],
        },
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            image: Yup.mixed().required('Image is required'),
            items: Yup.array().required('Need at least 1 dot'),
        }),
        onSubmit: (values, { resetForm }) => {
            const formData = new FormData();
            for (const key in values) {
                if (key == 'items') {
                    formData.append('items', JSON.stringify(items));
                    continue;
                }
                formData.append(key, values[key]);
            }
            console.log(values);
        },
    });

    useEffect(() => {
        inspirationForm.setFieldValue('items', items);
    }, [items]);

    return (
        <div className={`fixed left-0 top-0 z-50 flex size-full items-center justify-center ${className}`}>
            <div
                className="absolute left-0 top-0 size-full bg-[#00000083]"
                onClick={() => setIsEditInspiration(false)}
            ></div>
            <Card className="max-h-[90vh] overflow-y-auto p-4">
                <form onSubmit={inspirationForm.handleSubmit}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start gap-4">
                            <Button
                                disabled={!inspirationForm.values.image}
                                color="blue"
                                onClick={() => setIsCreatingDot(true)}
                            >
                                Create dot
                            </Button>
                            <Button
                                disabled={!inspirationForm.values.image}
                                variant="outlined"
                                color="red"
                                onClick={() => setIsDeletingDot(true)}
                            >
                                Delete dot
                            </Button>
                            {inspirationForm.values.image && (
                                <Button>
                                    <label htmlFor="uploadImage">Change image</label>
                                </Button>
                            )}
                        </div>
                        {(inspirationForm.errors.image || inspirationForm.errors.items) && (
                            <span className="text-sm text-red-500">
                                {inspirationForm.errors.image || inspirationForm.errors.items}
                            </span>
                        )}
                    </div>
                    <div
                        className={`relative mt-4 w-[600px] rounded-md ${isCreatingDot && 'cursor-crosshair'}`}
                        onMouseMove={(e) => {
                            const dot = e.target.closest(`[data-type^="dot-"]`);
                            if (dot && isDeletingDot) dot.style.cursor = 'not-allowed';
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.target.getBoundingClientRect();
                            const x = ((e.clientX - rect.left - 12) * 100) / rect.width;
                            const y = ((e.clientY - rect.top - 12) * 100) / rect.height;
                            if (isCreatingDot) {
                                const dot = React.createElement(Dot, {
                                    x,
                                    y,
                                    type: `dot-${x}-${y}`,
                                    products,
                                    setItems,
                                    key: (Math.random() - 0.5) * x * y,
                                });
                                setDots((dots) => [...dots, dot]);
                                setIsCreatingDot(false);
                            }
                            if (isDeletingDot) {
                                const dot = e.target.closest(`[data-type^="dot-"]`);
                                const type = dot?.dataset?.type;
                                const dot_x = type?.split('-')[1];
                                const dot_y = type?.split('-')[2];
                                setItems((items) => items.filter((item) => item.x != dot_x && item.y != dot_y));
                                setDots((dots) => dots.filter((dot) => dot.props.type != type));
                                setIsDeletingDot(false);
                            }
                        }}
                    >
                        {!inspirationForm.values.image && (
                            <label
                                htmlFor="uploadImage"
                                className="flex h-[300px] w-full cursor-pointer flex-col items-center justify-center border bg-gray-300"
                            >
                                <CloudArrowUpIcon className="size-8" />
                                <span>Upload image</span>
                            </label>
                        )}
                        <img
                            src={inspiration?.image ?? ''}
                            alt=""
                            className={`${!inspirationForm.values.image && 'hidden'}`}
                        />
                        <input
                            id="uploadImage"
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.currentTarget.files[0];
                                inspirationForm.setFieldValue('image', file);
                                setDots([]);
                                setItems([]);
                                const img = e.currentTarget.previousElementSibling;
                                img.src = URL.createObjectURL(file);
                            }}
                        />
                        {dots}
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-10">
                        <Button type="submit" onClick={inspirationForm.handleSubmit}>
                            Save
                        </Button>
                        <Button color="red" onClick={() => setIsEditInspiration(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Dot = ({ x = 0, y = 0, type = '', products = [], setItems, product = {} }) => {
    const [isSelectingProduct, setIsSelectingProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(product);

    return (
        <div
            data-type={type}
            className={`dot absolute z-10 cursor-pointer`}
            style={{ left: x + '%', top: y + '%' }}
            onBlur={() => {
                setIsSelectingProduct(false);
            }}
        >
            <span
                className="relative flex size-6 items-center justify-center"
                onClick={(e) => {
                    e.preventDefault();
                    const ip = e.currentTarget.nextElementSibling;
                    ip.checked = !ip.checked;
                    setIsSelectingProduct(!isSelectingProduct);
                }}
            >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fff] opacity-50"></span>
                <span className="child relative inline-flex size-4 shrink-0 rounded-full bg-white"></span>
            </span>

            <div
                className={`absolute -left-2 -top-[calc(100%_+_40px)] size-auto min-w-[150px] overflow-hidden rounded-md bg-white p-2 transition-all duration-500 before:absolute before:left-4 before:top-full before:z-10 before:border-[6px] before:border-white before:border-b-transparent before:border-l-transparent before:border-r-transparent before:content-[''] after:absolute after:left-2 after:top-full  after:inline-block after:h-72 after:w-full after:bg-transparent after:content-[''] ${
                    isSelectingProduct ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                }`}
            >
                <Autocomplete
                    className="bg-white text-black *:![scrollbar-width:thin]"
                    sx={{ width: 300 }}
                    size="small"
                    options={products}
                    value={selectedProduct}
                    autoHighlight
                    getOptionLabel={(option) => option.name}
                    onChange={(e, value) => {
                        setSelectedProduct(value);
                        setItems((items) => {
                            const existedItem = items.find((item) => item.x == x && item.y == y);
                            console.log(existedItem);
                            if (existedItem) {
                                return items.map((item) =>
                                    item.product == existedItem.product ? { ...existedItem, product: value._id } : item,
                                );
                            }
                            return [...items, { x, y, product: value._id }];
                        });
                    }}
                    renderOption={(props, option) => {
                        return (
                            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                <img loading="lazy" width="20" src={option?.colors[0]?.images[0]} alt="" />
                                <span className="line-clamp-2">{option.name}</span>
                            </Box>
                        );
                    }}
                    renderInput={(params) => {
                        return (
                            <TextField
                                {...params}
                                label="Choose a product"
                                inputProps={{
                                    ...params.inputProps,
                                    autoComplete: 'new-password', // disable autocomplete and autofill
                                }}
                            />
                        );
                    }}
                />
            </div>
        </div>
    );
};

export default EditRoom;
