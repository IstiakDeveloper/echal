import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type OrderItem = {
    id: number;
    name: string;
    price: string;
    quantity: number;
    line_total: string;
    product: { image: string | null } | null;
};

type Order = {
    id: number;
    status: string;
    total: string;
    subtotal: string;
    delivery_amount: string;
    created_at: string;
    user: { name: string; email: string; phone: string | null } | null;
    phone: string;
    division: string;
    district: string;
    upazila: string;
    address: string;
    items: OrderItem[];
};

type OrderShowProps = {
    order: Order;
};

export default function OrderShow({ order }: OrderShowProps) {
    const form = useForm({
        status: order.status,
    });

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch(`/admin/orders/${order.id}/status`);
    };

    return (
        <>
            <Head title={`Order #${order.id} — Admin`} />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                            <p className="mt-1 text-muted-foreground">
                                Placed on {new Date(order.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-6">
                            <div className="rounded-lg border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold">Customer Information</h2>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Name:</span>{' '}
                                        <span className="font-medium">
                                            {order.user?.name || 'Guest'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Email:</span>{' '}
                                        <span className="font-medium">
                                            {order.user?.email || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Phone:</span>{' '}
                                        <span className="font-medium">{order.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium">{order.address}</p>
                                    <p className="text-muted-foreground">
                                        {order.upazila}, {order.district}, {order.division}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold">Update Status</h2>
                                <form onSubmit={handleStatusUpdate} className="space-y-4">
                                    <select
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Updating...' : 'Update Status'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-lg border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold">Order Items</h2>
                                <div className="space-y-3">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-lg border border-border p-3"
                                        >
                                            {item.product?.image && (
                                                <img
                                                    src={item.product.image}
                                                    alt=""
                                                    className="h-12 w-12 rounded object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Qty: {item.quantity} × ৳{parseFloat(item.price).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="font-semibold">
                                                ৳{parseFloat(item.line_total).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-6">
                                <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-medium">
                                            ৳{parseFloat(order.subtotal).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery:</span>
                                        <span className="font-medium">
                                            ৳{parseFloat(order.delivery_amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="border-t border-border pt-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">Total:</span>
                                            <span className="text-lg font-bold">
                                                ৳{parseFloat(order.total).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
