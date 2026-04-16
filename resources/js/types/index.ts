export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

type CartSummary = {
    count: number;
    items: Record<
        number,
        {
            quantity: number;
        }
    >;
};

export type SharedData = {
    name: string;
    /** Canonical site URL (no trailing slash), for same-origin checks in the client. */
    appUrl?: string;
    auth: Auth;
    sidebarOpen: boolean;
    cart?: CartSummary;
    storefront?: {
        topOffer: string | null;
        supportEmail: string | null;
        supportPhone: string | null;
        whatsappPhone: string | null;
        whatsappPrefill: string | null;
        facebookPageUrl?: string | null;
        popup?: {
            id: number;
            imageUrl: string;
            linkUrl: string | null;
            updatedAt: string | null;
        } | null;
    };
    [key: string]: unknown;
};
