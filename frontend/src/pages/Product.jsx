// src/pages/Product.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link for cheaper alternatives
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/frontend_assets/assets';
import axios from 'axios'; // Import axios for the new API call

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart } = useContext(ShopContext);
    const [productData, setProductData] = useState(null);
    const [image, setImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');

    // NEW: State for discount information
    const [discountInfo, setDiscountInfo] = useState(null);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState(null);

    useEffect(() => {
        const fetchProductData = () => {
            // Your existing logic to find product data
            const product = products.find((item) => item._id === productId);
            if (product) {
                setProductData(product);
                setImage(product.image[0]);
                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                    setSelectedSize(product.sizes[0]);
                }
            }
        };
        fetchProductData();
    }, [productId, products, selectedSize]);

    // NEW: useEffect to fetch discount information when productData is available
    useEffect(() => {
        const fetchDiscount = async () => {
            if (productData) { // Only fetch if product data is loaded
                setDiscountLoading(true);
                setDiscountError(null); // Clear previous errors
                try {
                    // Call your Node.js backend endpoint for discount
                    // Ensure your backend is running on http://localhost:5000
                    // And your mockProducts have 'id' properties that match your CSVs
                    const response = await axios.post('http://localhost:5000/api/get-product-discount', {
                        productId: productData._id // Use productData._id from your mockProducts
                    });
                    setDiscountInfo(response.data);
                } catch (err) {
                    console.error('Error fetching discount:', err);
                    setDiscountError("Could not load discount information.");
                } finally {
                    setDiscountLoading(false);
                }
            }
        };
        fetchDiscount();
    }, [productData]); // Dependency on productData ensures it runs once the product details are loaded

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size before adding to cart.');
            return;
        }
        addToCart(productId, selectedSize, 1);
        alert(`Added ${productData.name} (Size: ${selectedSize}) to cart!`);
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
                    {productData.sizes && productData.sizes.length > 0 && (
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

                    {/* NEW: Discount Information Display */}
                    <div className='mt-6'>
                        {discountLoading && <p className='text-blue-600'>Checking for discounts...</p>}
                        {discountError && <p className='text-red-500'>{discountError}</p>}
                        {/* Display discount if available and positive */}
                        {discountInfo && discountInfo.suggested_discount_percent > 0 ? (
                            <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative' role="alert">
                                <strong className='font-bold'>Special Offer! </strong>
                                <span className='block sm:inline'>Get **{discountInfo.suggested_discount_percent}% OFF** (${discountInfo.suggested_discount_amount.toFixed(2)}) on this item!</span>
                                <p className='text-sm mt-1'>{discountInfo.explanation}</p>
                            </div>
                        ) : (
                            // Display if no discount and not loading/error
                            !discountLoading && !discountError && discountInfo && (
                                <p className='text-gray-500 text-sm'>No special discount available for this item right now. {discountInfo.explanation}</p>
                            )
                        )}
                        {/* Display cheaper alternatives if provided and no discount */}
                        {discountInfo && discountInfo.cheaper_alternatives && discountInfo.cheaper_alternatives.length > 0 && (
                            <div className='mt-4'>
                                <p className='font-medium'>🔻 Consider these alternatives in the same category:</p>
                                <ul className='list-disc list-inside text-sm text-gray-700'>
                                    {discountInfo.cheaper_alternatives.map(alt => (
                                        <li key={alt.product_id}>
                                            <Link to={`/product/${alt.product_id}`} className='text-blue-500 hover:underline'>
                                                {alt.product_name} (${alt.price.toFixed(2)})
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
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