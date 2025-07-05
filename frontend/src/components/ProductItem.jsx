// src/components/ProductItem.jsx
// frontend/src/components/ProductItem.jsx
import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => { // 'image' can now be a string or an array
    const { currency } = useContext(ShopContext);

    // Determine the actual image URL: if 'image' is an array, take the first element; otherwise, use it directly.
    const imageUrlToDisplay = Array.isArray(image) ? image[0] : image;

    return (
        <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
            <div className='overflow-hidden'>
                <img className='hover:scale-110 transition ease-in-out' src={imageUrlToDisplay} alt={name} />
            </div>
            <p className='pt-3 pb-1 text-sm'>{name}</p>
            <p className='text-sm font-medium'>{currency}{price}</p>
        </Link>
    );
}

export default ProductItem;


// import React, { useContext } from 'react';
// import { ShopContext } from '../context/ShopContext';
// import { Link } from 'react-router-dom';

// const ProductItem = ({ id, image, name, price }) => {
//     const { currency } = useContext(ShopContext);

//     return (
//         <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
//             <div className='overflow-hidden'>
//                 <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
//             </div>
//             <p className='pt-3 pb-1 text-sm'>{name}</p>
//             <p className='text-sm font-medium'>{currency}{price}</p>
//         </Link>
//     );
// }

// export default ProductItem;


