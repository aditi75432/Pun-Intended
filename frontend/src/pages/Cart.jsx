// import React from 'react'

// const Cart = () => {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default Cart

// src/pages/Cart.jsx
import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotalCartAmount, currency, delivery_fee } = useContext(ShopContext);

    // Convert cartItems object to an array for mapping
    const cartItemsArray = Object.values(cartItems);

    return (
        <div className='px-10 sm:px-20 py-10'>
            <h2 className='text-3xl font-semibold mb-8 text-center'>Your Shopping Cart</h2>

            {cartItemsArray.length === 0 ? (
                <div className='text-center text-gray-600'>
                    <p className='mb-4'>Your cart is empty.</p>
                    <Link to="/" className='text-blue-600 hover:underline'>Continue Shopping</Link>
                </div>
            ) : (
                <>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/* Cart Items List */}
                        <div className='md:col-span-1'>
                            <div className='hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] gap-4 py-3 px-2 bg-gray-100 rounded-md font-semibold text-sm text-gray-700'>
                                <p>Product</p>
                                <p>Details</p>
                                <p>Price</p>
                                <p>Quantity</p>
                                <p>Total</p>
                                <p>Remove</p>
                            </div>
                            {cartItemsArray.map((item, index) => (
                                <div key={item._id + '_' + item.size} className='grid grid-cols-2 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] items-center gap-4 py-4 border-b border-gray-200 text-sm'>
                                    {/* Product Image (for mobile and desktop) */}
                                    <div className='col-span-1 md:col-span-1'>
                                        <img src={item.image} alt={item.name} className='w-20 h-20 object-cover rounded-md' />
                                    </div>

                                    {/* Product Details & Quantity Controls (Responsive Layout) */}
                                    <div className='col-span-1 md:col-span-2 flex flex-col justify-center'>
                                        <p className='font-medium'>{item.name}</p>
                                        <p className='text-gray-500 text-xs'>Size: {item.size}</p>
                                        <div className='flex items-center gap-2 mt-2 md:hidden'>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                                                className='bg-gray-200 px-2 py-1 rounded-md text-gray-700 hover:bg-gray-300'
                                            >-</button>
                                            <span className='font-medium'>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                                                className='bg-gray-200 px-2 py-1 rounded-md text-gray-700 hover:bg-gray-300'
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <p className='col-span-1 md:col-span-1 text-right md:text-left'>
                                        {currency}{item.price.toFixed(2)}
                                    </p>

                                    {/* Quantity (Desktop Only) */}
                                    <div className='hidden md:flex col-span-1 md:col-span-1 items-center gap-2'>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                                            className='bg-gray-200 px-2 py-1 rounded-md text-gray-700 hover:bg-gray-300'
                                        >-</button>
                                        <span className='font-medium'>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                                            className='bg-gray-200 px-2 py-1 rounded-md text-gray-700 hover:bg-gray-300'
                                        >+</button>
                                    </div>

                                    {/* Total Price for Item */}
                                    <p className='col-span-1 md:col-span-1 text-right md:text-left'>
                                        {currency}{(item.price * item.quantity).toFixed(2)}
                                    </p>

                                    {/* Remove Button */}
                                    <div className='col-span-1 md:col-span-1 flex justify-end md:justify-start'>
                                        <button
                                            onClick={() => removeFromCart(item._id, item.size)}
                                            className='text-red-500 hover:text-red-700 text-xl'
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className='md:col-span-1 bg-gray-50 p-6 rounded-md shadow-sm'>
                            <h3 className='text-2xl font-semibold mb-4'>Cart Totals</h3>
                            <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                                <p>Subtotal</p>
                                <p>{currency}{getTotalCartAmount().toFixed(2)}</p>
                            </div>
                            <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                                <p>Delivery Fee</p>
                                <p>{currency}{delivery_fee.toFixed(2)}</p>
                            </div>
                            <div className='flex justify-between items-center py-4 font-bold text-lg'>
                                <p>Total</p>
                                <p>{currency}{(getTotalCartAmount() + delivery_fee).toFixed(2)}</p>
                            </div>
                            <Link to="/place-order">
                                <button className='w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 mt-4'>
                                    PROCEED TO CHECKOUT
                                </button>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
