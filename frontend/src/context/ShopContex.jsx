import {createContext} from "react";
import { productScreenshots } from "../assets/assets";

export const ShopContext = createContext();
const ShopContextProvider = (props) => {
    const currency='$';
    const delivery=10;
    const value ={
        productScreenshots,currency,delivery
    }
    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;