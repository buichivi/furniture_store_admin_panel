import {
    HomeIcon,
    UserCircleIcon,
    TableCellsIcon,
    InformationCircleIcon,
    ServerStackIcon,
    RectangleStackIcon,
    ShoppingCartIcon,
    SparklesIcon,
    InboxIcon,
    TicketIcon,
} from '@heroicons/react/24/solid';
import {
    Home,
    Profile,
    Tables,
    Notifications,
    Product,
    Category,
    Brand,
    CategoryTree,
    PromoCode,
} from '@/pages/dashboard';
import { SignIn, SignUp } from '@/pages/auth';
import { AddColor, AddProduct, EditCategoryForm, EditColor, EditProductForm } from './components';
import { element } from 'prop-types';

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
                name: 'Category',
                path: '/category',
                element: <CategoryTree />,
            },
            {
                icon: <SparklesIcon {...icon} />,
                name: 'brand',
                path: '/brand',
                element: <Brand />,
            },
            {
                icon: <InboxIcon {...icon} />,
                name: 'product',
                path: '/product',
                element: <Product />,
            },
            {
                icon: <TicketIcon {...icon} />,
                name: 'promo code',
                path: '/promocode',
                element: <PromoCode />,
            },
            // {
            //     icon: <UserCircleIcon {...icon} />,
            //     name: 'profile',
            //     path: '/profile',
            //     element: <Profile />,
            // },
            // {
            //     icon: <TableCellsIcon {...icon} />,
            //     name: 'tables',
            //     path: '/tables',
            //     element: <Tables />,
            // },
            // {
            //     icon: <InformationCircleIcon {...icon} />,
            //     name: 'notifications',
            //     path: '/notifications',
            //     element: <Notifications />,
            // },
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
        ],
    },
];
const subRoutes = [
    {
        path: '/product/edit/:slug',

        element: <EditProductForm />,
    },
    {
        path: '/product/create',

        element: <AddProduct />,
    },
    {
        path: '/product/edit/:slug/add-color',

        element: <AddColor />,
    },
    {
        path: '/product/:slug/edit-color/:colorId',
        element: <EditColor />,
    },
];

export default routes;
export { subRoutes };
