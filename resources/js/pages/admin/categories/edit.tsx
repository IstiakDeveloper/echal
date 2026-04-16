import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
};

type CategoryEditProps = {
    category: Category;
};

export default function CategoryEdit({ category }: CategoryEditProps) {
    const form = useForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        sort_order: category.sort_order.toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/admin/categories/${category.id}`);
    };

    return (
        <>
            <Head title={`Edit ${category.name} — Admin`} />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/categories">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Edit Category
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                {category.name}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="max-w-2xl space-y-4"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Name *
                            </label>
                            <input
                                type="text"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            {form.errors.name && (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Slug
                            </label>
                            <input
                                type="text"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={form.data.slug}
                                onChange={(e) =>
                                    form.setData('slug', e.target.value)
                                }
                            />
                            {form.errors.slug && (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.slug}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={form.data.sort_order}
                                onChange={(e) =>
                                    form.setData('sort_order', e.target.value)
                                }
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Updating...'
                                    : 'Update Category'}
                            </Button>
                            <Link href="/admin/categories">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
