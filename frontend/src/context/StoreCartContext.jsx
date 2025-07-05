// frontend/src/context/StoreCartContext.jsx
import React, { createContext, useState } from "react";

export const StoreCartContext = createContext(null);

export const StoreCartContextProvider = (props) => {
  // `storeCartItems` will hold objects with `_id`, `name`, `price`, `image`, `size`, `quantity` for scanned store products.
  const [storeCartItems, setStoreCartItems] = useState({});

  // Function to add a product to the store cart
  // `productToAdd` is expected to be a full product object (as returned by the backend scan).
  const addToStoreCart = (productToAdd, quantity = 1) => {
    setStoreCartItems((prev) => {
      const existingItem = prev[productToAdd._id];
      const updatedCart = { ...prev };

      if (existingItem) {
        // If product already in cart, just update quantity
        updatedCart[productToAdd._id] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };
      } else {
        // If new product, add it with all its details
        updatedCart[productToAdd._id] = {
          _id: productToAdd._id,
          name: productToAdd.name,
          price: productToAdd.price,
          image: productToAdd.image,
          size: productToAdd.sizes && productToAdd.sizes.length > 0 ? productToAdd.sizes[0] : "One Size", // Use first size from backend, or default
          quantity: quantity,
        };
      }
      console.log(`Store Product with ID ${productToAdd._id} added to store cart!`, updatedCart[productToAdd._id]);
      return updatedCart;
    });
  };

  // Function to remove a product from the store cart (decreases quantity or removes if 1)
  const removeFromStoreCart = (itemId) => {
    setStoreCartItems((prev) => {
      const updatedCart = { ...prev };
      if (updatedCart[itemId]) {
        if (updatedCart[itemId].quantity > 1) {
          updatedCart[itemId] = {
            ...updatedCart[itemId],
            quantity: updatedCart[itemId].quantity - 1,
          };
        } else {
          delete updatedCart[itemId]; // Remove item if quantity becomes 0
        }
      }
      return updatedCart;
    });
  };

  // Function to update item quantity directly in the store cart
  const updateStoreCartItemQuantity = (newQuantity, itemId) => {
    setStoreCartItems((prev) => {
      const updatedCart = { ...prev };
      if (updatedCart[itemId]) {
        updatedCart[itemId] = {
          ...updatedCart[itemId],
          quantity: newQuantity,
        };
      }
      return updatedCart;
    });
  };

  // Function to clear the entire store cart
  const clearStoreCart = () => {
    setStoreCartItems({});
    console.log("Store cart cleared.");
  };

  // Function to get total amount of items in the store cart
  const getTotalStoreCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in storeCartItems) {
      if (storeCartItems[itemId].quantity > 0) {
        let itemInfo = storeCartItems[itemId];
        totalAmount += itemInfo.price * itemInfo.quantity;
      }
    }
    return totalAmount;
  };

  const contextValue = {
    storeCartItems,
    addToStoreCart,
    removeFromStoreCart,
    updateStoreCartItemQuantity,
    getTotalStoreCartAmount,
    clearStoreCart,
  };

  return (
    <StoreCartContext.Provider value={contextValue}>
      {props.children}
    </StoreCartContext.Provider>
  );
};