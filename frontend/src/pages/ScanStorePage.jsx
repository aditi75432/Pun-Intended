import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const ScanStorePage = () => {
  const [scanResult, setScanResult] = useState(null); // Stores the raw text from the QR code (e.g., JSON string)
  const [scanError, setScanError] = useState(null); // Stores errors from the QR scanner itself (e.g., camera access)

  const [storeId, setStoreId] = useState(null); // Stores the parsed storeId from the QR
  const [loadingStoreValidation, setLoadingStoreValidation] = useState(false); // Loading state for backend API call
  const [storeValidationError, setStoreValidationError] = useState(null); // Errors from backend API call

  const navigate = useNavigate(); // Initialize the navigate hook for routing

  // --- useEffect for QR Scanner Setup and Cleanup ---
  useEffect(() => {
    let html5QrcodeScanner;

    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`QR Scan successful: ${decodedText}`, decodedResult);
      setScanResult(decodedText); // Set the raw QR data
      setScanError(null); // Clear any scanner errors
      html5QrcodeScanner.clear(); // Stop the scanner immediately after a successful scan
    };

    const onScanError = (errorMessage) => {
      // Log errors but don't stop the scanner, as it might be temporary (e.g., no QR in view)
      console.warn(`QR Scan error: ${errorMessage}`);
      setScanError(`Camera error or no QR detected: ${errorMessage}`); // Display a user-friendly error
    };

    // Only render the scanner if there's no scan result yet
    if (!scanResult) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", // ID of the HTML element where the scanner will render
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          facingMode: "environment" // Prefer back camera for scanning
        },
        false // verbose logs from html5-qrcode library
      );
      html5QrcodeScanner.render(onScanSuccess, onScanError);
    }

    // Cleanup function: This runs when the component unmounts
    return () => {
      if (html5QrcodeScanner) { // Ensure scanner instance exists
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner on unmount:", error);
        });
      }
    };
  }, [scanResult]); // Re-run this effect if scanResult changes (to potentially stop/hide scanner)

  // --- useEffect for Parsing Scan Result and Making Backend API Call ---
  useEffect(() => {
    const validateStore = async () => {
      if (!scanResult) return; // Only proceed if we have a scanResult

      setLoadingStoreValidation(true); // Start loading
      setStoreValidationError(null); // Clear any previous validation errors

      try {
        // 1. Attempt to parse the JSON data from the QR code
        const parsedData = JSON.parse(scanResult);
        const receivedStoreId = parsedData.storeId;

        if (!receivedStoreId) {
          throw new Error("QR code data is missing 'storeId'.");
        }

        setStoreId(receivedStoreId); // Store the parsed store ID in state

        console.log(`Attempting to validate store ID: ${receivedStoreId} with backend.`);

        // 2. Make the API call to your backend
        
        const backendUrl = 'http://localhost:5000'; // Make sure this matches your backend's address

        const response = await fetch(`${backendUrl}/api/scan-store`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ storeId: receivedStoreId }),
        });

        if (!response.ok) {
          // If the response is not OK (e.g., 400, 404, 500 status)
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to validate store. Please try again.');
        }

        const data = await response.json();
        console.log('Store validation successful:', data);

        // 3. If validation is successful, navigate to the product scanning page
        // We'll pass the storeId to the next page using state, as it's needed there.
        navigate('/scan-product', { state: { storeId: receivedStoreId } });

      } catch (error) {
        // Handle parsing or API call errors
        console.error("Store validation error:", error);
        setStoreValidationError(error.message);
        setStoreId(null); // Reset storeId on error so user can re-scan
      } finally {
        setLoadingStoreValidation(false); // Stop loading regardless of success/failure
      }
    };

    // Call the validation function whenever scanResult changes
    validateStore();
  }, [scanResult, navigate]); // Add 'navigate' to dependency array as recommended by ESLint

  // Optional: Button to simulate a successful store scan for development/testing
  const simulateStoreScan = () => {
    // A mock QR code data string, matching your specified format
    const mockStoreData = JSON.stringify({ storeId: "wm_ny_121", timestamp: Date.now() });
    setScanResult(mockStoreData);
    setScanError(null);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-8">
      <h2 className="text-3xl font-bold text-center mb-6">Scan Walmart Store QR Code</h2>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Please scan the QR code provided at the store entrance to begin your self-checkout journey.
      </p>

      {/* Conditionally render the scanner, result display, loading, or error messages */}
      {!scanResult ? (
        // Render the QR scanner if no result yet
        <div id="qr-reader" className="w-full max-w-sm border-2 border-gray-300 rounded-lg overflow-hidden">
          {scanError && (
              <p className="text-red-500 text-center py-4">{scanError}</p>
          )}
          {/* The QR scanner's video feed will render inside this div */}
        </div>
      ) : (
        // Render the status/result after a scan
        <div className="mt-8 p-4 bg-gray-100 border rounded-lg max-w-md w-full text-center">
          {loadingStoreValidation ? (
            // Show loading message while validating with backend
            <p className="text-blue-600 font-semibold text-xl flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating Store... Please wait.
            </p>
          ) : storeValidationError ? (
            // Show validation error message
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
              <p className="font-semibold text-lg">Store Validation Failed!</p>
              <p className="mt-1">{storeValidationError}</p>
              <button
                onClick={() => {
                  setScanResult(null); // Clear scan result to allow re-scanning
                  setStoreValidationError(null); // Clear validation error
                }}
                className="mt-4 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
              >
                Try Scanning Again
              </button>
            </div>
          ) : (
            // Show success message (briefly, before navigating)
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
              <p className="font-semibold text-xl">Store Scanned Successfully!</p>
              <p className="break-words mt-2">
                Store ID: <span className="font-mono bg-green-200 p-1 rounded-md">{storeId}</span>
              </p>
              <p className="mt-4 text-gray-800">Redirecting to product scanning...</p>
            </div>
          )}
        </div>
      )}

      {/* Optional: Simulate Scan Button (only shown if no scan result yet) */}
      {!scanResult && (
        <button
          onClick={simulateStoreScan}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 ease-in-out shadow-md"
        >
          Simulate Store Scan (for testing)
        </button>
      )}
    </div>
  );
};

export default ScanStorePage;