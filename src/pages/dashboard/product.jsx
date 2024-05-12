import { EditProductForm } from '@/components';
import apiRequest from '@/utils/apiRequest';
import { TrashIcon } from '@heroicons/react/24/outline';
import { InboxIcon, PencilIcon } from '@heroicons/react/24/solid';
import { Avatar, Button, Card, IconButton, Switch, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const TABLE_HEAD = ['Name', 'Image preview', 'Colors', 'Category', 'Price', 'Active', 'Action'];

export function Product() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        apiRequest
            .get('/products')
            .then((res) => {
                console.log(res.data.products);
                setProducts(res.data.products);
            })
            .catch((error) => console.log(error));
    }, []);

    const handleActiveProduct = (e, id) => {
        toast.promise(apiRequest.patch('/products/' + id, { active: e.target.checked }), {
            loading: 'Updating...',
            success: (res) => {
                return res.data.message;
            },
            error: (err) => {
                return err.response.data.error || 'Something went wrong';
            },
        });
    };

    const handleDeleteProduct = (id) => {
        toast.promise(apiRequest.delete('/products/' + id), {
            loading: 'Deleting...',
            success: (res) => {
                setProducts((products) => products.filter((prod) => prod._id != id));
                return res.data.message;
            },
            error: (err) => {
                return err.response.data.error || 'Something went wrong';
            },
        });
    };

    return (
        <div className="py-6">
            <Link to={`/dashboard/product/create`}>
                <Button variant="gradient">Add product</Button>
            </Link>
            <Card className="mt-4 h-full w-full overflow-scroll">
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            {TABLE_HEAD.map((head) => (
                                <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products?.length === 0 && (
                            <tr>
                                <td colSpan={TABLE_HEAD.length}>
                                    <div className="flex min-h-[50vh] items-center justify-center opacity-50">
                                        <InboxIcon className="size-5 text-black" />
                                        <span className="ml-2 text-sm">Empty</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {products?.map(({ _id, name, colors, category, priceOnSale, active }, index) => {
                            const isLast = index === products.length - 1;
                            const classes = isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50';

                            return (
                                <tr key={name}>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {name}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <img src={colors[0]?.images[0]} alt={name} className="size-16" />
                                    </td>
                                    <td className={classes}>
                                        {colors.map(({ name, thumb }, key) => (
                                            <Tooltip key={key} content={name} className="capitalize">
                                                <Avatar
                                                    src={thumb}
                                                    size="xs"
                                                    variant="circular"
                                                    className={`cursor-pointer border border-[#000] ${
                                                        key === 0 ? '' : '-ml-2.5'
                                                    }`}
                                                />
                                            </Tooltip>
                                        ))}
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {category?.name}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            ${priceOnSale}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Switch
                                            defaultChecked={active}
                                            onChange={(e) => handleActiveProduct(e, _id)}
                                            color="green"
                                            name="active"
                                        />
                                    </td>
                                    <td className={classes}>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/dashboard/product/edit/${_id}`}>
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
                                                    onClick={(e) => {
                                                        const ip = e.currentTarget.nextElementSibling;
                                                        ip.checked = !ip.checked;
                                                    }}
                                                >
                                                    <TrashIcon className="size-4" />
                                                </IconButton>
                                            </Tooltip>
                                            <input type="checkbox" className="hidden [&:checked+div]:flex" />
                                            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                                                <span
                                                    className="absolute left-0 top-0 block size-full bg-[#000000a8]"
                                                    onClick={(e) =>
                                                        (e.currentTarget.parentElement.previousElementSibling.checked = false)
                                                    }
                                                ></span>
                                                <Card className="min-w-[50%] p-4">
                                                    <h3 className="font-medium text-black">Delete product</h3>
                                                    <p className="mt-4 text-sm">Are you sure to delete this product?</p>
                                                    <div className="mt-6 flex items-center justify-center gap-2">
                                                        <Button color="red" onClick={() => handleDeleteProduct(_id)}>
                                                            Delete
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.currentTarget.parentElement.parentElement.parentElement.previousElementSibling.checked = false;
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
