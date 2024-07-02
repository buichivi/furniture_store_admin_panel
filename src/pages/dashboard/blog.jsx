import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, IconButton, Tooltip } from '@material-tailwind/react';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const { token } = useAuthStore();

    useEffect(() => {
        apiRequest
            .get('/blogs', { headers: { Authorization: 'Bearer ' + token } })
            .then((res) => setBlogs(res.data?.blogs))
            .catch((err) => console.log(err));
    }, []);

    const handleDeleteBlog = (id) => {
        toast.promise(
            apiRequest.delete('/blogs/' + id, {
                headers: { Authorization: 'Bearer ' + token },
            }),
            {
                loading: 'Deleting...',
                success: (res) => {
                    setBlogs((blogs) => blogs.filter((blog) => blog._id != id));
                    return res.data?.message;
                },
                error: (err) => err?.response?.data?.error,
            },
        );
    };

    return (
        <div className="mt-4">
            <Link to="/dashboard/blog/create">
                <Button>Add blog</Button>
            </Link>
            <div className="mt-4 h-[80vh]">
                <div className="ag-theme-quartz size-full">
                    <AgGridReact
                        // ref={tableGrid}
                        rowData={blogs}
                        columnDefs={[
                            {
                                field: 'thumb',
                                cellRenderer: ({ data }) => {
                                    return <img src={data.thumb} className="w-28" />;
                                },
                            },
                            {
                                field: 'title',
                            },
                            {
                                field: 'author',
                                valueFormatter: ({ data }) =>
                                    data.author.firstName + ' ' + data.author.lastName,
                            },
                            {
                                field: 'tags',
                                valueFormatter: ({ data }) => {
                                    return data.tags.map((tag) => tag.name).join(', ');
                                },
                            },
                            {
                                field: 'action',
                                cellRenderer: ({ data }) => {
                                    return (
                                        <div>
                                            <Link
                                                to={`/dashboard/blog/edit/${data.slug}`}
                                            >
                                                <Tooltip content="Edit Blog">
                                                    <IconButton variant="text">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Link>
                                            <span
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Are you sure to delete this blog?',
                                                        )
                                                    ) {
                                                        handleDeleteBlog(data?._id);
                                                    }
                                                }}
                                            >
                                                <Tooltip content="Delete Blog">
                                                    <IconButton
                                                        variant="text"
                                                        className="ml-2 hover:text-red-600"
                                                    >
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
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 15, 20, 25]}
                        className="pb-5"
                        defaultColDef={{
                            flex: 1,
                            autoHeight: true,
                            cellClass: 'py-1',
                        }}
                        onGridReady={(e) => {
                            console.log(e);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export { Blog };
