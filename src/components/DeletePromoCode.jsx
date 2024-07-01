import useAuthStore from '@/stores/authStore';
import apiRequest from '@/utils/apiRequest';
import { Button, Card } from '@material-tailwind/react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const DeletePromoCode = ({ promoCode, setPromoCodes, setIsDelete }) => {
    const { token } = useAuthStore();
    const handleDeletePromoCode = () => {
        toast.promise(
            apiRequest.delete('/promo-code/' + promoCode?._id, {
                headers: {
                    Authorization: `Bearer ` + token,
                },
            }),
            {
                loading: 'Deleting...',
                success: (res) => {
                    setIsDelete(false);
                    setPromoCodes((promoCodes) => promoCodes.filter((promo) => promo._id != promoCode?._id));
                    return res.data.message;
                },
                error: (err) => {
                    return err.response?.data?.error;
                },
            },
        );
    };

    return (
        <>
            <div className="fixed left-0 top-0 z-50 flex size-full items-center justify-center">
                <span
                    onClick={() => setIsDelete(false)}
                    className="absolute left-0 top-0 size-full bg-[#0000009a]"
                ></span>
                <Card className="min-w-[50%] p-8">
                    <h3 className="text-lg font-semibold text-black">Delete promo code</h3>
                    <p className="mt-4">
                        Are you sure to delete promo code{' '}
                        <span className="font-bold uppercase">`{promoCode?.code}`</span>
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
                        <span onClick={() => setIsDelete(false)} className="hidden"></span>
                        <Button onClick={(e) => e.currentTarget.previousElementSibling.click()}>Cancel</Button>
                    </div>
                </Card>
            </div>
        </>
    );
};

DeletePromoCode.propTypes = {
    setPromoCodes: PropTypes.func,
    promoCode: PropTypes.object,
    setIsDelete: PropTypes.func,
};

export default DeletePromoCode;
