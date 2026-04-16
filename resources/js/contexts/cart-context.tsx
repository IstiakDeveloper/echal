import type { ReactNode } from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';

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

    const syncTimerRef = useRef<number | null>(null);
    const desiredRef = useRef<Record<string, number>>({});

    const openDrawer = useCallback(() => setDrawerOpen(true), []);

    const setFromServer = useCallback((count: number, items: CartItems) => {
        setState({ count, items });
        saveToStorage(items);
    }, []);

    const flushSync = useCallback(async () => {
        const entries = Object.entries(desiredRef.current);
        desiredRef.current = {};

        if (entries.length === 0) return;

        setIsPending(true);

        try {
            const csrf =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement | null
                )?.content ?? '';

            for (const [productId, quantity] of entries) {
                const formData = new FormData();
                formData.append('product_id', productId);
                formData.append('quantity', String(quantity));
                formData.append('_token', csrf);

                const res = await fetch('/cart', {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!res.ok) continue;

                const data = (await res.json()) as {
                    cart?: { count: number; items: CartItems };
                };
                if (data.cart) {
                    setState({
                        count: data.cart.count,
                        items: data.cart.items,
                    });
                    saveToStorage(data.cart.items);
                }
            }
        } catch {
            // keep optimistic state
        } finally {
            setIsPending(false);
        }
    }, []);

    const scheduleSync = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (syncTimerRef.current != null) {
            window.clearTimeout(syncTimerRef.current);
        }

        syncTimerRef.current = window.setTimeout(() => {
            syncTimerRef.current = null;
            flushSync();
        }, 200);
    }, [flushSync]);

    const persistAndSync = useCallback(
        (productId: number, quantity: number) => {
            const key = String(productId);
            let snapshotItems: CartItems = {};

            setState((prev) => {
                const nextItems = { ...prev.items };
                if (quantity <= 0) {
                    delete nextItems[key];
                } else {
                    nextItems[key] = { quantity };
                }
                snapshotItems = nextItems;
                return { items: nextItems, count: countFromItems(nextItems) };
            });

            saveToStorage(snapshotItems);
            desiredRef.current[key] = quantity;
            scheduleSync();
        },
        [scheduleSync],
    );

    const addToCart = useCallback(
        (productId: number) => {
            const key = String(productId);
            const current =
                desiredRef.current[key] ??
                loadFromStorage()[key]?.quantity ??
                0;
            persistAndSync(productId, current + 1);
        },
        [persistAndSync],
    );

    const setQuantity = useCallback(
        (productId: number, quantity: number) => {
            persistAndSync(productId, quantity);
        },
        [persistAndSync],
    );

    const getQuantity = useCallback(
        (productId: number): number => {
            return state.items[String(productId)]?.quantity ?? 0;
        },
        [state.items],
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
        [
            state,
            setFromServer,
            addToCart,
            setQuantity,
            getQuantity,
            isPending,
            drawerOpen,
            openDrawer,
        ],
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
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
