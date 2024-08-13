import apiRequest from '@/utils/apiRequest';
import { Button, Card, IconButton } from '@material-tailwind/react';
import { AgGridReact } from 'ag-grid-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '@/stores/authStore';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const Room = () => {
    const [rooms, setRooms] = useState([]);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    useEffect(() => {
        apiRequest
            .get('/rooms')
            .then((res) => {
                setRooms(res.data?.rooms);
            })
            .catch((err) => console.log(err));
    }, []);

    console.log(rooms);

    return (
        <div>
            <Button onClick={() => setIsCreatingRoom(true)}>Add room</Button>
            {isCreatingRoom && <CreateRoomForm setIsCreatingRoom={setIsCreatingRoom} setRooms={setRooms} />}
            <div
                className="ag-theme-quartz mt-4" // applying the grid theme
                style={{ height: 500 }} // the grid will fill the size of the parent container
            >
                <AgGridReact
                    columnDefs={[
                        {
                            field: 'name',
                        },
                        {
                            field: 'description',
                        },
                        {
                            field: 'Action',
                            cellRenderer: ({ data }) => {
                                return (
                                    <React.Fragment>
                                        <IconButton size="sm" variant="text">
                                            <Link to={`/dashboard/room/edit/${data.slug}`}>
                                                <PencilIcon className="size-4" />
                                            </Link>
                                        </IconButton>
                                        <IconButton size="sm" variant="text" className="ml-4">
                                            <TrashIcon className="size-4 transition-all hover:text-red-500" />
                                        </IconButton>
                                    </React.Fragment>
                                );
                            },
                        },
                    ]}
                    rowData={rooms}
                    defaultColDef={{
                        flex: 1,
                    }}
                />
            </div>
        </div>
    );
};

const CreateRoomForm = ({ setIsCreatingRoom, setRooms }) => {
    const { token } = useAuthStore();
    const createRoomForm = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Name is required'),
            description: Yup.string().required('Description is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            toast.promise(apiRequest.post('/rooms', values, { headers: { Authorization: 'Bearer ' + token } }), {
                loading: 'Creating...',
                success: (res) => {
                    resetForm();
                    setRooms((rooms) => [...rooms, values]);
                    setIsCreatingRoom(false);
                    return res.data?.message;
                },
                error: (err) => console.log(err),
            });
        },
    });

    return (
        <div className="fixed left-0 top-0 z-50 flex size-full items-center justify-center">
            <div
                className="absolute left-0 top-0 size-full bg-black opacity-50"
                onClick={() => setIsCreatingRoom(false)}
            ></div>
            <Card className="fixed h-fit w-1/2 p-4">
                <h3 className="text-lg font-bold text-black">Create room</h3>
                <form onSubmit={createRoomForm.handleSubmit}>
                    <div className="mt-4">
                        <div className="w-full">
                            <div className="flex w-full items-center justify-between">
                                <span>Name</span>
                                {createRoomForm.errors.name && (
                                    <span className="text-sm text-red-500">{createRoomForm.errors.name}</span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={createRoomForm.values.name}
                                onChange={createRoomForm.handleChange}
                                placeholder="Name"
                                className="w-full border-b p-1 outline-none transition-all focus:border-black"
                            />
                        </div>
                        <div className="mt-4 w-full">
                            <div className="flex w-full items-center justify-between">
                                <span>Description</span>
                                {createRoomForm.errors.description && (
                                    <span className="text-sm text-red-500">{createRoomForm.errors.description}</span>
                                )}
                            </div>
                            <textarea
                                name="description"
                                value={createRoomForm.values.description}
                                onChange={createRoomForm.handleChange}
                                className="size-full resize-y border-b p-1 outline-none transition-all focus:border-black"
                                rows={5}
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-10">
                        <Button type="submit">Create</Button>
                        <Button color="red" onClick={() => setIsCreatingRoom(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Room;
