import React, { useContext, useState } from 'react'
import { assets } from "../assets/frontend_assets/assets";
import {NavLink} from 'react-router-dom'
import {Link} from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
    const[visible,setVisible]=useState(false);

    const {setShowSearch}=useContext(ShopContext);
    // Assuming you want to show the total items in the main cart
    const { getTotalCartItems } = useContext(ShopContext);

  return (
    <div className ='flex items-center justify-between py-5 font-medium'>
      
      <Link to= '/'><img src={assets.logo} className= 'w-36' alt="Logo"/> </Link>
      {/* Desktop Navigation Links */}
      <ul className= 'hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to= '/' className= 'flex flex-col items-center gap-1'>
            <p>HOME</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink to= '/collection' className= 'flex flex-col items-center gap-1'>
            <p>COLLECTION</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        {/* Scan Store Link for Desktop */}
        <NavLink to= '/scan-store' className= 'flex flex-col items-center gap-1'>
            <p>SCAN STORE</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        {/* Virtual Try-On Link for Desktop */}
        <NavLink to= '/virtual-try-on-outfit' className= 'flex flex-col items-center gap-1'>
            <p>VIRTUAL TRY-ON</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        {/* NEW: Outfit Cart Link for Desktop */}
        <NavLink to= '/outfit-cart' className= 'flex flex-col items-center gap-1'>
            <p>MY OUTFITS</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        {/* NEW: Grocery Reminders Link for Desktop */}
        <NavLink to= '/grocery-reminders' className= 'flex flex-col items-center gap-1'>
            <p>GROCERY REMINDERS</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink to= '/about' className= 'flex flex-col items-center gap-1'>
            <p>ABOUT</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink to= '/contact' className= 'flex flex-col items-center gap-1'>
            <p>CONTACT</p>
            <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        
        </ul>
        <div className=' flex items-center gap-6'>
            <img onClick= {()=>setShowSearch(true)}src= {assets.search_icon} className= 'w-5 curson-pointer' alt=""/>
            <div className='group relative'>
                <img className ='w-5 curson-pointer' src={assets.profile_icon} alt=""/>
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                        <p className='cursor-pointer hover:text-black'>My Profile</p>
                        <p className='cursor-pointer hover:text-black'>Orders</p>
                        <p className='cursor-pointer hover:text-black'>Logout</p>
                    </div>
                </div>
            </div>
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                {/* Ensure getTotalCartItems() is correctly implemented in ShopContext */}
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
                    {getTotalCartItems()}
                </p>
            </Link>
            <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />

        </div>
            {/* Sidebar menu for small screens */}
            <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all z-50 ${visible ? 'w-full': 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
                    {/* Scan Store Link for Mobile Sidebar */}
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/scan-store'>SCAN STORE</NavLink>
                    {/* Virtual Try-On Link for Mobile Sidebar */}
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/virtual-try-on-outfit'>VIRTUAL TRY-ON</NavLink>
                    {/* NEW: Outfit Cart Link for Mobile Sidebar */}
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/outfit-cart'>MY OUTFITS</NavLink>
                    {/* NEW: Grocery Reminders Link for Mobile Sidebar */}
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/grocery-reminders'>GROCERY REMINDERS</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                </div>
            </div>
    </div>
  )
}

export default Navbar;


// import React, { useContext, useState } from 'react'
// import { assets } from "../assets/frontend_assets/assets";
// import {NavLink} from 'react-router-dom'
// import {Link} from 'react-router-dom'
// import { ShopContext } from '../context/ShopContext';

// const Navbar = () => {
//     const[visible,setVisible]=useState(false);

//     const {setShowSearch}=useContext(ShopContext);

//   return (
//     <div className ='flex items-center justify-between py-5 font-medium'>
      
//       <Link to= '/'><img src={assets.logo} className= 'w-36' alt="Logo"/> </Link>
//       {/* Desktop Navigation Links */}
//       <ul className= 'hidden sm:flex gap-5 text-sm text-gray-700'> {/* Removed the extra 'hidden' class here, as it conflicts with 'sm:flex' */}
//         <NavLink to= '/' className= 'flex flex-col items-center gap-1'>
//             <p>HOME</p>
//             <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
//         </NavLink>
//         <NavLink to= '/collection' className= 'flex flex-col items-center gap-1'>
//             <p>COLLECTION</p>
//             <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
//         </NavLink>
//         {/* NEW: Scan Store Link for Desktop */}
//         <NavLink to= '/scan-store' className= 'flex flex-col items-center gap-1'>
//             <p>SCAN STORE</p>
//             <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
//         </NavLink>
//         {/* NEW: Virtual Try-On Link for Desktop */}
//         <NavLink to= '/virtual-try-on-outfit' className= 'flex flex-col items-center gap-1'>
//             <p>VIRTUAL TRY-ON</p>
//             <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
//         </NavLink>
//         <NavLink to= '/about' className= 'flex flex-col items-center gap-1'>
//             <p>ABOUT</p>
//             <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
//         </NavLink>
//         <NavLink to= '/contact' className= 'flex flex-col items-center gap-1'>
//             <p>CONTACT</p>
//             <hr className=' w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
//         </NavLink>
        
//         </ul>
//         <div className=' flex items-center gap-6'>
//         <img onClick= {()=>setShowSearch(true)}src= {assets.search_icon} className= 'w-5 curson-pointer' alt=""/>
//            <div className='group relative'>
//             <img className ='w-5 curson-pointer' src={assets.profile_icon} alt=""/>
//             <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
//             <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
//                 <p className='cursor-pointer hover:text-black'>My Profile</p>
//                 <p className='cursor-pointer hover:text-black'>Orders</p>
//                 <p className='cursor-pointer hover:text-black'>Logout</p>
//             </div>
//             </div>

//            </div>
//            <Link to='/cart' className='relative'>
//             <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
//             <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'> 10
//             </p>
//             </Link>
//             <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />

//         </div>
//             {/* Sidebar menu for small screens */}
//             <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all z-50 ${visible ? 'w-full': 'w-0'}`}> {/* Added z-50 to ensure sidebar is on top */}
//             <div className='flex flex-col text-gray-600'>
//             <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
//                 <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
//                 <p>Back</p>
//             </div>
//             <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
//             <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
//             {/* NEW: Scan Store Link for Mobile Sidebar */}
//             <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/scan-store'>SCAN STORE</NavLink>
//             {/* NEW: Virtual Try-On Link for Mobile Sidebar */}
//             <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/virtual-try-on-outfit'>VIRTUAL TRY-ON</NavLink>
//             <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
//             <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>

//             </div>

            
//             </div>


//     </div>
//   )
// }

// export default Navbar


