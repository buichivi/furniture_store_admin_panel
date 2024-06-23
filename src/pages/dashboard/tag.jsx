import { EditCategoryForm } from '@/components';
import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { InboxIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Button, Card, IconButton, Input, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
const TABLE_HEAD = ['Name', 'Created at', 'Action'];

const Tag = () => {
    const [tags, setTags] = useState([]);
    const { token } = useAuthStore();
    const [name, setName] = useState('');

    useEffect(() => {
        apiRequest
            .get('/tags')
            .then((res) => setTags(res.data?.tags))
            .catch((err) => console.log(err));
    }, []);

    const handleAddTag = () => {
        toast.promise(apiRequest.post('/tags', { name }, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Creating...',
            success: (res) => {
                setTags((tags) => [...tags, res.data?.tag]);
                setName('');
                return res.data?.message;
            },
            error: (err) => err?.response?.data?.error,
        });
    };

    return (
        <div className="py-6">
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

            <Card className="mt-6 h-full w-full overflow-scroll">
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
                        {tags.length === 0 && (
                            <tr>
                                <td colSpan={TABLE_HEAD.length}>
                                    <div className="flex min-h-[50vh] items-center justify-center opacity-50">
                                        <InboxIcon className="size-5 text-black" />
                                        <span className="ml-2 text-sm">Empty</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {tags.map((tag, index) => {
                            const { _id, name, createdAt } = tag;
                            return (
                                <tr key={name} className="even:bg-blue-gray-50/50">
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {name}
                                        </Typography>
                                    </td>

                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {createdAt}
                                        </Typography>
                                    </td>

                                    <td className="p-4">
                                        <span
                                            onClick={(e) => {
                                                const inputEdit = e.currentTarget.nextElementSibling;
                                                inputEdit.checked = !inputEdit.checked;
                                            }}
                                        >
                                            <Tooltip content="Edit Category">
                                                <IconButton variant="text">
                                                    <PencilIcon className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="hidden [&:checked+div]:block"
                                            id={`edit-tag-${index}`}
                                        />
                                        <div className="fixed left-0 top-0 z-50 hidden h-full w-full">
                                            <label
                                                htmlFor={`edit-tag-${index}`}
                                                className="block h-full w-full bg-[#000000a1]"
                                            ></label>
                                            <EditTag tag={tag} index={index} setTags={setTags} />
                                        </div>
                                        <span
                                            onClick={(e) => {
                                                const inputDelete = e.currentTarget.nextElementSibling;
                                                inputDelete.checked = !inputDelete.checked;
                                            }}
                                        >
                                            <Tooltip content="Delete Brand">
                                                <IconButton variant="text" className="ml-2 hover:text-red-600">
                                                    <TrashIcon className="h-4 w-4 " />
                                                </IconButton>
                                            </Tooltip>
                                        </span>
                                        <input
                                            type="checkbox"
                                            id={`delete-tag-${index}`}
                                            className="hidden [&:checked+div]:flex"
                                        />
                                        <div className="fixed left-0 top-0 z-50 hidden h-full w-full items-center justify-center">
                                            <label
                                                htmlFor={`delete-tag-${index}`}
                                                className="absolute left-0 top-0 h-full w-full bg-[#000000a1]"
                                            ></label>
                                            <DeleteTag index={index} tag={tag} setTags={setTags} />
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
};

const EditTag = ({ tag, index, setTags }) => {
    const [name, setName] = useState(tag?.name);
    const { token } = useAuthStore();

    const handleUpdateTag = (e) => {
        toast.promise(
            apiRequest.put('/tags/' + tag?._id, { name }, { headers: { Authorization: 'Bearer ' + token } }),
            {
                loading: 'Updating...',
                success: (res) => {
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
                <Button
                    onClick={(e) => {
                        handleUpdateTag(e);
                    }}
                >
                    Save
                </Button>
                <label htmlFor={`edit-tag-${index}`}></label>
                <Button color="red" onClick={(e) => e.currentTarget.previousElementSibling.click()}>
                    Cancel
                </Button>
            </div>
        </Card>
    );
};

const DeleteTag = ({ tag, index, setTags }) => {
    const { token } = useAuthStore();

    const handleDeleteTag = () => {
        toast.promise(apiRequest.delete('/tags/' + tag?._id, { headers: { Authorization: 'Bearer ' + token } }), {
            loading: 'Deleting...',
            success: (res) => {
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
                <Button color="red" onClick={() => handleDeleteTag()}>
                    Delete
                </Button>
                <Button className="relative">
                    <label
                        htmlFor={`delete-tag-${index}`}
                        className="absolute left-0 top-0 size-full cursor-pointer"
                    ></label>
                    Cancel
                </Button>
            </div>
        </Card>
    );
};

export { Tag };
