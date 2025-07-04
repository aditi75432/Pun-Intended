// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'; // To access currency

const Orders = () => {
    const { currency } = useContext(ShopContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // *** REPLACE THIS WITH YOUR ACTUAL BACKEND API CALL ***
                // Example: const response = await fetch('/api/user/orders', { headers: { 'Authorization': `Bearer ${yourAuthToken}` } });
                // For demonstration, simulating data:
                const simulatedOrders = [
                    {
                        _id: 'ORD001',
                        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
                        totalAmount: 159.97,
                        status: 'Delivered',
                        items: [
                            { productId: 'p1', name: 'Cool T-Shirt', quantity: 1, price: 29.99, size: 'M' },
                            { productId: 'p2', name: 'Denim Jeans', quantity: 1, price: 129.98, size: '32' },
                        ],
                        shippingInfo: { address: '123 Fake St', city: 'Exampleville', zipCode: '10001', country: 'USA' }
                    },
                    {
                        _id: 'ORD002',
                        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
                        totalAmount: 50.00,
                        status: 'Processing',
                        items: [
                            { productId: 'p3', name: 'Sneakers', quantity: 1, price: 50.00, size: '9' },
                        ],
                        shippingInfo: { address: '456 Imaginary Ave', city: 'Demo City', zipCode: '90210', country: 'USA' }
                    }
                ];

                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                setOrders(simulatedOrders);

            } catch (err) {
                setError(err.message || 'Failed to fetch orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        return <div className='text-center py-20 text-lg'>Loading your orders...</div>;
    }

    if (error) {
        return <div className='text-center py-20 text-lg text-red-600'>Error: {error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className='text-center py-20 text-lg text-gray-600'>
                <p>You haven't placed any orders yet.</p>
                <Link to="/" className='text-blue-600 hover:underline mt-4 block'>Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className='px-10 sm:px-20 py-10 max-w-4xl mx-auto'>
            <h2 className='text-3xl font-semibold mb-8 text-center'>My Orders</h2>
            <div className='space-y-8'>
                {orders.map(order => (
                    <div key={order._id} className='bg-white p-6 rounded-lg shadow-md border border-gray-200'>
                        <div className='flex justify-between items-center mb-4 border-b pb-3'>
                            <h3 className='font-bold text-lg'>Order ID: <span className='text-blue-700'>{order._id}</span></h3>
                            <p className={`text-sm px-3 py-1 rounded-full ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>{order.status}</p>
                        </div>
                        <p className='text-gray-600 mb-2'><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className='text-gray-600 mb-4'><strong>Total Amount:</strong> {currency}{order.totalAmount.toFixed(2)}</p>

                        <h4 className='font-semibold text-md mb-2'>Items:</h4>
                        <ul className='list-disc pl-5 mb-4 text-gray-700'>
                            {order.items.map(item => (
                                <li key={item.productId + '_' + item.size} className='mb-1'>
                                    {item.name} ({item.size}) x {item.quantity} - {currency}{(item.price * item.quantity).toFixed(2)}
                                </li>
                            ))}
                        </ul>

                        {order.shippingInfo && (
                            <div>
                                <h4 className='font-semibold text-md mb-2'>Shipping To:</h4>
                                <p className='text-gray-700'>
                                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                                    <br />
                                    {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.zipCode}
                                    <br />
                                    {order.shippingInfo.country}, Ph: {order.shippingInfo.phone}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;



