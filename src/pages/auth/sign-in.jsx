import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { Input, Button, Typography } from '@material-tailwind/react';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

export function SignIn() {
    const navigate = useNavigate();
    const { loginUser, setToken } = useAuthStore();
    const token = localStorage.getItem('token');

    useEffect(() => {
        apiRequest
            .get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            })
            .then((res) => {
                navigate('/');
                loginUser(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    const loginForm = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('This field is required'),
            password: Yup.string().required('This field is required'),
        }),
        onSubmit: (values) => {
            toast.promise(apiRequest.post('/auth/admin/login', { ...values }), {
                loading: 'Login...',
                success: (res) => {
                    loginUser(res.data.user);
                    setToken(res.data.token);
                    navigate('/');
                    return res.data.message;
                },
                error: (err) => {
                    return err.response.data.error;
                },
            });
        },
    });

    return (
        <section className="m-8 flex gap-4">
            <div className="mt-24 w-full lg:w-3/5">
                <div className="text-center">
                    <Typography variant="h2" className="mb-4 font-bold">
                        Sign In
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Enter your email and password to Sign In.
                    </Typography>
                </div>
                <form className="mx-auto mb-2 mt-8 w-80 max-w-screen-lg lg:w-1/2" onSubmit={loginForm.handleSubmit}>
                    <div className="mb-1 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                                Your email
                            </Typography>
                            {loginForm.errors.email && (
                                <Typography variant="small" color="red" className="-mb-3 font-medium">
                                    {loginForm.errors.email}
                                </Typography>
                            )}
                        </div>
                        <Input
                            type="email"
                            name="email"
                            value={loginForm.values.email}
                            onChange={loginForm.handleChange}
                            size="lg"
                            placeholder="name@mail.com"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: 'before:content-none after:content-none',
                            }}
                        />
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Password
                        </Typography>
                        <Input
                            name="password"
                            value={loginForm.values.password}
                            onChange={loginForm.handleChange}
                            type="password"
                            size="lg"
                            placeholder="********"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: 'before:content-none after:content-none',
                            }}
                        />
                    </div>
                    <Button className="mt-6" fullWidth type="submit">
                        Sign In
                    </Button>
                </form>
            </div>
            <div className="hidden h-full w-2/5 lg:block">
                <img src="/img/pattern.png" className="size-full rounded-3xl object-cover" />
            </div>
        </section>
    );
}

export default SignIn;
