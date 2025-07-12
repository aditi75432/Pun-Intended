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
import { useState } from 'react';
import axios from 'axios';

//import PImg1 from '../assets/frontend_assets/p_img1.png'; // adjust path based on file location
import PImg1 from '../assets/frontend_assets/p_img1.png'; // Woman cotton top
import PImg2 from '../assets/frontend_assets/p_img2_1.png'; // Man cotton tee

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotalCartAmount, currency, delivery_fee, addToCart } = useContext(ShopContext);
const [uploadedFile, setUploadedFile] = useState(null);


    const [ocrResults, setOcrResults] = useState([]);
const [ocrLoading, setOcrLoading] = useState(false);

// OCR Upload Handler
// const handleOCRUpload = async (event) => {
//     const file = event.target.files[0];
//     const formData = new FormData();
//     formData.append('image', file);

//     setOcrLoading(true);
//     try {
//         const response = await axios.post("http://localhost:8000/upload/", formData);
//         setOcrResults(response.data.matches);

//         // 🔁 TODO: You can loop over results and add them to cart here
//         console.log("OCR Results:", response.data.matches);
//         alert("OCR completed. You can now add these items to cart manually or automate it.");
//     } catch (err) {
//         console.error("OCR upload failed:", err);
//         alert("Failed to process image");
//     } finally {
//         setOcrLoading(false);
//     }
// };
// OCR Upload Handler
// const handleOCRUpload = async (event) => {
//     const file = event.target.files[0];
//     const formData = new FormData();
//     formData.append('image', file);

//     setOcrLoading(true);
//     try {
//         const response = await axios.post("http://localhost:8000/upload/", formData);
//         const results = response.data.matches;
//         setOcrResults(results);

//         // 🔁 Auto-add OCR items to cart
//         results.forEach(item => {
//             const itemObj = {
//                 _id: item.name,                          // fallback unique ID
//                 name: item.name,
//                 price: item.price,
//                 image: "https://via.placeholder.com/100", // or use actual if available
//                 size: "standard",
//                 quantity: 1
//             };

//             addToCart(itemObj); // 👈 this actually adds it to the cart
//         });

//         alert("OCR completed. Items added to cart!");
//     } catch (err) {
//         console.error("OCR upload failed:", err);
//         alert("Failed to process image");
//     } finally {
//         setOcrLoading(false);
//     }
// };
const handleOCRUpload = async (event) => {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append('image', file);

  setOcrLoading(true);
  try {
    const response = await axios.post("http://localhost:8000/upload/", formData);
    const results = response.data.matches;

    // Attach image, size, and link based on known products
    const enriched = results.map(item => {
      let link = "", image = "";

if (item.name.toLowerCase().includes("woman")) {
  link = "http://localhost:5173/product/aaaaa";
  image = "/p_img1.png"; // ✅ pulled from public/
} else if (item.name.toLowerCase().includes("man")) {
  link = "http://localhost:5173/product/aaaab";
  image = "/p_img2_1.png"; // ✅ pulled from public/
} else {
  link = item.link || "#";
  image = "https://via.placeholder.com/100";
}
      return { ...item, image, size: "M", link };
    });

    setOcrResults(enriched);
    alert("OCR completed. Review and add items to your cart.");
  } catch (err) {
    console.error("OCR upload failed:", err);
    alert("Failed to process image");
  } finally {
    setOcrLoading(false);
  }
};

{ocrResults.length > 0 && (
  <div className='mt-4 bg-gray-100 p-4 rounded-md text-left'>
    <h4 className='font-semibold mb-4'>Detected Items via OCR</h4>
    <div className='grid gap-4'>
      {ocrResults.map((item, index) => (
        <div key={index} className='flex items-center justify-between bg-white p-4 rounded-md shadow-sm'>
          {/* Left: Image + Info */}
          <div className='flex items-center gap-4'>
            <img
              src={item.image}
              alt={item.name}
              className='w-20 h-20 object-cover rounded-md'
            />
            <div>
              <p className='font-medium'>{item.name}</p>
              <p className='text-gray-600'>₹{item.price}</p>
              <select
                value={item.size}
                onChange={(e) => {
                  const updated = [...ocrResults];
                  updated[index].size = e.target.value;
                  setOcrResults(updated);
                }}
                className='mt-1 border rounded px-2 py-1 text-sm'
              >
                <option value="S">Size: S</option>
                <option value="M">Size: M</option>
                <option value="L">Size: L</option>
              </select>
              <div className='mt-1'>
                <a href={item.link} target='_blank' rel='noopener noreferrer' className='text-blue-600 underline text-sm'>
                  View Product
                </a>
              </div>
            </div>
          </div>

          {/* Right: Accept / Reject Buttons */}
          <div className='flex gap-2'>
            <button
              onClick={() => {
                const product = {
                  _id: item.name,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  size: item.size,
                  quantity: 1
                };
                addToCart(product);
                setOcrResults(prev => prev.filter((_, i) => i !== index));
              }}
              className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm'
            >
              ✅ Add
            </button>
            <button
              onClick={() => {
                setOcrResults(prev => prev.filter((_, i) => i !== index));
              }}
              className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm'
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


    // Convert cartItems object to an array for mapping
    const cartItemsArray = Object.values(cartItems);

    return (
        <div className='px-10 sm:px-20 py-10'>
            <h2 className='text-3xl font-semibold mb-8 text-center'>Your Shopping Cart</h2>

            {/* <div className='my-6 text-center'>
  <label className='bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700'>
    {ocrLoading ? "Uploading..." : "Upload Shopping List (OCR)"}
    <input
      type="file"
      accept="image/*"
      onChange={handleOCRUpload}
      className="hidden"
    />
  </label>
</div> */}

<div className='my-6 text-center'>
  {/* File Upload Input */}
  {!uploadedFile ? (
    <label className='bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700'>
      Upload Shopping List (OCR)
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setUploadedFile(file);
            setOcrResults([]); // clear previous results
          }
        }}
        className="hidden"
      />
    </label>
  ) : (
    <div className='flex flex-col items-center gap-4'>
      {/* Image Preview */}
      <img
        src={URL.createObjectURL(uploadedFile)}
        alt="Uploaded Preview"
        className="w-32 h-32 object-cover border rounded"
      />

      {/* OCR Action Buttons */}
      <div className='flex gap-4'>
        <button
          onClick={async () => {
            if (!uploadedFile) return;
            const formData = new FormData();
            formData.append('image', uploadedFile);

            setOcrLoading(true);
            try {
              const response = await axios.post("http://localhost:8000/upload/", formData);
              const results = response.data.matches;

              const enriched = results.map(item => {
                let link = "", image = "";

if (item.name.toLowerCase().includes("woman")) {
  link = "http://localhost:5173/product/aaaaa";
  image = "http://localhost:5173/p_img1.png";  // ✅ Full URL
} else if (item.name.toLowerCase().includes("man")) {
  link = "http://localhost:5173/product/aaaab";
  image = "http://localhost:5173/p_img2_1.png";  // ✅ Full URL
}

 else {
  link = item.link || "#";
  image = "https://via.placeholder.com/100";
}
                return { ...item, image, size: "M", link };
              });

              setOcrResults(enriched);
              alert("OCR completed. Review items to add to cart.");
            } catch (err) {
              console.error("OCR failed:", err);
              alert("OCR processing failed.");
            } finally {
              setOcrLoading(false);
            }
          }}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
          disabled={ocrLoading}
        >
          {ocrLoading ? "Running OCR..." : "Run OCR on List"}
        </button>

        <button
          onClick={() => {
            setUploadedFile(null);
            setOcrResults([]);
          }}
          className='text-red-500 hover:text-red-700 text-lg'
        >
          ❌ Remove
        </button>
      </div>
    </div>
  )}
</div>
{ocrResults.length > 0 && (
  <div className="mt-6 bg-gray-50 p-6 rounded-md">
    <h4 className="text-lg font-semibold mb-4">OCR Detected Items (Review to Add):</h4>
    <div className="grid grid-cols-1 gap-4">
      {ocrResults.map((item, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border p-4 rounded-md bg-white shadow-sm"
        >
          {/* Image */}
          <div className="flex items-center gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
              <a
                href={item.link}
                target="_blank"
                className="text-blue-600 text-sm underline"
              >
                View Product
              </a>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <select
              className="border px-2 py-1 rounded-md"
              value={item.size}
              onChange={(e) => {
                const updated = [...ocrResults];
                updated[index].size = e.target.value;
                setOcrResults(updated);
              }}
            >
              <option value="S">Size S</option>
              <option value="M">Size M</option>
              <option value="L">Size L</option>
              <option value="XL">Size XL</option>
            </select>

            <button
              onClick={() => {
                const itemObj = {
                  _id: item.name,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  size: item.size,
                  quantity: 1,
                };
                addToCart(itemObj);
                const updated = [...ocrResults];
                updated.splice(index, 1);
                setOcrResults(updated);
              }}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              ✅ Add
            </button>

            <button
              onClick={() => {
                const updated = [...ocrResults];
                updated.splice(index, 1);
                setOcrResults(updated);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* {ocrResults.length > 0 && (
  <div className='mt-4 bg-gray-100 p-4 rounded-md text-left'>
    <h4 className='font-semibold mb-2'>OCR Detected Items:</h4>
    <ul className='list-disc list-inside'>
      {ocrResults.map((item, index) => (
        <li key={index}>
          {item.name} - ₹{item.price} — <a href={item.link} target='_blank' className='text-blue-600 underline'>Buy</a>
        </li>
      ))}
    </ul>
  </div>
)} */}



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
