import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Product = {
    id: number;
    name: string;
    slug: string;
    price: string;
    cost_price: string | null;
    image: string | null;
    stock: number;
    is_active: boolean;
    is_featured: boolean;
    category: { name: string } | null;
};

type ProductsIndexProps = {
    products: {
        data: Product[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories: Array<{ id: number; name: string }>;
    filters: { search?: string; category?: string; status?: string };
};

export default function ProductsIndex({
    products,
    categories,
    filters,
}: ProductsIndexProps) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/admin/products/${id}`);
        }
    };

    return (
        <>
            <Head title="Products — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Products</h1>
                            <p className="mt-1 text-muted-foreground">
                                Manage your products
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/products/import/csv">
                                <Button
                                    variant="secondary"
                                    className="cursor-pointer"
                                >
                                    <Upload className="mr-2 size-4" />
                                    Import CSV
                                </Button>
                            </Link>
                            <Link href="/admin/products/create">
                                <Button className="cursor-pointer">
                                    <Plus className="mr-2 size-4" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="rounded-lg border border-border bg-card p-4">
                        <form method="get" className="flex flex-wrap gap-4">
                            <div className="min-w-[200px] flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="search"
                                        defaultValue={filters.search}
                                        placeholder="Search products..."
                                        className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <select
                                name="category"
                                defaultValue={filters.category || ''}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="status"
                                defaultValue={filters.status || ''}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <Button type="submit">Filter</Button>
                        </form>
                    </div>

                    {/* Products Table */}
                    <div className="rounded-lg border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Cost
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Profit margin
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Featured
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No products found
                                            </td>
                                        </tr>
                                    ) : (
                                        products.data.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-b border-border hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                                                            {product.image ? (
                                                                <img
                                                                    src={
                                                                        product.image
                                                                    }
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-linear-to-br from-muted to-muted/40" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {product.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {product.category?.name ||
                                                        '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold tabular-nums ${
                                                            product.stock <= 0
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                                                                : product.stock <=
                                                                    5
                                                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                                                                  : 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200'
                                                        }`}
                                                    >
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    ৳
                                                    {parseFloat(
                                                        product.price,
                                                    ).toLocaleString('en-BD', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 text-right text-muted-foreground">
                                                    {product.cost_price !=
                                                        null &&
                                                    product.cost_price !== ''
                                                        ? `৳${parseFloat(product.cost_price).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {(() => {
                                                        const price =
                                                            parseFloat(
                                                                product.price,
                                                            );
                                                        const cost =
                                                            product.cost_price !=
                                                                null &&
                                                            product.cost_price !==
                                                                ''
                                                                ? parseFloat(
                                                                      product.cost_price,
                                                                  )
                                                                : null;
                                                        if (
                                                            cost == null ||
                                                            price <= 0
                                                        )
                                                            return '—';
                                                        const margin =
                                                            ((price - cost) /
                                                                price) *
                                                            100;
                                                        return (
                                                            <span
                                                                className={
                                                                    margin >= 0
                                                                        ? 'text-green-600 dark:text-green-400'
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }
                                                            >
                                                                {margin.toFixed(
                                                                    1,
                                                                )}
                                                                %
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                            product.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {product.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {product.is_featured ? (
                                                        <span className="inline-block rounded-full bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                                                            Featured
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/products/${product.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="cursor-pointer"
                                                            >
                                                                <Eye className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="cursor-pointer"
                                                            >
                                                                <Edit className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {products.links.length > 3 && (
                        <div className="flex items-center justify-center gap-2">
                            {products.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-md px-3 py-2 text-sm ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border bg-card hover:bg-muted'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
