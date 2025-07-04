// frontend/src/pages/StoreCartPage.jsx (NEW FILE NAME - rename your existing CartPage.jsx)
import React, { useContext } from 'react';
import { StoreCartContext } from '../context/StoreCartContext'; // NEW: Import StoreCartContext
import { useNavigate } from 'react-router-dom';

const StoreCartPage = () => {
    // MODIFIED: Use StoreCartContext's state and functions
    const { storeCartItems, getTotalStoreCartAmount, clearStoreCart, removeFromStoreCart, addToStoreCart } = useContext(StoreCartContext);
    const navigate = useNavigate();
    const currency = '₹';

    const checkout = () => {
        const cartDetails = {
            // Get items directly from `storeCartItems`, which already holds full product info
            items: Object.keys(storeCartItems).filter(id => storeCartItems[id].quantity > 0).map(id => {
                const item = storeCartItems[id];
                return {
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    image: item.image // Include image if you want it on the receipt
                };
            }),
            totalAmount: getTotalStoreCartAmount(),
            timestamp: new Date().toISOString(),
            storeId: 'wm_ny_121', // Assuming this is derived or hardcoded for the demo
            transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Simple unique ID
        };

        // Navigate to the receipt page, passing store cart details in state
        navigate('/receipt', { state: { cartDetails } });

        // Clear the store cart after "checkout"
        clearStoreCart();
    };

    const cartIsEmpty = Object.values(storeCartItems).every(item => item.quantity === 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8">Your Store Shopping Cart</h1>

            {cartIsEmpty ? (
                <div className="text-center text-gray-600 text-lg">
                    <p className="mb-4">Your store cart is empty.</p>
                    <button
                        onClick={() => navigate('/scan-product')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 ease-in-out shadow-md"
                    >
                        Start Scanning Products
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.values(storeCartItems).map(item => {
                                if (item.quantity > 0) {
                                    return (
                                        <div key={item._id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                                            <img src={item.image[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                                <p className="text-gray-600">ID: {item._id}</p>
                                                <p className="text-gray-600">Size: {item.size}</p>
                                                <p className="text-gray-800 font-bold">{currency}{item.price.toFixed(2)} x {item.quantity}</p>
                                                <p className="text-lg font-bold text-blue-700 mt-1">Total: {currency}{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                            {/* Add quantity controls for demo */}
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => removeFromStoreCart(item._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => addToStoreCart(item, 1)} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">+</button>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 text-right mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Subtotal: <span className="text-blue-700">{currency}{getTotalStoreCartAmount().toFixed(2)}</span></h2>
                        <button
                            onClick={checkout}
                            className="mt-6 px-8 py-4 bg-green-700 text-white text-xl font-semibold rounded-lg hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-200 ease-in-out shadow-lg"
                        >
                            Proceed to Checkout
                        </button>
                        <button
                            onClick={() => clearStoreCart()}
                            className="mt-4 ml-4 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-200 ease-in-out shadow-md"
                        >
                            Clear Store Cart
                        </button>
                        <button
                            onClick={() => navigate('/scan-product')}
                            className="mt-4 ml-4 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-200 ease-in-out shadow-md"
                        >
                            Continue Scanning
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default StoreCartPage;