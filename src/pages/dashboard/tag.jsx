import { EditCategoryForm } from '@/components';
import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { InboxIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Input, Tooltip, Typography } from '@material-tailwind/react';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
const TABLE_HEAD = ['Name', 'Created at', 'Action'];

const Tag = () => {
    const [tags, setTags] = useState([]);
    const { token } = useAuthStore();
    const [name, setName] = useState('');
    const [editTag, setEditTag] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const tableGrid = useRef();

    useEffect(() => {
        apiRequest
            .get('/tags')
            .then((res) => setTags(res.data?.tags))
            .catch((err) => console.log(err));
    }, []);

    const handleAddTag = () => {
        if (name) {
            toast.promise(apiRequest.post('/tags', { name }, { headers: { Authorization: 'Bearer ' + token } }), {
                loading: 'Creating...',
                success: (res) => {
                    setTags((tags) => [...tags, res.data?.tag]);
                    setName('');
                    return res.data?.message;
                },
                error: (err) => err?.response?.data?.error,
            });
        }
    };

    return (
        <div className="py-6">
            <div className="flex items-center justify-between">
                <div className="flex w-1/3 items-center gap-2">
                    <Input
                        variant="standard"
                        label="Tag name"
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                    />
                    <Button variant="gradient" className="shrink-0" onClick={() => handleAddTag()}>
                        Add tag
                    </Button>
                </div>
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
                style={{ height: 500 }} // the grid will fill the size of the parent container
            >
                <AgGridReact
                    ref={tableGrid}
                    rowData={tags}
                    columnDefs={[
                        { field: 'name' },
                        { field: 'createdAt' },
                        {
                            field: 'action',
                            cellRenderer: ({ data: tag }) => {
                                return (
                                    <div>
                                        <span
                                            onClick={() => {
                                                setIsEdit(true);
                                                setEditTag(tag);
                                            }}
                                        >
                                            <Tooltip content="Edit Tag">
                                                <IconButton variant="text">
                                                    <PencilIcon className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                        <span
                                            onClick={() => {
                                                setIsDelete(true);
                                                setEditTag(tag);
                                            }}
                                        >
                                            <Tooltip content="Delete Tag">
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
                    <EditTag tag={editTag} setTags={setTags} setIsEdit={setIsEdit} />
                </div>
            )}
            {isDelete && (
                <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center">
                    <span
                        onClick={() => setIsDelete(false)}
                        className="absolute left-0 top-0 h-full w-full bg-[#000000a1]"
                    ></span>
                    <DeleteTag tag={editTag} setTags={setTags} setIsDelete={setIsDelete} />
                </div>
            )}
        </div>
    );
};

const EditTag = ({ tag, setTags, setIsEdit }) => {
    const [name, setName] = useState(tag?.name);
    const { token } = useAuthStore();

    const handleUpdateTag = () => {
        toast.promise(
            apiRequest.put('/tags/' + tag?._id, { name }, { headers: { Authorization: 'Bearer ' + token } }),
            {
                loading: 'Updating...',
                success: (res) => {
                    setIsEdit(false);
                    setTags((tags) => tags.map((t) => (t._id == tag._id ? res.data?.tag : t)));
                    return res.data?.message;
                },
                error: (err) => err?.response?.data?.error,
            },
        );
    };

    return (
        <Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4 md:w-1/2 lg:w-1/3">
            <h4 className="font-bold text-black">Edit Tag</h4>
            <div className="mt-6">
                <Input
                    variant="standard"
                    label="Tag name"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                />
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
                <Button onClick={handleUpdateTag}>Save</Button>
                <Button color="red" onClick={() => setIsEdit(false)}>
                    Cancel
                </Button>
            </div>
        </Card>
    );
};

const DeleteTag = ({ tag, setTags, setIsDelete }) => {
    const { token } = useAuthStore();

    const handleDeleteTag = () => {
        toast.promise(apiRequest.delete('/tags/' + tag?._id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
                setIsDelete(false);
                setTags((tags) => tags.filter((t) => t._id != tag._id));
                return res.data?.message;
            },
            error: (err) => err?.response?.data?.error,
        });
    };

    return (
        <Card className="h-auto min-w-[50%] px-4 py-6">
            <h3 className="text-left font-semibold">Confirm Delete</h3>
            <p className="mt-2 text-sm">
                Are you sure you want to delete the tag named "<span className="font-bold">{tag?.name}</span>"?
            </p>
            <div className="mt-10 flex items-center justify-center gap-10">
                <Button color="red" onClick={handleDeleteTag}>
                    Delete
                </Button>
                <Button className="relative" onClick={() => setIsDelete(false)}>
                    Cancel
                </Button>
            </div>
        </Card>
    );
};

export { Tag };
