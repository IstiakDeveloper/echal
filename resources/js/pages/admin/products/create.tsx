import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type ProductCreateProps = {
    categories: Array<{ id: number; name: string }>;
};

export default function ProductCreate({ categories }: ProductCreateProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const form = useForm({
        category_id: '',
        name: '',
        slug: '',
        description: '',
        price: '',
        image: '',
        images: [] as File[],
        stock: '',
        is_active: true,
        is_featured: false,
        featured_order: '',
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newFiles = [...uploadedFiles, ...files];
        setUploadedFiles(newFiles);
        form.setData('images', newFiles);

        // Create preview URLs
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviews]);
    };

    const addFiles = (files: File[]) => {
        if (files.length === 0) return;

        const newFiles = [...uploadedFiles, ...files];
        setUploadedFiles(newFiles);
        form.setData('images', newFiles);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviews]);
    };

    const handlePasteImages = (e: React.ClipboardEvent) => {
        const items = Array.from(e.clipboardData?.items ?? []);
        const files = items
            .filter((item) => item.type.startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter((f): f is File => Boolean(f));

        if (files.length === 0) {
            return;
        }

        e.preventDefault();
        addFiles(files);
    };

    const removeImage = (index: number) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        const newPreviews = previewImages.filter((_, i) => i !== index);

        setUploadedFiles(newFiles);
        setPreviewImages(newPreviews);
        form.setData('images', newFiles);

        // Revoke the preview URL to free memory
        URL.revokeObjectURL(previewImages[index]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/products', {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Create Product — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Create Product
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Add a new product to your store
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Category *
                                    </label>
                                    <select
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        value={form.data.category_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'category_id',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select a category
                                        </option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.category_id && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.category_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Product Name *
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
                                        placeholder="Auto-generated from name"
                                    />
                                    {form.errors.slug && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.slug}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Price (৳) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        value={form.data.price}
                                        onChange={(e) =>
                                            form.setData(
                                                'price',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {form.errors.price && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.price}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        value={form.data.stock}
                                        onChange={(e) =>
                                            form.setData(
                                                'stock',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.stock && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.stock}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Product Images
                                    </label>
                                    <div className="space-y-3">
                                        <div
                                            ref={dropzoneRef}
                                            tabIndex={0}
                                            onPaste={handlePasteImages}
                                            onClick={() => {
                                                dropzoneRef.current?.focus();
                                                fileInputRef.current?.click();
                                            }}
                                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/30 p-6 transition-colors hover:border-primary hover:bg-muted/50"
                                        >
                                            <Upload className="mb-2 size-8 text-muted-foreground" />
                                            <p className="text-sm font-medium">
                                                Click to upload images
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                PNG, JPG, WEBP up to 10MB
                                                (multiple images supported)
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Tip: click here and paste from
                                                clipboard (Ctrl+V)
                                            </p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />

                                        {previewImages.length > 0 && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {previewImages.map(
                                                    (preview, index) => (
                                                        <div
                                                            key={index}
                                                            className="group relative"
                                                        >
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="h-32 w-full rounded-lg object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeImage(
                                                                        index,
                                                                    )
                                                                }
                                                                className="absolute top-2 right-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {form.errors.images && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.images}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Main Image URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        value={form.data.image}
                                        onChange={(e) =>
                                            form.setData(
                                                'image',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Or provide a URL for the main product
                                        image
                                    </p>
                                    {form.errors.image && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.image}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Description
                                    </label>
                                    <textarea
                                        rows={6}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.description && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
                                        checked={form.data.is_active}
                                        onChange={(e) =>
                                            form.setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="ml-2 text-sm"
                                    >
                                        Product is active
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
                                        checked={form.data.is_featured}
                                        onChange={(e) =>
                                            form.setData(
                                                'is_featured',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="is_featured"
                                        className="ml-2 text-sm"
                                    >
                                        Show on Home (Featured)
                                    </label>
                                </div>

                                {form.data.is_featured && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Featured order
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            value={form.data.featured_order}
                                            onChange={(e) =>
                                                form.setData(
                                                    'featured_order',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0 = top"
                                        />
                                        {form.errors.featured_order && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {form.errors.featured_order}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Creating...'
                                    : 'Create Product'}
                            </Button>
                            <Link href="/admin/products">
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
