import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Product = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    image: string | null;
    stock: number | null;
    is_active: boolean;
    category: { name: string } | null;
};

type ProductShowProps = {
    product: Product;
};

export default function ProductShow({ product }: ProductShowProps) {
    return (
        <>
            <Head title={`${product.name} — Admin`} />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/products">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">{product.name}</h1>
                                <p className="mt-1 text-muted-foreground">{product.slug}</p>
                            </div>
                        </div>
                        <Link href={`/admin/products/${product.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 size-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            {product.image && (
                                <img src={product.image} alt={product.name} className="w-full rounded-lg" />
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground">Category</label>
                                <p className="font-medium">{product.category?.name || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Price</label>
                                <p className="text-2xl font-bold">৳{parseFloat(product.price).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Stock</label>
                                <p className="font-medium">{product.stock ?? '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Status</label>
                                <span
                                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                        product.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {product.description && (
                                <div>
                                    <label className="text-sm text-muted-foreground">Description</label>
                                    <p className="mt-1">{product.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
