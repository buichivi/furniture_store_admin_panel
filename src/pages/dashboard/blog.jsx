import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { Button } from '@material-tailwind/react';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const { token } = useAuthStore();

    useEffect(() => {
        apiRequest
            .get('/blogs', { headers: { Authorization: 'Bearer ' + token } })
            .then((res) => setBlogs(res.data.blogs))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className="mt-4">
            <Link to="/dashboard/blog/create">
                <Button>Add blog</Button>
            </Link>
            <AgGridReact rowData={blogs} columnDefs={[]} />
        </div>
    );
};

export { Blog };
