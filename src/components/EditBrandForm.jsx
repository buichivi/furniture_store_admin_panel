import apiRequest from '@/utils/apiRequest';
import { Button, Card, Typography } from '@material-tailwind/react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const EditBrandForm = ({ brand = {}, index = {}, setBrands = () => {} }) => {
    const { _id, name, description } = brand;
    const token = localStorage.getItem('token');

    // Handle edit category

    const editBrandForm = useFormik({
        initialValues: {
            name: name,
            description: description,
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
        }),
        onSubmit: (values) => {
            toast.promise(apiRequest.put('/brands/' + _id, values, { headers: { Authorization: 'Bearer ' + token } }), {
                loading: 'Updating...',
                success: (res) => {
                    setBrands((brands) => {
                        const newBrand = brands.map((brand) => (brand._id === _id ? res.data.brand : brand));
                        return newBrand;
                    });
                    return res.data.message;
                },
                error: (err) => {
                    console.log(err);
                    return err.response.data.error || 'Something went wrong';
                },
            });
        },
    });
    return (
        <Card className="absolute left-1/2 top-1/2 h-auto w-2/3 -translate-x-1/2 -translate-y-1/2 p-4">
            <h3 className="font-semibold capitalize">Edit category</h3>
            <form onSubmit={editBrandForm.handleSubmit} className="mt-6">
                <label className="block">
                    <span className="text-sm">Name</span>
                    {editBrandForm.errors.name && (
                        <Typography className="text-sm" color="red">
                            {editBrandForm.errors.name}
                        </Typography>
                    )}
                    <input
                        name="name"
                        type="text"
                        value={editBrandForm.values.name}
                        onChange={editBrandForm.handleChange}
                        placeholder="Category name"
                        className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                    />
                </label>
                <label className="mt-4 block">
                    <span className="text-sm">Description</span>
                    {editBrandForm.errors.description && (
                        <Typography className="text-sm" color="red">
                            {editBrandForm.errors.description}
                        </Typography>
                    )}
                    <textarea
                        name="description"
                        spellCheck="false"
                        placeholder="Category name"
                        value={editBrandForm.values.description}
                        onChange={editBrandForm.handleChange}
                        className="w-full resize-y border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                        rows={4}
                    ></textarea>
                </label>
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
                            htmlFor={`edit-brand-${index}`}
                            className="absolute left-0 top-0 size-full cursor-pointer"
                        ></label>
                        Close
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default EditBrandForm;
