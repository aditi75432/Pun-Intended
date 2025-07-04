// // frontend/src/pages/ImageSearch.jsx
// frontend/src/pages/ImageSearch.jsx
import React, { useState } from 'react';
import ProductItem from '../components/ProductItem'; // <--- Import your existing ProductItem component
import { Link } from 'react-router-dom'; // Import Link (good practice, though ProductItem handles it)

const ImageSearch = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // For image preview
    const [mostRelevantProduct, setMostRelevantProduct] = useState(null); // <--- Changed to hold a single product object
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file)); // Create a URL for preview
            setError(null); // Clear previous errors
            setMostRelevantProduct(null); // <--- Clear previous results
        } else {
            setSelectedImage(null);
            setPreviewImage(null);
        }
    };

    const handleSearch = async () => {
        if (!selectedImage) {
            setError('Please select an image to search.');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedImage); // 'image' should match your backend's expected field name

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/search-by-image', { // Your backend endpoint
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to perform image search.');
            }

            const data = await response.json();
            console.log('Search API Response:', data); // Log the full response for debugging

            if (data.products && data.products.length > 0) {
                // Backend returns results sorted by relevance, so the first one is the most relevant.
                // You can add a score threshold here if you only want results above a certain relevance.
                // For example: const filteredProducts = data.products.filter(p => p.score > 0.7);
                // setMostRelevantProduct(filteredProducts.length > 0 ? filteredProducts[0] : null);
                setMostRelevantProduct(data.products[0]); // <--- Set only the first product
            } else {
                setError("No highly relevant products found. Try a different image.");
                setMostRelevantProduct(null);
            }

        } catch (err) {
            console.error('Error during image search:', err);
            setError(err.message);
            setMostRelevantProduct(null); // <--- Clear result on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-bold text-center mb-8'>Visual Product Search</h1>

            <div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8'>
                <p className='text-gray-700 mb-4 text-center'>Upload an image of a product to find similar items in our store.</p>
                
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />

                {previewImage && (
                    <div className='mt-6 text-center'>
                        <p className='text-gray-600 mb-2'>Image Preview:</p>
                        <img src={previewImage} alt="Preview" className='max-w-xs max-h-48 object-contain mx-auto border border-gray-300 rounded-md' />
                    </div>
                )}

                {error && <p className='text-red-500 text-center mt-4'>{error}</p>}

                <button
                    onClick={handleSearch}
                    disabled={loading || !selectedImage}
                    className='mt-6 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium'
                >
                    {loading ? 'Searching...' : 'Search for Similar Products'}
                </button>
            </div>

            <hr className='my-8' />

            <h2 className='text-2xl font-bold mb-6 text-center'>Search Results</h2>
            {loading && <p className='text-center text-blue-600'>Loading results...</p>}
            
            {/* Conditional rendering based on search state */}
            {!loading && !mostRelevantProduct && selectedImage && !error && (
                <p className='text-center text-gray-600'>No similar products found. Try a different image or adjust your search.</p>
            )}
            {!loading && mostRelevantProduct && (
                <div className='flex justify-center'> {/* Use flexbox to center a single item */}
                    {/* Render only the most relevant product using ProductItem */}
                    <ProductItem
                        key={mostRelevantProduct.id}
                        id={mostRelevantProduct.id}
                        name={mostRelevantProduct.productName}
                        price={mostRelevantProduct.price}
                        image={mostRelevantProduct.imageUrl} // <--- Pass imageUrl directly (it's a string)
                        // You can also pass the score if ProductItem should display it, or for debugging
                        score={mostRelevantProduct.score} 
                    />
                </div>
            )}
            {!loading && !selectedImage && !error && (
                <p className='text-center text-gray-600'>Upload an image above to start your search.</p>
            )}
        </div>
    );
};

export default ImageSearch;



// import React, { useState } from 'react';
// import ProductItem from '../components/ProductItem'; // <--- Import your existing ProductItem component

// const ImageSearch = () => {
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [previewImage, setPreviewImage] = useState(null); // For image preview
//     const [searchResults, setSearchResults] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setSelectedImage(file);
//             setPreviewImage(URL.createObjectURL(file)); // Create a URL for preview
//             setError(null); // Clear previous errors
//             setSearchResults([]); // Clear previous results
//         } else {
//             setSelectedImage(null);
//             setPreviewImage(null);
//         }
//     };

//     const handleSearch = async () => {
//         if (!selectedImage) {
//             setError('Please select an image to search.');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('image', selectedImage); // 'image' should match your backend's expected field name

//         setLoading(true);
//         setError(null);

//         try {
//             const response = await fetch('http://localhost:5000/api/search-by-image', { // Your backend endpoint
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to perform image search.');
//             }

//             const data = await response.json();
//             // Assuming backend returns { products: [...] }
//             // Each product object from Azure AI Search has 'id', 'productName', 'imageUrl', 'price', etc.
//             setSearchResults(data.products || []);
//         } catch (err) {
//             setError(err.message);
//             setSearchResults([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className='container mx-auto px-4 py-8'>
//             <h1 className='text-3xl font-bold text-center mb-8'>Virtual Image Search</h1>

//             <div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8'>
//                 <p className='text-gray-700 mb-4 text-center'>Upload an image of a product to find similar items in our store.</p>
                
//                 <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                     className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
//                 />

//                 {previewImage && (
//                     <div className='mt-6 text-center'>
//                         <p className='text-gray-600 mb-2'>Image Preview:</p>
//                         <img src={previewImage} alt="Preview" className='max-w-xs max-h-48 object-contain mx-auto border border-gray-300 rounded-md' />
//                     </div>
//                 )}

//                 {error && <p className='text-red-500 text-center mt-4'>{error}</p>}

//                 <button
//                     onClick={handleSearch}
//                     disabled={loading || !selectedImage}
//                     className='mt-6 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium'
//                 >
//                     {loading ? 'Searching...' : 'Search for Similar Products'}
//                 </button>
//             </div>

//             <hr className='my-8' />

//             <h2 className='text-2xl font-bold mb-6 text-center'>Search Results</h2>
//             {loading && <p className='text-center text-blue-600'>Loading results...</p>}
//             {!loading && searchResults.length === 0 && selectedImage && !error && (
//                 <p className='text-center text-gray-600'>No similar products found. Try a different image.</p>
//             )}
//             {!loading && searchResults.length > 0 && (
//                 <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
//                     {searchResults.map(product => (
//                         <ProductItem
//                             key={product.id} // Ensure 'id' is available from backend search result
//                             name={product.productName} // Backend returns 'productName'
//                             id={product.id}
//                             price={product.price}
//                             image={product.imageUrl} // Backend returns 'imageUrl'
//                             // Pass other props if ProductItem expects them (e.g., category, etc.)
//                         />
//                     ))}
//                 </div>
//             )}
//             {!loading && !selectedImage && !error && (
//                 <p className='text-center text-gray-600'>Upload an image above to start your search.</p>
//             )}
//         </div>
//     );
// };

// export default ImageSearch;