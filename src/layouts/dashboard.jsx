import { Routes, Route, useNavigate } from 'react-router-dom';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { IconButton } from '@material-tailwind/react';
import { Sidenav, DashboardNavbar, Configurator, Footer } from '@/widgets/layout';
import routes, { subRoutes } from '@/routes';
import { useMaterialTailwindController, setOpenConfigurator } from '@/context';
import useAuthStore from '@/stores/authStore';
import { useEffect } from 'react';
import apiRequest from '@/utils/apiRequest';

export function Dashboard() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { sidenavType } = controller;
    const { loginUser } = useAuthStore();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    useEffect(() => {
        apiRequest
            .get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                loginUser(res.data);
            })
            .catch((err) => {
                navigate('/auth/sign-in');
                console.log(err);
            });
    }, []);

    return (
        <div className="min-h-screen bg-blue-gray-50/50">
            <Sidenav routes={routes} brandImg={sidenavType === 'dark' ? '/img/logo.png' : '/img/logo.png'} />
            <div className="p-4 xl:ml-80">
                <DashboardNavbar />

                {/* Configurator */}
                {/* <Configurator />
                <IconButton
                    size="lg"
                    color="white"
                    className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
                    ripple={false}
                    onClick={() => setOpenConfigurator(dispatch, true)}
                >
                    <Cog6ToothIcon className="h-5 w-5" />
                </IconButton> */}
                <Routes>
                    {routes.map(
                        ({ layout, pages }) =>
                            layout === 'dashboard' &&
                            pages.map(({ path, element }) => <Route exact path={path} element={element} />),
                    )}
                    {subRoutes.map(({ path, element }, index) => {
                        return <Route key={index} path={path} element={element} />;
                    })}
                </Routes>
                <div className="text-blue-gray-600">
                    <Footer />
                </div>
            </div>
        </div>
    );
}

Dashboard.displayName = '/src/layout/dashboard.jsx';

export default Dashboard;
