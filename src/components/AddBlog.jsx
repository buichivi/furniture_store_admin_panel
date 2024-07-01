import useAuthStore from '@/stores/authStore';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Tooltip } from '@material-tailwind/react';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

import { CKEditor } from '@ckeditor/ckeditor5-react';
// import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import 'ckeditor5/ckeditor5.css';

const AddBlog = () => {
    const { currentUser, token } = useAuthStore();

    const blogForm = useFormik({
        initialValues: {
            title: '',
            thumb: '',
            post: '',
            tags: '',
            author: currentUser?._id,
        },
        validationSchema: Yup.object().shape({
            title: Yup.string().required('Title is required'),
            thumb: Yup.mixed().required('Thumb image is required'),
            post: Yup.string().required('Post is required'),
            tags: Yup.array().min(1, 'Need at least 1 tag').required('Tags is required'),
        }),
        onSubmit: (values) => {
            console.log(values);
        },
    });

    return (
        <div className="mt-4">
            <Link to="/dashboard/blog">
                <Tooltip content="Back">
                    <IconButton>
                        <ArrowLeftIcon className="size-5" />
                    </IconButton>
                </Tooltip>
            </Link>
            <Card className="mt-4 p-4">
                <h4 className="text-xl font-bold capitalize text-black">Add blog</h4>
                <form onSubmit={blogForm.handleSubmit} className="w-full">
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            <span>Title</span>
                            {blogForm.errors.title && <span className="text-red-500">{blogForm.errors.title}</span>}
                        </div>
                        <input
                            type="text"
                            placeholder="Title"
                            className="max-w-1/2 mt-1 min-w-[300px] border-b p-2 outline-none transition-colors focus:border-b-black"
                        />
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            <span>Post</span>
                            {blogForm.errors.post && <span className="text-red-500">{blogForm.errors.post}</span>}
                        </div>
                        <CKEditor editor={ClassicEditor} config={{}} />
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddBlog;
