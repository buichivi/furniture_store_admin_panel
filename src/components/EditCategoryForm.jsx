import apiRequest from '@/utils/apiRequest';
import { PencilIcon } from '@heroicons/react/24/solid';
import { Button, Card, Typography } from '@material-tailwind/react';
import { useFormik } from 'formik';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const EditCategoryForm = ({ category = {}, index = {}, setCategories = () => {} }) => {
    const previewCateImage = useRef();
    const { _id, name, imageUrl, description } = category;
    const token = localStorage.getItem('token');

    const editCateForm = useFormik({
        initialValues: {
            name: name,
            description: description,
            imageUrl: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
            imageUrl: Yup.mixed(),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            for (const key in values) {
                formData.append(key, values[key]);
            }
            toast.promise(
                apiRequest.put('/categories/' + _id, formData, { headers: { Authorization: 'Bearer ' + token } }),
                {
                    loading: 'Updating...',
                    success: (res) => {
                        setCategories((categories) => {
                            const newCategories = categories.map((cate) =>
                                cate._id === _id ? res.data.category : cate,
                            );
                            return newCategories;
                        });
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
        <Card className="absolute left-1/2 top-1/2 h-auto w-2/3 -translate-x-1/2 -translate-y-1/2 p-4">
            <h3 className="font-semibold capitalize">Edit category</h3>
            <form onSubmit={editCateForm.handleSubmit} className="mt-6">
                <label className="block">
                    <span className="text-sm">Name</span>
                    {editCateForm.errors.name && (
                        <Typography className="text-sm" color="red">
                            {editCateForm.errors.name}
                        </Typography>
                    )}
                    <input
                        name="name"
                        type="text"
                        value={editCateForm.values.name}
                        onChange={editCateForm.handleChange}
                        placeholder="Category name"
                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                    />
                </label>
                <label className="mt-4 block">
                    <span className="text-sm">Description</span>
                    {editCateForm.errors.description && (
                        <Typography className="text-sm" color="red">
                            {editCateForm.errors.description}
                        </Typography>
                    )}
                    <textarea
                        name="description"
                        spellCheck="false"
                        placeholder="Category name"
                        value={editCateForm.values.description}
                        onChange={editCateForm.handleChange}
                        className="w-full resize-y border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                        rows={4}
                    ></textarea>
                </label>
                <div className="mt-4">
                    <span className="mb-2 block text-sm">Image</span>
                    {editCateForm.errors.imageUrl && <Typography>{editCateForm.errors.imageUrl}</Typography>}
                    <div className="relative w-fit [&:hover_label]:opacity-100">
                        <img ref={previewCateImage} src={imageUrl} alt="" className="size-28 object-cover" />
                        <label
                            htmlFor={`edit-img-cate-${index}`}
                            className="absolute left-0 top-0 z-50 flex size-full cursor-pointer items-center justify-center bg-[#000000ab] opacity-0 transition-all"
                        >
                            <span className="mr-1 text-sm text-white">Edit image</span>
                            <PencilIcon className="size-4" color="white" />
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            id={`edit-img-cate-${index}`}
                            onChange={(e) => {
                                editCateForm.setFieldValue('imageUrl', e.currentTarget.files[0]);
                                previewCateImage.current.src = URL.createObjectURL(e.currentTarget.files[0]);
                                // setFile(e.currentTarget.files[0]);
                            }}
                            className="hidden"
                        />
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Button
                        color="blue"
                        variant="outlined"
                        type="submit"
                        onClick={(e) => {
                            e.currentTarget.nextElementSibling.children[0].click();
                        }}
                    >
                        Save
                    </Button>
                    <Button color="red" className="relative">
                        <label
                            htmlFor={`edit-cate-${index}`}
                            className="absolute left-0 top-0 size-full cursor-pointer"
                        ></label>
                        Close
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default EditCategoryForm;
