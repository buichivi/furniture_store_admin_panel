import { useRef } from 'react';
import useAuthStore from '@/stores/authStore';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import apiRequest from '@/utils/apiRequest';
import { Button, Card, Typography } from '@material-tailwind/react';
import { PencilIcon } from '@heroicons/react/24/solid';

const EditSlider = ({ slider, setSliders, setIsEdit }) => {
    const previewCateImage = useRef();
    const { token } = useAuthStore();

    const sliderForm = useFormik({
        initialValues: {
            title: slider?.title ?? '',
            heading: slider?.heading ?? '',
            description: slider?.description ?? '',
            link: slider?.link ?? '',
            image: slider?.image ?? '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            title: Yup.string().required('This field is required'),
            heading: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
            link: Yup.string().required('This field is required'),
            image: Yup.mixed().required('This field is required'),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            console.log('HELLO');
            toast.promise(
                apiRequest.put('/sliders/' + slider?._id, formData, { headers: { Authorization: 'Bearer ' + token } }),
                {
                    loading: 'Editing...',
                    success: (res) => {
                        setIsEdit(false);
                        setSliders((sliders) =>
                            sliders.map((sld) => (sld._id == slider?._id ? res?.data?.slider : sld)),
                        );
                        return res?.data?.message;
                    },
                    error: (err) => err?.response?.data?.error,
                },
            );
        },
    });
    return (
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
                            src={slider?.image || 'https://placehold.co/600x400?text=Select%20image'}
                            alt=""
                            className="size-28 object-contain"
                        />
                        <label
                            htmlFor={`edit-slider-image-${slider?._id}`}
                            className="absolute left-0 top-0 z-50 flex size-full cursor-pointer items-center justify-center bg-[#000000ab] opacity-0 transition-all"
                        >
                            <span className="mr-1 text-sm text-white">Select image</span>
                            <PencilIcon className="size-4" color="white" />
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            id={`edit-slider-image-${slider?._id}`}
                            onChange={(e) => {
                                console.log(URL.createObjectURL(e.currentTarget.files[0]));
                                sliderForm.setFieldValue('image', e.currentTarget.files[0]);
                                previewCateImage.current.src = URL.createObjectURL(e.currentTarget.files[0]);
                            }}
                            className="hidden"
                        />
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Button variant="outlined" type="submit">
                        Save
                    </Button>
                    <Button color="red" className="relative" onClick={() => setIsEdit(false)}>
                        Close
                    </Button>
                </div>
            </form>
        </Card>
    );
};
export default EditSlider;
