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

const App = () => {
  return (
    // Your main website context
    <ShopContextProvider>
      {/* The new store cart context, nested inside ShopContextProvider */}
      {/* This ensures store-related components have access to their own cart logic */}
      <StoreCartContextProvider>
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
            
          </Routes>
          <Footer />
        </div>
      </StoreCartContextProvider>
    </ShopContextProvider>
  );
};

export default App;


// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import Collection from './pages/Collection';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import Cart from './pages/Cart';
// import Login from './pages/Login';
// import Orders from './pages/Orders';
// import PlaceOrder from './pages/PlaceOrder'; // This is your Checkout page
// import Product from './pages/Product';
// import ImageSearch from './pages/ImageSearch'; // <--- NEW IMPORT
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import SearchBar from './components/SearchBar';
// import ShopContextProvider from './context/ShopContext'; // Import your ShopContextProvider
// import ScanStorePage from './pages/ScanStorePage';
// import ScanProductPage from './pages/ScanProductPage';

// const App = () => {
//   return (
//     <ShopContextProvider>
//       <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
//         <Navbar />
//         <SearchBar />
//         <Routes>
//           <Route path='/' element={<Home />} />
//           <Route path='/collection' element={<Collection />} />
//           <Route path='/about' element={<About />} />
//           <Route path='/cart' element={<Cart />} />
//           <Route path='/contact' element={<Contact />} />
//           <Route path='/login' element={<Login />} />
//           <Route path='/orders' element={<Orders />} />
//           <Route path='/place-order' element={<PlaceOrder />} />
//           <Route path='/product/:productId' element={<Product />} />
//           <Route path='/image-search' element={<ImageSearch />} /> 
//           <Route path='/scan-store' element={<ScanStorePage />} />
//           <Route path='/scan-product' element={<ScanProductPage />} />
          
//         </Routes>
//         <Footer />
//       </div>
//     </ShopContextProvider>
//   );
// };

// export default App;

