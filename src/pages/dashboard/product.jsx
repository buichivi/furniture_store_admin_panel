import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import React from '@heroicons/react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { PencilIcon } from '@heroicons/react/24/solid';
import { Avatar, Button, Card, IconButton, Switch, Tooltip } from '@material-tailwind/react';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const handleActiveProduct = (e, id) => {
    toast.promise(
        apiRequest.patch(
            '/products/' + id,
            { active: e.target.checked },
            { headers: { Authorization: 'Bearer ' + token } },
        ),
        {
            loading: 'Updating...',
            success: (res) => {
                return res.data.message;
            },
            error: (err) => {
                return err.response.data.error || 'Something went wrong';
            },
        },
    );
};

const handleDeleteProduct = (e, id) => {
    toast.promise(apiRequest.delete('/products/' + id, { headers: { Authorization: 'Bearer ' + token } }), {
        loading: 'Deleting...',
        success: (res) => {
            setProducts((products) => products.filter((prod) => prod._id != id));

            // ! Handle when delete a product close modal
            return res.data.message;
        },
        error: (err) => {
            return err.response.data.error || 'Something went wrong';
        },
    });
};

const onRowDoubleClicked = (event, navigate) => {
    navigate(`/dashboard/product/edit/${event.data?.slug}`);
};

export function Product() {
    const [products, setProducts] = useState([]);
    const { token } = useAuthStore();
    const [deleteProduct, setDeteleProduct] = useState({});
    const [isDelete, setIsDelete] = useState(false);
    const tableGrid = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        apiRequest
            .get('/products')
            .then((res) => {
                console.log(res.data.products);
                setProducts(res.data.products);
            })
            .catch((error) => console.log(error));
    }, []);

    return (
        <div className="py-6">
            <div className="flex items-center justify-between">
                <Link to={`/dashboard/product/create`}>
                    <Button variant="gradient">Add product</Button>
                </Link>
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
            <div
                className="ag-theme-quartz mt-4" // applying the grid theme
                style={{ height: 850 }} // the grid will fill the size of the parent container
            >
                <AgGridReact
                    ref={tableGrid}
                    rowData={products}
                    columnDefs={[
                        {
                            field: 'name',
                            minWidth: 250,
                        },
                        {
                            field: 'image',
                            minWidth: 120,
                            cellRenderer: ({ data }) => {
                                return (
                                    <div className="size-20">
                                        <img
                                            src={data?.colors[0]?.images[0]}
                                            alt={name}
                                            className="size-full object-contain"
                                        />
                                    </div>
                                );
                            },
                        },
                        {
                            field: 'colors',
                            cellRenderer: ({ data }) => {
                                return (
                                    <>
                                        {data?.colors.map(({ _id, name, thumb }, key) => (
                                            <Tooltip key={key} content={name} className="capitalize">
                                                <Avatar
                                                    src={thumb}
                                                    size="xs"
                                                    variant="circular"
                                                    className={`cursor-pointer ${key === 0 ? '' : '-ml-2.5'}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/dashboard/product/${data.slug}/edit-color/${_id}`);
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </>
                                );
                            },
                            flex: 1.5,
                        },
                        { field: 'category', valueFormatter: ({ data }) => data.category.name },
                        { field: 'price', valueFormatter: ({ data }) => '$' + data.price },
                        { field: 'salePrice', valueFormatter: ({ data }) => '$' + data.salePrice },
                        {
                            field: 'active',
                            cellRenderer: ({ data }) => {
                                return (
                                    <Switch
                                        defaultChecked={data.active}
                                        onChange={(e) => handleActiveProduct(e, data._id)}
                                        color="green"
                                        name="active"
                                        className="flex-1"
                                    />
                                );
                            },
                        },
                        {
                            field: 'action',
                            cellRenderer: ({ data: product }) => {
                                return (
                                    <div className="flex items-center gap-2">
                                        <Link to={`/dashboard/product/edit/${product?.slug}`}>
                                            <Tooltip content="Edit product">
                                                <IconButton variant="text">
                                                    <PencilIcon className="size-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </Link>
                                        <Tooltip content="Delete product">
                                            <IconButton
                                                variant="text"
                                                className="hover:text-red-500"
                                                onClick={() => {
                                                    setIsDelete(true);
                                                    setDeteleProduct(product);
                                                }}
                                            >
                                                <TrashIcon className="size-4" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                );
                            },
                            flex: 1.3,
                        },
                    ]}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 15, 20, 25]}
                    className="pb-5"
                    defaultColDef={{
                        autoHeight: true,
                        flex: 1,
                    }}
                    rowClass="cursor-pointer"
                    onRowDoubleClicked={(e) => onRowDoubleClicked(e, navigate)}
                />
            </div>
            {isDelete && (
                <div className="fixed left-0 top-0 z-50 flex size-full items-center justify-center">
                    <span
                        className="absolute left-0 top-0 block size-full bg-[#000000a8]"
                        onClick={() => setIsDelete(false)}
                    ></span>
                    <Card className="min-w-[50%] p-4">
                        <h3 className="font-medium text-black">Delete product</h3>
                        <p className="mt-4 text-sm">
                            Are you sure to delete product "<span className="font-semibold">{deleteProduct?.name}</span>
                            "?
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <Button
                                color="red"
                                onClick={(e) => {
                                    setIsDelete(false);
                                    handleDeleteProduct(e, deleteProduct?._id);
                                }}
                            >
                                Delete
                            </Button>
                            <Button onClick={() => setIsDelete(false)}>Cancel</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
