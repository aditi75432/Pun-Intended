import { createContext } from "react";
import { products } from "../assets/frontend_assets/assets";
import {  useState } from "react";


export const ShopContext=createContext(); //api from react library
//export allows us to access in many pages
const ShopContextProvider= (props)=> {
    //variables inside value can be accessed in all componenets using createContext api
    
    const currency ='INR ';
    const delivery_fee=10;
    const [search, setSearch]=useState('');
    const [showSearch, setShowSearch]=useState(false)

    const value= {
        products,  currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch
    }

    return(
        <ShopContext.Provider value= {value}>
            {props.children}
        </ShopContext.Provider>
    )

}
export default ShopContextProvider;