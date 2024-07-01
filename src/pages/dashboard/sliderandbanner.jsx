import React from 'react';
import apiRequest from '@/utils/apiRequest';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Input, Switch, Tooltip, Typography } from '@material-tailwind/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '@/stores/authStore';
import { EditSliderForm } from '@/components';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component

const SliderAndBanner = () => {
    const previewCateImage = useRef();
    const [sliders, setSliders] = useState([]);
    const inputOpen = useRef();
    const { token } = useAuthStore();
    const [sliderEdit, setSliderEdit] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const tableGrid = useRef();

    useEffect(() => {
        apiRequest
            .get('/sliders', { headers: { Authorization: 'Bearer ' + token } })
            .then((res) => setSliders(res.data?.sliders))
            .catch((err) => console.log(err));
    }, []);

    const sliderForm = useFormik({
        initialValues: {
            title: '',
            heading: '',
            description: '',
            link: '',
            image: '',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('This field is required'),
            heading: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
            link: Yup.string().required('This field is required'),
            image: Yup.mixed().required('This field is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            toast.promise(apiRequest.post('/sliders', formData, { headers: { Authorization: 'Bearer ' + token } }), {
                loading: 'Creating...',
                success: (res) => {
                    resetForm();
                    inputOpen.current.click();
                    previewCateImage.current.src = 'https://placehold.co/600x400?text=Select%20image';
                    setSliders((sliders) => [...sliders, res?.data?.slider]);
                    return res?.data?.message;
                },
                error: (err) => err?.response?.data?.error,
            });
        },
    });

    const handleActiveSlider = (e, id) => {
        toast.promise(
            apiRequest.patch(
                '/sliders/' + id,
                { active: e.target.checked },
                { headers: { Authorization: 'Bearer ' + token } },
            ),
            {
                loading: 'Updating...',
                success: (res) => {
                    return res.data?.message;
                },
                error: (err) => err?.response?.data?.error,
            },
        );
    };

    const handleDeleteSlider = (id) => {
        toast.promise(apiRequest.delete('/sliders/' + id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
                setSliders((sliders) => sliders.filter((slider) => slider._id != id));
                return res.data?.message;
            },
            error: (err) => err?.response?.data?.error,
        });
    };

    return (
        <div className="py-6">
            <div className="mb-4 flex w-full items-center justify-between">
                <Button
                    variant="gradient"
                    onClick={(e) => {
                        e.currentTarget.nextElementSibling.checked = !e.currentTarget.nextElementSibling.checked;
                    }}
                >
                    Add slider
                </Button>
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
            <input type="checkbox" ref={inputOpen} id="add-cate" className="hidden [&:checked+div]:flex" />
            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                <label htmlFor="add-cate" className="absolute left-0 top-0 size-full bg-[#000b]"></label>
                <Card className="absolute left-1/2 top-1/2 h-auto w-2/3 -translate-x-1/2 -translate-y-1/2 p-4">
                    <h3 className="font-semibold capitalize">Add slider</h3>
                    <form onSubmit={sliderForm.handleSubmit} className="mt-6">
                        <div className="flex items-start gap-10">
                            <label className="block flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Title</span>
                                    {sliderForm.errors.title && (
                                        <Typography className="text-sm" color="red">
                                            {sliderForm.errors.title}
                                        </Typography>
                                    )}
                                </div>
                                <input
                                    name="title"
                                    type="text"
                                    value={sliderForm.values.title}
                                    onChange={sliderForm.handleChange}
                                    placeholder="Category name"
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                                />
                            </label>
                            <label className="block flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Link</span>
                                    {sliderForm.errors.link && (
                                        <Typography className="text-sm" color="red">
                                            {sliderForm.errors.link}
                                        </Typography>
                                    )}
                                </div>
                                <input
                                    name="link"
                                    type="text"
                                    value={sliderForm.values.link}
                                    onChange={sliderForm.handleChange}
                                    placeholder="Link"
                                    className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                                />
                            </label>
                        </div>
                        <label className="mt-4 block flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Heading</span>
                                {sliderForm.errors.heading && (
                                    <Typography className="text-sm" color="red">
                                        {sliderForm.errors.heading}
                                    </Typography>
                                )}
                            </div>
                            <input
                                name="heading"
                                type="text"
                                value={sliderForm.values.heading}
                                onChange={sliderForm.handleChange}
                                placeholder="Heading"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                            />
                        </label>
                        <label className="mt-4 block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Desciption</span>
                                {sliderForm.errors.description && (
                                    <Typography className="text-sm" color="red">
                                        {sliderForm.errors.description}
                                    </Typography>
                                )}
                            </div>
                            <textarea
                                name="description"
                                spellCheck="false"
                                placeholder="Descrition"
                                value={sliderForm.values.description}
                                onChange={sliderForm.handleChange}
                                className="w-full resize-y border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                                rows={4}
                            ></textarea>
                        </label>
                        <div className="mt-4">
                            <span className="mb-2 block text-sm">Image</span>
                            {sliderForm.errors.image && (
                                <Typography className="text-sm" color="red">
                                    {sliderForm.errors.image}
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
                                    htmlFor="add-slider-image"
                                    className="absolute left-0 top-0 z-50 flex size-full cursor-pointer items-center justify-center bg-[#000000ab] opacity-0 transition-all"
                                >
                                    <span className="mr-1 text-sm text-white">Select image</span>
                                    <PencilIcon className="size-4" color="white" />
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="add-slider-image"
                                    onChange={(e) => {
                                        sliderForm.setFieldValue('image', e.target.files[0]);
                                        previewCateImage.current.src = URL.createObjectURL(e.currentTarget.files[0]);
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
                                    onClick={(e) => e.stopPropagation()}
                                ></label>
                                Close
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <div
                className="ag-theme-quartz" // applying the grid theme
                style={{ height: 500 }} // the grid will fill the size of the parent container
            >
                <AgGridReact
                    ref={tableGrid}
                    rowData={sliders}
                    columnDefs={[
                        {
                            field: 'image',
                            cellRenderer: ({ data }) => {
                                return (
                                    <div className="size-20">
                                        <img src={data.image} alt="" className="w-full object-cover" />
                                    </div>
                                );
                            },
                            autoHeight: true,
                        },
                        {
                            field: 'title',
                            flex: 1,
                        },
                        { field: 'heading', flex: 1 },
                        {
                            width: '100px',
                            field: 'active',
                            cellRenderer: ({ data }) => {
                                return (
                                    <Switch
                                        color="green"
                                        defaultChecked={data.active}
                                        value={data.active}
                                        onChange={(e) => handleActiveSlider(e, data._id)}
                                    />
                                );
                            },
                        },
                        {
                            width: '150px',
                            field: 'action',
                            cellRenderer: ({ data: slider }) => {
                                return (
                                    <div className="flex items-center">
                                        <span
                                            className="inline-block"
                                            onClick={() => {
                                                setSliderEdit(slider);
                                                setIsEdit(true);
                                            }}
                                        >
                                            <Tooltip content="Edit Category">
                                                <IconButton variant="text">
                                                    <PencilIcon className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                        <span
                                            onClick={() => {
                                                if (confirm('Are you sure to delete this slider?')) {
                                                    handleDeleteSlider(slider?._id);
                                                }
                                            }}
                                        >
                                            <Tooltip content="Delete Category">
                                                <IconButton variant="text" className="ml-2 hover:text-red-600">
                                                    <TrashIcon className="h-4 w-4 " />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                    </div>
                                );
                            },
                        },
                    ]}
                    pagination={true}
                    paginationPageSize={5}
                    paginationPageSizeSelector={[5, 10, 15, 20]}
                    className="pb-5"
                    defaultColDef={{
                        cellClass: '!flex items-center',
                    }}
                />
            </div>
            {isEdit && <EditSlider slider={sliderEdit} setSliders={setSliders} setIsEdit={setIsEdit} />}
        </div>
    );
};

const EditSlider = ({ slider, setSliders, setIsEdit }) => {
    return (
        <div className="fixed left-0 top-0 z-50 h-full w-full">
            <span onClick={() => setIsEdit(false)} className="block h-full w-full bg-[#000000a1]"></span>
            <EditSliderForm slider={slider} setSliders={setSliders} setIsEdit={setIsEdit} />
        </div>
    );
};

export { SliderAndBanner };
