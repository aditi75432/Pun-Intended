import React from "react";
import { assets } from "../assets/frontend_assets/assets";
const OurPolicy = () => {
    return (
        <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
            <div>
                <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
                <p className='font-semibold'>Custom Designs</p>
                <p className='text-gray-400'>Unique styles tailored just for you.</p>
            </div>
            <div>
                <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
                <p className='font-semibold'>Fresh Off the Press</p>
                <p className='text-gray-400'>Premium quality, made-to-order prints.</p>
            </div>
            <div>
                <img src={assets.sustainable_icon} className='w-16 m-auto mb-5' alt="" />
                <p className='font-semibold'>Sustainably Crafted</p>
                <p className='text-gray-400'>Eco-friendly materials, guilt-free fashion.</p>
            </div>
            <div>
                <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
                <p className='font-semibold'>Best Customer Support</p>
                <p className='text-gray-400'>Stuck on what to buy, how to buy it? Give us a call!!</p>
            </div>
        </div>
    );
};

export default OurPolicy;
