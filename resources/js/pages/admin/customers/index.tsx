import { Head, Link } from '@inertiajs/react';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    created_at: string;
    orders_count: number;
};

type CustomersIndexProps = {
    customers: {
        data: Customer[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { search?: string };
};

export default function CustomersIndex({
    customers,
    filters,
}: CustomersIndexProps) {
    return (
        <>
            <Head title="Customers — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Customers</h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage customer accounts
                        </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                        <form method="get" className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Search customers..."
                                    className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <Button type="submit">Filter</Button>
                        </form>
                    </div>

                    <div className="rounded-lg border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Orders
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Joined
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No customers found
                                            </td>
                                        </tr>
                                    ) : (
                                        customers.data.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="border-b border-border"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {customer.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {customer.email}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {customer.phone || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {customer.orders_count}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {new Date(
                                                        customer.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/admin/customers/${customer.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
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
                </div>
            </AdminLayout>
        </>
    );
}
