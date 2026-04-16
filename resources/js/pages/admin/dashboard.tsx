import { Head, Link } from '@inertiajs/react';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';

type DashboardProps = {
    stats: {
        totalOrders: number;
        totalRevenue: number;
        totalCustomers: number;
        totalProducts: number;
        activeProducts: number;
    };
    recentOrders: Array<{
        id: number;
        status: string;
        total: string;
        created_at: string;
        user: { name: string; email: string } | null;
    }>;
    ordersByStatus: Record<string, number>;
    revenueByMonth: Record<string, number>;
};

export default function AdminDashboard({
    stats,
    recentOrders,
    ordersByStatus,
}: DashboardProps) {
    const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;

    const statCards = [
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Active Products',
            value: `${stats.activeProducts} / ${stats.totalProducts}`,
            icon: Package,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <>
            <Head title="Dashboard — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="mt-1 text-muted-foreground">
                            Overview of your store
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.title}
                                    className="rounded-lg border border-border bg-card p-6 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {stat.title}
                                            </p>
                                            <p className="mt-1 text-2xl font-bold">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div
                                            className={`rounded-lg p-3 ${stat.bgColor}`}
                                        >
                                            <Icon
                                                className={`size-6 ${stat.color}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Orders & Stats */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Orders */}
                        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Recent Orders
                                </h2>
                                <Link
                                    href="/admin/orders"
                                    className="text-sm text-primary hover:underline"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentOrders.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No orders yet
                                    </p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between rounded-lg border border-border p-3"
                                        >
                                            <div>
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    Order #{order.id}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.user?.name ||
                                                        order.user?.email ||
                                                        'Guest'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                        statusColors[
                                                            order.status
                                                        ] ||
                                                        'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {formatCurrency(
                                                        parseFloat(order.total),
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Orders by Status */}
                        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">
                                Orders by Status
                            </h2>
                            <div className="space-y-3">
                                {Object.entries(ordersByStatus).map(
                                    ([status, count]) => (
                                        <div
                                            key={status}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-muted-foreground capitalize">
                                                {status}
                                            </span>
                                            <span className="font-semibold">
                                                {count}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
