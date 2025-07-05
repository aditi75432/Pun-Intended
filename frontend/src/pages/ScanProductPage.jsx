// frontend/src/pages/ScanProductPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { StoreCartContext } from '../context/StoreCartContext';

const ScanProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeId } = location.state || {};

  const { addToStoreCart, storeCartItems } = useContext(StoreCartContext);

  const [productScanResult, setProductScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [addProductError, setAddProductError] = useState(null);

  const currency = '₹';

  const simulatedProductIndex = useRef(0);
  const mockSimulatedProductIds = ["p1", "p2", "p3", "5829376", "5802831"];

  // Flag to prevent multiple processing for the same scan result
  const isProcessingScan = useRef(false); // ADD THIS useRef

  useEffect(() => {
    if (!storeId) {
      console.warn("No storeId found. Redirecting to scan store first.");
      navigate('/scan-store', { replace: true });
    }
  }, [storeId, navigate]);

  useEffect(() => {
    let html5QrcodeScanner;

    const onProductScanSuccess = (decodedText, decodedResult) => {
      console.log(`Product QR Scan successful: ${decodedText}`, decodedResult);
      // Only set if we're not currently processing
      if (!isProcessingScan.current) { // ADD THIS CHECK
        setProductScanResult(decodedText);
        setScanError(null);
      }
    };

    const onProductScanError = (errorMessage) => {
      console.warn(`Product QR Scan error: ${errorMessage}`);
      setScanError(`Camera error or no QR detected: ${errorMessage}`);
    };

    // Only render scanner if no productScanResult is being processed and we're not already processing
    if (!productScanResult && storeId && !isProcessingScan.current) { // ADD THIS CHECK
      html5QrcodeScanner = new Html5QrcodeScanner(
        "product-qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          facingMode: "environment"
        },
        false
      );
      html5QrcodeScanner.render(onProductScanSuccess, onProductScanError);
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear product Html5QrcodeScanner on unmount:", error);
        });
      }
    };
  }, [productScanResult, storeId]); // Keep productScanResult in deps to re-run when a new scan comes in

  useEffect(() => {
    const processProductScan = async () => {
      // Check if there's a result to process AND if we are not already processing it
      if (!productScanResult || !storeId || isProcessingScan.current) { // ADD THIS CHECK
        return;
      }

      isProcessingScan.current = true; // Set flag to true to indicate processing has started

      setAddingProduct(true);
      setAddProductError(null);
      setProductDetails(null);

      try {
        const parsedProductData = JSON.parse(productScanResult);
        const { productId: scannedProductId, storeId: scannedStoreId } = parsedProductData;

        if (!scannedProductId || !scannedStoreId) {
          throw new Error("Product QR code data is missing 'productId' or 'storeId'.");
        }

        if (scannedStoreId !== storeId) {
          throw new Error(`Product belongs to a different store (${scannedStoreId}). Please scan products from ${storeId}.`);
        }

        console.log(`Attempting to add product ID: ${scannedProductId} to store cart for store: ${storeId}.`);

        const backendUrl = 'http://localhost:5000';

        const response = await fetch(`${backendUrl}/api/scan-product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: scannedProductId, storeId: storeId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add product to cart. Please try again.');
        }

        const data = await response.json();
        console.log('Raw data received from backend:', data);

        const productToAddDetails = data.productInfo;
        console.log('Product details to add to cart (productToAddDetails):', productToAddDetails);

        if (productToAddDetails) {
          addToStoreCart(productToAddDetails, 1);
          setProductDetails(productToAddDetails);
        } else {
          console.warn(`Product details not returned from backend for ID ${scannedProductId}.`);
          setProductDetails({ _id: scannedProductId, name: "Unknown Product", price: 0, image: ['/placeholder_image.png'], sizes: ["N/A"] });
        }

        // Clear scan result and processing flag after a delay
        setTimeout(() => {
          setProductScanResult(null);
          setProductDetails(null);
          isProcessingScan.current = false; // RESET THE FLAG HERE
        }, 2000);

      } catch (error) {
        console.error("Error processing product scan:", error);
        setAddProductError(error.message);
        setProductDetails(null);
        setTimeout(() => {
          setProductScanResult(null);
          setAddProductError(null);
          isProcessingScan.current = false; // RESET THE FLAG HERE
        }, 3000);
      } finally {
        setAddingProduct(false);
      }
    };

    processProductScan();
  }, [productScanResult, storeId, addToStoreCart]); // productScanResult is the trigger

  const simulateProductScan = () => {
    const currentMockProductId = mockSimulatedProductIds[simulatedProductIndex.current];
    simulatedProductIndex.current = (simulatedProductIndex.current + 1) % mockSimulatedProductIds.length;

    const mockProductData = JSON.stringify({ productId: currentMockProductId, storeId: storeId || "wm_ny_121" });
    
    // Only simulate if not currently processing a scan
    if (!isProcessingScan.current) { // ADD THIS CHECK
        console.log(`[Simulate Scan] Simulating scan for product ID: ${currentMockProductId}`);
        setProductScanResult(mockProductData);
        setScanError(null);
    } else {
        console.log(`[Simulate Scan] Already processing a scan, ignoring simulate click.`);
    }
  };

  if (!storeId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-8">
        <p className="text-xl text-red-500">Please scan a store QR code first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-8">
      <h2 className="text-3xl font-bold text-center mb-6">Scan Product QR Code</h2>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        You are in Store: <span className="font-semibold text-blue-700">{storeId}</span>
      </p>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Please scan the QR code on each product you wish to add to your cart.
      </p>

      {!productScanResult ? (
        <div id="product-qr-reader" className="w-full max-w-sm border-2 border-gray-300 rounded-lg overflow-hidden">
          {scanError && (
              <p className="text-red-500 text-center py-4">{scanError}</p>
          )}
        </div>
      ) : (
        <div className="mt-8 p-4 bg-gray-100 border rounded-lg max-w-md w-full text-center">
          {addingProduct ? (
            <p className="text-blue-600 font-semibold text-xl flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Product to Cart...
            </p>
          ) : addProductError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
              <p className="font-semibold text-lg">Failed to Add Product!</p>
              <p className="mt-1">{addProductError}</p>
            </div>
          ) : productDetails ? (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
              <p className="font-semibold text-xl">Product Added to Cart!</p>
              <p className="mt-2">
                <span className="font-bold">{productDetails.name}</span> (ID: {productDetails._id})
                <br />Price: {currency}{productDetails.price.toFixed(2)}
              </p>
              {productDetails.image && productDetails.image[0] && (
                <img src={productDetails.image[0]} alt={productDetails.name} className="h-20 w-20 object-cover mx-auto mt-2 rounded-md" />
              )}
            </div>
          ) : (
            <div className="mt-8 p-4 bg-gray-100 border rounded-lg max-w-md w-full text-center">
              <p className="font-semibold text-xl">Product Scanned!</p>
              <p className="break-words mt-2">
                Raw Product Data: <span className="font-mono bg-gray-200 p-1 rounded-md">{productScanResult}</span>
              </p>
              <p className="mt-4 text-gray-800">Processing scan data...</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-blue-800 mb-3">Your Current Store Cart ({Object.values(storeCartItems).reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
        {Object.values(storeCartItems).every(item => item.quantity === 0) ? (
          <p className="text-gray-600">No items added yet.</p>
        ) : (
          <ul className="list-disc list-inside text-left text-gray-800 max-h-40 overflow-y-auto">
            {Object.values(storeCartItems).map(item => {
              if (item.quantity > 0) {
                return (
                  <li key={item._id} className="flex justify-between items-center py-1">
                    <span>{item.name} ({item.quantity})</span>
                    <span className="font-semibold">{currency}{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        )}
      </div>

      {!productScanResult && (
        <button
          onClick={simulateProductScan}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-200 ease-in-out shadow-md"
        >
          Simulate Product Scan (Click to add next product)
        </button>
      )}

      <button
        onClick={() => navigate('/store-cart')}
        className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition duration-200 ease-in-out shadow-md"
      >
        Go to Store Cart & Checkout
      </button>
    </div>
  );
};

export default ScanProductPage;

