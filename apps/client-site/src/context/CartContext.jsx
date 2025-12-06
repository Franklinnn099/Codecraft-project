import { createContext, useContext, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Add to cart
  const addToCart = (product) => {
    const exists = cartItems.find((item) => item.id === product.id);
    if (exists) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCartItems((prev) => [...prev, { ...product, qty: 1 }]);
    }
  };

  // ✅ Remove from cart
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Update quantity
  const updateQuantity = (id, action) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty:
                action === "increase"
                  ? item.qty + 1
                  : Math.max(1, item.qty - 1),
            }
          : item
      )
    );
  };

  // ✅ Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    clearCoupon();
  };

  // ✅ Apply coupon
  const applyCoupon = async (code) => {
    setErrorMessage("");

    // Get discount details with product mappings
    const { data: discount, error } = await supabase
      .from("discounts")
      .select(
        `
        *,
        discount_products (
          product_id
        )
      `
      )
      .eq("code", code.trim().toUpperCase())
      .eq("status", "Active")
      .maybeSingle();

    if (error || !discount) {
      setErrorMessage("Invalid or expired coupon code.");
      return false;
    }

    // Check if discount is within date range
    const today = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);

    if (today < startDate || today > endDate) {
      setErrorMessage("This coupon is not currently active.");
      return false;
    }

    // Check if discount applies to cart items
    const productMappings = discount.discount_products || [];
    const applicableCartItems = cartItems.filter((item) => {
      // If no product mappings, discount applies to all products
      if (productMappings.length === 0) return true;
      // Otherwise, check if product is in the mapping
      return productMappings.some((mapping) => mapping.product_id === item.id);
    });

    if (applicableCartItems.length === 0) {
      setErrorMessage(
        "This coupon is not applicable to any items in your cart."
      );
      return false;
    }

    // Calculate total of applicable items
    const applicableTotal = applicableCartItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.qty,
      0
    );

    // Check minimum order value
    if (discount.minimum_order && applicableTotal < discount.minimum_order) {
      setErrorMessage(
        `Minimum order value is ₵${discount.minimum_order} for applicable items.`
      );
      return false;
    }

    // Calculate discount amount
    let discountAmt = 0;
    if (discount.discount_type === "percentage") {
      discountAmt = (discount.discount_value / 100) * applicableTotal;
    } else if (discount.discount_type === "fixed") {
      discountAmt = discount.discount_value;
    }

    // Ensure discount doesn't exceed total
    discountAmt = Math.min(discountAmt, applicableTotal);

    setCoupon(discount);
    setDiscountAmount(discountAmt);
    setErrorMessage("");
    return true;
  };

  // ✅ Clear coupon
  const clearCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    setErrorMessage("");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        clearCoupon,
        coupon,
        discountAmount,
        errorMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Export custom hook
export const useCart = () => useContext(CartContext);
