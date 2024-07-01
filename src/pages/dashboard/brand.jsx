import { EditBrandForm } from '@/components';
import apiRequest from '@/utils/apiRequest';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useAuthStore from '@/stores/authStore';
import { AgGridReact } from 'ag-grid-react';

export function Brand() {
    const [brands, setBrands] = useState([]);
    const [editBrand, setEditBrand] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const tableGrid = useRef();

    const { token } = useAuthStore();
    useEffect(() => {
        apiRequest
            .get('/brands')
            .then((res) => setBrands(res.data.brands))
            .catch((err) => console.log(err));
    }, []);

    // const handleChangeActiveBrand = (e, id) => {
    //     toast.promise(
    //         apiRequest.patch(
    //             '/brands/' + id,
    //             { active: e.target.checked },
    //             { headers: { Authorization: 'Bearer ' + token } },
    //         ),
    //         {
    //             loading: 'Updating...',
    //             success: (res) => {
    //                 return res.data.message;
    //             },
    //             error: (err) => {
    //                 return err.response.data.error || 'Something went wrong';
    //             },
    //         },
    //     );
    // };

    const handleDeleteBrand = (id) => {
        toast.promise(apiRequest.delete('/brands/' + id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
                setIsDelete(false);
                setBrands((brands) => {
                    const newBrands = brands.filter((brand) => brand._id !== id);
                    return newBrands;
                });
                return res.data?.message;
            },
            error: (err) => {
                console.log(err);
                return err?.response?.data?.error || 'Something went wrong';
            },
        });
    };

    const addBrandForm = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('This field is required'),
            description: Yup.string().required('This field is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            toast.promise(apiRequest.post('/brands/', values, { headers: { Authorization: 'Bearer ' + token } }), {
                loading: 'Creating...',
                success: (res) => {
                    setBrands((brands) => {
                        const newBrands = [...brands, res.data.brand];
                        return newBrands;
                    });
                    resetForm();
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
        <div className="py-6">
            <div className="flex items-center justify-between">
                <Button
                    variant="gradient"
                    onClick={(e) => {
                        e.currentTarget.nextElementSibling.checked = !e.currentTarget.nextElementSibling.checked;
                    }}
                >
                    Add brand
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
            <input type="checkbox" id="add-brand" className="hidden [&:checked+div]:flex" />
            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                <label htmlFor="add-brand" className="absolute left-0 top-0 size-full bg-[#000b]"></label>
                <Card className="absolute left-1/2 top-1/2 h-auto w-2/3 -translate-x-1/2 -translate-y-1/2 p-4">
                    <h3 className="font-semibold capitalize">Add brand</h3>
                    <form onSubmit={addBrandForm.handleSubmit} className="mt-6">
                        <label className="block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Name</span>
                                {addBrandForm.errors.name && (
                                    <Typography className="text-sm" color="red">
                                        {addBrandForm.errors.name}
                                    </Typography>
                                )}
                            </div>
                            <input
                                name="name"
                                type="text"
                                value={addBrandForm.values.name}
                                onChange={addBrandForm.handleChange}
                                placeholder="Category name"
                                className="w-full border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                            />
                        </label>
                        <label className="mt-4 block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Desciption</span>
                                {addBrandForm.errors.description && (
                                    <Typography className="text-sm" color="red">
                                        {addBrandForm.errors.description}
                                    </Typography>
                                )}
                            </div>
                            <textarea
                                name="description"
                                spellCheck="false"
                                placeholder="Category name"
                                value={addBrandForm.values.description}
                                onChange={addBrandForm.handleChange}
                                className="w-full resize-y border-b border-b-gray-300 py-2 pl-2 text-sm outline-none transition-colors focus:border-b-black"
                                rows={4}
                            ></textarea>
                        </label>
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <Button
                                color="cyan"
                                variant="filled"
                                type="submit"
                                onClick={(e) => {
                                    e.currentTarget.nextElementSibling.children[0].click();
                                }}
                            >
                                Add
                            </Button>
                            <Button color="red" className="relative" variant="outlined">
                                <label
                                    htmlFor="add-brand"
                                    className="absolute left-0 top-0 size-full cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                ></label>
                                Close
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <div
                className="ag-theme-quartz mt-4" // applying the grid theme
                style={{ height: 500 }} // the grid will fill the size of the parent container
            >
                <AgGridReact
                    ref={tableGrid}
                    rowData={brands}
                    columnDefs={[
                        { field: 'name' },
                        { field: 'description', flex: 2 },
                        {
                            field: 'action',
                            cellRenderer: ({ data: brand }) => {
                                return (
                                    <div>
                                        <span
                                            onClick={() => {
                                                setIsEdit(true);
                                                setEditBrand(brand);
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
                                                setIsDelete(true);
                                                setEditBrand(brand);
                                            }}
                                        >
                                            <Tooltip content="Delete Brand">
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
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 15, 20, 25]}
                    className="pb-5"
                    defaultColDef={{
                        flex: 1,
                        autoHeight: true,
                        cellClass: 'py-1',
                    }}
                />
            </div>
            {isEdit && (
                <div className="fixed left-0 top-0 z-50 h-full w-full">
                    <span onClick={() => setIsEdit(false)} className="block h-full w-full bg-[#000000a1]"></span>
                    <EditBrandForm brand={editBrand} setBrands={setBrands} setIsEdit={setIsEdit} />
                </div>
            )}

            {isDelete && (
                <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center">
                    <span
                        onClick={() => setIsDelete(false)}
                        className="absolute left-0 top-0 h-full w-full bg-[#000000a1]"
                    ></span>
                    <Card className="h-auto min-w-[50%] px-4 py-6">
                        <h3 className="text-left font-semibold">Confirm Delete</h3>
                        <p className="mt-2 text-sm">
                            Are you sure you want to delete the brand named "
                            <span className="font-bold">{editBrand?.name}</span>"?
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-10">
                            <Button
                                color="red"
                                onClick={() => {
                                    handleDeleteBrand(editBrand?._id);
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
