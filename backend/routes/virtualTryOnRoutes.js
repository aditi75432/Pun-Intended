// backend/routes/virtualTryOnRoutes.js
const express = require('express');
const router = express.Router();

// --- Mock Data for Virtual Try-On Products (Separate from existing products) ---
// IMPORTANT: Ensure these model3dUrl paths point to actual .glb files
// that you have placed in your frontend/public/models/ directory.
// For testing, even empty .glb files will work, but you won't see anything.
const mockVirtualTryOnProducts = [
    {
        id: "vt_shirt_001",
        name: "Blue Casual Shirt",
        imageUrl: "/tryon/shirt.png", // Placeholder image
        model3dUrl: "/models/shirt.glb", // Path to your shirt GLB model
        category: "top", // Used for layering and initial positioning
        price: 35.00
    },
    {
        id: "vt_pants_001",
        name: "Black Slim Pants",
        imageUrl: "/tryon/pants.png",
        model3dUrl: "/models/pants.glb", // Path to your pants GLB model
        category: "bottom", // Used for layering and initial positioning
        price: 55.00
    },
    {
        id: "vt_sunglasses_001",
        name: "Aviator Sunglasses",
        imageUrl: "/tryon/sunglasses.png",
        model3dUrl: "/models/sunglasses.glb", // Path to your sunglasses GLB model
        category: "accessory-face", // Used for layering and initial positioning
        price: 25.00
    },
    {
        id: "vt_purse_001",
        name: "Leather Shoulder Bag",
        imageUrl: "/tryon/purse.png",
        model3dUrl: "/models/purse.glb", // Path to your purse GLB model
        category: "accessory-hand", // Used for layering and initial positioning
        price: 80.00
    },
    {
        id: "vt_belt_001",
        name: "Brown Leather Belt",
        imageUrl: "/tryon/belt.png",
        model3dUrl: "/models/belt.glb", // Path to your belt GLB model
        category: "accessory-waist", // Used for layering and initial positioning
        price: 20.00
    },
    {
        id: "vt_jacket_001",
        name: "Denim Jacket",
        imageUrl: "/tryon/jacket.png",
        model3dUrl: "/models/jacket.glb", // Assuming you'll add a jacket.glb
        category: "outerwear", // Used for layering and initial positioning
        price: 70.00
    }
];

// --- Endpoint to get Virtual Try-On Products ---
router.get('/virtual-try-on-products', (req, res) => {
    console.log('[Virtual Try-On] Serving mock virtual try-on products.');
    res.status(200).json({ success: true, products: mockVirtualTryOnProducts });
});

module.exports = router;