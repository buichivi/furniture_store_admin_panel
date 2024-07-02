import useAuthStore from '@/stores/authStore';
import { ArrowLeftIcon, BookmarkIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Tooltip } from '@material-tailwind/react';
import { useFormik } from 'formik';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { CKEditor } from '@/components';
import { useEffect, useState } from 'react';
import apiRequest from '@/utils/apiRequest';
import { Autocomplete, TextField } from '@mui/material';
import toast from 'react-hot-toast';

const AddBlog = () => {
    const { token } = useAuthStore();
    const { slug } = useParams();
    const [tags, setTags] = useState([]);
    const [blog, setBlog] = useState({});
    const [currentImages, setCurrentImages] = useState([]);
    const [allImages, setAllImages] = useState([]);
    const [deleteImages, setDeleteImages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (slug) {
            apiRequest
                .get('/blogs/' + slug, {
                    headers: { Authorization: 'Bearer ' + token },
                })
                .then((res) => setBlog(res.data?.blog))
                .catch((err) => console.log(err));
        }
    }, [slug]);

    useEffect(() => {
        apiRequest
            .get('/tags')
            .then((res) => {
                setTags(res.data.tags);
            })
            .catch((err) => console.log(err));
    }, []);

    const blogForm = useFormik({
        initialValues: {
            title: slug ? blog?.title : '',
            thumb: slug ? blog?.thumb : '',
            post: slug ? blog?.post : '',
            tags: slug ? blog?.tags : '',
            description: slug ? blog?.description : '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            thumb: Yup.mixed().required('Thumb image is required'),
            post: Yup.string().required('Post is required'),
            tags: Yup.array().min(1, 'Need at least 1 tag').required('Tags is required'),
            description: Yup.string().required('Description is required'),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            for (const key in values) {
                if (key == 'tags') {
                    formData.append(
                        'tags',
                        JSON.stringify(values.tags.map((tag) => tag._id)),
                    );
                    continue;
                }
                formData.append(key, values[key]);
            }
            const set_1 = new Set(currentImages);
            const set_2 = new Set(allImages);
            const difference = [...set_2].filter((element) => !set_1.has(element));
            if (!slug) {
                toast.promise(
                    apiRequest.post('/blogs', formData, {
                        headers: { Authorization: 'Bearer ' + token },
                    }),
                    {
                        loading: 'Creating...',
                        success: (res) => {
                            if (difference.length) {
                                apiRequest
                                    .delete('/blogs/images', {
                                        headers: { Authorization: 'Bearer ' + token },
                                        data: {
                                            images: difference,
                                        },
                                    })
                                    .then((res) => console.log(res))
                                    .catch((err) => console.log(err));
                            }
                            navigate('/dashboard/blog');
                            return res.data?.message;
                        },
                        error: (err) => err?.response?.data?.error,
                    },
                );
            } else {
                if (formData.get('post') == blog?.post) {
                    formData.delete('post');
                }
                toast.promise(
                    apiRequest.put('/blogs/' + slug, formData, {
                        headers: { Authorization: 'Bearer ' + token },
                    }),
                    {
                        loading: 'Editing...',
                        success: (res) => {
                            if (difference.length) {
                                apiRequest
                                    .delete('/blogs/images', {
                                        headers: { Authorization: 'Bearer ' + token },
                                        data: {
                                            images: difference,
                                        },
                                    })
                                    .then((res) => console.log(res))
                                    .catch((err) => console.log(err));
                            }
                            navigate('/dashboard/blog');
                            return res.data?.message;
                        },
                        error: (err) => err?.response?.data?.error,
                    },
                );
            }
        },
    });

    return (
        <form onSubmit={blogForm.handleSubmit} className="mt-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard/blog">
                        <Tooltip content="Back">
                            <IconButton>
                                <ArrowLeftIcon className="size-5" />
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <h4 className="text-xl font-bold capitalize text-black">
                        {slug ? 'Edit blog' : 'Add blog'}
                    </h4>
                </div>
                <Tooltip content="Save">
                    <Button type="submit" className="flex items-center gap-2">
                        <BookmarkIcon className="size-5" />
                        <span>Save</span>
                    </Button>
                </Tooltip>
            </div>
            <Card className="mt-4 p-4">
                <div className="w-full">
                    <div className="flex items-start justify-between gap-10">
                        <label className="mt-4 inline-block flex-1">
                            <div className="flex items-center justify-between">
                                <span>Title</span>
                                {blogForm.errors.title && (
                                    <span className="text-red-500">
                                        {blogForm.errors.title}
                                    </span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="title"
                                placeholder="Title"
                                value={blogForm.values.title}
                                onChange={blogForm.handleChange}
                                className="mt-1 w-full min-w-[300px] border-b p-2 outline-none transition-colors focus:border-b-black"
                            />
                        </label>
                        <label className="mt-4 inline-block flex-1">
                            <div className="flex items-center justify-between">
                                <span>Tags</span>
                                {blogForm.errors.tags && (
                                    <span className="text-red-500">
                                        {blogForm.errors.tags}
                                    </span>
                                )}
                            </div>
                            {tags.length > 0 && (
                                <Autocomplete
                                    fullWidth
                                    multiple
                                    size="small"
                                    value={blogForm.values.tags || []}
                                    options={tags}
                                    getOptionLabel={(option) => option.name}
                                    isOptionEqualToValue={(op, val) => op._id == val._id}
                                    disableCloseOnSelect
                                    onChange={(_, value) => {
                                        blogForm.setFieldValue('tags', value);
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
                        </label>
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-10">
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span>Thumb</span>
                                {blogForm.errors.thumb && (
                                    <span className="text-red-500">
                                        {blogForm.errors.thumb}
                                    </span>
                                )}
                            </div>
                            <input
                                type="file"
                                id="blog-thumb"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const imgPreview =
                                        e.currentTarget.nextElementSibling.children[1];
                                    if (e.currentTarget.files.length) {
                                        blogForm.setFieldValue(
                                            'thumb',
                                            e.currentTarget.files[0],
                                        );
                                        imgPreview.src = URL.createObjectURL(
                                            e.currentTarget.files[0],
                                        );
                                    }
                                }}
                            />
                            <div
                                className="relative mt-2 w-full [&:hover>label]:opacity-100"
                                style={{ aspectRatio: 1 / 0.5 }}
                            >
                                <label
                                    htmlFor="blog-thumb"
                                    className="absolute left-0 top-0 flex size-full cursor-pointer items-center justify-center bg-[#0000008a] text-white opacity-0 transition-all"
                                >
                                    <span>Upload</span>
                                </label>
                                <img
                                    src={
                                        blog?.thumb ||
                                        'https://placehold.co/600x400?font=roboto&text=Thumb'
                                    }
                                    alt=""
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="mt-4">
                                <div className="flex items-center justify-between">
                                    <span>Description</span>
                                    {blogForm.errors.description && (
                                        <span className="text-red-500">
                                            {blogForm.errors.description}
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    type="text"
                                    name="description"
                                    placeholder="Description"
                                    value={blogForm.values.description}
                                    onChange={blogForm.handleChange}
                                    rows={10}
                                    className="mt-1 h-full w-full border-b p-2 outline-none transition-colors focus:border-b-black"
                                ></textarea>
                            </label>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="mb-4 flex items-center justify-between">
                            <span>Post</span>
                            {blogForm.errors.post && (
                                <span className="text-red-500">
                                    {blogForm.errors.post}
                                </span>
                            )}
                        </div>
                        <div className="">
                            <CKEditor
                                initialValue={blog?.post}
                                onChange={({ content, listSrc, imageUrlList }) => {
                                    if (content) {
                                        setCurrentImages(listSrc);
                                        setAllImages(imageUrlList);
                                        blogForm.setFieldValue('post', content);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </form>
    );
};

export default AddBlog;
