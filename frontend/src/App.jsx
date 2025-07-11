// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart'; // Your existing website cart
import Login from './pages/Login';
import Orders from './pages/Orders';
import PlaceOrder from './pages/PlaceOrder'; // Your Checkout page
import Product from './pages/Product';
import ImageSearch from './pages/ImageSearch'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import ShopContextProvider from './context/ShopContext'; // Your existing ShopContextProvider

// NEW IMPORTS for the store feature
import ScanStorePage from './pages/ScanStorePage';
import ScanProductPage from './pages/ScanProductPage';
import StoreCartPage from './pages/StoreCartPage'; // The new dedicated store cart page
import ReceiptPage from './pages/ReceiptPage'; // The receipt page for the store feature
import { StoreCartContextProvider } from './context/StoreCartContext'; // The new store cart context

//Virtual Try-On
import VirtualTryOnOutfitPage from './pages/VirtualTryOnOutfitPage';
import OutfitCartProvider from './context/OutfitCartContext';
import OutfitCartPage from './pages/OutfitCartPage'; // Import the new OutfitCartPage

// NEW: Import the GroceryReminders page
import GroceryReminders from './pages/GroceryReminders'; 

const App = () => {
  return (
    // Your main website context
    <ShopContextProvider>
      {/* The new store cart context, nested inside ShopContextProvider */}
      <StoreCartContextProvider>
        {/* OutfitCartProvider needs to wrap components that use OutfitCartContext */}
        {/* This includes VirtualTryOnOutfitPage and the new OutfitCartPage */}
        <OutfitCartProvider>
          <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
            <Navbar />
            <SearchBar />
            <Routes>
              {/* Existing Website Routes (unmodified) */}
              <Route path='/' element={<Home />} />
              <Route path='/collection' element={<Collection />} />
              <Route path='/about' element={<About />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/login' element={<Login />} />
              <Route path='/orders' element={<Orders />} />
              <Route path='/place-order' element={<PlaceOrder />} />
              <Route path='/product/:productId' element={<Product />} />
              <Route path='/image-search' element={<ImageSearch />} /> 
              
              {/* NEW Store Feature Routes */}
              <Route path='/scan-store' element={<ScanStorePage />} />
              <Route path='/scan-product' element={<ScanProductPage />} />
              <Route path='/store-cart' element={<StoreCartPage />} /> {/* Dedicated store cart page */}
              <Route path='/receipt' element={<ReceiptPage />} /> {/* Receipt page for store transactions */}

              {/* Virtual Try-On Routes */}
              <Route path="/virtual-try-on-outfit" element={<VirtualTryOnOutfitPage />} />
              <Route path="/outfit-cart" element={<OutfitCartPage />} /> {/* Route for the outfit cart page */}
              
              {/* NEW: Route for Grocery Reminders */}
              <Route path="/grocery-reminders" element={<GroceryReminders />} />
            </Routes>
            <Footer />
          </div>
        </OutfitCartProvider>
      </StoreCartContextProvider>
    </ShopContextProvider>
  );
};

export default App;


// // frontend/src/App.jsx
// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import Collection from './pages/Collection';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import Cart from './pages/Cart'; // Your existing website cart
// import Login from './pages/Login';
// import Orders from './pages/Orders';
// import PlaceOrder from './pages/PlaceOrder'; // Your Checkout page
// import Product from './pages/Product';
// import ImageSearch from './pages/ImageSearch'; 
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import SearchBar from './components/SearchBar';
// import ShopContextProvider from './context/ShopContext'; // Your existing ShopContextProvider

// // NEW IMPORTS for the store feature
// import ScanStorePage from './pages/ScanStorePage';
// import ScanProductPage from './pages/ScanProductPage';
// import StoreCartPage from './pages/StoreCartPage'; // The new dedicated store cart page
// import ReceiptPage from './pages/ReceiptPage'; // The receipt page for the store feature
// import { StoreCartContextProvider } from './context/StoreCartContext'; // The new store cart context

// //Virtual Try-On
// import VirtualTryOnOutfitPage from './pages/VirtualTryOnOutfitPage';
// import OutfitCartProvider from './context/OutfitCartContext';
// import OutfitCartPage from './pages/OutfitCartPage'; // NEW: Import the new OutfitCartPage

// const App = () => {
//   return (
//     // Your main website context
//     <ShopContextProvider>
//       {/* The new store cart context, nested inside ShopContextProvider */}
//       <StoreCartContextProvider>
//         {/* OutfitCartProvider needs to wrap components that use OutfitCartContext */}
//         {/* This includes VirtualTryOnOutfitPage and the new OutfitCartPage */}
//         <OutfitCartProvider> {/* Moved here */}
//           <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
//             <Navbar />
//             <SearchBar />
//             <Routes>
//               {/* Existing Website Routes (unmodified) */}
//               <Route path='/' element={<Home />} />
//               <Route path='/collection' element={<Collection />} />
//               <Route path='/about' element={<About />} />
//               <Route path='/cart' element={<Cart />} />
//               <Route path='/contact' element={<Contact />} />
//               <Route path='/login' element={<Login />} />
//               <Route path='/orders' element={<Orders />} />
//               <Route path='/place-order' element={<PlaceOrder />} />
//               <Route path='/product/:productId' element={<Product />} />
//               <Route path='/image-search' element={<ImageSearch />} /> 
              
//               {/* NEW Store Feature Routes */}
//               <Route path='/scan-store' element={<ScanStorePage />} />
//               <Route path='/scan-product' element={<ScanProductPage />} />
//               <Route path='/store-cart' element={<StoreCartPage />} /> {/* Dedicated store cart page */}
//               <Route path='/receipt' element={<ReceiptPage />} /> {/* Receipt page for store transactions */}

//               {/* Virtual Try-On Routes */}
//               <Route path="/virtual-try-on-outfit" element={<VirtualTryOnOutfitPage />} />
//               <Route path="/outfit-cart" element={<OutfitCartPage />} /> {/* NEW: Route for the outfit cart page */}
              
//             </Routes>
//             <Footer />
//           </div>
//         </OutfitCartProvider> {/* Closing tag for OutfitCartProvider */}
//       </StoreCartContextProvider>
//     </ShopContextProvider>
//   );
// };

// export default App;

