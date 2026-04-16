import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

type OrderItem = {
    id: number;
    name: string;
    price: string;
    quantity: number;
    line_total: string;
};

type Order = {
    id: number;
    created_at: string;
    phone: string;
    subtotal: string;
    delivery_amount: string;
    discount: string;
    total: string;
    items: OrderItem[];
};

type ReceiptProps = {
    order: Order;
};

export default function OrderReceipt({ order }: ReceiptProps) {
    useEffect(() => {
        const t = setTimeout(() => window.print(), 50);
        return () => clearTimeout(t);
    }, []);

    const subtotal = Number.parseFloat(order.subtotal) || 0;
    const discount = Number.parseFloat(order.discount ?? '0') || 0;
    const delivery = Number.parseFloat(order.delivery_amount) || 0;
    const total = Number.parseFloat(order.total) || 0;

    return (
        <>
            <Head title={`Receipt #${order.id}`} />

            <div className="mx-auto max-w-md bg-white p-6 text-black print:p-0">
                <div className="mb-4 text-center">
                    <div className="text-lg font-bold">E-Chal</div>
                    <div className="text-xs opacity-80">
                        Order Receipt #{order.id}
                    </div>
                </div>

                <div className="mb-4 text-xs">
                    <div className="flex justify-between">
                        <span className="opacity-80">Date</span>
                        <span>
                            {new Date(order.created_at).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-80">Phone</span>
                        <span>{order.phone}</span>
                    </div>
                </div>

                <div className="border-y border-dashed border-black/50 py-3 text-xs">
                    <div className="mb-2 flex font-semibold">
                        <div className="flex-1">Item</div>
                        <div className="w-10 text-right">Qty</div>
                        <div className="w-16 text-right">Total</div>
                    </div>
                    <div className="space-y-1">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex">
                                <div className="flex-1 pr-2">
                                    {item.name}
                                </div>
                                <div className="w-10 text-right tabular-nums">
                                    {item.quantity}
                                </div>
                                <div className="w-16 text-right tabular-nums">
                                    ৳
                                    {(
                                        Number.parseFloat(item.line_total) || 0
                                    ).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="opacity-80">Subtotal</span>
                        <span className="tabular-nums">
                            ৳{subtotal.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-80">Discount</span>
                        <span className="tabular-nums">
                            ৳{discount.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-80">Delivery</span>
                        <span className="tabular-nums">
                            ৳{delivery.toFixed(2)}
                        </span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-black/30 pt-2 text-sm font-bold">
                        <span>Total</span>
                        <span className="tabular-nums">
                            ৳{total.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs opacity-80">
                    Thank you.
                </div>
            </div>
        </>
    );
}

