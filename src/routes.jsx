import {
    HomeIcon,
    UserCircleIcon,
    TableCellsIcon,
    InformationCircleIcon,
    ServerStackIcon,
    RectangleStackIcon,
    ShoppingCartIcon,
} from '@heroicons/react/24/solid';
import { Home, Profile, Tables, Notifications, Product, Category } from '@/pages/dashboard';
import { SignIn, SignUp } from '@/pages/auth';

const icon = {
    className: 'w-5 h-5 text-inherit',
};

export const routes = [
    {
        layout: 'dashboard',
        pages: [
            {
                icon: <HomeIcon {...icon} />,
                name: 'dashboard',
                path: '/home',
                element: <Home />,
            },
            {
                icon: <RectangleStackIcon {...icon} />,
                name: 'category',
                path: '/category',
                element: <Category />,
            },
            {
                icon: <ShoppingCartIcon {...icon} />,
                name: 'product',
                path: '/product',
                element: <Product />,
            },
            {
                icon: <UserCircleIcon {...icon} />,
                name: 'profile',
                path: '/profile',
                element: <Profile />,
            },
            {
                icon: <TableCellsIcon {...icon} />,
                name: 'tables',
                path: '/tables',
                element: <Tables />,
            },
            {
                icon: <InformationCircleIcon {...icon} />,
                name: 'notifications',
                path: '/notifications',
                element: <Notifications />,
            },
        ],
    },
    {
        title: 'auth pages',
        layout: 'auth',
        pages: [
            {
                icon: <ServerStackIcon {...icon} />,
                name: 'sign in',
                path: '/sign-in',
                element: <SignIn />,
            },
            {
                icon: <RectangleStackIcon {...icon} />,
                name: 'sign up',
                path: '/sign-up',
                element: <SignUp />,
            },
        ],
    },
];

export default routes;
