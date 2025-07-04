// src/pages/OrderSuccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
    return (
        <div className='flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4'>
            <h2 className='text-4xl font-bold text-green-600 mb-4'>Order Placed Successfully!</h2>
            <p className='text-lg text-gray-700 mb-6'>Thank you for your purchase. Your order has been confirmed.</p>
            <p className='text-gray-600 mb-8'>You will receive an email with your order details shortly.</p>
            <div className='flex gap-4'>
                <Link to="/orders" className='bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors'>
                    View My Orders
                </Link>
                <Link to="/" className='border border-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors'>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;