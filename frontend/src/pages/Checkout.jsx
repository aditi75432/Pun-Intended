// src/pages/Checkout.jsx
import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cartItems, getTotalCartAmount, clearCart, currency, delivery_fee } = useContext(ShopContext);
    const navigate = useNavigate();

    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (Object.keys(cartItems).length === 0) {
            setError("Your cart is empty! Please add items before checking out.");
            setLoading(false);
            return;
        }

        // Basic validation for shipping info
        for (const key in shippingInfo) {
            if (!shippingInfo[key]) {
                setError(`Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
                setLoading(false);
                return;
            }
        }

        const totalAmount = getTotalCartAmount() + delivery_fee;

        try {
            // In a real application, you'd send this data to your backend
            // for payment processing and order creation.
            const orderData = {
                items: Object.values(cartItems).map(item => ({
                    productId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size
                })),
                shippingInfo: shippingInfo,
                totalAmount: totalAmount,
                // userId: /* Get from your auth context if applicable */
                // paymentMethod: 'COD' // Or 'Stripe', 'PayPal', etc.
            };

            console.log("Simulating order placement with data:", orderData);
            // Simulate an API call
            const response = await new Promise(resolve => setTimeout(() => {
                // Simulate success or failure
                if (Math.random() > 0.1) { // 90% success rate for demo
                    resolve({ ok: true, json: () => Promise.resolve({ success: true, message: 'Order placed successfully!', orderId: 'ORD' + Date.now() }) });
                } else {
                    resolve({ ok: false, status: 500, json: () => Promise.resolve({ success: false, message: 'Payment failed or server error.' }) });
                }
            }, 1500)); // Simulate network delay

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order.');
            }

            const result = await response.json();
            console.log('Order placed successfully:', result);
            alert('Order placed successfully!');
            clearCart(); // Clear cart after successful order
            navigate('/order-success'); // Redirect to a success page
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='px-10 sm:px-20 py-10 max-w-3xl mx-auto'>
            <h2 className='text-3xl font-semibold mb-8 text-center'>Checkout</h2>
            {error && <p className='text-red-600 text-center mb-4'>{error}</p>}

            <form onSubmit={handlePlaceOrder} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Shipping Information */}
                <div className='md:col-span-2'>
                    <h3 className='text-xl font-semibold mb-4'>Shipping Information</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor="firstName" className='block text-sm font-medium text-gray-700'>First Name</label>
                            <input type="text" id="firstName" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                        <div>
                            <label htmlFor="lastName" className='block text-sm font-medium text-gray-700'>Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                        <div className='sm:col-span-2'>
                            <label htmlFor="email" className='block text-sm font-medium text-gray-700'>Email</label>
                            <input type="email" id="email" name="email" value={shippingInfo.email} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                        <div className='sm:col-span-2'>
                            <label htmlFor="address" className='block text-sm font-medium text-gray-700'>Address</label>
                            <input type="text" id="address" name="address" value={shippingInfo.address} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                        <div>
                            <label htmlFor="city" className='block text-sm font-medium text-gray-700'>City</label>
                            <input type="text" id="city" name="city" value={shippingInfo.city} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                        <div>
                            <label htmlFor="zipCode" className='block text-sm font-medium text-gray-700'>Zip Code</label>
                            <input type="text" id="zipCode" name="zipCode" value={shippingInfo.zipCode} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                        <div>
                            <label htmlFor="country" className='block text-sm font-medium text-gray-700'>Country</label>
                            <input type="text" id="country" name="country" value={shippingInfo.country} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                        <div>
                            <label htmlFor="phone" className='block text-sm font-medium text-gray-700'>Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2' />
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className='md:col-span-2 bg-gray-50 p-6 rounded-md shadow-sm mt-8'>
                    <h3 className='text-xl font-semibold mb-4'>Order Summary</h3>
                    {Object.values(cartItems).map(item => (
                        <div key={item._id + '_' + item.size} className='flex justify-between items-center py-1 text-sm'>
                            <span>{item.name} ({item.size}) x {item.quantity}</span>
                            <span>{currency}{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className='border-t border-gray-200 mt-4 pt-4'>
                        <div className='flex justify-between items-center py-1'>
                            <p>Subtotal</p>
                            <p>{currency}{getTotalCartAmount().toFixed(2)}</p>
                        </div>
                        <div className='flex justify-between items-center py-1'>
                            <p>Delivery Fee</p>
                            <p>{currency}{delivery_fee.toFixed(2)}</p>
                        </div>
                        <div className='flex justify-between items-center py-2 font-bold text-lg'>
                            <p>Total</p>
                            <p>{currency}{(getTotalCartAmount() + delivery_fee).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Place Order Button */}
                <div className='md:col-span-2 text-center mt-8'>
                    <button
                        type="submit"
                        disabled={loading || Object.keys(cartItems).length === 0}
                        className='w-full md:w-auto bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Checkout;