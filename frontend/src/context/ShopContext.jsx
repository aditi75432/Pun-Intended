// src/context/ShopContext.jsx
import { createContext, useState, useEffect } from "react";
import { products } from "../assets/frontend_assets/assets"; // Assuming this is your product data array

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    // Existing states
    const currency = 'INR ';
    const delivery_fee = 10;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // --- Cart State and Logic ---
    const [cartItems, setCartItems] = useState(() => {
        // Initialize cart from localStorage on component mount
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : {}; // Use an object for cart for easier updates
        } catch (error) {
            console.error("Failed to parse cart from localStorage:", error);
            return {};
        }
    });

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }, [cartItems]);

    // Function to add an item to the cart
    // It now also takes 'size' as a parameter, crucial for apparel/items with variations
    const addToCart = (productId, size, quantity = 1) => {
        setCartItems(prevItems => {
            const itemKey = `${productId}_${size}`; // Unique key for product + size
            const newCart = { ...prevItems };

            if (newCart[itemKey]) {
                // If item (with this size) already exists, update its quantity
                newCart[itemKey].quantity += quantity;
            } else {
                // If new item (or new size of existing product), add it
                // Find the product data from your 'products' array
                const product = products.find(p => p._id === productId);
                if (product) {
                    newCart[itemKey] = {
                        _id: productId,
                        name: product.name,
                        image: product.image[0], // Assuming you want the first image for cart display
                        price: product.price,
                        size: size, // Store the selected size
                        quantity: quantity
                    };
                } else {
                    console.warn(`Product with ID ${productId} not found.`);
                }
            }
            return newCart;
        });
    };

    // Function to remove an item from the cart
    const removeFromCart = (productId, size) => {
        setCartItems(prevItems => {
            const itemKey = `${productId}_${size}`;
            const newCart = { ...prevItems };
            if (newCart[itemKey]) {
                delete newCart[itemKey];
            }
            return newCart;
        });
    };

    // Function to update the quantity of an item in the cart
    const updateQuantity = (productId, size, newQuantity) => {
        setCartItems(prevItems => {
            const itemKey = `${productId}_${size}`;
            const newCart = { ...prevItems };

            if (newQuantity <= 0) {
                // Remove item if quantity goes to 0 or less
                delete newCart[itemKey];
            } else if (newCart[itemKey]) {
                newCart[itemKey].quantity = newQuantity;
            }
            return newCart;
        });
    };

    // Function to clear the entire cart
    const clearCart = () => {
        setCartItems({});
    };

    // Get total number of items (sum of quantities) in cart
    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    };

    // Get total price of items in cart
    const getTotalCartAmount = () => {
        return Object.values(cartItems).reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
        getTotalCartItems, getTotalCartAmount
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;


