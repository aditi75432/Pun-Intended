// frontend/src/pages/VirtualTryOnOutfitPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import ARViewer from '../components/ARViewer';
import { OutfitCartContext } from '../context/OutfitCartContext';
import { useNavigate } from 'react-router-dom';

const VirtualTryOnOutfitPage = () => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedVirtualProducts, setSelectedVirtualProducts] = useState([]);
  const [showAR, setShowAR] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  // AR input mode: 'video' (plays a demo video) or 'image' (displays a pre-edited mock outfit image)
  const [arInputMode, setArInputMode] = useState('video');
  // This will hold the URL of the image to be displayed in ARViewer (pre-edited mock outfit)
  const [displayedImageUrlInAR, setDisplayedImageUrlInAR] = useState(null);
  // This holds the user's uploaded file for preview on the selection page (NOT used by ARViewer for display)
  const [userUploadedImagePreviewUrl, setUserUploadedImagePreviewUrl] = useState(null);

  // NEW: Pre-edited mock images for the 'My Picture Try-On' mode
  // IMPORTANT: You MUST replace these placeholder URLs with actual images you've pre-edited.
  const mockPreEditedTryOnImages = [
      '/demo_outfits/outfit2.png', // Replace with URL for your first pre-edited image
      '/demo_outfits/outfit1.png', // Replace with URL for your second pre-edited image
      'https://placehold.co/600x800/DC143C/FFFFFF?text=Outfit+Model+3', // Replace with URL for your third pre-edited image
      'https://placehold.co/600x800/20B2AA/FFFFFF?text=Outfit+Model+4', // Replace with URL for your fourth pre-edited image
      'https://placehold.co/600x800/FFD700/000000?text=Outfit+Model+5', // Replace with URL for your fifth pre-edited image
  ];
  const [currentMockImageIndex, setCurrentMockImageIndex] = useState(0); // Index for cycling through mock images

  // Removed showLoadingOverlay state and setTimeout for immediate display as requested

  const arViewerRef = useRef(null);
  const { addOutfit, getOutfitCount } = useContext(OutfitCartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVirtualTryOnProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      try {
        const backendUrl = 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/virtual-try-on-products`);
        if (!response.ok) {
          throw new Error('Failed to fetch virtual try-on products.');
        }
        const data = await response.json();
        setAvailableProducts(data.products);
      } catch (err) {
        console.error("Error fetching virtual try-on products:", err);
        setError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchVirtualTryOnProducts();
  }, []);

  const toggleProductSelection = (product) => {
    setSelectedVirtualProducts((prevSelected) => {
      if (prevSelected.find((p) => p.id === product.id)) {
        return prevSelected.filter((p) => p.id !== product.id);
      } else {
        return [...prevSelected, product];
      }
    });
  };

  const handleStartTryOn = () => {
    if (selectedVirtualProducts.length === 0) {
      alert("Please select at least one item to try on!");
      return;
    }

    if (arInputMode === 'image') {
        // In 'image' mode, use the current mock image from the cycle
        setDisplayedImageUrlInAR(mockPreEditedTryOnImages[currentMockImageIndex]);
    } else { // 'video' mode
        setDisplayedImageUrlInAR(null); // ARViewer will use its internal video URL
    }

    // Immediately show AR viewer
    setShowAR(true);
  };

  const handleStopTryOn = () => {
    setShowAR(false);
    setSelectedVirtualProducts([]);
    setUserUploadedImagePreviewUrl(null); // Clear user uploaded image
    setDisplayedImageUrlInAR(null); // Clear image displayed in ARViewer
    setArInputMode('video'); // Reset to video mode
  };

  const handleSaveOutfit = async () => {
    if (!arViewerRef.current || !showAR) {
      alert("Please start the virtual try-on first and select items to save an outfit.");
      return;
    }
    if (selectedVirtualProducts.length === 0) {
        alert("Select some virtual clothes to try on before saving an outfit!");
        return;
    }

    const productIdsInOutfit = selectedVirtualProducts.map(p => p.id);

    try {
        // ARViewer's captureScreenshot will now capture either the video frame or the pre-edited image
        const outfitImage = await arViewerRef.current.captureScreenshot();
        if (outfitImage) {
            addOutfit(outfitImage, productIdsInOutfit);
            // NEW: Cycle to the next mock image for the *next* try-on
            setCurrentMockImageIndex((prevIndex) => (prevIndex + 1) % mockPreEditedTryOnImages.length);
        } else {
            alert("Failed to capture outfit image. Please try again.");
        }
    } catch (error) {
        console.error("Error saving outfit:", error);
        alert("An error occurred while saving the outfit.");
    }
  };

  const goToOutfitCart = () => {
    navigate('/outfit-cart');
  };

  const handleUserImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUserUploadedImagePreviewUrl(URL.createObjectURL(file));
      setError(null); // Clear any previous errors
    } else {
      setUserUploadedImagePreviewUrl(null);
    }
  };

  if (loadingProducts) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-blue-600">Loading virtual try-on products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-8 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">Virtual Try-On Outfit Builder</h2>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Select items to create your virtual outfit and try them on in real-time.
      </p>

      <button
        onClick={goToOutfitCart}
        className="fixed top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Go to Outfits Cart ({getOutfitCount()})
      </button>


      {!showAR ? (
        <>
          {/* AR Input Mode Selection */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => { setArInputMode('video'); setDisplayedImageUrlInAR(null); }}
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${
                arInputMode === 'video' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Video Try-On
            </button>
            <button
              onClick={() => setArInputMode('image')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${
                arInputMode === 'image' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Picture Try-On
            </button>
          </div>

          {/* User Image Upload Input (conditional) */}
          {arInputMode === 'image' && (
            <div className="mb-6 w-full max-w-md bg-white p-4 rounded-lg shadow-md">
              <label htmlFor="image-upload" className="block text-md font-semibold text-gray-700 mb-2">
                Upload your picture (for context):
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleUserImageUpload}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              
              {userUploadedImagePreviewUrl && (
                <div className="mt-4 text-center p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Your Uploaded Image Preview:</p>
                  <img src={userUploadedImagePreviewUrl} alt="User Uploaded" className="max-w-full h-auto max-h-48 object-contain mx-auto rounded-md shadow-sm" />
                  <p className="text-xs text-gray-500 mt-2">
                    (Note: This image is for your reference. In 'My Picture Try-On' mode, a pre-edited outfit image will be shown.)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 w-full max-w-4xl">
            {availableProducts.map((product) => (
              <div
                key={product.id}
                className={`flex flex-col items-center p-4 border rounded-lg shadow-md cursor-pointer transition-all duration-200
                  ${selectedVirtualProducts.some((p) => p.id === product.id)
                    ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:shadow-lg'
                  }`}
                onClick={() => toggleProductSelection(product)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-24 h-24 object-contain mb-2 rounded-md"
                />
                <p className="font-semibold text-center">{product.name}</p>
                <p className="text-sm text-gray-600">({product.category})</p>
              </div>
            ))}
          </div>

          <div className="w-full max-w-md bg-gray-50 p-4 rounded-lg shadow-inner mb-6">
            <h3 className="text-xl font-semibold mb-3">Selected for Try-On ({selectedVirtualProducts.length} items)</h3>
            {selectedVirtualProducts.length === 0 ? (
              <p className="text-gray-600">No items selected yet.</p>
            ) : (
              <ul className="list-disc list-inside text-left">
                {selectedVirtualProducts.map((product) => (
                  <li key={product.id} className="text-gray-800">
                    {product.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleStartTryOn}
            className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Start Virtual Try-On
          </button>
        </>
      ) : (
        <>
          {/* Removed loading overlay as per request */}
          <div className="w-full max-w-2xl">
            {/* Pass new props to ARViewer */}
            <ARViewer
              ref={arViewerRef}
              selectedVirtualProducts={selectedVirtualProducts} // Still passed for context, though ARViewer won't overlay 3D models in 'image' mode
              inputMode={arInputMode} // Pass the selected mode
              uploadedImage={displayedImageUrlInAR} // Pass the pre-edited mock outfit image URL
            />
          </div>
          <p className="mt-4 text-sm text-red-500 text-center max-w-md">
            **Important:** In 'Demo Video' mode, outfits are pre-fitted in the video. In 'My Picture' mode, a pre-edited outfit image is shown. True avatar movement and dynamic clothing draping requires advanced (often paid) AR/AI solutions.
          </p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleStopTryOn}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-200 ease-in-out shadow-md"
            >
              Stop Virtual Try-On
            </button>
            <button
              onClick={handleSaveOutfit}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition duration-200 ease-in-out shadow-md"
            >
              Save This Outfit to Cart ({getOutfitCount()})
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VirtualTryOnOutfitPage;

// // frontend/src/pages/VirtualTryOnOutfitPage.jsx
// import React, { useState, useEffect, useRef, useContext } from 'react';
// import ARViewer from '../components/ARViewer';
// import { OutfitCartContext } from '../context/OutfitCartContext';
// import { useNavigate } from 'react-router-dom';
// // import { ShopContext } from '../context/ShopContext'; // Not needed here anymore

// const VirtualTryOnOutfitPage = () => {
//   const [availableProducts, setAvailableProducts] = useState([]);
//   const [selectedVirtualProducts, setSelectedVirtualProducts] = useState([]);
//   const [showAR, setShowAR] = useState(false);
//   const [loadingProducts, setLoadingProducts] = useState(true);
//   const [error, setError] = useState(null);

//   // NEW STATES for AR input mode
//   const [arInputMode, setArInputMode] = useState('video'); // 'video' or 'image'
//   const [uploadedImageFile, setUploadedImageFile] = useState(null); // File object from user upload
//   const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = useState(null); // Data URL for img src (user upload or mock)

//   // NEW STATES for mock images
//   const mockUserImages = [
//       { id: 'mock_pose_1', name: 'Standing Pose', url: 'https://placehold.co/300x400/FF5733/FFFFFF?text=User+Pose+1' },
//       { id: 'mock_pose_2', name: 'Side View', url: 'https://placehold.co/300x400/33FF57/FFFFFF?text=User+Pose+2' },
//       { id: 'mock_pose_3', name: 'Arms Up', url: 'https://placehold.co/300x400/3357FF/FFFFFF?text=User+Pose+3' },
//       { id: 'mock_pose_4', name: 'Walking', url: 'https://placehold.co/300x400/FF33E9/FFFFFF?text=User+Pose+4' },
//   ];
//   const [selectedMockImageId, setSelectedMockImageId] = useState(null); // ID of the currently selected mock image
//   const [showLoadingOverlay, setShowLoadingOverlay] = useState(false); // For the 4-5 second loading screen

//   const arViewerRef = useRef(null);
//   const { addOutfit, getOutfitCount } = useContext(OutfitCartContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchVirtualTryOnProducts = async () => {
//       setLoadingProducts(true);
//       setError(null);
//       try {
//         const backendUrl = 'http://localhost:5000';
//         const response = await fetch(`${backendUrl}/api/virtual-try-on-products`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch virtual try-on products.');
//         }
//         const data = await response.json();
//         setAvailableProducts(data.products);
//       } catch (err) {
//         console.error("Error fetching virtual try-on products:", err);
//         setError(err.message);
//       } finally {
//         setLoadingProducts(false);
//       }
//     };

//     fetchVirtualTryOnProducts();
//   }, []);

//   // Update uploadedImagePreviewUrl when selectedMockImageId changes
//   useEffect(() => {
//     if (arInputMode === 'image' && selectedMockImageId) {
//       const mockImage = mockUserImages.find(img => img.id === selectedMockImageId);
//       if (mockImage) {
//         setUploadedImagePreviewUrl(mockImage.url);
//         setUploadedImageFile(null); // Clear actual uploaded file if mock is selected
//       }
//     } else if (arInputMode === 'image' && !uploadedImageFile) {
//         // If in image mode but no file uploaded and no mock selected, clear preview
//         setUploadedImagePreviewUrl(null);
//     }
//   }, [arInputMode, selectedMockImageId, uploadedImageFile]);


//   const toggleProductSelection = (product) => {
//     setSelectedVirtualProducts((prevSelected) => {
//       if (prevSelected.find((p) => p.id === product.id)) {
//         return prevSelected.filter((p) => p.id !== product.id);
//       } else {
//         return [...prevSelected, product];
//       }
//     });
//   };

//   const handleStartTryOn = () => {
//     if (selectedVirtualProducts.length === 0) {
//       alert("Please select at least one item to try on!");
//       return;
//     }
//     // If in image mode, ensure either an image is uploaded OR a mock image is selected
//     if (arInputMode === 'image' && !uploadedImageFile && !selectedMockImageId) {
//         alert("Please upload an image or select a mock image to use the 'My Picture' try-on mode.");
//         return;
//     }

//     setShowLoadingOverlay(true); // Show loading overlay
//     setTimeout(() => {
//         setShowLoadingOverlay(false); // Hide loading overlay after 4-5 seconds
//         setShowAR(true); // Then show AR viewer
//     }, 4500); // 4.5 seconds for loading simulation
//   };

//   const handleStopTryOn = () => {
//     setShowAR(false);
//     setSelectedVirtualProducts([]);
//     setUploadedImageFile(null); // Clear uploaded image on stop
//     setUploadedImagePreviewUrl(null);
//     setSelectedMockImageId(null); // Clear selected mock image
//     setArInputMode('video'); // Reset to video mode
//   };

//   const handleSaveOutfit = async () => {
//     if (!arViewerRef.current || !showAR) {
//       alert("Please start the virtual try-on first and select items to save an outfit.");
//       return;
//     }
//     if (selectedVirtualProducts.length === 0) {
//         alert("Select some virtual clothes to try on before saving an outfit!");
//         return;
//     }

//     const productIdsInOutfit = selectedVirtualProducts.map(p => p.id);

//     try {
//         const outfitImage = await arViewerRef.current.captureScreenshot();
//         if (outfitImage) {
//             addOutfit(outfitImage, productIdsInOutfit);
//         } else {
//             alert("Failed to capture outfit image. Please try again.");
//         }
//     } catch (error) {
//         console.error("Error saving outfit:", error);
//         alert("An error occurred while saving the outfit.");
//     }
//   };

//   const goToOutfitCart = () => {
//     navigate('/outfit-cart');
//   };

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setUploadedImageFile(file);
//       setUploadedImagePreviewUrl(URL.createObjectURL(file));
//       setSelectedMockImageId(null); // Clear mock selection if user uploads their own
//       setError(null); // Clear any previous errors
//     } else {
//       setUploadedImageFile(null);
//       setUploadedImagePreviewUrl(null);
//     }
//   };

//   if (loadingProducts) {
//     return (
//       <div className="min-h-[70vh] flex items-center justify-center">
//         <p className="text-xl text-blue-600">Loading virtual try-on products...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-[70vh] flex items-center justify-center">
//         <p className="text-xl text-red-500">Error: {error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[70vh] flex flex-col items-center justify-center py-8 px-4">
//       <h2 className="text-3xl font-bold text-center mb-6">Virtual Try-On Outfit Builder</h2>
//       <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
//         Select items to create your virtual outfit and try them on in real-time.
//       </p>

//       <button
//         onClick={goToOutfitCart}
//         className="fixed top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50 transition duration-300 ease-in-out transform hover:scale-105"
//       >
//         Go to Outfits Cart ({getOutfitCount()})
//       </button>


//       {!showAR ? (
//         <>
//           {/* NEW: AR Input Mode Selection */}
//           <div className="mb-6 flex gap-4">
//             <button
//               onClick={() => { setArInputMode('video'); setUploadedImageFile(null); setUploadedImagePreviewUrl(null); setSelectedMockImageId(null); }}
//               className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${
//                 arInputMode === 'video' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Demo Video Try-On
//             </button>
//             <button
//               onClick={() => setArInputMode('image')}
//               className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${
//                 arInputMode === 'image' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Upload My Picture
//             </button>
//           </div>

//           {/* NEW: Image Upload Input (conditional) */}
//           {arInputMode === 'image' && (
//             <div className="mb-6 w-full max-w-md bg-white p-4 rounded-lg shadow-md">
//               <label htmlFor="image-upload" className="block text-md font-semibold text-gray-700 mb-2">
//                 Upload your picture for try-on:
//               </label>
//               <input
//                 type="file"
//                 id="image-upload"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
//               />
              
//               <p className="text-center text-gray-500 my-4">- OR -</p>

//               <p className="block text-md font-semibold text-gray-700 mb-2">
//                 Select a mock pose:
//               </p>
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 {mockUserImages.map(mockImg => (
//                   <div
//                     key={mockImg.id}
//                     onClick={() => { setSelectedMockImageId(mockImg.id); setUploadedImageFile(null); }}
//                     className={`cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center
//                       ${selectedMockImageId === mockImg.id ? 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-100'}`
//                     }
//                   >
//                     <img src={mockImg.url} alt={mockImg.name} className="w-20 h-20 object-contain rounded-md mb-1" />
//                     <p className="text-xs text-center font-medium">{mockImg.name}</p>
//                   </div>
//                 ))}
//               </div>

//               {uploadedImagePreviewUrl && (
//                 <div className="mt-6 text-center p-3 bg-gray-50 rounded-md border border-gray-200">
//                   <p className="text-sm text-gray-600 mb-2 font-semibold">Current Selected Image:</p>
//                   <img src={uploadedImagePreviewUrl} alt="Selected for Try-On" className="max-w-full h-auto max-h-48 object-contain mx-auto rounded-md shadow-sm" />
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 w-full max-w-4xl">
//             {availableProducts.map((product) => (
//               <div
//                 key={product.id}
//                 className={`flex flex-col items-center p-4 border rounded-lg shadow-md cursor-pointer transition-all duration-200
//                   ${selectedVirtualProducts.some((p) => p.id === product.id)
//                     ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50'
//                     : 'border-gray-200 bg-white hover:shadow-lg'
//                   }`}
//                 onClick={() => toggleProductSelection(product)}
//               >
//                 <img
//                   src={product.imageUrl}
//                   alt={product.name}
//                   className="w-24 h-24 object-contain mb-2 rounded-md"
//                 />
//                 <p className="font-semibold text-center">{product.name}</p>
//                 <p className="text-sm text-gray-600">({product.category})</p>
//               </div>
//             ))}
//           </div>

//           <div className="w-full max-w-md bg-gray-50 p-4 rounded-lg shadow-inner mb-6">
//             <h3 className="text-xl font-semibold mb-3">Selected for Try-On ({selectedVirtualProducts.length} items)</h3>
//             {selectedVirtualProducts.length === 0 ? (
//               <p className="text-gray-600">No items selected yet.</p>
//             ) : (
//               <ul className="list-disc list-inside text-left">
//                 {selectedVirtualProducts.map((product) => (
//                   <li key={product.id} className="text-gray-800">
//                     {product.name}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <button
//             onClick={handleStartTryOn}
//             className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 ease-in-out transform hover:scale-105"
//           >
//             Start Virtual Try-On
//           </button>
//         </>
//       ) : (
//         <>
//           {showLoadingOverlay && (
//             <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-[1200] text-white">
//               <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500"></div>
//               <p className="mt-4 text-xl font-semibold">Processing your virtual try-on...</p>
//               <p className="text-sm text-gray-300">This might take a few seconds to analyze the pose.</p>
//             </div>
//           )}
//           <div className="w-full max-w-2xl">
//             {/* Pass new props to ARViewer */}
//             <ARViewer
//               ref={arViewerRef}
//               selectedVirtualProducts={selectedVirtualProducts}
//               inputMode={arInputMode} // Pass the selected mode
//               uploadedImage={uploadedImagePreviewUrl} // Pass the uploaded image URL (could be user upload or mock)
//             />
//           </div>
//           <p className="mt-4 text-sm text-red-500 text-center max-w-md">
//             **Important:** In 'Demo Video' mode, outfits are pre-fitted in the video. In 'My Picture' mode, 3D models are overlaid on your static image. True avatar movement and dynamic clothing draping requires advanced (often paid) AR/AI solutions.
//           </p>
//           <div className="flex gap-4 mt-6">
//             <button
//               onClick={handleStopTryOn}
//               className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-200 ease-in-out shadow-md"
//             >
//               Stop Virtual Try-On
//             </button>
//             <button
//               onClick={handleSaveOutfit}
//               className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition duration-200 ease-in-out shadow-md"
//             >
//               Save This Outfit to Cart ({getOutfitCount()})
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default VirtualTryOnOutfitPage;


