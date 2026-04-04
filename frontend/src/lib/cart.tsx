"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_STORAGE_KEY = "commerce-checkout-cart";

export type CartItem = {
  productId: number;
  name: string;
  imageUrl: string;
  unitPriceInPaise: number;
  quantity: number;
};

type AddToCartInput = {
  productId: number;
  name: string;
  imageUrl: string;
  unitPriceInPaise: number;
  quantity?: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  isHydrated: boolean;
  addItem: (item: AddToCartInput) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPriceInPaise: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart) as CartItem[];
        setCartItems(parsedCart);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, isHydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (item: AddToCartInput) => {
      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (cartItem) => cartItem.productId === item.productId,
        );

        if (existingItem) {
          return currentItems.map((cartItem) =>
            cartItem.productId === item.productId
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + (item.quantity || 1),
                }
              : cartItem,
          );
        }

        return [
          ...currentItems,
          {
            productId: item.productId,
            name: item.name,
            imageUrl: item.imageUrl,
            unitPriceInPaise: item.unitPriceInPaise,
            quantity: item.quantity || 1,
          },
        ];
      });
    };

    const increaseQuantity = (productId: number) => {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    };

    const decreaseQuantity = (productId: number) => {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      );
    };

    const removeItem = (productId: number) => {
      setCartItems((currentItems) =>
        currentItems.filter((item) => item.productId !== productId),
      );
    };

    const clearCart = () => {
      setCartItems([]);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPriceInPaise = cartItems.reduce(
      (sum, item) => sum + item.unitPriceInPaise * item.quantity,
      0,
    );

    return {
      cartItems,
      isHydrated,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
      totalItems,
      totalPriceInPaise,
    };
  }, [cartItems, isHydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
