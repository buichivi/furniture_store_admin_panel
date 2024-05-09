import apiRequest from '@/utils/apiRequest';
import { PencilIcon } from '@heroicons/react/24/solid';
import { Avatar, Card, IconButton, Switch, Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';

const TABLE_HEAD = ['#', 'Name', 'Image preview', 'Colors', 'Category', 'Active', 'Action'];

const TABLE_ROWS = [
    {
        name: 'John Michael',
        job: 'Manager',
        image: 'https://www.shutterstock.com/image-vector/vector-realistic-yellow-armchair-3d-600nw-2239751635.jpg',
        colors: [
            'https://t3.ftcdn.net/jpg/04/22/57/62/360_F_422576286_MWtfgRaK8uhKytPH4LCKUyGEnrD9zZoC.webp',
            'https://t3.ftcdn.net/jpg/04/22/57/62/360_F_422576286_MWtfgRaK8uhKytPH4LCKUyGEnrD9zZoC.webp',
            'https://t3.ftcdn.net/jpg/04/22/57/62/360_F_422576286_MWtfgRaK8uhKytPH4LCKUyGEnrD9zZoC.webp',
            'https://t3.ftcdn.net/jpg/04/22/57/62/360_F_422576286_MWtfgRaK8uhKytPH4LCKUyGEnrD9zZoC.webp',
        ],
        category: 'Chair',
        active: true,
    },
];

export function Product() {
    const [products, setProducts] = useState();

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
            <Card className="h-full w-full overflow-scroll">
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
                        {TABLE_ROWS.map(({ name, image, colors, category, active }, index) => {
                            const isLast = index === TABLE_ROWS.length - 1;
                            const classes = isLast ? 'p-4' : 'p-4 border-b border-blue-gray-50';

                            return (
                                <tr key={name}>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {index + 1}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {name}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <img src={image} alt={name} className="size-16" />
                                    </td>
                                    <td className={classes}>
                                        {colors.map((img, key) => (
                                            <Tooltip key={key} content={name}>
                                                <Avatar
                                                    src={img}
                                                    size="xs"
                                                    variant="circular"
                                                    className={`cursor-pointer border-2 border-white ${
                                                        key === 0 ? '' : '-ml-2.5'
                                                    }`}
                                                />
                                            </Tooltip>
                                        ))}
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {category}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Switch defaultChecked={active} color="green" name="active" />
                                    </td>
                                    <td className={classes}>
                                        <Tooltip content="Edit product">
                                            <IconButton variant="text">
                                                <PencilIcon className="size-4" />
                                            </IconButton>
                                        </Tooltip>
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
