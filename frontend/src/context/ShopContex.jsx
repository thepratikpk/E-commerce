import {createContext,useState} from "react";
import { productScreenshots } from "../assets/assets";

export const ShopContext = createContext();
const ShopContextProvider = (props) => {
    const currency='₹';
    const delivery=10;
    const [search,setSearch]=useState('');
    const [showSearch,setShowSearch]=useState(false)
    const value ={
        productScreenshots,currency,delivery,
        search,setSearch,showSearch,setShowSearch
    }
    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;