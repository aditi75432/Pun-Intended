// frontend/src/utils/demoOutfitMapping.js

// IMPORTANT:
// 1. Replace the product IDs (e.g., "vtop_001", "vbottom_001")
//    with the ACTUAL IDs from your backend/data/virtualTryOnProducts.js.
// 2. The key for each entry MUST be a comma-separated string of product IDs,
//    AND THE IDS MUST BE SORTED ALPHABETICALLY/NUMERICALLY.
//    (e.g., "vbottom_001,vtop_001" is correct, NOT "vtop_001,vbottom_001" if vbottom_001 comes first alphabetically)
//    Always sort them to ensure consistency when creating the key from the cart items.

const demoOutfitMapping = {
  // Example 1: Blue Casual Shirt (vtop_001) + Black Slim Pants (vbottom_001)
  // Make sure to sort the IDs alphabetically: "vbottom_001" comes before "vtop_001"
  "vbottom_001,vtop_001": "/demo_outfits/outfit_blue_shirt_black_pants.jpg",

  // Example 2: Green Jacket (vouter_001) + White T-Shirt (vtop_002) + Blue Jeans (vbottom_002)
  // Sorted IDs: "vbottom_002,vouter_001,vtop_002"
  "vbottom_002,vouter_001,vtop_002": "/demo_outfits/outfit_green_jacket_white_tee_blue_jeans.jpg",

  // Example 3: Just a Red Dress (vtop_003) - a single item
  "vtop_003": "/demo_outfits/outfit_red_dress.jpg",

  // **IMPORTANT FALLBACK (Strongly Recommended for Hackathons):**
  // This is a default image that will show if the exact combination in the cart
  // doesn't have a specific pre-rendered image. Make this a very impressive one!
  "default_fallback_outfit": "/demo_outfits/generic_perfect_outfit.jpg"
};

export default demoOutfitMapping;