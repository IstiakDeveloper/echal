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
    auth: Auth;
    sidebarOpen: boolean;
    cart?: CartSummary;
    [key: string]: unknown;
};
