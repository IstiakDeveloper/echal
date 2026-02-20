import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'e-chal-cart';

type CartItems = Record<string, { quantity: number }>;

type CartState = {
    count: number;
    items: CartItems;
};

type CartContextValue = CartState & {
    setFromServer: (count: number, items: CartItems) => void;
    addToCart: (productId: number) => void;
    setQuantity: (productId: number, quantity: number) => void;
    getQuantity: (productId: number) => number;
    isPending: boolean;
    drawerOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
    openDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItems {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as CartItems;
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

function saveToStorage(items: CartItems): void {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // ignore
    }
}

function countFromItems(items: CartItems): number {
    return Object.values(items).reduce((sum, i) => sum + (i?.quantity ?? 0), 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<CartState>(() => {
        const items = loadFromStorage();
        return { items, count: countFromItems(items) };
    });
    const [isPending, setIsPending] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const openDrawer = useCallback(() => setDrawerOpen(true), []);

    const setFromServer = useCallback((count: number, items: CartItems) => {
        setState({ count, items });
        saveToStorage(items);
    }, []);

    const persistAndSync = useCallback(
        async (productId: number, quantity: number) => {
            const key = String(productId);
            const nextItems = { ...state.items };
            if (quantity <= 0) {
                delete nextItems[key];
            } else {
                nextItems[key] = { quantity };
            }
            const nextCount = countFromItems(nextItems);

            setState({ count: nextCount, items: nextItems });
            saveToStorage(nextItems);
            setIsPending(true);

            try {
                const formData = new FormData();
                formData.append('product_id', String(productId));
                formData.append('quantity', String(quantity));
                formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '');

                const res = await fetch('/cart', {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (res.ok) {
                    const data = (await res.json()) as { cart?: { count: number; items: CartItems } };
                    if (data.cart) {
                        setState({ count: data.cart.count, items: data.cart.items });
                        saveToStorage(data.cart.items);
                    }
                }
            } catch {
                // keep optimistic state
            } finally {
                setIsPending(false);
            }
        },
        [state.items]
    );

    const addToCart = useCallback(
        (productId: number) => {
            const current = state.items[String(productId)]?.quantity ?? 0;
            persistAndSync(productId, current + 1);
        },
        [state.items, persistAndSync]
    );

    const setQuantity = useCallback(
        (productId: number, quantity: number) => {
            persistAndSync(productId, quantity);
        },
        [persistAndSync]
    );

    const getQuantity = useCallback(
        (productId: number): number => {
            return state.items[String(productId)]?.quantity ?? 0;
        },
        [state.items]
    );

    const value = useMemo<CartContextValue>(
        () => ({
            ...state,
            setFromServer,
            addToCart,
            setQuantity,
            getQuantity,
            isPending,
            drawerOpen,
            setDrawerOpen,
            openDrawer,
        }),
        [state, setFromServer, addToCart, setQuantity, getQuantity, isPending, drawerOpen, openDrawer]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used within CartProvider');
    }
    return ctx;
}

export function useCartOptional(): CartContextValue | null {
    return useContext(CartContext);
}
