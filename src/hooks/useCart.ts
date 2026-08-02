"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  veg: boolean;
};

type CartState = {
  slug: string | null;
  sessionToken: string | null;
  lines: CartLine[];
  setSession: (slug: string, token: string) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (menuItemId: string, qty: number) => void;
  remove: (menuItemId: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      slug: null,
      sessionToken: null,
      lines: [],
      setSession: (slug, token) => set({ slug, sessionToken: token }),
      add: (line, qty = 1) => {
        const existing = get().lines.find((l) => l.menuItemId === line.menuItemId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.menuItemId === line.menuItemId
                ? { ...l, qty: Math.min(20, l.qty + qty) }
                : l
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line, qty }] });
        }
      },
      setQty: (menuItemId, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.menuItemId !== menuItemId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.menuItemId === menuItemId ? { ...l, qty: Math.min(20, qty) } : l
          ),
        });
      },
      remove: (menuItemId) =>
        set({ lines: get().lines.filter((l) => l.menuItemId !== menuItemId) }),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((s, l) => s + l.price * l.qty, 0),
      count: () => get().lines.reduce((s, l) => s + l.qty, 0),
    }),
    { name: "nk-cart" }
  )
);
