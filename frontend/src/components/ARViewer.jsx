// frontend/src/components/ARViewer.jsx
import React, { useRef, useEffect, useState, Suspense, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// Import MediaPipe Pose libraries
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils'; // Still needed for onFrame logic, even if not using live camera

// Component to load and display a single GLTF model
function GLBModel({ url, position, rotation, scale, name }) {
  const gltf = useLoader(GLTFLoader, url);
  const meshRef = useRef();

  return (
    <primitive
      object={gltf.scene}
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
    />
  );
}

// Loader Fallback for 3D models
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="text-white text-lg">
      Loading 3D Models: {progress.toFixed(0)} %
    </Html>
  );
}

// Main ARViewer component - NOW WITH DYNAMIC INPUT MODES
const ARViewer = forwardRef(({ selectedVirtualProducts, inputMode, uploadedImage }, ref) => {
  const videoRef = useRef(null);
  const imageRef = useRef(null); // Ref for uploaded image (now used for the pre-edited mock)
  const canvasRef = useRef(null); // Reference to the Three.js Canvas element itself
  const [mediaReady, setMediaReady] = useState(false); // Tracks if video or image is loaded/ready
  const [arError, setArError] = useState(null);
  const [poseLandmarks, setPoseLandmarks] = useState(null); // Pose landmarks are only relevant for 3D overlay

  // --- IMPORTANT: REPLACE THIS WITH YOUR OWN DEMO VIDEO URL ---
  // This should be a video of a person (model) trying on outfits.
  // For a real demo, host this video on a CDN or your own server for stability.
  const DEMO_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4"; // REPLACE THIS!
  // Consider placing a small video file in your public/assets folder and using a relative path like '/assets/demo_model_tryon.mp4'
  // -----------------------------------------------------------

  // This function is now only relevant if 3D models are actually being rendered (e.g., in a future live camera mode)
  // For the current 'image' mode, 3D models are NOT overlaid.
  const getBaseModelProps = (category) => {
    switch (category) {
      case 'top': return { basePosition: [0, -0.2, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [1.6, 1.6, 1.6], layerOrder: 2 };
      case 'bottom': return { basePosition: [0, -1.2, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [1.6, 1.6, 1.6], layerOrder: 1 };
      case 'outerwear': return { basePosition: [0, -0.2, -1], baseRotation: [0, Math.PI, 0], baseScale: [1.7, 1.7, 1.7], layerOrder: 3 };
      case 'accessory-face': return { basePosition: [0, 0.4, -0.4], baseRotation: [0, Math.PI, 0], baseScale: [0.1, 0.1, 0.1], layerOrder: 4 };
      case 'accessory-waist': return { basePosition: [0, -0.6, -1.1], baseRotation: [0, Math.PI, 0], baseScale: [0.12, 0.12, 0.12], layerOrder: 2.5 };
      case 'accessory-hand': return { basePosition: [1, -0.8, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [0.5, 0.5, 0.5], layerOrder: 3.5 };
      default: return { basePosition: [0, 0, 0], baseRotation: [0, 0, 0], baseScale: [1, 1, 1], layerOrder: 0 };
    }
  };

  const onResults = useCallback((results) => {
    if (results.poseLandmarks) {
      setPoseLandmarks(results.poseLandmarks);
    } else {
      setPoseLandmarks(null);
    }
  }, []);

  useEffect(() => {
    let pose = null;
    let camera = null; // MediaPipe Camera utility instance (used for video frame processing)

    const setupMediaPipe = async () => {
      setArError(null);
      setMediaReady(false);
      setPoseLandmarks(null); // Clear old landmarks

      // Initialize MediaPipe Pose only if needed (e.g., for a future live camera mode)
      // For 'video' mode, MediaPipe is used to get pose from the video.
      // For 'image' mode, MediaPipe is NOT used, as the image is pre-edited.
      if (inputMode === 'video') {
          pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
          pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, smoothSegmentation: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
          pose.onResults(onResults);
      }


      if (inputMode === 'video' && videoRef.current) {
        videoRef.current.src = DEMO_VIDEO_URL;
        videoRef.current.loop = true;
        videoRef.current.muted = true;
        videoRef.current.play();

        videoRef.current.onloadeddata = () => {
          setMediaReady(true);
          // MediaPipe Camera utility can process video elements
          if (pose) { // Only start camera if pose is initialized (i.e., in 'video' mode)
            camera = new Camera(videoRef.current, {
              onFrame: async () => {
                if (videoRef.current && videoRef.current.readyState >= 2) {
                  await pose.send({ image: videoRef.current });
                }
              },
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            });
            camera.start();
          }
        };

        videoRef.current.onerror = (e) => {
          console.error("Error loading demo video:", e);
          setArError("Failed to load demo video. Please check the URL.");
        };

      } else if (inputMode === 'image' && uploadedImage && imageRef.current) {
        // For 'image' mode, we just need to display the image. No MediaPipe processing.
        imageRef.current.onload = async () => {
          setMediaReady(true);
        };
        imageRef.current.onerror = (e) => {
            console.error("Error loading uploaded image:", e);
            setArError("Failed to load your image. Please try another one.");
        };
        imageRef.current.src = uploadedImage; // Set the image source to trigger onload

      } else {
        setArError("No media source selected or ready.");
      }
    };

    setupMediaPipe();

    return () => {
      if (camera) camera.stop(); // Stop MediaPipe Camera for video mode
      if (pose) pose.close(); // Close MediaPipe Pose instance
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = ''; // Clear video source
      }
      if (imageRef.current) {
        imageRef.current.src = ''; // Clear image source
      }
    };
  }, [inputMode, uploadedImage, onResults]); // Re-run effect when mode or image changes

  // This function is now only relevant if 3D models are actually being rendered
  const getDynamicModelProps = (productCategory) => {
    const baseProps = getBaseModelProps(productCategory);
    // If no pose landmarks, return base props (no dynamic adjustment)
    if (!poseLandmarks || !(videoRef.current || imageRef.current)) {
      return baseProps;
    }

    // Determine the active media element and its dimensions
    const activeMedia = inputMode === 'video' ? videoRef.current : imageRef.current;
    if (!activeMedia) return baseProps;

    const mediaWidth = activeMedia.videoWidth || activeMedia.naturalWidth;
    const mediaHeight = activeMedia.videoHeight || activeMedia.naturalHeight;

    if (!mediaWidth || !mediaHeight) return baseProps; // Ensure dimensions are available

    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    const leftHip = poseLandmarks[23];
    const rightHip = poseLandmarks[24];
    const nose = poseLandmarks[0];

    const getPixelCoords = (landmark) => ({
      x: landmark.x * mediaWidth, y: landmark.y * mediaHeight, z: landmark.z
    });

    const lsPx = getPixelCoords(leftShoulder);
    const rsPx = getPixelCoords(rightShoulder);
    const lhPx = getPixelCoords(leftHip);
    const rhPx = getPixelCoords(rightHip);
    const nosePx = getPixelCoords(nose);

    const shoulderWidthPx = Math.abs(rsPx.x - lsPx.x);
    const torsoHeightPx = Math.abs((lsPx.y + rsPx.y) / 2 - (lhPx.y + rhPx.y) / 2);

    // These might need calibration for your specific video/image content
    const referenceShoulderWidth = 200;
    const referenceTorsoHeight = 350;

    let scaleFactorX = shoulderWidthPx > 0 ? Math.min(Math.max(shoulderWidthPx / referenceShoulderWidth, 0.8), 1.8) : 1;
    let scaleFactorY = torsoHeightPx > 0 ? Math.min(Math.max(torsoHeightPx / referenceTorsoHeight, 0.8), 1.8) : 1;
    const overallScale = (scaleFactorX + scaleFactorY) / 2;

    const centerShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const centerHipY = (leftHip.y + rightHip.y) / 2;

    // Adjust 3D coordinates based on normalized MediaPipe coordinates
    // MediaPipe coords are 0-1, Three.js scene is typically -X to X, -Y to Y
    const threeDX = -(centerShoulderX - 0.5) * (baseProps.baseScale[0] * 2);
    const threeDY_shoulder = -(centerShoulderY - 0.5) * (baseProps.baseScale[1] * 2);
    const threeDY_hip = -(centerHipY - 0.5) * (baseProps.baseScale[1] * 2);

    let dynamicPosition = [...baseProps.basePosition];

    if (productCategory === 'top' || productCategory === 'outerwear') {
      dynamicPosition[1] = threeDY_shoulder + 0.2; // Adjust Y to align with shoulders
      dynamicPosition[0] = threeDX; // Adjust X to align with center of body
    } else if (productCategory === 'bottom') {
      dynamicPosition[1] = threeDY_hip - 0.2; // Adjust Y to align with hips
      dynamicPosition[0] = threeDX;
    } else if (productCategory === 'accessory-face') {
      dynamicPosition[0] = threeDX;
      dynamicPosition[1] = -(nosePx.y / mediaHeight - 0.5) * (baseProps.baseScale[1] * 2) + 0.5;
    } else if (productCategory === 'accessory-waist') {
      dynamicPosition[0] = threeDX;
      dynamicPosition[1] = (threeDY_shoulder + threeDY_hip) / 2 - 0.3;
    } else if (productCategory === 'accessory-hand') {
      dynamicPosition[0] = threeDX + (shoulderWidthPx / mediaWidth * 2);
      dynamicPosition[1] = threeDY_shoulder - 0.5;
    }

    return {
      position: dynamicPosition,
      rotation: baseProps.baseRotation,
      scale: baseProps.baseScale.map(s => s * overallScale),
      layerOrder: baseProps.layerOrder
    };
  };

  const sortedProducts = [...selectedVirtualProducts].sort((a, b) => {
    const propsA = getBaseModelProps(a.category);
    const propsB = getBaseModelProps(b.category);
    return propsA.layerOrder - propsB.layerOrder;
  });

  // Expose captureScreenshot function via useImperativeHandle
  useImperativeHandle(ref, () => ({
    captureScreenshot: async () => {
      const activeMedia = inputMode === 'video' ? videoRef.current : imageRef.current;
      if (!activeMedia) {
        console.error("Media not ready for screenshot.");
        return null;
      }

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = activeMedia.videoWidth || activeMedia.naturalWidth;
      outputCanvas.height = activeMedia.videoHeight || activeMedia.naturalHeight;
      const ctx = outputCanvas.getContext('2d');

      // 1. Draw active media frame (video or image)
      ctx.drawImage(activeMedia, 0, 0, outputCanvas.width, outputCanvas.height);

      // Get data URL
      const dataUrl = outputCanvas.toDataURL('image/png');
      return dataUrl;
    }
  }));


  return (
    <div className="relative w-full max-w-2xl h-[600px] bg-black border-2 border-gray-300 rounded-lg overflow-hidden flex justify-center items-center">
      {arError && (
        <div className="absolute z-20 bg-red-700 text-white p-4 rounded-lg text-center">
          {arError}
        </div>
      )}

      {/* Conditional rendering for video or image background */}
      {inputMode === 'video' && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          playsInline
          loop
          muted
          src={DEMO_VIDEO_URL} // Set src directly here for clarity
        />
      )}
      {inputMode === 'image' && uploadedImage && (
        <img
          ref={imageRef}
          className="absolute inset-0 w-full h-full object-contain z-0 bg-gray-700" // object-contain to prevent stretching
          src={uploadedImage} // This will be the pre-edited mock outfit image URL
          alt="Pre-edited Outfit Demo"
        />
      )}
      
      {/* Three.js Canvas for 3D model overlay - ONLY render if in 'video' mode (for pose detection) */}
      {/* No 3D models are overlaid in 'image' mode as the image itself is the "fitted" result */}
      {mediaReady && inputMode === 'video' && ( // Only render 3D models if in 'video' mode
        <Canvas
          ref={canvasRef}
          className="absolute inset-0 z-10"
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ alpha: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 5, 5]} intensity={1} />
          <directionalLight position={[0, -5, -5]} intensity={0.5} />

          <Suspense fallback={<Loader />}>
            {sortedProducts.map((product) => {
              const { position, rotation, scale } = getDynamicModelProps(product.category);
              return (
                <GLBModel
                  key={product.id}
                  url={product.model3dUrl}
                  position={position}
                  rotation={rotation}
                  scale={scale}
                  name={product.name}
                />
              );
            })}
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      )}
      {/* Removed the overlay text for 'image' mode */}
    </div>
  );
});

export default ARViewer;


// // frontend/src/components/ARViewer.jsx
// import React, { useRef, useEffect, useState, Suspense, useCallback, useImperativeHandle, forwardRef } from 'react';
// import { Canvas, useFrame, useLoader } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls, Html, useProgress } from '@react-three/drei';
// import * as THREE from 'three';

// // Import MediaPipe Pose libraries
// import { Pose } from '@mediapipe/pose';
// import { Camera } from '@mediapipe/camera_utils'; // Still needed for onFrame logic, even if not using live camera

// // Component to load and display a single GLTF model
// function GLBModel({ url, position, rotation, scale, name }) {
//   const gltf = useLoader(GLTFLoader, url);
//   const meshRef = useRef();

//   return (
//     <primitive
//       object={gltf.scene}
//       ref={meshRef}
//       position={position}
//       rotation={rotation}
//       scale={scale}
//       name={name}
//     />
//   );
// }

// // Loader Fallback for 3D models
// function Loader() {
//   const { progress } = useProgress();
//   return (
//     <Html center className="text-white text-lg">
//       Loading 3D Models: {progress.toFixed(0)} %
//     </Html>
//   );
// }

// // Main ARViewer component - NOW WITH DYNAMIC INPUT MODES
// const ARViewer = forwardRef(({ selectedVirtualProducts, inputMode, uploadedImage }, ref) => { // NEW PROPS: inputMode, uploadedImage
//   const videoRef = useRef(null);
//   const imageRef = useRef(null); // NEW: Ref for uploaded image
//   const canvasRef = useRef(null); // Reference to the Three.js Canvas element itself
//   const [mediaReady, setMediaReady] = useState(false); // Tracks if video or image is loaded/ready
//   const [arError, setArError] = useState(null);
//   const [poseLandmarks, setPoseLandmarks] = useState(null);

//   // --- IMPORTANT: REPLACE THIS WITH YOUR OWN DEMO VIDEO URL ---
//   // This should be a video of a person (model) trying on outfits.
//   // For a real demo, host this video on a CDN or your own server for stability.
//   const DEMO_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4"; // REPLACE THIS!
//   // Consider placing a small video file in your public/assets folder and using a relative path like '/assets/demo_model_tryon.mp4'
//   // -----------------------------------------------------------

//   const getBaseModelProps = (category) => {
//     switch (category) {
//       case 'top': return { basePosition: [0, -0.2, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [1.6, 1.6, 1.6], layerOrder: 2 };
//       case 'bottom': return { basePosition: [0, -1.2, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [1.6, 1.6, 1.6], layerOrder: 1 };
//       case 'outerwear': return { basePosition: [0, -0.2, -1], baseRotation: [0, Math.PI, 0], baseScale: [1.7, 1.7, 1.7], layerOrder: 3 };
//       case 'accessory-face': return { basePosition: [0, 0.4, -0.4], baseRotation: [0, Math.PI, 0], baseScale: [0.1, 0.1, 0.1], layerOrder: 4 };
//       case 'accessory-waist': return { basePosition: [0, -0.6, -1.1], baseRotation: [0, Math.PI, 0], baseScale: [0.12, 0.12, 0.12], layerOrder: 2.5 };
//       case 'accessory-hand': return { basePosition: [1, -0.8, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [0.5, 0.5, 0.5], layerOrder: 3.5 };
//       default: return { basePosition: [0, 0, 0], baseRotation: [0, 0, 0], baseScale: [1, 1, 1], layerOrder: 0 };
//     }
//   };

//   const onResults = useCallback((results) => {
//     if (results.poseLandmarks) {
//       setPoseLandmarks(results.poseLandmarks);
//     } else {
//       setPoseLandmarks(null);
//     }
//   }, []);

//   useEffect(() => {
//     let pose = null;
//     let camera = null; // MediaPipe Camera utility instance (used for video frame processing)

//     const setupMediaPipe = async () => {
//       setArError(null);
//       setMediaReady(false);
//       setPoseLandmarks(null); // Clear old landmarks

//       pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
//       pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, smoothSegmentation: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
//       pose.onResults(onResults);

//       if (inputMode === 'video' && videoRef.current) {
//         videoRef.current.src = DEMO_VIDEO_URL;
//         videoRef.current.loop = true;
//         videoRef.current.muted = true;
//         videoRef.current.play();

//         videoRef.current.onloadeddata = () => {
//           setMediaReady(true);
//           // MediaPipe Camera utility can process video elements
//           camera = new Camera(videoRef.current, {
//             onFrame: async () => {
//               if (videoRef.current && videoRef.current.readyState >= 2) {
//                 await pose.send({ image: videoRef.current });
//               }
//             },
//             width: videoRef.current.videoWidth,
//             height: videoRef.current.videoHeight,
//           });
//           camera.start();
//         };

//         videoRef.current.onerror = (e) => {
//           console.error("Error loading demo video:", e);
//           setArError("Failed to load demo video. Please check the URL.");
//         };

//       } else if (inputMode === 'image' && uploadedImage && imageRef.current) {
//         // For static images, MediaPipe can process them directly
//         // We need to wait for the image to load before sending it to MediaPipe
//         imageRef.current.onload = async () => {
//           setMediaReady(true);
//           // Send the static image to MediaPipe once
//           await pose.send({ image: imageRef.current });
//         };
//         imageRef.current.onerror = (e) => {
//             console.error("Error loading uploaded image:", e);
//             setArError("Failed to load your image. Please try another one.");
//         };
//         // Set the image source to trigger onload
//         imageRef.current.src = uploadedImage;

//       } else {
//         setArError("No media source selected or ready.");
//       }
//     };

//     setupMediaPipe();

//     return () => {
//       if (camera) camera.stop(); // Stop MediaPipe Camera for video mode
//       if (pose) pose.close(); // Close MediaPipe Pose instance
//       if (videoRef.current) {
//         videoRef.current.pause();
//         videoRef.current.src = ''; // Clear video source
//       }
//       if (imageRef.current) {
//         imageRef.current.src = ''; // Clear image source
//       }
//     };
//   }, [inputMode, uploadedImage, onResults]); // Re-run effect when mode or image changes

//   const getDynamicModelProps = (productCategory) => {
//     const baseProps = getBaseModelProps(productCategory);
//     if (!poseLandmarks || !(videoRef.current || imageRef.current)) {
//       return baseProps;
//     }

//     // Determine the active media element and its dimensions
//     const activeMedia = inputMode === 'video' ? videoRef.current : imageRef.current;
//     if (!activeMedia) return baseProps;

//     const mediaWidth = activeMedia.videoWidth || activeMedia.naturalWidth;
//     const mediaHeight = activeMedia.videoHeight || activeMedia.naturalHeight;

//     if (!mediaWidth || !mediaHeight) return baseProps; // Ensure dimensions are available

//     const leftShoulder = poseLandmarks[11];
//     const rightShoulder = poseLandmarks[12];
//     const leftHip = poseLandmarks[23];
//     const rightHip = poseLandmarks[24];
//     const nose = poseLandmarks[0];

//     const getPixelCoords = (landmark) => ({
//       x: landmark.x * mediaWidth, y: landmark.y * mediaHeight, z: landmark.z
//     });

//     const lsPx = getPixelCoords(leftShoulder);
//     const rsPx = getPixelCoords(rightShoulder);
//     const lhPx = getPixelCoords(leftHip);
//     const rhPx = getPixelCoords(rightHip);
//     const nosePx = getPixelCoords(nose);

//     const shoulderWidthPx = Math.abs(rsPx.x - lsPx.x);
//     const torsoHeightPx = Math.abs((lsPx.y + rsPx.y) / 2 - (lhPx.y + rhPx.y) / 2);

//     // These might need calibration for your specific video/image content
//     const referenceShoulderWidth = 200;
//     const referenceTorsoHeight = 350;

//     let scaleFactorX = shoulderWidthPx > 0 ? Math.min(Math.max(shoulderWidthPx / referenceShoulderWidth, 0.8), 1.8) : 1;
//     let scaleFactorY = torsoHeightPx > 0 ? Math.min(Math.max(torsoHeightPx / referenceTorsoHeight, 0.8), 1.8) : 1;
//     const overallScale = (scaleFactorX + scaleFactorY) / 2;

//     const centerShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
//     const centerShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
//     const centerHipY = (leftHip.y + rightHip.y) / 2;

//     // Adjust 3D coordinates based on normalized MediaPipe coordinates
//     // MediaPipe coords are 0-1, Three.js scene is typically -X to X, -Y to Y
//     const threeDX = -(centerShoulderX - 0.5) * (baseProps.baseScale[0] * 2);
//     const threeDY_shoulder = -(centerShoulderY - 0.5) * (baseProps.baseScale[1] * 2);
//     const threeDY_hip = -(centerHipY - 0.5) * (baseProps.baseScale[1] * 2);

//     let dynamicPosition = [...baseProps.basePosition];

//     if (productCategory === 'top' || productCategory === 'outerwear') {
//       dynamicPosition[1] = threeDY_shoulder + 0.2; // Adjust Y to align with shoulders
//       dynamicPosition[0] = threeDX; // Adjust X to align with center of body
//     } else if (productCategory === 'bottom') {
//       dynamicPosition[1] = threeDY_hip - 0.2; // Adjust Y to align with hips
//       dynamicPosition[0] = threeDX;
//     } else if (productCategory === 'accessory-face') {
//       dynamicPosition[0] = threeDX;
//       dynamicPosition[1] = -(nosePx.y / mediaHeight - 0.5) * (baseProps.baseScale[1] * 2) + 0.5;
//     } else if (productCategory === 'accessory-waist') {
//       dynamicPosition[0] = threeDX;
//       dynamicPosition[1] = (threeDY_shoulder + threeDY_hip) / 2 - 0.3;
//     } else if (productCategory === 'accessory-hand') {
//       dynamicPosition[0] = threeDX + (shoulderWidthPx / mediaWidth * 2);
//       dynamicPosition[1] = threeDY_shoulder - 0.5;
//     }

//     return {
//       position: dynamicPosition,
//       rotation: baseProps.baseRotation,
//       scale: baseProps.baseScale.map(s => s * overallScale),
//       layerOrder: baseProps.layerOrder
//     };
//   };

//   const sortedProducts = [...selectedVirtualProducts].sort((a, b) => {
//     const propsA = getBaseModelProps(a.category);
//     const propsB = getBaseModelProps(b.category);
//     return propsA.layerOrder - propsB.layerOrder;
//   });

//   // Expose captureScreenshot function via useImperativeHandle
//   useImperativeHandle(ref, () => ({
//     captureScreenshot: async () => {
//       const activeMedia = inputMode === 'video' ? videoRef.current : imageRef.current;
//       if (!activeMedia || !canvasRef.current) {
//         console.error("Media or Three.js canvas not ready for screenshot.");
//         return null;
//       }

//       const threeJsCanvas = canvasRef.current;

//       const outputCanvas = document.createElement('canvas');
//       outputCanvas.width = activeMedia.videoWidth || activeMedia.naturalWidth;
//       outputCanvas.height = activeMedia.videoHeight || activeMedia.naturalHeight;
//       const ctx = outputCanvas.getContext('2d');

//       // 1. Draw active media frame (video or image)
//       ctx.drawImage(activeMedia, 0, 0, outputCanvas.width, outputCanvas.height);

//       // 2. ONLY Draw Three.js canvas content on top if in 'image' mode
//       if (inputMode === 'image') {
//         ctx.drawImage(threeJsCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
//       }

//       // Get data URL
//       const dataUrl = outputCanvas.toDataURL('image/png');
//       return dataUrl;
//     }
//   }));


//   return (
//     <div className="relative w-full max-w-2xl h-[600px] bg-black border-2 border-gray-300 rounded-lg overflow-hidden flex justify-center items-center">
//       {arError && (
//         <div className="absolute z-20 bg-red-700 text-white p-4 rounded-lg text-center">
//           {arError}
//         </div>
//       )}

//       {/* Conditional rendering for video or image background */}
//       {inputMode === 'video' && (
//         <video
//           ref={videoRef}
//           className="absolute inset-0 w-full h-full object-cover z-0"
//           autoPlay
//           playsInline
//           loop
//           muted
//           src={DEMO_VIDEO_URL} // Set src directly here for clarity
//         />
//       )}
//       {inputMode === 'image' && uploadedImage && (
//         <img
//           ref={imageRef}
//           className="absolute inset-0 w-full h-full object-contain z-0 bg-gray-700" // object-contain to prevent stretching
//           src={uploadedImage}
//           alt="Uploaded for Try-On"
//         />
//       )}
      
//       {/* Three.js Canvas for 3D model overlay - only render if media is ready AND in 'image' mode */}
//       {mediaReady && inputMode === 'image' && ( // Only render 3D models if in 'image' mode
//         <Canvas
//           ref={canvasRef}
//           className="absolute inset-0 z-10"
//           camera={{ position: [0, 0, 5], fov: 75 }}
//           gl={{ alpha: true }}
//         >
//           <ambientLight intensity={0.8} />
//           <directionalLight position={[0, 5, 5]} intensity={1} />
//           <directionalLight position={[0, -5, -5]} intensity={0.5} />

//           <Suspense fallback={<Loader />}>
//             {sortedProducts.map((product) => {
//               const { position, rotation, scale } = getDynamicModelProps(product.category);
//               return (
//                 <GLBModel
//                   key={product.id}
//                   url={product.model3dUrl}
//                   position={position}
//                   rotation={rotation}
//                   scale={scale}
//                   name={product.name}
//                 />
//               );
//             })}
//           </Suspense>
//           <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
//         </Canvas>
//       )}
//       {mediaReady && inputMode === 'video' && ( // Placeholder for video mode if canvas is needed for other reasons
//           <div className="absolute inset-0 z-10 flex items-center justify-center text-white text-xl font-bold">
//               {/* No 3D models rendered here, video handles the fitting */}
//               <p className="bg-black bg-opacity-50 p-2 rounded">Video Demo Mode: Outfits pre-fitted in video</p>
//           </div>
//       )}
//     </div>
//   );
// });

// export default ARViewer;
// // frontend/src/components/ARViewer.jsx
// import React, { useRef, useEffect, useState, Suspense, useCallback, useImperativeHandle, forwardRef } from 'react'; // NEW: forwardRef, useImperativeHandle
// import { Canvas, useFrame, useLoader } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls, Html, useProgress } from '@react-three/drei';
// import * as THREE from 'three';

// // Import MediaPipe Pose libraries
// import { Pose } from '@mediapipe/pose';
// import { Camera } from '@mediapipe/camera_utils';

// // Component to load and display a single GLTF model
// function GLBModel({ url, position, rotation, scale, name }) {
//   const gltf = useLoader(GLTFLoader, url);
//   const meshRef = useRef();

//   return (
//     <primitive
//       object={gltf.scene}
//       ref={meshRef}
//       position={position}
//       rotation={rotation}
//       scale={scale}
//       name={name}
//     />
//   );
// }

// // Loader Fallback for 3D models
// function Loader() {
//   const { progress } = useProgress();
//   return (
//     <Html center className="text-white text-lg">
//       Loading 3D Models: {progress.toFixed(0)} %
//     </Html>
//   );
// }

// // Main ARViewer component - NOW WRAPPED WITH forwardRef
// const ARViewer = forwardRef(({ selectedVirtualProducts }, ref) => { // NEW: forwardRef and ref prop
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null); // Reference to the Three.js Canvas element itself
//   const [cameraStream, setCameraStream] = useState(null);
//   const [arError, setArError] = useState(null);
//   const [poseLandmarks, setPoseLandmarks] = useState(null);

//   const getBaseModelProps = (category) => {
//     switch (category) {
//       case 'top': return { basePosition: [0, -0.2, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [1.6, 1.6, 1.6], layerOrder: 2 };
//       case 'bottom': return { basePosition: [0, -1.2, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [1.6, 1.6, 1.6], layerOrder: 1 };
//       case 'outerwear': return { basePosition: [0, -0.2, -1], baseRotation: [0, Math.PI, 0], baseScale: [1.7, 1.7, 1.7], layerOrder: 3 };
//       case 'accessory-face': return { basePosition: [0, 0.4, -0.4], baseRotation: [0, Math.PI, 0], baseScale: [0.1, 0.1, 0.1], layerOrder: 4 };
//       case 'accessory-waist': return { basePosition: [0, -0.6, -1.1], baseRotation: [0, Math.PI, 0], baseScale: [0.12, 0.12, 0.12], layerOrder: 2.5 };
//       case 'accessory-hand': return { basePosition: [1, -0.8, -1.2], baseRotation: [0, Math.PI, 0], baseScale: [0.5, 0.5, 0.5], layerOrder: 3.5 };
//       default: return { basePosition: [0, 0, 0], baseRotation: [0, 0, 0], baseScale: [1, 1, 1], layerOrder: 0 };
//     }
//   };

//   const onResults = useCallback((results) => {
//     if (results.poseLandmarks) {
//       setPoseLandmarks(results.poseLandmarks);
//     } else {
//       setPoseLandmarks(null);
//     }
//   }, []);

//   useEffect(() => {
//     let currentStream = null;
//     let pose = null;
//     let camera = null;

//     const setupMediaPipe = async () => {
//       pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
//       pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, smoothSegmentation: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
//       pose.onResults(onResults);

//       try {
//         currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
//         if (videoRef.current) {
//           videoRef.current.srcObject = currentStream;
//           videoRef.current.onloadedmetadata = () => {
//             if (camera) camera.start();
//           };
//           videoRef.current.play();
//         }
//         setCameraStream(currentStream);

//         camera = new Camera(videoRef.current, {
//           onFrame: async () => { if (videoRef.current) { await pose.send({ image: videoRef.current }); } },
//           width: 640, height: 480,
//         });
//       } catch (err) {
//         console.error("Error accessing camera or setting up MediaPipe:", err);
//         setArError("Failed to access camera or load AR models. Please check permissions and try again.");
//       }
//     };

//     setupMediaPipe();

//     return () => {
//       if (camera) camera.stop();
//       if (pose) pose.close();
//       if (currentStream) {
//         currentStream.getTracks().forEach(track => track.stop());
//         console.log("Camera stream stopped and released.");
//       }
//     };
//   }, [onResults]);

//   const getDynamicModelProps = (productCategory) => {
//     const baseProps = getBaseModelProps(productCategory);
//     if (!poseLandmarks || !videoRef.current) {
//       return baseProps;
//     }

//     const leftShoulder = poseLandmarks[11];
//     const rightShoulder = poseLandmarks[12];
//     const leftHip = poseLandmarks[23];
//     const rightHip = poseLandmarks[24];
//     const nose = poseLandmarks[0];

//     const videoWidth = videoRef.current.videoWidth;
//     const videoHeight = videoRef.current.videoHeight;

//     const getPixelCoords = (landmark) => ({
//       x: landmark.x * videoWidth, y: landmark.y * videoHeight, z: landmark.z
//     });

//     const lsPx = getPixelCoords(leftShoulder);
//     const rsPx = getPixelCoords(rightShoulder);
//     const lhPx = getPixelCoords(leftHip);
//     const rhPx = getPixelCoords(rightHip);
//     const nosePx = getPixelCoords(nose);

//     const shoulderWidthPx = Math.abs(rsPx.x - lsPx.x);
//     const torsoHeightPx = Math.abs((lsPx.y + rsPx.y) / 2 - (lhPx.y + rhPx.y) / 2);

//     const referenceShoulderWidth = 200;
//     const referenceTorsoHeight = 350;

//     let scaleFactorX = shoulderWidthPx > 0 ? Math.min(Math.max(shoulderWidthPx / referenceShoulderWidth, 0.8), 1.8) : 1;
//     let scaleFactorY = torsoHeightPx > 0 ? Math.min(Math.max(torsoHeightPx / referenceTorsoHeight, 0.8), 1.8) : 1;
//     const overallScale = (scaleFactorX + scaleFactorY) / 2;

//     const centerShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
//     const centerShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
//     const centerHipY = (leftHip.y + rightHip.y) / 2;

//     const threeDX = -(centerShoulderX - 0.5) * (baseProps.baseScale[0] * 2);
//     const threeDY_shoulder = -(centerShoulderY - 0.5) * (baseProps.baseScale[1] * 2);
//     const threeDY_hip = -(centerHipY - 0.5) * (baseProps.baseScale[1] * 2);

//     let dynamicPosition = [...baseProps.basePosition];

//     if (productCategory === 'top' || productCategory === 'outerwear') {
//       dynamicPosition[1] = threeDY_shoulder + 0.2;
//       dynamicPosition[0] = threeDX;
//     } else if (productCategory === 'bottom') {
//       dynamicPosition[1] = threeDY_hip - 0.2;
//       dynamicPosition[0] = threeDX;
//     } else if (productCategory === 'accessory-face') {
//       dynamicPosition[0] = threeDX;
//       dynamicPosition[1] = -(nosePx.y / videoHeight - 0.5) * (baseProps.baseScale[1] * 2) + 0.5;
//     } else if (productCategory === 'accessory-waist') {
//       dynamicPosition[0] = threeDX;
//       dynamicPosition[1] = (threeDY_shoulder + threeDY_hip) / 2 - 0.3;
//     } else if (productCategory === 'accessory-hand') {
//       dynamicPosition[0] = threeDX + (shoulderWidthPx / videoWidth * 2);
//       dynamicPosition[1] = threeDY_shoulder - 0.5;
//     }

//     return {
//       position: dynamicPosition,
//       rotation: baseProps.baseRotation,
//       scale: baseProps.baseScale.map(s => s * overallScale),
//       layerOrder: baseProps.layerOrder
//     };
//   };

//   const sortedProducts = [...selectedVirtualProducts].sort((a, b) => {
//     const propsA = getBaseModelProps(a.category);
//     const propsB = getBaseModelProps(b.category);
//     return propsA.layerOrder - propsB.layerOrder;
//   });

//   // NEW: Expose captureScreenshot function via useImperativeHandle
//   useImperativeHandle(ref, () => ({
//     captureScreenshot: async () => {
//       if (!videoRef.current || !canvasRef.current) {
//         console.error("Video or Three.js canvas not ready for screenshot.");
//         return null;
//       }

//       const videoElement = videoRef.current;
//       const threeJsCanvas = canvasRef.current; // The actual DOM canvas element from Three.js

//       const outputCanvas = document.createElement('canvas');
//       outputCanvas.width = videoElement.videoWidth;
//       outputCanvas.height = videoElement.videoHeight;
//       const ctx = outputCanvas.getContext('2d');

//       // 1. Draw video frame
//       // Due to the `transform scaleX(-1)` on the video, we need to draw it mirrored.
//       ctx.translate(outputCanvas.width, 0);
//       ctx.scale(-1, 1);
//       ctx.drawImage(videoElement, 0, 0, outputCanvas.width, outputCanvas.height);
//       ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

//       // 2. Draw Three.js canvas content on top (it's already correctly oriented)
//       ctx.drawImage(threeJsCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

//       // Get data URL
//       const dataUrl = outputCanvas.toDataURL('image/png');
//       return dataUrl;
//     }
//   }));


//   return (
//     <div className="relative w-full max-w-2xl h-[600px] bg-black border-2 border-gray-300 rounded-lg overflow-hidden flex justify-center items-center">
//       {arError && (
//         <div className="absolute z-20 bg-red-700 text-white p-4 rounded-lg text-center">
//           {arError}
//         </div>
//       )}

//       {/* Video stream from camera */}
//       <video
//         ref={videoRef}
//         className="absolute inset-0 w-full h-full object-cover transform scaleX(-1) z-0"
//         autoPlay
//         playsInline
//       />
      
//       {/* Three.js Canvas for 3D model overlay - NOW WITH ref */}
//       {cameraStream && (
//         <Canvas
//           ref={canvasRef} // NEW: Attach ref to the Canvas
//           className="absolute inset-0 z-10"
//           camera={{ position: [0, 0, 5], fov: 75 }}
//           gl={{ alpha: true }}
//         >
//           <ambientLight intensity={0.8} />
//           <directionalLight position={[0, 5, 5]} intensity={1} />
//           <directionalLight position={[0, -5, -5]} intensity={0.5} />

//           <Suspense fallback={<Loader />}>
//             {sortedProducts.map((product) => {
//               const { position, rotation, scale } = getDynamicModelProps(product.category);
//               return (
//                 <GLBModel
//                   key={product.id}
//                   url={product.model3dUrl}
//                   position={position}
//                   rotation={rotation}
//                   scale={scale}
//                   name={product.name}
//                 />
//               );
//             })}
//           </Suspense>
//           <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
//         </Canvas>
//       )}
//     </div>
//   );
// });

// export default ARViewer;
