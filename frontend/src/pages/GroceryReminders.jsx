import React, { useState, useEffect, useMemo } from 'react';
import mockProductCatalog from '../data/mockProductCatalog';
import mockCustomerData from '../data/mockCustomerData';

const GroceryReminders = () => {
    // State management for the assistant
    const [selectedUser, setSelectedUser] = useState(null);
    const [cart, setCart] = useState([]);
    // Using objects for snoozed/blocked for easier lookup and update
    const [snoozed, setSnoozed] = useState({}); // { productId: DateWhenSnoozeEnds }
    const [blocked, setBlocked] = useState(new Set()); // Set of productIds

    // --- Data Processing Logic (Mimicking Python Script) ---
    const userIds = useMemo(() => {
        const ids = new Set();
        mockCustomerData.forEach(item => ids.add(item.user_id));
        return Array.from(ids).sort();
    }, []);

    // Set a default user if available
    useEffect(() => {
        if (userIds.length > 0 && !selectedUser) {
            setSelectedUser(userIds[0]);
        }
    }, [userIds, selectedUser]);

    const refillSuggestions = useMemo(() => {
        if (!selectedUser) return [];

        const userPurchases = mockCustomerData.filter(
            item => item.user_id === selectedUser && item.event_type === 'purchase'
        ).sort((a, b) => new Date(a.event_time) - new Date(b.event_time)); // Sort by time

        // Group purchases by product_id to calculate gaps
        const productPurchaseHistory = {};
        userPurchases.forEach(purchase => {
            if (!productPurchaseHistory[purchase.product_id]) {
                productPurchaseHistory[purchase.product_id] = [];
            }
            productPurchaseHistory[purchase.product_id].push(new Date(purchase.event_time));
        });

        const productData = [];

        for (const productId in productPurchaseHistory) {
            const dates = productPurchaseHistory[productId];
            if (dates.length < 2) {
                // Need at least two purchases to calculate a gap
                continue;
            }

            let totalGapDays = 0;
            for (let i = 1; i < dates.length; i++) {
                const diffTime = Math.abs(dates[i] - dates[i - 1]);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalGapDays += diffDays;
            }
            const avgGapDays = totalGapDays / (dates.length - 1);
            const lastPurchaseTime = dates[dates.length - 1];

            // Merge with catalog data
            const productInfo = mockProductCatalog.find(p => p.product_id === productId);
            if (productInfo) {
                productData.push({
                    product_id: productId,
                    avg_gap_days: avgGapDays,
                    last_purchase_time: lastPurchaseTime,
                    product_name: productInfo.product_name,
                    image_url: productInfo.image_url,
                    price: productInfo.price
                });
            }
        }

        // Filter for "due today" based on your criteria (gap_days <= 3 and last purchase 2+ days ago)
        const now = new Date();
        const dueItems = productData.filter(item => {
            const timeSinceLastPurchase = Math.ceil(Math.abs(now - item.last_purchase_time) / (1000 * 60 * 60 * 24));
            return item.avg_gap_days <= 3 && timeSinceLastPurchase >= 2;
        });

        // Sort by how overdue they are (most overdue first)
        return dueItems.sort((a,b) => {
            const aOverdueBy = Math.ceil(Math.abs(now - a.last_purchase_time) / (1000 * 60 * 60 * 24)) - a.avg_gap_days;
            const bOverdueBy = Math.ceil(Math.abs(now - b.last_purchase_time) / (1000 * 60 * 60 * 24)) - b.avg_gap_days;
            return bOverdueBy - aOverdueBy; // Descending order
        });

    }, [selectedUser, snoozed, blocked]); // Recalculate when user, snooze, or block state changes

    // --- Handlers ---
    const handleAddToCart = (productId) => {
        setCart(prevCart => [...prevCart, productId]);
        alert(`Added ${mockProductCatalog.find(p => p.product_id === productId)?.product_name} to cart!`);
    };

    const handleSnooze = (productId, days) => {
        const snoozeUntil = new Date();
        snoozeUntil.setDate(snoozeUntil.getDate() + days);
        setSnoozed(prevSnoozed => ({
            ...prevSnoozed,
            [productId]: snoozeUntil
        }));
        alert(`Snoozed ${mockProductCatalog.find(p => p.product_id === productId)?.product_name} for ${days} days.`);
    };

    const handleBlock = (productId) => {
        setBlocked(prevBlocked => new Set(prevBlocked).add(productId));
        alert(`Blocked reminders for ${mockProductCatalog.find(p => p.product_id === productId)?.product_name}.`);
    };

    // Snooze options for dropdown
    const snoozeOptions = {
        "1 day": 1, "2 days": 2, "3 days": 3, "4 days": 4,
        "5 days": 5, "6 days": 6, "1 week": 7,
        "2 weeks": 14, "3 weeks": 21, "1 month": 30
    };

    // Calculate cart total
    const cartItemsDetails = useMemo(() => {
        return cart.map(productId => mockProductCatalog.find(p => p.product_id === productId)).filter(Boolean);
    }, [cart]);

    const cartTotal = useMemo(() => {
        return cartItemsDetails.reduce((sum, item) => sum + item.price, 0);
    }, [cartItemsDetails]);

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center text-purple-700 mb-8">🧠 Smart Grocery Refill Assistant</h1>

            {/* User Selection */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
                <label htmlFor="user-select" className="block text-xl font-semibold text-gray-700 mb-2">👤 Select User:</label>
                <select
                    id="user-select"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-lg"
                    value={selectedUser || ''}
                    onChange={(e) => {
                        setSelectedUser(e.target.value);
                        setCart([]); // Clear cart on user change
                        setSnoozed({}); // Clear snooze on user change
                        setBlocked(new Set()); // Clear blocked on user change
                    }}
                >
                    {userIds.map(id => (
                        <option key={id} value={id}>{id}</option>
                    ))}
                </select>
            </div>

            {/* Refill Suggestions */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🔔 Refill Suggestions</h2>
            {refillSuggestions.length === 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
                    <p className="font-bold">No refill suggestions for the selected user at the moment.</p>
                    <p>Try selecting a different user or check back later.</p>
                </div>
            )}

            <div className="space-y-6">
                {refillSuggestions.map((item) => {
                    const isBlocked = blocked.has(item.product_id);
                    const snoozeTime = snoozed[item.product_id];
                    const isSnoozed = snoozeTime && new Date() < snoozeTime;

                    if (isBlocked) {
                        return (
                            <div key={item.product_id} className="p-4 bg-gray-200 rounded-lg shadow-sm flex items-center space-x-4">
                                <span className="text-gray-600 text-lg">🚫</span>
                                <p className="text-gray-600 italic">Reminders for **{item.product_name}** are blocked.</p>
                            </div>
                        );
                    }

                    if (isSnoozed) {
                        const timeLeftMs = snoozeTime.getTime() - new Date().getTime();
                        const daysLeft = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
                        const hoursLeft = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        return (
                            <div key={item.product_id} className="p-4 bg-blue-100 rounded-lg shadow-sm flex items-center space-x-4">
                                <span className="text-blue-700 text-lg">🔕</span>
                                <p className="text-blue-700 italic">**{item.product_name}** snoozed for {daysLeft}d {hoursLeft}h remaining.</p>
                            </div>
                        );
                    }

                    const lastBoughtDate = item.last_purchase_time.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    const cycleDays = Math.round(item.avg_gap_days);

                    return (
                        <div key={item.product_id} className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                <img
                                    src={item.image_url || "https://via.placeholder.com/100?text=No+Image"}
                                    alt={item.product_name}
                                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                                />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.product_name}</h3>
                                <p className="text-gray-700 mb-1"><span className="font-semibold">⏳ Usually bought every:</span> {cycleDays} days</p>
                                <p className="text-gray-700 mb-3"><span className="font-semibold">🛍️ Last purchased:</span> {lastBoughtDate}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                    <button
                                        onClick={() => handleAddToCart(item.product_id)}
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <span>✔</span> Add to Cart
                                    </button>
                                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                                        <select
                                            id={`snooze-select-${item.product_id}`}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            defaultValue="3 days" // Default snooze choice
                                        >
                                            {Object.entries(snoozeOptions).map(([label, days]) => (
                                                <option key={label} value={days}>{label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const selectElement = document.getElementById(`snooze-select-${item.product_id}`);
                                                const selectedDays = parseInt(selectElement.value, 10);
                                                handleSnooze(item.product_id, selectedDays);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center space-x-2 w-full md:w-auto"
                                        >
                                            <span>⏱</span> Snooze
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleBlock(item.product_id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <span>🚫</span> Don’t Remind
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Final Cart Summary */}
            <hr className="my-10 border-t-2 border-gray-300" />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🛒 Final Cart</h2>
            {cartItemsDetails.length === 0 ? (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
                    <p className="font-bold">Cart is empty.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cartItemsDetails.map((item, index) => (
                                <tr key={item.product_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-6 text-right">
                        <h3 className="text-2xl font-bold text-gray-900">💰 Total: ${cartTotal.toFixed(2)}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroceryReminders;