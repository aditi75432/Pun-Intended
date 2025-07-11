import React from 'react'
import { assets } from '../assets/frontend_assets/assets';

const Footer = () => {
    return (
        <div>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

                <div>
                    <img src={assets.logo} className='mb-5 w-32' alt="Brand Logo" />
                    <p className='w-full md:w-2/3 text-gray-600'>
                        Bringing you fresh, custom-designed apparel with quality and creativity. Stay ahead of the trends with our latest drops.
                    </p>
                </div>

                <div>
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col gap-1 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>

                <div>
                    <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-1 text-gray-600'>
                        <li>contact@yourbrand.com</li>
                        <li>+123 456 7890</li>
                    </ul>
                </div>

            </div>

            <p className='py-5 text-sm text-center'>
                © 2025 Pun Intended. All rights reserved.
            </p>
        </div>
    );
};

export default Footer;
