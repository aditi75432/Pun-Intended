// frontend/src/pages/Cart/Cart.jsx
import React, { useContext } from 'react';
// import './Cart.css'; // REMOVE or COMMENT OUT if exclusively using Tailwind
import { ShopContext } from '../../context/ShopContext'; // Existing main cart context
// import { OutfitCartContext } from '../../context/OutfitCartContext'; // REMOVED: No longer needed here

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  // const { outfits, removeOutfit } = useContext(OutfitCartContext); // REMOVED: No longer needed here

  // You might still have demoOutfitMapping from before, if not, define a simple one
  const demoOutfitMapping = {
      "default_fallback_outfit": "https://via.placeholder.com/300x400.png?text=Outfit+Placeholder" // A generic fallback
  };

  const handleVisualizeOutfit = () => {
    // This logic is for the *old* demo outfit mapping, not the new saved outfits
    // You'll need to decide if you want to keep this functionality for individual items,
    // or if the saved outfits supersede it.
    const currentCartVirtualProductIds = [];
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const product = food_list.find(item => item._id === itemId);
        if (product && product.virtualTryOnProductId) {
          currentCartVirtualProductIds.push(product.virtualTryOnProductId);
        }
      }
    }

    if (currentCartVirtualProductIds.length === 0) {
      alert("Please add some virtual try-on items to your main cart first to visualize!");
      return;
    }

    currentCartVirtualProductIds.sort();
    const cartKey = currentCartVirtualProductIds.join(',');

    const imageUrl = demoOutfitMapping[cartKey];

    if (imageUrl) {
      // Set demo image if found
      // setDemoOutfitImage(imageUrl); // Assuming you have a state for this, like in the old Cart.jsx
      alert("Visualization logic needs to be fully implemented for the demo modal."); // Placeholder
    } else {
      // setDemoOutfitImage(demoOutfitMapping["default_fallback_outfit"]); // Assuming you have a state for this
      console.log(`No specific pre-rendered image for combo: ${cartKey}, showing default fallback.`);
      alert("No specific visualization for this combination, showing default or nothing."); // Placeholder
    }
    // setShowDemoModal(true); // Assuming you have a state for this
  };


  return (
    <div className='p-4 min-h-[70vh]'>
      <div className="w-full max-w-4xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Your Shopping Cart</h2>

        {/* Existing Cart Items Section (from ShopContext) */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">Individual Products</h3>
          {/* Cart Header */}
          <div className="grid grid-cols-6 items-center text-gray-600 font-semibold border-b pb-3 mb-4 text-center">
            <p className="col-span-2">Products</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
          </div>

          {/* Cart Items */}
          {food_list.map((item) => {
            if (cartItems[item._id] > 0) {
              return (
                <div key={item._id} className="grid grid-cols-6 items-center border-b py-4 text-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md mx-auto col-span-2" />
                  <p className="text-lg font-medium">{item.name}</p>
                  <p className="text-gray-700">${item.price.toFixed(2)}</p>
                  <p className="text-gray-700">{cartItems[item._id]}</p>
                  <p className="text-gray-700">${(item.price * cartItems[item._id]).toFixed(2)}</p>
                  <div className="flex justify-center items-center">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 text-2xl font-bold cursor-pointer"
                    >
                      &#x2716; {/* Unicode 'X' mark */}
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })}
          {Object.keys(cartItems).every(key => cartItems[key] === 0) && (
            <p className="text-center text-gray-500 mt-4">Your individual product cart is empty.</p>
          )}
        </div>

        {/* REMOVED: Saved Outfits Section (moved to OutfitCartPage.jsx) */}

        {/* Cart Totals & Promo Code Sections (existing) */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mt-8 w-full">
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4">Cart Totals</h3>
            <div className="flex justify-between items-center mb-2">
              <p>Subtotal</p>
              <p>${getTotalCartAmount().toFixed(2)}</p>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center mb-2">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2.00.toFixed(2)}</p>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center text-xl font-bold mb-4">
              <p>Total</p>
              <p>${(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2.00).toFixed(2)}</p>
            </div>
            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md shadow-md transition duration-300 ease-in-out">
              PROCEED TO CHECKOUT
            </button>
            <button
                onClick={handleVisualizeOutfit}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md shadow-md transition duration-300 ease-in-out"
            >
                Visualize Main Cart Outfit (Demo)
            </button>
          </div>

          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4">Promo Code</h3>
            <p className="text-gray-600 mb-4">If you have a promo code, Enter it here</p>
            <div className="flex">
              <input type="text" placeholder='promo code' className="flex-1 border border-gray-300 p-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button className="bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-r-md transition duration-300">Submit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Outfit Modal (for individual item visualization) - Keep if you still use it */}
      {/* Ensure you define showDemoModal and demoOutfitImage states if you use this */}
      {/*
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-lg w-11/12 max-h-[90vh] overflow-y-auto">
            <span
              onClick={() => setShowDemoModal(false)}
              className="absolute top-3 right-5 text-gray-500 hover:text-gray-800 text-3xl font-bold cursor-pointer"
            >
              &times;
            </span>
            <h3 className="text-2xl font-bold mb-4 text-center">Your Outfit Preview (from Main Cart)</h3>
            {demoOutfitImage ? (
              <img
                src={demoOutfitImage}
                alt="Your visualized outfit"
                className="max-w-full h-auto rounded-md shadow-md mx-auto"
              />
            ) : (
              <p className="text-gray-600 text-center">No visualization available for this combination. Try adding different items!</p>
            )}
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default Cart;