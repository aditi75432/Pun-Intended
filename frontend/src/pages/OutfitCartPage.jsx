// frontend/src/pages/OutfitCartPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { OutfitCartContext } from '../context/OutfitCartContext';
import { ShopContext } from '../context/ShopContext';
import StyleAdvisorModal from '../components/StyleAdvisorModal';
import SharedTryOnRoomModal from '../components/SharedTryOnRoomModal'; // NEW: Import the Shared Try-On Room Modal

const OutfitCartPage = () => {
    const { outfits, removeOutfit } = useContext(OutfitCartContext);
    const { addAllToCart, food_list, addToCart } = useContext(ShopContext);

    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [virtualProductsMap, setVirtualProductsMap] = useState({});
    const [recommendations, setRecommendations] = useState({});
    const [loadingRecommendations, setLoadingRecommendations] = useState({});

    // NEW STATES for the Shared Try-On Room Modal
    const [showSharedRoomModal, setShowSharedRoomModal] = useState(false);
    const [selectedOutfitForShare, setSelectedOutfitForShare] = useState(null);

    // MOCK USER PROFILE DATA (Make sure this matches what StyleAdvisorModal expects)
    const mockUserProfile = {
        userId: 'user_123',
        skinTone: 'warm',
        bodyType: 'pear',
        stylePreferences: ['classy', 'edgy'],
        pastPurchases: ['top_001', 'bottom_005', 'accessory_003'],
        culturalContext: 'general_usa'
    };

    // Existing states for Style Advisor Modal
    const [showStyleAdvisorModal, setShowStyleAdvisorModal] = useState(false);
    const [selectedOutfitForAdvisor, setSelectedOutfitForAdvisor] = useState(null);


    useEffect(() => {
        if (food_list && food_list.length > 0) {
            const map = {};
            food_list.forEach(item => {
                if (item.virtualTryOnProductId) {
                    map[item.virtualTryOnProductId] = item;
                }
            });
            setVirtualProductsMap(map);
            setIsLoadingProducts(false);
        } else {
            console.warn("ShopContext food_list not providing virtual product details. Outfit item names might be generic.");
            setIsLoadingProducts(false);
        }
    }, [food_list]);

    const fetchStaticRecommendationsForOutfit = async (outfitId, outfitDetails) => {
        setLoadingRecommendations(prev => ({ ...prev, [outfitId]: true }));
        try {
            const mockGenAIResponse = await new Promise(resolve => setTimeout(() => {
                const isCasual = outfitDetails.productIds.includes('vtop_001') || outfitDetails.productIds.includes('vbottom_002');
                const isFormal = outfitDetails.productIds.includes('vtop_003') || outfitDetails.productIds.includes('vbottom_005');

                resolve({
                    recommendations: [
                        `Style Hint: This outfit has a great base for a ${isCasual ? 'relaxed, everyday look' : 'smart casual vibe'}.`,
                        isCasual ? `Pair with: Consider adding a simple, comfortable pair of white sneakers for an effortless feel, or classic loafers for a slightly elevated touch.` : `Pair with: A sleek leather belt and polished ankle boots would complete this look perfectly.`,
                        isFormal ? `Occasion Suggestions: Ideal for a business casual event, a semi-formal dinner, or a stylish office day.` : `Occasion Suggestions: Perfect for weekend outings, casual meet-ups, or a comfortable day at home.`,
                        `Body Type Tip: The silhouette nicely complements your ${mockUserProfile.bodyType} body type.`,
                        `Color Harmony: The colors in this outfit work well with your ${mockUserProfile.skinTone} skin tone.`
                    ],
                    suggestedProducts: [
                        { id: 'shoe_001', name: 'White Casual Sneakers', imageUrl: 'https://via.placeholder.com/80?text=Sneakers' },
                        { id: 'bag_002', name: 'Minimalist Tote Bag', imageUrl: 'https://via.placeholder.com/80?text=Tote' }
                    ]
                });
            }, 1000));
            setRecommendations(prev => ({ ...prev, [outfitId]: mockGenAIResponse }));
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            setRecommendations(prev => ({ ...prev, [outfitId]: { error: "Failed to load recommendations." } }));
        } finally {
            setLoadingRecommendations(prev => ({ ...prev, [outfitId]: false }));
        }
    };

    const getProductName = (virtualProductId) => {
        if (virtualProductsMap[virtualProductId]) {
            return virtualProductsMap[virtualProductId].name;
        }
        return `Product ID: ${virtualProductId}`;
    };

    const handleOrderOutfit = (outfit) => {
        if (outfit.productIds && outfit.productIds.length > 0) {
            const productIdsToAdd = outfit.productIds;
            const shopItemIdsToAdd = [];

            productIdsToAdd.forEach(virtualId => {
                const shopItem = food_list.find(item => item.virtualTryOnProductId === virtualId);
                if (shopItem) {
                    shopItemIdsToAdd.push(shopItem._id);
                } else {
                    console.warn(`Could not find shop item for virtual product ID: ${virtualId}`);
                }
            });

            if (shopItemIdsToAdd.length > 0) {
                shopItemIdsToAdd.forEach(id => addToCart(id));
                alert(`Added items from "${outfit.name}" to your main shopping cart!`);
            } else {
                alert("No matching items found in store inventory for this outfit.");
            }
        } else {
            alert("No items found in this outfit to add to cart.");
        }
    };

    const openStyleAdvisor = (outfit) => {
        setSelectedOutfitForAdvisor(outfit);
        setShowStyleAdvisorModal(true);
    };

    const closeStyleAdvisor = () => {
        setShowStyleAdvisorModal(false);
        setSelectedOutfitForAdvisor(null);
    };

    // NEW: Functions to open/close Shared Room Modal
    const openSharedRoom = (outfit) => {
        setSelectedOutfitForShare(outfit);
        setShowSharedRoomModal(true);
    };

    const closeSharedRoom = () => {
        setShowSharedRoomModal(false);
        setSelectedOutfitForShare(null);
    };


    if (isLoadingProducts) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <p className="text-xl text-blue-600">Loading outfit details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] p-4 sm:p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Your Saved Outfits ({outfits.length})</h2>

            {outfits.length === 0 ? (
                <p className="text-center text-gray-500 text-lg mt-12">
                    You haven't saved any outfits yet. Go to the <a href="/virtual-try-on-outfit" className="text-blue-600 hover:underline">Virtual Try-On page</a> to save some!
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {outfits.map((outfit) => (
                        <div key={outfit.id} className="border rounded-lg shadow-md p-4 flex flex-col items-center bg-white">
                            <h3 className="font-bold text-xl mb-2 text-center">{outfit.name}</h3>
                            <img
                                src={outfit.imageUrl}
                                alt={outfit.name}
                                className="w-full max-w-xs h-64 object-contain rounded-md mb-3 border border-gray-200"
                            />
                            <div className="text-sm text-gray-700 mb-3 text-center">
                                <p className="font-semibold mb-1">Outfit Items:</p>
                                <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                                    {outfit.productIds && outfit.productIds.length > 0 ? (
                                        outfit.productIds.map((pid, index) => (
                                            <li key={index}>{getProductName(pid)}</li>
                                        ))
                                    ) : (
                                        <li>No specific items listed</li>
                                    )}
                                </ul>
                            </div>
                            <p className="text-md font-semibold text-green-700 mb-4">Est. Price: $XX.XX</p>

                            {/* Option to trigger the conversational advisor */}
                            <button
                                onClick={() => openStyleAdvisor(outfit)}
                                className="w-full mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300 shadow-md"
                            >
                                💬 Get Personalized Style Advice
                            </button>

                            {/* NEW: Share Outfit with Friends Button */}
                            <button
                                onClick={() => openSharedRoom(outfit)}
                                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300 shadow-md"
                            >
                                👯‍♀️ Share Outfit with Friends
                            </button>


                            {/* Existing static recommendations section (optional, can be removed if conversational is enough) */}
                            <div className="w-full mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg shadow-inner">
                                <h4 className="font-bold text-purple-800 text-lg mb-2 text-center">
                                    ✨ Quick Style Tips✨
                                </h4>
                                {loadingRecommendations[outfit.id] ? (
                                    <p className="text-center text-gray-600 text-sm italic">
                                        Generating quick tips...
                                    </p>
                                ) : recommendations[outfit.id] && recommendations[outfit.id].error ? (
                                    <p className="text-center text-red-500 text-sm">
                                        {recommendations[outfit.id].error}
                                    </p>
                                ) : recommendations[outfit.id] && recommendations[outfit.id].recommendations.length > 0 ? (
                                    <>
                                        <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 mb-3">
                                            {recommendations[outfit.id].recommendations.map((tip, idx) => (
                                                <li key={idx}>{tip}</li>
                                            ))}
                                        </ul>
                                        {recommendations[outfit.id].suggestedProducts && recommendations[outfit.id].suggestedProducts.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-gray-700 text-sm mt-2 mb-1">Recommended to Pair With:</p>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {recommendations[outfit.id].suggestedProducts.map(prod => (
                                                        <div key={prod.id} className="text-center">
                                                            <img src={prod.imageUrl} alt={prod.name} className="w-16 h-16 object-cover rounded-md border border-gray-200 mx-auto" />
                                                            <p className="text-xs text-gray-600 mt-1">{prod.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-center text-gray-600 text-sm italic">
                                        Click "Get Quick Tips" for instant advice!
                                    </p>
                                )}
                                <button
                                    onClick={() => fetchStaticRecommendationsForOutfit(outfit.id, outfit)}
                                    disabled={loadingRecommendations[outfit.id]}
                                    className="w-full mt-3 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingRecommendations[outfit.id] ? 'Generating...' : 'Get Quick Tips'}
                                </button>
                            </div>


                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => handleOrderOutfit(outfit)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300"
                                >
                                    Add All to Main Cart
                                </button>
                                <button
                                    onClick={() => removeOutfit(outfit.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300"
                                >
                                    Remove Outfit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showStyleAdvisorModal && selectedOutfitForAdvisor && (
                <StyleAdvisorModal
                    outfit={selectedOutfitForAdvisor}
                    userProfile={mockUserProfile}
                    onClose={closeStyleAdvisor}
                />
            )}

            {/* NEW: Render Shared Try-On Room Modal */}
            {showSharedRoomModal && selectedOutfitForShare && (
                <SharedTryOnRoomModal
                    outfit={selectedOutfitForShare}
                    onClose={closeSharedRoom}
                />
            )}
        </div>
    );
};

export default OutfitCartPage;

