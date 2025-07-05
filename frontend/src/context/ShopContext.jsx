// src/context/ShopContext.jsx
import { createContext, useState, useEffect } from "react";
import { products as initialLocalProducts } from "../assets/frontend_assets/assets"; 
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    // Existing states
    const currency = 'INR ';
    const delivery_fee = 10;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // State to hold the products fetched from the backend (CSV data)
    const [fetchedCsvProducts, setFetchedCsvProducts] = useState([]);

    // The 'products' state that will be exposed by the context,
    // combining initial local products and fetched CSV products
    const [allProducts, setAllProducts] = useState([]);

    // NEW: State for category filtering
    const [categoryFilter, setCategoryFilter] = useState('all'); // Default to show all

    // --- Cart State and Logic ---
    const [cartItems, setCartItems] = useState(() => {
        // Initial cart state from localStorage (only used once on initial mount)
        try {
            const storedCart = localStorage.getItem('cart');
            const parsedCart = storedCart ? JSON.parse(storedCart) : {};
            // >> LOG 1
            console.log("1. Initial cart state from localStorage (useState init):", parsedCart);
            return parsedCart; 
        } catch (error) {
            console.error("Failed to parse cart from localStorage during initial load (useState init):", error);
            return {};
        }
    });

    // Effect to fetch CSV products once on component mount
    useEffect(() => {
        const fetchCsvProducts = async () => {
            try {
                console.log("[ShopContext] Fetching grocery products from backend (CSV data)...");
                const response = await axios.get('http://localhost:5000/api/products-from-csv');
                setFetchedCsvProducts(response.data); // Store the fetched products
            } catch (error) {
                console.error("Error fetching CSV products for ShopContext:", error);
                // If fetching fails, fetchedCsvProducts will remain an empty array
            }
        };
        fetchCsvProducts();
    }, []); // Empty dependency array means this runs only once on component mount

    // Effect to combine local and fetched products whenever fetchedCsvProducts changes
    // This also handles cart initialization/update based on the combined product list
    useEffect(() => {
        // Combine initial local products with fetched CSV products
        const combined = [...initialLocalProducts];
        fetchedCsvProducts.forEach(csvProd => {
            // Add unique CSV products to the combined list
            if (!combined.some(p => p._id === csvProd._id)) {
                combined.push(csvProd);
            }
        });
        // >> LOG 2
        console.log("2. Combined products list:", combined);
        setAllProducts(combined);

        // --- Refined Cart Initialization Logic ---
        setCartItems(prevItems => { // prevItems here is the cart state from the *previous render* or initial state
            // >> LOG 3
            console.log("3. Inside setCartItems callback. prevItems:", prevItems);
            const newInitialCart = {}; // Start with a completely fresh cart object for known products

            // Initialize all known products from the 'combined' list with quantity 0
            combined.forEach(product => {
                const sizesToConsider = (product.sizes && product.sizes.length > 0) ? product.sizes : ["One Size"];
                sizesToConsider.forEach(size => {
                    const itemKey = `${product._id}_${size}`;
                    newInitialCart[itemKey] = {
                        _id: product._id,
                        name: product.name,
                        image: product.image[0],
                        price: product.price,
                        size: size,
                        quantity: 0 // Initialize quantity to 0
                    };
                });
            });
            // >> LOG 4
            console.log("4. New cart initialized with all known products at quantity 0:", newInitialCart);

            // Now, overlay quantities from localStorage if available and valid
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                try {
                    const parsedStoredCart = JSON.parse(storedCart);
                    // >> LOG 5
                    console.log("5. Parsed cart from localStorage (before merging):", parsedStoredCart);
                    for (const key in parsedStoredCart) {
                        // Only apply quantity if the item key exists in our new list of known products
                        if (newInitialCart[key]) {
                            newInitialCart[key].quantity = parsedStoredCart[key].quantity;
                        } else {
                            // Optionally, log if an item in localStorage is no longer in the product catalog
                            console.warn(`Item with key ${key} from localStorage not found in current product catalog.`);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing cart from localStorage when combining products:", e);
                    // If localStorage data is corrupt, we stick with all quantities at 0
                }
            }
            // >> LOG 6
            console.log("6. Final cart state after merging with localStorage:", newInitialCart);
            return newInitialCart; // Return this cleanly constructed cart state
        });

    }, [fetchedCsvProducts, initialLocalProducts]); // Re-combine and re-initialize cart if sources change

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        // >> LOG 7
        console.log("7. Cart state updated, saving to localStorage:", cartItems);
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }, [cartItems]);

    // Function to add an item to the cart
    const addToCart = (productId, size, quantity = 1) => {
        setCartItems(prevItems => {
            const itemKey = `${productId}_${size}`; // Unique key for product + size
            const newCart = { ...prevItems };

            if (newCart[itemKey]) {
                newCart[itemKey].quantity += quantity;
            } else {
                // Find the product data from the combined 'allProducts' array
                const product = allProducts.find(p => p._id === productId);
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
                    console.warn(`Product with ID ${productId} not found in available products.`);
                }
            }
            // >> LOG 8
            console.log("8. Cart state after addToCart:", newCart);
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
            // >> LOG 9
            console.log("9. Cart state after removeFromCart:", newCart);
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
            // >> LOG 10
            console.log("10. Cart state after updateQuantity:", newCart);
            return newCart;
        });
    };

    // Function to clear the entire cart
    const clearCart = () => {
        setCartItems({});
        // >> LOG 11
        console.log("11. Cart state after clearCart:", {});
    };

    // Get total number of items (sum of quantities) in cart
    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
    };

    // Get total price of items in cart
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const itemKey in cartItems) {
            const itemInCart = cartItems[itemKey];
            // Find the product info from the 'allProducts' state to get the correct price
            const productInfo = allProducts.find(p => p._id === itemInCart._id);
            if (productInfo) {
                totalAmount += productInfo.price * itemInCart.quantity;
            }
        }
        return totalAmount;
    };

    // NEW: Function to get filtered products based on categoryFilter
    const getFilteredProducts = () => {
        if (categoryFilter === 'all') {
            return allProducts; // Return all combined products
        } else if (categoryFilter === 'grocery') {
            // Filter products that have a 'category' property and it's 'grocery'
            return allProducts.filter(product => product.category && product.category.toLowerCase() === 'grocery');
        }
        // Add more categories as needed
        return []; // Return empty array if filter doesn't match
    };


    const value = {
        // Expose the combined list of all products under the 'products' key
        products: allProducts, 
        currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
        getTotalCartItems, getTotalCartAmount,
        categoryFilter, setCategoryFilter, getFilteredProducts // Add new filter states/functions
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;

// // src/context/ShopContext.jsx
// import { createContext, useState, useEffect } from "react";
// import { products as initialLocalProducts } from "../assets/frontend_assets/assets"; 
// import axios from 'axios';

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//     // Existing states
//     const currency = 'INR ';
//     const delivery_fee = 10;
//     const [search, setSearch] = useState('');
//     const [showSearch, setShowSearch] = useState(false);

//     // State to hold the products fetched from the backend (CSV data)
//     const [fetchedCsvProducts, setFetchedCsvProducts] = useState([]);

//     // The 'products' state that will be exposed by the context,
//     // combining initial local products and fetched CSV products
//     const [allProducts, setAllProducts] = useState([]);

//     // NEW: State for category filtering
//     const [categoryFilter, setCategoryFilter] = useState('all'); // Default to show all

//     // --- Cart State and Logic ---
//     const [cartItems, setCartItems] = useState(() => {
//         // Initial cart state from localStorage (only used once on initial mount)
//         try {
//             const storedCart = localStorage.getItem('cart');
//             return storedCart ? JSON.parse(storedCart) : {}; 
//         } catch (error) {
//             console.error("Failed to parse cart from localStorage during initial load:", error);
//             return {};
//         }
//     });

//     // Effect to fetch CSV products once on component mount
//     useEffect(() => {
//         const fetchCsvProducts = async () => {
//             try {
//                 console.log("[ShopContext] Fetching grocery products from backend (CSV data)...");
//                 const response = await axios.get('http://localhost:5000/api/products-from-csv');
//                 setFetchedCsvProducts(response.data); // Store the fetched products
//             } catch (error) {
//                 console.error("Error fetching CSV products for ShopContext:", error);
//                 // If fetching fails, fetchedCsvProducts will remain an empty array
//             }
//         };
//         fetchCsvProducts();
//     }, []); // Empty dependency array means this runs only once on mount

//     // Effect to combine local and fetched products whenever fetchedCsvProducts changes
//     // This also handles cart initialization/update based on the combined product list
//     useEffect(() => {
//         // Combine initial local products with fetched CSV products
//         const combined = [...initialLocalProducts];
//         fetchedCsvProducts.forEach(csvProd => {
//             // Add unique CSV products to the combined list
//             if (!combined.some(p => p._id === csvProd._id)) {
//                 combined.push(csvProd);
//             }
//         });
//         setAllProducts(combined);

//         // --- Refined Cart Initialization Logic ---
//         setCartItems(prevItems => { // prevItems here is the cart state from the *previous render* or initial state
//             const newInitialCart = {}; // Start with a completely fresh cart object for known products

//             // Initialize all known products from the 'combined' list with quantity 0
//             combined.forEach(product => {
//                 const sizesToConsider = (product.sizes && product.sizes.length > 0) ? product.sizes : ["One Size"];
//                 sizesToConsider.forEach(size => {
//                     const itemKey = `${product._id}_${size}`;
//                     newInitialCart[itemKey] = {
//                         _id: product._id,
//                         name: product.name,
//                         image: product.image[0],
//                         price: product.price,
//                         size: size,
//                         quantity: 0 // Initialize quantity to 0
//                     };
//                 });
//             });

//             // Now, overlay quantities from localStorage if available and valid
//             const storedCart = localStorage.getItem('cart');
//             if (storedCart) {
//                 try {
//                     const parsedStoredCart = JSON.parse(storedCart);
//                     for (const key in parsedStoredCart) {
//                         // Only apply quantity if the item key exists in our new list of known products
//                         if (newInitialCart[key]) {
//                             newInitialCart[key].quantity = parsedStoredCart[key].quantity;
//                         } else {
//                             // Optionally, log if an item in localStorage is no longer in the product catalog
//                             console.warn(`Item with key ${key} from localStorage not found in current product catalog.`);
//                         }
//                     }
//                 } catch (e) {
//                     console.error("Error parsing cart from localStorage when combining products:", e);
//                     // If localStorage data is corrupt, we stick with all quantities at 0
//                 }
//             }
//             return newInitialCart; // Return this cleanly constructed cart state
//         });

//     }, [fetchedCsvProducts, initialLocalProducts]); // Re-combine and re-initialize cart if sources change

//     // Persist cart to localStorage whenever it changes
//     useEffect(() => {
//         try {
//             localStorage.setItem('cart', JSON.stringify(cartItems));
//         } catch (error) {
//             console.error("Failed to save cart to localStorage:", error);
//         }
//     }, [cartItems]);

//     // Function to add an item to the cart
//     const addToCart = (productId, size, quantity = 1) => {
//         setCartItems(prevItems => {
//             const itemKey = `${productId}_${size}`; // Unique key for product + size
//             const newCart = { ...prevItems };

//             if (newCart[itemKey]) {
//                 newCart[itemKey].quantity += quantity;
//             } else {
//                 // Find the product data from the combined 'allProducts' array
//                 const product = allProducts.find(p => p._id === productId);
//                 if (product) {
//                     newCart[itemKey] = {
//                         _id: productId,
//                         name: product.name,
//                         image: product.image[0], // Assuming you want the first image for cart display
//                         price: product.price,
//                         size: size, // Store the selected size
//                         quantity: quantity
//                     };
//                 } else {
//                     console.warn(`Product with ID ${productId} not found in available products.`);
//                 }
//             }
//             return newCart;
//         });
//     };

//     // Function to remove an item from the cart
//     const removeFromCart = (productId, size) => {
//         setCartItems(prevItems => {
//             const itemKey = `${productId}_${size}`;
//             const newCart = { ...prevItems };
//             if (newCart[itemKey]) {
//                 delete newCart[itemKey];
//             }
//             return newCart;
//         });
//     };

//     // Function to update the quantity of an item in the cart
//     const updateQuantity = (productId, size, newQuantity) => {
//         setCartItems(prevItems => {
//             const itemKey = `${productId}_${size}`;
//             const newCart = { ...prevItems };

//             if (newQuantity <= 0) {
//                 // Remove item if quantity goes to 0 or less
//                 delete newCart[itemKey];
//             } else if (newCart[itemKey]) {
//                 newCart[itemKey].quantity = newQuantity;
//             }
//             return newCart;
//         });
//     };

//     // Function to clear the entire cart
//     const clearCart = () => {
//         setCartItems({});
//     };

//     // Get total number of items (sum of quantities) in cart
//     const getTotalCartItems = () => {
//         return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
//     };

//     // Get total price of items in cart
//     const getTotalCartAmount = () => {
//         let totalAmount = 0;
//         for (const itemKey in cartItems) {
//             const itemInCart = cartItems[itemKey];
//             // Find the product info from the 'allProducts' state to get the correct price
//             const productInfo = allProducts.find(p => p._id === itemInCart._id);
//             if (productInfo) {
//                 totalAmount += productInfo.price * itemInCart.quantity;
//             }
//         }
//         return totalAmount;
//     };

//     // NEW: Function to get filtered products based on categoryFilter
//     const getFilteredProducts = () => {
//         if (categoryFilter === 'all') {
//             return allProducts; // Return all combined products
//         } else if (categoryFilter === 'grocery') {
//             // Filter products that have a 'category' property and it's 'grocery'
//             return allProducts.filter(product => product.category && product.category.toLowerCase() === 'grocery');
//         }
//         // Add more categories as needed
//         return []; // Return empty array if filter doesn't match
//     };


//     const value = {
//         // Expose the combined list of all products under the 'products' key
//         products: allProducts, 
//         currency, delivery_fee,
//         search, setSearch, showSearch, setShowSearch,
//         cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
//         getTotalCartItems, getTotalCartAmount,
//         categoryFilter, setCategoryFilter, getFilteredProducts // Add new filter states/functions
//     };

//     return (
//         <ShopContext.Provider value={value}>
//             {props.children}
//         </ShopContext.Provider>
//     );
// };

// export default ShopContextProvider;



// import { createContext, useState, useEffect } from "react";
// import { products } from "../assets/frontend_assets/assets"; // Assuming this is your product data array

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//     // Existing states
//     const currency = 'INR ';
//     const delivery_fee = 10;
//     const [search, setSearch] = useState('');
//     const [showSearch, setShowSearch] = useState(false);

//     // --- Cart State and Logic ---
//     const [cartItems, setCartItems] = useState(() => {
//         // Initialize cart from localStorage on component mount
//         try {
//             const storedCart = localStorage.getItem('cart');
//             return storedCart ? JSON.parse(storedCart) : {}; // Use an object for cart for easier updates
//         } catch (error) {
//             console.error("Failed to parse cart from localStorage:", error);
//             return {};
//         }
//     });

//     // Persist cart to localStorage whenever it changes
//     useEffect(() => {
//         try {
//             localStorage.setItem('cart', JSON.stringify(cartItems));
//         } catch (error) {
//             console.error("Failed to save cart to localStorage:", error);
//         }
//     }, [cartItems]);

//     // Function to add an item to the cart
//     // It now also takes 'size' as a parameter, crucial for apparel/items with variations
//     const addToCart = (productId, size, quantity = 1) => {
//         setCartItems(prevItems => {
//             const itemKey = `${productId}_${size}`; // Unique key for product + size
//             const newCart = { ...prevItems };

//             if (newCart[itemKey]) {
//                 // If item (with this size) already exists, update its quantity
//                 newCart[itemKey].quantity += quantity;
//             } else {
//                 // If new item (or new size of existing product), add it
//                 // Find the product data from your 'products' array
//                 const product = products.find(p => p._id === productId);
//                 if (product) {
//                     newCart[itemKey] = {
//                         _id: productId,
//                         name: product.name,
//                         image: product.image[0], // Assuming you want the first image for cart display
//                         price: product.price,
//                         size: size, // Store the selected size
//                         quantity: quantity
//                     };
//                 } else {
//                     console.warn(`Product with ID ${productId} not found.`);
//                 }
//             }
//             return newCart;
//         });
//     };

//     // Function to remove an item from the cart
//     const removeFromCart = (productId, size) => {
//         setCartItems(prevItems => {
//             const itemKey = `${productId}_${size}`;
//             const newCart = { ...prevItems };
//             if (newCart[itemKey]) {
//                 delete newCart[itemKey];
//             }
//             return newCart;
//         });
//     };

//     // Function to update the quantity of an item in the cart
//     const updateQuantity = (productId, size, newQuantity) => {
//         setCartItems(prevItems => {
//             const itemKey = `${productId}_${size}`;
//             const newCart = { ...prevItems };

//             if (newQuantity <= 0) {
//                 // Remove item if quantity goes to 0 or less
//                 delete newCart[itemKey];
//             } else if (newCart[itemKey]) {
//                 newCart[itemKey].quantity = newQuantity;
//             }
//             return newCart;
//         });
//     };

//     // Function to clear the entire cart
//     const clearCart = () => {
//         setCartItems({});
//     };

//     // Get total number of items (sum of quantities) in cart
//     const getTotalCartItems = () => {
//         return Object.values(cartItems).reduce((total, item) => total + item.quantity, 0);
//     };

//     // Get total price of items in cart
//     const getTotalCartAmount = () => {
//         return Object.values(cartItems).reduce((total, item) => total + (item.price * item.quantity), 0);
//     };

//     const value = {
//         products, currency, delivery_fee,
//         search, setSearch, showSearch, setShowSearch,
//         cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
//         getTotalCartItems, getTotalCartAmount
//     };

//     return (
//         <ShopContext.Provider value={value}>
//             {props.children}
//         </ShopContext.Provider>
//     );
// };

// export default ShopContextProvider;


