import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { Button, Card } from '@material-tailwind/react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const DeletePromoCode = ({ id, code, setPromoCodes }) => {
    const { token } = useAuthStore();
    const handleDeletePromoCode = () => {
        toast.promise(
            apiRequest.delete('/promo-code/' + id, {
                headers: {
                    Authorization: `Bearer ` + token,
                },
            }),
            {
                loading: 'Deleting...',
                success: (res) => {
                    setPromoCodes((promoCodes) => promoCodes.filter((promo) => promo._id != id));
                    return res.data.message;
                },
                error: (err) => {
                    err.response?.data?.error;
                },
            },
        );
    };

    return (
        <>
            <input type="checkbox" className="hidden [&:checked+div]:flex" id={`delete-promo-code-${id}`} />
            <div className="fixed left-0 top-0 z-50 hidden size-full items-center justify-center">
                <label
                    htmlFor={`delete-promo-code-${id}`}
                    className="absolute left-0 top-0 size-full bg-[#0000009a]"
                ></label>
                <Card className="min-w-[50%] p-8">
                    <h3 className="text-lg font-semibold text-black">Delete promo code</h3>
                    <p className="mt-4">
                        Are you sure to delete promo code <span className="font-bold uppercase">`{code}`</span>
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-8">
                        <Button
                            color="red"
                            onClick={(e) => {
                                handleDeletePromoCode();
                                e.currentTarget.nextElementSibling.click();
                            }}
                        >
                            Delete
                        </Button>
                        <label htmlFor={`delete-promo-code-${id}`} className="hidden"></label>
                        <Button onClick={(e) => e.currentTarget.previousElementSibling.click()}>Cancel</Button>
                    </div>
                </Card>
            </div>
        </>
    );
};

DeletePromoCode.propTypes = {
    id: PropTypes.string,
    setPromoCodes: PropTypes.func,
    code: PropTypes.string,
};

export default DeletePromoCode;
