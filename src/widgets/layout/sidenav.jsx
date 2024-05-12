import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { Avatar, Button, IconButton, Typography } from '@material-tailwind/react';
import { useMaterialTailwindController, setOpenSidenav } from '@/context';
import useAuthStore from '@/stores/authStore';
import toast from 'react-hot-toast';
import apiRequest from '@/utils/apiRequest';

export function Sidenav({ brandImg, brandName, routes }) {
    const [controller, dispatch] = useMaterialTailwindController();
    const { currentUser, logout } = useAuthStore();
    const { sidenavColor, sidenavType, openSidenav } = controller;
    const navigate = useNavigate();
    const sidenavTypes = {
        dark: 'bg-gradient-to-br from-gray-800 to-gray-900',
        white: 'bg-white shadow-sm',
        transparent: 'bg-transparent',
    };

    return (
        <aside
            className={`${sidenavTypes[sidenavType]} ${
                openSidenav ? 'translate-x-0' : '-translate-x-80'
            } fixed inset-0 z-50  my-4 ml-4 flex h-[calc(100vh-32px)] w-72 flex-col rounded-xl border border-blue-gray-100 transition-transform duration-300 xl:translate-x-0`}
        >
            <div className={`relative`}>
                <Link to="/" className="px-8 py-6 text-center">
                    <Typography variant="h6" color={sidenavType === 'dark' ? 'white' : 'blue-gray'}>
                        {brandName}
                    </Typography>
                </Link>
                <IconButton
                    variant="text"
                    color="white"
                    size="sm"
                    ripple={false}
                    className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
                    onClick={() => setOpenSidenav(dispatch, false)}
                >
                    <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
                </IconButton>
            </div>
            <div className="m-4 flex-1">
                {routes.map(({ layout, title, pages }, key) => (
                    <>
                        {layout == 'dashboard' && (
                            <ul key={key} className="mb-4 flex flex-col gap-1">
                                {title && (
                                    <li className="mx-3.5 mb-2 mt-4">
                                        <Typography
                                            variant="small"
                                            color={sidenavType === 'dark' ? 'white' : 'blue-gray'}
                                            className="font-black uppercase opacity-75"
                                        >
                                            {title}
                                        </Typography>
                                    </li>
                                )}
                                {pages.map(({ icon, name, path }) => (
                                    <li key={name}>
                                        <NavLink to={`/${layout}${path}`}>
                                            {({ isActive }) => (
                                                <Button
                                                    variant={isActive ? 'gradient' : 'text'}
                                                    color={
                                                        isActive
                                                            ? sidenavColor
                                                            : sidenavType === 'dark'
                                                            ? 'white'
                                                            : 'blue-gray'
                                                    }
                                                    className="flex items-center gap-4 px-4 capitalize"
                                                    fullWidth
                                                >
                                                    {icon}
                                                    <Typography color="inherit" className="font-medium capitalize">
                                                        {name}
                                                    </Typography>
                                                </Button>
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ))}
            </div>
            <span className="px-6">
                <Button
                    className="flex items-center gap-2"
                    color="black"
                    variant="text"
                    onClick={() => {
                        toast.promise(apiRequest.patch('/auth/admin/logout', { userId: currentUser._id }), {
                            loading: 'Logout...',
                            success: (res) => {
                                logout();
                                navigate('/admin/login');
                                return res.data.message;
                            },
                            error: (err) => err.response.data.message,
                        });
                    }}
                >
                    <ArrowLeftOnRectangleIcon className="size-6" />
                    <span>Log out</span>
                </Button>
            </span>
        </aside>
    );
}

Sidenav.defaultProps = {
    brandImg: '/img/logo.png',
    brandName: 'Admin panel',
};

Sidenav.propTypes = {
    brandImg: PropTypes.string,
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = '/src/widgets/layout/sidnave.jsx';

export default Sidenav;
