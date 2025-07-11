import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext'; // To add items to the main cart

const StyleAdvisorModal = ({ outfit, userProfile, onClose }) => {
    const { addAllToCart, food_list, addToCart } = useContext(ShopContext);

    // Initial conversation state
    const [conversation, setConversation] = useState([
        { type: 'advisor', message: `Hey there! 😊 I see you’re eyeing that ${outfit.name}—such a bold, chic combo. May I help you style this look?`, options: ['Yes, please!', 'No, thanks.'] }
    ]);
    const [currentStep, setCurrentStep] = useState(0); // 0: initial, 1: style vibe, 2: occasion, 3: suggest catalog, 4: budget/allergies, 5: final action, 6: done
    const [showInput, setShowInput] = useState(false);
    const [inputText, setInputText] = useState('');
    const [tempBudget, setTempBudget] = useState(null);
    const [tempAllergies, setTempAllergies] = useState(null);
    const [suggestedProducts, setSuggestedProducts] = useState([]);


    useEffect(() => {
        // Scroll to bottom of chat history
        const chatHistory = document.getElementById('chat-history');
        if (chatHistory) {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    }, [conversation]);

    // Simple mock "GenAI" logic
    const handleUserResponse = async (response) => {
        // First, add the user's response to the conversation
        const newConversationAfterUser = [...conversation, { type: 'user', message: response }];
        setConversation(newConversationAfterUser);

        // Simulate thinking time before advisor responds
        await new Promise(resolve => setTimeout(resolve, 800));

        let nextAdvisorMessage = '';
        let nextOptions = [];
        let nextStep = currentStep;

        switch (currentStep) {
            case 0: // Initial question
                if (response === 'Yes, please!') {
                    nextAdvisorMessage = 'Totally get that! Let’s tailor this to you. Quick check—do you usually go for edgy, clean, romantic, or more laid-back vibes?';
                    nextOptions = ['Classy with an edge', 'Edgy', 'Clean', 'Romantic', 'Laid-back'];
                    nextStep = 1;
                } else {
                    nextAdvisorMessage = 'No worries! Let me know if you change your mind. Enjoy the outfit!';
                    nextOptions = [];
                    nextStep = 6; // End conversation
                    setTimeout(onClose, 2000); // Close modal after a delay
                }
                break;

            case 1: // Style Vibe
                // Add a console log to inspect the outfit object
                console.log("Outfit object received by StyleAdvisorModal:", outfit);

                // Defensive check to ensure outfit.productIds is an array
                const outfitProductIds = outfit && Array.isArray(outfit.productIds) ? outfit.productIds : [];

                const outfitHasLeather = outfitProductIds.includes('vbottom_002'); // Example ID for black leather pants
                const outfitHasPuffySleeve = outfitProductIds.includes('vtop_001'); // Example ID for white puffy sleeve shirt

                let topTip = '';
                if (userProfile.skinTone === 'warm' && outfitHasPuffySleeve) {
                    topTip = `This shirt’s bright white tone will really pop against your ${userProfile.skinTone} skin tone—great contrast.`;
                } else {
                    topTip = `The top complements your overall look beautifully.`;
                }

                let sizeTip = '';
                // Ensure userProfile.pastPurchases is an array before using .includes()
                const userPastPurchases = userProfile && Array.isArray(userProfile.pastPurchases) ? userProfile.pastPurchases : [];

                if (userPastPurchases.includes('top_001')) { // Assuming top_001 maps to the shirt
                    sizeTip = `You usually wear a size M, and based on your past purchases, this cut will give you a flowy silhouette without looking oversized.`;
                } else {
                    sizeTip = `This cut is a versatile choice for your usual sizing patterns.`;
                }

                let bottomTip = '';
                if (userProfile.bodyType === 'pear' && outfitHasLeather) {
                    bottomTip = `The leather pants hug the waist and taper at the ankle—flattering for your ${userProfile.bodyType}-shaped body type. Adds that subtle statement edge you like.`;
                } else {
                    bottomTip = `The pants provide a sleek and modern base to your outfit.`;
                }

                let sunglassesTip = 'The angular black frames give structure to your soft facial features—great balance!'; // Assuming sunglasses are part of the original outfit context

                nextAdvisorMessage = `Perfect. That puffy white shirt gives off elegant confidence, and pairing it with leather pants is already giving you that “${response}” energy.

                Now let’s fine-tune:
                👚 Top
                ${topTip}
                ${sizeTip}
                👖 Bottom
                ${bottomTip}
                🕶️ Sunglasses
                ${sunglassesTip}
                Would you wear this for something casual-chic or more like an event?`;
                nextOptions = ['Brunch', 'Art Gallery Date Night', 'Work', 'Party'];
                nextStep = 2;
                break;

            case 2: // Occasion
                let brunchSuggestions = `Add a light tan trench coat (it picks up warm undertones). Nude block heels or ankle boots. Gold hoops + a crossbody bag for that effortless sophistication.`;
                let dateNightSuggestions = `Swap to a cropped blazer—maybe deep burgundy or emerald green to add richness. Strappy black heels. Pull your hair back in a sleek ponytail, bold lip (you rocked that crimson red in your NYE photos 😉), and a small clutch.`;
                let workSuggestions = `Pair with a structured blazer, closed-toe heels, and a sleek briefcase for a professional yet stylish look.`;
                let partySuggestions = `Amp it up with statement jewelry, metallic heels, and a sequined clutch for a dazzling party vibe.`;

                if (response.includes('Brunch')) {
                    nextAdvisorMessage = `Love that. Here's what I’d suggest for Brunch:\n${brunchSuggestions}`;
                } else if (response.includes('Art Gallery Date Night')) {
                    nextAdvisorMessage = `Love that. Here's what I’d suggest for Date Night:\n${dateNightSuggestions}`;
                } else if (response.includes('Work')) {
                    nextAdvisorMessage = `Great choice! For work, I'd suggest:\n${workSuggestions}`;
                } else if (response.includes('Party')) {
                    nextAdvisorMessage = `Fantastic! For a party, consider:\n${partySuggestions}`;
                }

                nextAdvisorMessage += `\n\nAlso—should I suggest some pieces from our catalog that pair well with this outfit? I can keep your preferred brands and budget in mind.`;
                nextOptions = ['Yes, please.', 'No, not now.'];
                nextStep = 3;
                break;

            case 3: // Suggest Catalog Pieces
                if (response === 'Yes, please.') {
                    nextAdvisorMessage = 'Noted. What\'s your budget (e.g., Under $150)? Any allergies (e.g., no wool)?';
                    setShowInput(true); // Show text input
                    nextOptions = ['Under $150, no wool', 'Any budget, no allergies']; // Provide common options for quick selection
                    nextStep = 4;
                } else {
                    nextAdvisorMessage = 'Understood! Is there anything else I can help you with regarding this outfit?';
                    nextOptions = ['Save this look', 'Add items to cart'];
                    nextStep = 5;
                }
                break;

            case 4: // Budget / Allergies (from previous step's input)
                const [budgetStr, allergiesStr] = response.split(',').map(s => s.trim());
                setTempBudget(budgetStr.includes('Under') ? parseInt(budgetStr.replace('Under $', '')) : Infinity);
                setTempAllergies(allergiesStr.toLowerCase());

                let filteredProducts = [];
                // Mock filtering logic - replace with real product data if available
                if (response.includes('Under $150, no wool')) {
                    filteredProducts = [
                        { id: 'blazer_001', name: 'Faux Leather Burgundy Blazer', price: 58, imageUrl: 'https://via.placeholder.com/80?text=Blazer' },
                        { id: 'sandals_001', name: 'Black Strappy Sandals, Vegan Leather', price: 49, imageUrl: 'https://via.placeholder.com/80?text=Sandals' },
                        { id: 'clutch_001', name: 'Mini Box Clutch with Gold Hardware', price: 32, imageUrl: 'https://via.placeholder.com/80?text=Clutch' }
                    ].filter(p => p.price <= 150);
                } else {
                    filteredProducts = [
                        { id: 'blazer_002', name: 'Chic Tweed Blazer', price: 180, imageUrl: 'https://via.placeholder.com/80?text=Tweed+Blazer' },
                        { id: 'heels_002', name: 'Stiletto Heels', price: 120, imageUrl: 'https://via.placeholder.com/80?text=Heels' }
                    ];
                }
                setSuggestedProducts(filteredProducts);

                let productSuggestionsText = filteredProducts.map(p => `• ${p.name} ($${p.price})`).join('\n');
                if (filteredProducts.length > 0) {
                     nextAdvisorMessage = `Noted. Filtering out ${allergiesStr}-based fabrics, sticking to your favorite mid-tier brands. I’ll add:\n${productSuggestionsText}`;
                } else {
                    nextAdvisorMessage = `Understood. Unfortunately, I couldn't find items matching your criteria at the moment.`;
                }

                nextAdvisorMessage += `\n\nWant me to save this look as a “Style Set” for future re-use or add it to your cart?`;
                nextOptions = ['Save it and add the pants + sandals to cart!', 'Save this look only', 'Add all suggested to cart', 'Decide later'];
                nextStep = 5;
                setShowInput(false); // Hide input after getting info
                break;

            case 5: // Final Action
                if (response === 'Save it and add the pants + sandals to cart!') {
                    // Assuming 'vbottom_002' is the ID for black leather pants and 'sandals_001' for black strappy sandals
                    const pantsItem = food_list.find(item => item.virtualTryOnProductId === 'vbottom_002');
                    const sandalsItem = suggestedProducts.find(p => p.id === 'sandals_001');

                    if (pantsItem) addToCart(pantsItem._id);
                    if (sandalsItem) {
                        // Check if the suggested sandal is also in food_list by name to get its _id
                        const foundInFoodList = food_list.find(item => item.name === sandalsItem.name);
                        if (foundInFoodList) {
                            addToCart(foundInFoodList._id);
                        } else {
                            console.warn("Suggested sandals not found in main food_list for adding to cart (by name).");
                            alert("Added pants to cart. Sandals not found in main catalog to add.");
                        }
                    }

                    nextAdvisorMessage = `Done and done 💁‍♀️ Also, heads up—those pants are trending fast in your size. Want me to alert you if stock runs low?`;
                    nextOptions = ['Yes, thank you!', 'No, not needed.'];
                    nextStep = 6;
                } else if (response === 'Save this look only') {
                    nextAdvisorMessage = `Look saved! What else can I do?`;
                    nextOptions = []; // No more direct options, can end or provide generic help
                    nextStep = 6;
                } else if (response === 'Add all suggested to cart') {
                    const shopItemIdsToAddToCart = suggestedProducts.map(suggestedProd => {
                        return food_list.find(item => item.name === suggestedProd.name)?._id; // Match by name as suggested products are mock
                    }).filter(Boolean); // Remove undefined/null entries

                    if (shopItemIdsToAddToCart.length > 0) {
                        addAllToCart(shopItemIdsToAddToCart);
                        nextAdvisorMessage = `All suggested items added to your main cart! Is there anything else?`;
                    } else {
                        nextAdvisorMessage = `Couldn't find suggested items in catalog to add to cart.`;
                    }
                    nextOptions = [];
                    nextStep = 6; // End conversation
                } else { // Decide later or other
                    nextAdvisorMessage = `No problem! Take your time. Let me know if you need anything else.`;
                    nextOptions = [];
                    nextStep = 6;
                    setTimeout(onClose, 2000); // Close modal
                }
                break;
            case 6: // Conversation End / Stock Alert
                if (response === 'Yes, thank you!') {
                    nextAdvisorMessage = 'You got it! Enjoy turning heads at brunch 💫 And if you ever want more style tips or remix ideas, I’m always here.';
                } else {
                    nextAdvisorMessage = 'Understood. Enjoy your outfit!';
                }
                nextOptions = [];
                setTimeout(onClose, 3000); // Close modal after final message
                break;
            default:
                nextAdvisorMessage = 'I\'m not sure how to respond to that. Can we start over?';
                nextOptions = ['Yes, please!'];
                setCurrentStep(0); // Reset conversation
                break;
        }

        setConversation(prev => [...prev, { type: 'advisor', message: nextAdvisorMessage, options: nextOptions, suggestedProducts }]);
        setCurrentStep(nextStep);
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const handleSubmitInput = () => {
        if (inputText.trim()) {
            handleUserResponse(inputText.trim());
            setInputText('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000]">
            <div className="bg-white rounded-lg shadow-xl relative w-11/12 max-w-2xl h-[90vh] flex flex-col">
                <span
                    onClick={onClose}
                    className="absolute top-3 right-5 text-gray-500 hover:text-gray-800 text-3xl font-bold cursor-pointer"
                >
                    &times;
                </span>
                <h3 className="text-2xl font-bold text-center py-4 border-b">👗 Style Advisor</h3>

                <div id="chat-history" className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversation.map((msg, index) => (
                        <div key={index} className={`flex ${msg.type === 'advisor' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`p-3 rounded-lg max-w-[80%] ${
                                msg.type === 'advisor' ? 'bg-purple-100 text-purple-800 rounded-bl-none' : 'bg-blue-100 text-blue-800 rounded-br-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-purple-200">
                                        <p className="font-semibold text-purple-700 text-sm mb-1">Recommended for you:</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {msg.suggestedProducts.map(prod => (
                                                <div key={prod.id} className="text-center text-xs">
                                                    <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 object-cover rounded-md border border-purple-200 mx-auto" />
                                                    <p>{prod.name}</p>
                                                    <p>${prod.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t flex flex-col gap-2">
                    {/* NEW: Safer rendering for options based on message type */}
                    {(() => {
                        const lastMessage = conversation[conversation.length - 1];
                        if (lastMessage && lastMessage.type === 'advisor' && lastMessage.options && lastMessage.options.length > 0) {
                            return (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {lastMessage.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleUserResponse(option)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200 text-sm"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            );
                        }
                        return null; // Don't render anything if conditions are not met
                    })()}

                    {showInput && (
                        <div className="flex mt-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={handleInputChange}
                                onKeyPress={(e) => { if (e.key === 'Enter') handleSubmitInput(); }}
                                placeholder="Type your response..."
                                className="flex-1 border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <button
                                onClick={handleSubmitInput}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-r-md transition duration-200"
                            >
                                Send
                            </button>
                        </div>
                    )}
                    {/* NEW: Safer rendering for conversation end message */}
                    {(() => {
                        const lastMessage = conversation[conversation.length - 1];
                        if (lastMessage && lastMessage.type === 'advisor' && lastMessage.options.length === 0 && !showInput && currentStep !== 6) {
                            return (
                                <p className="text-center text-gray-500 text-sm">Conversation ended. Closing in a moment...</p>
                            );
                        }
                        // Also, if the conversation is fully ended (currentStep === 6), show a final message
                        if (currentStep === 6 && !showInput && lastMessage && lastMessage.type === 'advisor' && lastMessage.options.length === 0) {
                            return (
                                <p className="text-center text-gray-500 text-sm">Thank you for using the Style Advisor! Modal will close shortly.</p>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>
        </div>
    );
};

export default StyleAdvisorModal;