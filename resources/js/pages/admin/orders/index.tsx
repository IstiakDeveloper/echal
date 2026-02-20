import { Head, Link } from '@inertiajs/react';
import { Search, Eye } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';

type Order = {
    id: number;
    status: string;
    total: string;
    created_at: string;
    user: { name: string; email: string } | null;
    phone: string;
    division: string;
    district: string;
};

type OrdersIndexProps = {
    orders: {
        data: Order[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { search?: string; status?: string };
};

export default function OrdersIndex({ orders, filters }: OrdersIndexProps) {
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <>
            <Head title="Orders — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Orders</h1>
                        <p className="mt-1 text-muted-foreground">Manage customer orders</p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                        <form method="get" className="flex flex-wrap gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Search orders..."
                                    className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <select
                                name="status"
                                defaultValue={filters.status || ''}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Button type="submit">Filter</Button>
                        </form>
                    </div>

                    <div className="rounded-lg border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.data.map((order) => (
                                            <tr key={order.id} className="border-b border-border">
                                                <td className="px-4 py-3 font-medium">#{order.id}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <div className="font-medium">
                                                            {order.user?.name || 'Guest'}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {order.user?.email || order.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {order.district}, {order.division}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                            statusColors[order.status] ||
                                                            'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    ৳{parseFloat(order.total).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {orders.links.length > 3 && (
                        <div className="flex items-center justify-center gap-2">
                            {orders.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-md px-3 py-2 text-sm ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-card border border-border hover:bg-muted'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
