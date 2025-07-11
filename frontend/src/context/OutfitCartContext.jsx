// frontend/src/context/OutfitCartContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const OutfitCartContext = createContext(null);

const OutfitCartProvider = ({ children }) => {
    const [outfits, setOutfits] = useState([]); // State to hold saved outfits

    // Load outfits from localStorage on initial mount
    useEffect(() => {
        try {
            const storedOutfits = localStorage.getItem('outfits_cart');
            if (storedOutfits) {
                setOutfits(JSON.parse(storedOutfits));
            }
        } catch (error) {
            console.error("Failed to load outfits from localStorage:", error);
            // Fallback to empty array if parsing fails
            setOutfits([]);
        }
    }, []);

    // Save outfits to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('outfits_cart', JSON.stringify(outfits));
        } catch (error) {
            console.error("Failed to save outfits to localStorage:", error);
        }
    }, [outfits]);

    // Function to generate a unique ID and name for an outfit
    const generateOutfitMetadata = useCallback(() => {
        const timestamp = Date.now();
        const newId = `outfit_${timestamp}`;
        const nextOutfitNumber = outfits.length + 1;
        const newName = `Outfit ${nextOutfitNumber}`;
        return { id: newId, name: newName, timestamp: timestamp };
    }, [outfits.length]);

    // Function to add an outfit to the cart
    const addOutfit = useCallback((outfitImageBase64, productIds) => {
        const { id, name, timestamp } = generateOutfitMetadata();
        const newOutfit = {
            id,
            name,
            imageUrl: outfitImageBase64, // The captured base64 image
            productIds: productIds,      // Array of virtualTryOnProductId strings
            timestamp // Useful for sorting or knowing when it was saved
        };
        setOutfits((prevOutfits) => [...prevOutfits, newOutfit]);
        alert(`"${name}" saved to your Outfit Cart!`);
        return newOutfit; // Return the saved outfit in case parent needs it
    }, [generateOutfitMetadata]);

    // Function to remove an outfit from the cart
    const removeOutfit = useCallback((outfitId) => {
        setOutfits((prevOutfits) => prevOutfits.filter((outfit) => outfit.id !== outfitId));
    }, []);

    // Function to get the total number of outfits
    const getOutfitCount = useCallback(() => {
        return outfits.length;
    }, [outfits.length]);

    const contextValue = {
        outfits,
        addOutfit,
        removeOutfit,
        getOutfitCount
    };

    return (
        <OutfitCartContext.Provider value={contextValue}>
            {children}
        </OutfitCartContext.Provider>
    );
};

export default OutfitCartProvider;