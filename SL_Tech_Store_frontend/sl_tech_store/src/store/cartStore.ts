import { create } from 'zustand';
import type { Cart } from '../types';
import { cartService } from '../services/cartService';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  updateItem: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,
  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await cartService.getCart();
      set({ cart: res.data.data });
    } catch { /* ignore if not logged in */ }
    set({ loading: false });
  },
  addToCart: async (productId, qty = 1) => {
    const res = await cartService.addToCart(productId, qty);
    set({ cart: res.data.data });
  },
  updateItem: async (productId, qty) => {
    const res = await cartService.updateItem(productId, qty);
    set({ cart: res.data.data });
  },
  removeItem: async (productId) => {
    const res = await cartService.removeItem(productId);
    set({ cart: res.data.data });
  },
  clearCart: async () => {
    await cartService.clearCart();
    set({ cart: null });
  },
}));
