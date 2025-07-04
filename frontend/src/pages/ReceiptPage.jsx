// frontend/src/pages/ReceiptPage.jsx
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRious from 'qrious'; // Ensure you have installed `qrious` (npm install qrious)

const ReceiptPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartDetails } = location.state || {}; // Get cart details passed from StoreCartPage
    const qrCanvasRef = useRef(null); // Ref for the QR code canvas

    const currency = '₹'; // Define currency for consistency

    useEffect(() => {
        if (!cartDetails) {
            // If no cart details, redirect back to the store cart or scanning page
            console.warn("No cart details found for receipt. Redirecting.");
            navigate('/store-cart', { replace: true }); // Redirect to the store cart page
            return;
        }

        // Generate QR code if canvas ref is available
        if (qrCanvasRef.current) {
            try {
                // Stringify the cart details to include in the QR code
                const qrData = JSON.stringify(cartDetails, null, 2);
                new QRious({
                    element: qrCanvasRef.current,
                    value: qrData,
                    size: 200,
                    level: 'H' // High error correction
                });
            } catch (error) {
                console.error("Error generating QR code:", error);
            }
        }
    }, [cartDetails, navigate]);

    if (!cartDetails) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-8">
                <p className="text-xl text-red-500">Loading receipt...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl bg-white shadow-lg rounded-lg my-8">
            <h1 className="text-4xl font-bold text-center text-green-700 mb-6">Payment Successful!</h1>
            <p className="text-center text-gray-600 mb-8">Thank you for shopping with us.</p>

            <div className="border-t-2 border-dashed border-gray-300 pt-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-blue-800">Transaction Details</h2>
                <p className="text-lg mb-2"><span className="font-medium">Transaction ID:</span> {cartDetails.transactionId}</p>
                <p className="text-lg mb-2"><span className="font-medium">Store ID:</span> {cartDetails.storeId}</p>
                <p className="text-lg mb-4"><span className="font-medium">Date & Time:</span> {new Date(cartDetails.timestamp).toLocaleString()}</p>
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-800">Items Purchased:</h3>
                <ul className="space-y-2">
                    {cartDetails.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                            <span>{item.name} ({item.quantity}) {item.size && ` - Size: ${item.size}`}</span>
                            <span className="font-semibold">{currency}{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-6 text-right">
                <p className="text-2xl font-bold text-gray-900">Total Paid: <span className="text-green-700">{currency}{cartDetails.totalAmount.toFixed(2)}</span></p>
            </div>

            <div className="mt-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Scan QR for Bill Details</h3>
                <canvas ref={qrCanvasRef} id="receipt-qr-code" className="mx-auto border border-gray-300 rounded-md"></canvas>
                <p className="text-gray-500 text-sm mt-2">This QR code contains your transaction details.</p>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/scan-store')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 ease-in-out shadow-md"
                >
                    Start New Shopping Session
                </button>
            </div>
        </div>
    );
};

export default ReceiptPage;