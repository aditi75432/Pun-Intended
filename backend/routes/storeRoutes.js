// backend/routes/storeRoutes.js
const express = require('express');
const router = express.Router();

// --- Mock Store Data for Initial Testing ---
const mockStores = [
    { storeId: "wm_ny_121", name: "Walmart NYC Flagship", address: "123 Main St, New York, NY" },
    { storeId: "wm_tx_007", name: "Walmart Houston South", address: "456 Oak Ave, Houston, TX" },
];

// --- Mock Product Data for STORE INVENTORY (NEW STRUCTURE) ---
// This will contain products available per specific store.
// Ensure these IDs match what you use in your frontend's simulateProductScan
// and what you expect from actual product QR codes.
const mockProductsInStoreInventory = {
    "wm_ny_121": { // Products for store "wm_ny_121"
        "p1": {
            _id: "p1", // Frontend expects _id
            name: "Grey Denim Pants",
            price: 79.99,
            image: ["https://storage77adi11.blob.core.windows.net/product-images/Screenshot 2025-06-22 184630.png"],
            category: "Apparel", // Added category
            sizes: ["S", "M", "L"] // Crucial: include `sizes` for the frontend to pick one
        },
        "p2": {
            _id: "p2",
            name: "Men's Shirt",
            price: 24.50,
            image: ["https://storage77adi11.blob.core.windows.net/product-images/Screenshot 2025-06-22 163024.png"],
            category: "Apparel",
            sizes: ["S", "M", "L", "XL"]
        },
        "p3": {
            _id: "p3",
            name: "Men shoes",
            price: 120.00,
            image: ["https://storage77adi11.blob.core.windows.net/product-images/menShoes.png"],
            category: "Footwear",
            sizes: ["7", "8", "9", "10"]
        },
        // Example of a product from your CSV data that might be in a store
        "5829376": {
            _id: "5829376",
            name: "Luxury Soap Bar",
            price: 7.10,
            image: ["https://via.placeholder.com/150/CCCCCC/000000?text=Product+5829376"],
            category: "Personal Care",
            sizes: ["Standard"]
        }
    },
    "wm_tx_007": { // Products for store "wm_tx_007"
        "prod_x": {
            _id: "prod_x",
            name: "Wireless Headphones",
            price: 89.00,
            image: ["https://via.placeholder.com/150/FF5733/FFFFFF?text=Headphones"],
            category: "Electronics",
            sizes: ["N/A"]
        },
        "5802831": {
            _id: "5802831",
            name: "Product_5802831 (Household Cleaner)",
            price: 14.62,
            image: [`https://via.placeholder.com/150/CCCCCC/000000?text=Product+5802831`],
            category: "Household",
            sizes: ["One Size"]
        }
    }
    // Add other stores and their specific products as needed
};

/**
 * @route POST /api/scan-store
 * @desc Validates the scanned store QR code and initializes a session.
 */
router.post('/scan-store', (req, res) => {
    const { storeId } = req.body;

    if (!storeId) {
        console.log('[Store Routes] Validation failed: Missing storeId in request body.');
        return res.status(400).json({ success: false, message: 'Store ID is required in the request body.' });
    }

    const foundStore = mockStores.find(store => store.storeId === storeId);

    if (!foundStore) {
        console.log(`[Store Routes] Validation failed: Store ID '${storeId}' not found in mock data.`);
        return res.status(404).json({ success: false, message: `Store with ID '${storeId}' not found or invalid QR code.` });
    }

    // In a real application, you might verify if this store has any products,
    // but for now, just validating the store ID is sufficient.
    console.log(`[Store Routes] Store '${storeId}' validated successfully. Sending store info.`);
    res.status(200).json({
        success: true,
        message: 'Store validated successfully. You can now proceed.',
        storeInfo: {
            id: foundStore.storeId,
            name: foundStore.name,
            address: foundStore.address
        }
    });
});

/**
 * @route POST /api/scan-product
 * @desc Validates the scanned product QR code and returns product details.
 * The frontend's StoreCartContext will manage the actual cart state.
 * @access Public (for now)
 */
router.post('/scan-product', (req, res) => {
    const { productId, storeId } = req.body; // Expecting { productId: "p123", storeId: "wm_ny_121" }

    if (!productId || !storeId) {
        console.log('[Product Scan] Validation failed: Missing productId or storeId in request body.');
        return res.status(400).json({ success: false, message: 'Product ID and Store ID are required.' });
    }

    // 1. Verify that the store exists in our mock inventory data
    const productsInCurrentStore = mockProductsInStoreInventory[storeId];

    if (!productsInCurrentStore) {
        console.log(`[Product Scan] Store ID '${storeId}' not found in mock product inventory.`);
        return res.status(404).json({ success: false, message: `Store '${storeId}' has no product data configured.` });
    }

    // 2. Lookup Product Details within that specific store's inventory
    const foundProduct = productsInCurrentStore[productId];

    if (!foundProduct) {
        console.log(`[Product Scan] Product ID '${productId}' not found in inventory for store '${storeId}'.`);
        return res.status(404).json({ success: false, message: `Product '${productId}' not found in this store's inventory.` });
    }

    // 3. Return the full product details to the frontend
    console.log(`[Product Scan] Product '${productId}' found for store '${storeId}'. Returning details.`);
    res.status(200).json({
        success: true,
        message: 'Product details retrieved successfully.',
        productInfo: foundProduct // Send the complete product object
    });
});

module.exports = router;