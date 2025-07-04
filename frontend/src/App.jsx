import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Orders from './pages/Orders';
import PlaceOrder from './pages/PlaceOrder'; // This is your Checkout page
import Product from './pages/Product';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import ShopContextProvider from './context/ShopContext'; // Import your ShopContextProvider

const App = () => {
  return (
    // Wrap your entire application with ShopContextProvider
    // This makes cart, product, and other shop data available globally
    <ShopContextProvider>
      <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <Navbar />
        <SearchBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<Login />} />
          <Route path='/orders' element={<Orders />} />
          {/* Your checkout page, previously named Checkout, now uses PlaceOrder */}
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/product/:productId' element={<Product />} />
          {/* If you plan to have an order success page, you can add it here too: */}
          {/* <Route path='/order-success' element={<OrderSuccess />} /> */}
        </Routes>
        <Footer />
      </div>
    </ShopContextProvider>
  );
};

export default App;


