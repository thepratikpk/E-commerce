import {createContext,useEffect,useState} from "react";
import { productScreenshots } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


export const ShopContext = createContext();
const ShopContextProvider = (props) => {
    const currency='₹';
    const delivery=10;
    const [search,setSearch]=useState('');
    const [showSearch,setShowSearch]=useState(false);
    const [cartItems,setCartItems]=useState({});
    const navigate=useNavigate();

    const addToCart=async (itemId,size)=>{
        if(!size){
            toast.error("Please select product size");
            return;
        }
        let cartData=structuredClone(cartItems);
        if(cartData[itemId]){
            if(cartData[itemId][size]){
            cartData[itemId][size]+=1;
            }
        else{
            cartData[itemId][size]=1;
            }
        } 
        else{
            cartData[itemId]={};
            cartData[itemId][size]=1;
        }
        setCartItems(cartData);
    }
    const getCartCount=()=>{
        let totalCount=0;
        for(const items in cartItems){
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item]>0){
                        totalCount +=cartItems[items][item];
                    }
                }catch (error){

                }
            }
        }
        return totalCount;
    }
    const getCartAmount=()=>{
        let totalAmount=0;
        for(const items in cartItems){
            let itemInfo=productScreenshots.find((productScreenshots)=>productScreenshots._id===items);
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item]>0){
                        totalAmount +=itemInfo.price*cartItems[items][item];
                    }
                }catch (error){

                }
            }
        }
        return totalAmount;
    }
    const updateQuantity=async (itemId,size,quantity)=>{
        let cartData=structuredClone(cartItems);
        cartData[itemId][size]=quantity;
        setCartItems(cartData);
    }
    const value ={
        productScreenshots,currency,delivery,
        search,setSearch,showSearch,setShowSearch,
        cartItems,addToCart,
        getCartCount,updateQuantity,
        getCartAmount,navigate
    }
    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;