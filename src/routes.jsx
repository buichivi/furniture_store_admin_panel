import {
    HomeIcon,
    ServerStackIcon,
    RectangleStackIcon,
    SparklesIcon,
    InboxIcon,
    TicketIcon,
    ClipboardDocumentListIcon,
    TagIcon,
    AdjustmentsHorizontalIcon,
    AtSymbolIcon,
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
    Tag,
    SliderAndBanner,
    Blog,
} from '@/pages/dashboard';
import { SignIn, SignUp } from '@/pages/auth';
import { AddBlog, AddColor, AddProduct, EditCategoryForm, EditColor, EditOrder, EditProductForm } from './components';
import { element } from 'prop-types';
import Order from './pages/dashboard/order';

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
                icon: <TagIcon {...icon} />,
                name: 'tag',
                path: '/tag',
                element: <Tag />,
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
            {
                icon: <ClipboardDocumentListIcon {...icon} />,
                name: 'Order',
                path: '/order',
                element: <Order />,
            },
            {
                icon: <AdjustmentsHorizontalIcon {...icon} />,
                name: 'Slider and banner',
                path: '/slider-and-banner',
                element: <SliderAndBanner />,
            },
            {
                icon: <AtSymbolIcon {...icon} />,
                name: 'Blog',
                path: '/blog',
                element: <Blog />,
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
    {
        path: '/order/edit/:id',
        element: <EditOrder />,
    },
    {
        path: '/blog/create',
        element: <AddBlog />,
    },
];

export default routes;
export { subRoutes };
