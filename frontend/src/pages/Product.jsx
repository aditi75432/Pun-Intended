// src/pages/Product.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext'; // Ensure this path is correct
import { assets } from '../assets/frontend_assets/assets'; // Ensure this path is correct

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart } = useContext(ShopContext); // Get addToCart from context
    const [productData, setProductData] = useState(null);
    const [image, setImage] = useState('');
    const [selectedSize, setSelectedSize] = useState(''); // Renamed to selectedSize for clarity

    useEffect(() => {
        const fetchProductData = () => {
            const product = products.find((item) => item._id === productId);
            if (product) {
                setProductData(product);
                setImage(product.image[0]);
                // Set a default size if available and no size is pre-selected
                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                    setSelectedSize(product.sizes[0]);
                }
            }
        };
        fetchProductData();
    }, [productId, products, selectedSize]); // Added selectedSize to dependency array

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size before adding to cart.'); // Basic validation
            return;
        }
        addToCart(productId, selectedSize, 1); // Add to cart with selected size and quantity 1
        alert(`Added ${productData.name} (Size: ${selectedSize}) to cart!`); // Feedback
    };

    return productData ? (
        <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 px-10 sm:px-20'>
            {/* Product Layout */}
            <div className='flex flex-col sm:flex-row gap-12'>
                {/* Left Section - Images */}
                <div className='flex gap-3'>
                    <div className='flex flex-col gap-3'>
                        {productData.image.map((item, index) => (
                            <img
                                key={index}
                                src={item}
                                className='w-16 h-16 cursor-pointer border border-gray-300'
                                onClick={() => setImage(item)}
                                alt='Thumbnail'
                            />
                        ))}
                    </div>
                    <div className='w-[400px] h-auto'>
                        <img className='w-full h-auto object-cover' src={image} alt='Product' />
                    </div>
                </div>

                {/* Right Section - Product Info */}
                <div className='flex-1'>
                    <h1 className='font-semibold text-2xl'>{productData.name}</h1>
                    <div className='flex items-center gap-1 mt-2'>
                        {[...Array(4)].map((_, i) => (
                            <img key={i} src={assets.star_icon} alt='Star' className='w-4' />
                        ))}
                        <img src={assets.star_dull_icon} alt='Star' className='w-4' />
                        <p className='pl-2 text-gray-500'>(122)</p>
                    </div>
                    <p className='mt-5 text-3xl font-semibold'>{currency}{productData.price}</p>
                    <p className='mt-5 text-gray-600 leading-6'>{productData.description}</p>

                    {/* Size Selection */}
                    {productData.sizes && productData.sizes.length > 0 && ( // Conditionally render if sizes exist
                        <div className='mt-6'>
                            <p className='font-medium'>Select Size</p>
                            <div className='flex gap-2 mt-2'>
                                {productData.sizes.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedSize(item)}
                                        className={`border py-2 px-4 text-sm ${item === selectedSize ? 'border-black' : 'border-gray-300'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart} // Call the new handler
                        className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 mt-6'
                    >
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    ) : <div className='opacity-0'></div>; // Render a transparent div while loading
};

export default Product;



