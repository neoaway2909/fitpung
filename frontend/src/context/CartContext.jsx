
import React, { createContext, useContext } from 'react';
const CartContext = createContext();
export const CartProvider = ({ children }) => {
  return <CartContext.Provider value={{ cart: [], cartTotal: 0 }}>{children}</CartContext.Provider>;
};
export const useCart = () => useContext(CartContext);
