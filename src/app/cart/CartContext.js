'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext();

function parsePrice(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  // remove commas, capture first number sequence (handles "₹1,299.50 / 1kg", "899", etc.)
  const cleaned = String(val).replace(/,/g, "");
  const m = cleaned.match(/[\d]+(?:\.[\d]+)?/);
  return m ? parseFloat(m[0]) : 0;
}

function getWeight(size) {
  const weights = {
    "250gm": 0.25,
    "500gm": 0.5,
    "1kg": 1,
    "2kg": 2,
    "Default": 0.25,
  };
  return weights[size] || 0;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");

  // Load cart from localStorage and normalize quantities + priceNumber
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = parsed.map((it) => ({
          ...it,
          quantity: Number(it.quantity) || 1,
          priceNumber: parsePrice(it.price) || Number(it.priceNumber) || 0,
        }));
        setCart(normalized);
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage:", e);
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to save cart to localStorage:", e);
    }
  }, [cart]);

  // Helper: compare product variants (id + options)
  const isSameVariant = (a, b) => {
    if (a.id !== b.id) return false;
    if ((a.size || "") !== (b.size || "")) return false;
    if ((a.color || "") !== (b.color || "")) return false;
    return true;
  };

  // Add item (merge if same id + variant). Respect product.quantity if provided.
  const addToCart = (product) => {
    const qty = Number(product.quantity) || 1;
    const priceNumber = parsePrice(product.price) || (product.priceNumber || 0);
    const size = product.size || "Default";               // <-- ensure a value
    const color = product.color || (product.color === undefined ? "" : product.color);

    setCart((prev) => {
      const index = prev.findIndex((item) => isSameVariant(item, { ...product, size, color }));
      if (index > -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quantity: (Number(updated[index].quantity) || 1) + qty,
          priceNumber: priceNumber || updated[index].priceNumber,
        };
        return updated;
      } else {
        return [...prev, { ...product, quantity: qty, priceNumber, size, color }];
      }
    });

    setToastMessage(`${product.name} added to cart`);
    setToastType("success");
    setShowToast(true);
  };

  // previous removeFromCart (replace with robust version)
  const removeFromCart = (target) => {
    setCart((prev) => {
      if (!target) return prev;
      // if an object (item) passed — remove only matching id + variant
      if (typeof target === "object" && target.id != null) {
        return prev.filter((item) => !(item.id === target.id && isSameVariant(item, target)));
      }
      // otherwise assume target is id — remove all items with that id
      return prev.filter((item) => item.id !== target);
    });
  };

  const updateQuantity = (id, variant = {}, newQuantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && isSameVariant(item, { ...item, ...variant })
          ? { ...item, quantity: Math.max(1, Number(newQuantity) || 1) }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const hideToast = () => setShowToast(false);

  // Derived totals
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [cart]
  );

  const totalWeight = useMemo(
    () => cart.reduce((sum, item) => sum + getWeight(item.size) * (Number(item.quantity) || 1), 0),
    [cart]
  );

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const priceNum = Number(item.priceNumber) || parsePrice(item.price) || 0;
        return sum + priceNum * (Number(item.quantity) || 1);
      }, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        totalItems,
        totalWeight,
        toastMessage,
        showToast,
        hideToast,
        setToastMessage,
        setShowToast,
        toastType,
        setToastType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
