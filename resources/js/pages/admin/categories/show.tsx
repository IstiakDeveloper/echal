import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    products_count: number;
};

type CategoryShowProps = {
    category: Category;
};

export default function CategoryShow({ category }: CategoryShowProps) {
    return (
        <>
            <Head title={`${category.name} — Admin`} />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/categories">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">{category.name}</h1>
                                <p className="mt-1 text-muted-foreground">{category.slug}</p>
                            </div>
                        </div>
                        <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 size-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Products</label>
                            <p className="font-medium">{category.products_count}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Sort Order</label>
                            <p className="font-medium">{category.sort_order}</p>
                        </div>
                        {category.description && (
                            <div>
                                <label className="text-sm text-muted-foreground">Description</label>
                                <p className="mt-1">{category.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
