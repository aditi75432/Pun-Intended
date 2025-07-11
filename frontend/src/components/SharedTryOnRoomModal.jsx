// frontend/src/components/SharedTryOnRoomModal.jsx
import React, { useState, useEffect } from 'react';

const SharedTryOnRoomModal = ({ outfit, onClose }) => {
    const [roomCode, setRoomCode] = useState('OUTFIT-XYZ-123');
    // FIX: Emojis as object keys must be enclosed in quotes
    const [reactions, setReactions] = useState({ '👍': 0, '❤️': 0, '🔥': 0 });
    const [votes, setVotes] = useState({ wearIt: 0, maybe: 0, nope: 0 });
    const [totalFriendsVoted, setTotalFriendsVoted] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [decisionMade, setDecisionMade] = useState(false);

    // Dummy friend avatars
    const friendAvatars = [
        'https://via.placeholder.com/40/FF5733/FFFFFF?text=F1', // Friend 1
        'https://via.placeholder.com/40/33FF57/FFFFFF?text=F2', // Friend 2
        'https://via.placeholder.com/40/3357FF/FFFFFF?text=F3', // Friend 3
        'https://via.placeholder.com/40/FF33E9/FFFFFF?text=F4', // Friend 4
    ];

    // Calculate vote percentages
    const totalVotes = votes.wearIt + votes.maybe + votes.nope;
    const wearItPercent = totalVotes > 0 ? (votes.wearIt / totalVotes) * 100 : 0;
    const maybePercent = totalVotes > 0 ? (votes.maybe / totalVotes) * 100 : 0;
    const nopePercent = totalVotes > 0 ? (votes.nope / totalVotes) * 100 : 0;

    // Check for "Decision Made" (e.g., > 60% "Wear It" with at least 3 votes)
    useEffect(() => {
        if (totalVotes >= 3 && wearItPercent > 60) {
            setDecisionMade(true);
            setShowConfetti(true); // Trigger confetti
            setTimeout(() => setShowConfetti(false), 3000); // Hide confetti after 3 seconds
        } else {
            setDecisionMade(false);
        }
    }, [totalVotes, wearItPercent]);

    const handleReaction = (emoji) => {
        setReactions(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }));
    };

    const handleVote = (type) => {
        setVotes(prev => ({ ...prev, [type]: prev[type] + 1 }));
    };

    const simulateFriendJoinAndVote = () => {
        if (totalFriendsVoted >= friendAvatars.length) {
            alert("All friends have joined and voted!");
            return;
        }

        setTotalFriendsVoted(prev => prev + 1);

        // Simulate a friend's reaction
        const randomReactionEmoji = ['👍', '❤️', '🔥'][Math.floor(Math.random() * 3)];
        setReactions(prev => ({ ...prev, [randomReactionEmoji]: prev[randomReactionEmoji] + 1 }));

        // Simulate a friend's vote
        const voteTypes = ['wearIt', 'maybe', 'nope'];
        const randomVoteType = voteTypes[Math.floor(Math.random() * voteTypes.length)];
        setVotes(prev => ({ ...prev, [randomVoteType]: prev[randomVoteType] + 1 }));
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode)
            .then(() => alert('Room code copied to clipboard!'))
            .catch(err => console.error('Failed to copy room code:', err));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[1100] p-4">
            {/* Confetti effect */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div
                            key={i}
                            className="confetti-piece absolute bg-yellow-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: `${Math.random() * 10 + 5}px`,
                                height: `${Math.random() * 10 + 5}px`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                transform: `rotate(${Math.random() * 360}deg)`,
                                opacity: Math.random(),
                                backgroundColor: ['#FFC700', '#FF00A3', '#00E0FF', '#9300FF', '#FF0035'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-2xl relative w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden">
                <span
                    onClick={onClose}
                    className="absolute top-4 right-6 text-gray-600 hover:text-gray-900 text-4xl font-bold cursor-pointer z-10"
                >
                    &times;
                </span>
                <h2 className="text-3xl font-bold text-center py-5 border-b bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800">
                    👯‍♀️ Shared Try-On Room
                </h2>

                <div className="flex-1 flex flex-col md:flex-row p-6 overflow-y-auto">
                    {/* Left Panel: Outfit Preview & Room Info */}
                    <div className="md:w-1/2 flex flex-col items-center p-4 border-r md:border-r-0 md:border-b-0 md:border-r border-gray-200">
                        <h3 className="text-xl font-semibold mb-3">Your Outfit: {outfit.name}</h3>
                        <img
                            src={outfit.imageUrl}
                            alt={outfit.name}
                            className="w-full max-w-xs h-80 object-contain rounded-lg shadow-lg mb-6 border border-gray-300"
                        />
                        
                        <div className="bg-gray-100 p-4 rounded-lg text-center w-full max-w-xs mb-6">
                            <p className="text-sm text-gray-600 mb-2">Share this code with friends:</p>
                            <div className="flex items-center justify-center">
                                <span className="text-2xl font-mono bg-gray-200 px-4 py-2 rounded-l-md border border-gray-300">{roomCode}</span>
                                <button
                                    onClick={copyRoomCode}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-r-md text-sm transition duration-200"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                (Simulated link: `https://your-app.com/join-room/${roomCode}`)
                            </p>
                        </div>

                        {/* Friend Avatars */}
                        <div className="mb-6">
                            <p className="text-lg font-semibold text-gray-700 mb-3">Friends in Room ({totalFriendsVoted}/{friendAvatars.length}):</p>
                            <div className="flex -space-x-2 overflow-hidden justify-center">
                                {friendAvatars.slice(0, totalFriendsVoted).map((avatar, index) => (
                                    <img
                                        key={index}
                                        className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                        src={avatar}
                                        alt={`Friend ${index + 1}`}
                                    />
                                ))}
                                {totalFriendsVoted < friendAvatars.length && (
                                    <button
                                        onClick={simulateFriendJoinAndVote}
                                        className="h-10 w-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold hover:bg-gray-400 transition-colors duration-200"
                                        title="Simulate a friend joining and voting"
                                    >
                                        +1
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Reactions & Voting */}
                    <div className="md:w-1/2 flex flex-col p-4">
                        {/* Reactions */}
                        <div className="mb-8 text-center">
                            <h3 className="text-xl font-semibold mb-3">Real-time Reactions:</h3>
                            <div className="flex justify-center gap-6">
                                {Object.entries(reactions).map(([emoji, count]) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        className="flex flex-col items-center p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                                    >
                                        <span className="text-3xl">{emoji}</span>
                                        <span className="text-sm font-bold text-gray-700 mt-1">{count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Voting UI */}
                        <div className="mb-8 text-center">
                            <h3 className="text-xl font-semibold mb-3">Friends' Votes:</h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <button
                                    onClick={() => handleVote('wearIt')}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-md transition duration-200 text-lg"
                                >
                                    Wear It!
                                </button>
                                <button
                                    onClick={() => handleVote('maybe')}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg shadow-md transition duration-200 text-lg"
                                >
                                    Maybe
                                </button>
                                <button
                                    onClick={() => handleVote('nope')}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-md transition duration-200 text-lg"
                                >
                                    Nope
                                </button>
                            </div>

                            {/* Progress Bars */}
                            <div className="space-y-2 text-left text-sm font-medium text-gray-700">
                                <div>
                                    <p>Wear It: {wearItPercent.toFixed(1)}%</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${wearItPercent}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <p>Maybe: {maybePercent.toFixed(1)}%</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${maybePercent}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <p>Nope: {nopePercent.toFixed(1)}%</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${nopePercent}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decision Made Badge */}
                        {decisionMade && (
                            <div className="mt-auto p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center font-bold text-xl animate-bounce">
                                🎉 Decision Made: Wear It! 🎉
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confetti CSS (can be moved to a global CSS file if preferred) */}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .confetti-piece {
                    animation: fall linear infinite;
                }
            `}</style>
        </div>
    );
};

export default SharedTryOnRoomModal;
