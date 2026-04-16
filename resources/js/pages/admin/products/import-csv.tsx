import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

export default function ProductsImportCsv() {
    return (
        <>
            <Head title="Import Products (CSV) — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Import Products (CSV)
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Upload a CSV file to create multiple products
                                at once.
                            </p>
                        </div>
                        <Link href="/admin/products">
                            <Button variant="secondary" className="cursor-pointer">
                                Back to products
                            </Button>
                        </Link>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="mb-4 text-sm text-muted-foreground">
                            CSV columns supported (header optional):
                            <div className="mt-2 rounded-md bg-muted/40 p-3 font-mono text-xs">
                                category,name,price,slug,description,image,stock,is_active
                            </div>
                            <div className="mt-2 text-xs">
                                - <span className="font-medium">category</span>{' '}
                                can be category id (number) or category name
                                (it will be created if missing)
                                <br />- <span className="font-medium">
                                    is_active
                                </span>{' '}
                                accepts 1/0, true/false, yes/no
                            </div>
                        </div>

                        <Form
                            action="/admin/products/import/csv"
                            method="post"
                            encType="multipart/form-data"
                        >
                            {({ processing, errors }) => (
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-1 text-sm font-medium">
                                            CSV file
                                        </div>
                                        <input
                                            type="file"
                                            name="file"
                                            accept=".csv,text/csv"
                                            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
                                        />
                                        {errors.file && (
                                            <div className="mt-2 text-sm text-destructive">
                                                {errors.file}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="cursor-pointer"
                                    >
                                        {processing
                                            ? 'Importing...'
                                            : 'Import products'}
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}

