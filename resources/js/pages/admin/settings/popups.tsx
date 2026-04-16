import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type Popup = {
    id: number;
    image_url: string;
    is_active: boolean;
    link_url: string | null;
    created_at: string;
};

type Props = {
    popups: Popup[];
};

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
    if (typeof createImageBitmap === 'function') {
        return await createImageBitmap(file);
    }

    const img = new Image();
    img.decoding = 'async';
    const url = URL.createObjectURL(file);
    try {
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
        return img;
    } finally {
        URL.revokeObjectURL(url);
    }
}

function getBitmapSize(
    bitmap: ImageBitmap | HTMLImageElement,
): { width: number; height: number } {
    // ImageBitmap has width/height, HTMLImageElement uses naturalWidth/naturalHeight.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyBitmap = bitmap as any;
    const width = Number(anyBitmap.width ?? anyBitmap.naturalWidth ?? 0);
    const height = Number(anyBitmap.height ?? anyBitmap.naturalHeight ?? 0);
    return { width, height };
}

async function resizePopupImage(file: File): Promise<{
    file: File;
    original: { width: number; height: number; bytes: number };
    output: { width: number; height: number; bytes: number };
}> {
    const bitmap = await loadBitmap(file);
    const original = {
        ...getBitmapSize(bitmap),
        bytes: file.size,
    };

    // Popup best-practice: keep it "banner-like" and not too huge.
    // We cap dimensions to reduce upload size + avoid "website inside modal" feeling.
    const maxWidth = 1400;
    const maxHeight = 1000;
    const scale = Math.min(
        1,
        maxWidth / Math.max(1, original.width),
        maxHeight / Math.max(1, original.height),
    );
    const targetWidth = Math.max(1, Math.round(original.width * scale));
    const targetHeight = Math.max(1, Math.round(original.height * scale));

    // If already small enough and reasonably sized, keep original.
    // (Also avoids re-encoding and quality loss.)
    if (
        targetWidth === original.width &&
        targetHeight === original.height &&
        file.size <= 600 * 1024
    ) {
        return {
            file,
            original,
            output: { width: original.width, height: original.height, bytes: file.size },
        };
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas not supported');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap as never, 0, 0, targetWidth, targetHeight);

    const prefersWebp =
        typeof file.type === 'string' && file.type.toLowerCase() === 'image/webp';
    const mime = prefersWebp ? 'image/webp' : 'image/jpeg';
    const quality = 0.85;

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
            mime,
            quality,
        );
    });

    const ext = mime === 'image/webp' ? 'webp' : 'jpg';
    const safeBase =
        file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_') ||
        'popup';
    const outFile = new File([blob], `${safeBase}.${ext}`, {
        type: mime,
        lastModified: Date.now(),
    });

    return {
        file: outFile,
        original,
        output: { width: targetWidth, height: targetHeight, bytes: outFile.size },
    };
}

export default function StorefrontPopupsPage({ popups }: Props) {
    const form = useForm<{
        image: File | null;
        link_url: string;
        activate_now: boolean;
    }>({
        image: null,
        link_url: '',
        activate_now: true,
    });

    const [imageStatus, setImageStatus] = useState<
        | null
        | {
              state: 'idle' | 'optimizing' | 'ready' | 'error';
              message?: string;
              original?: { width: number; height: number; bytes: number };
              output?: { width: number; height: number; bytes: number };
          }
    >(null);

    const imageHelp = useMemo(() => {
        if (!imageStatus || imageStatus.state === 'idle') return null;
        if (imageStatus.state === 'optimizing') {
            return 'Optimizing image…';
        }
        if (imageStatus.state === 'error') {
            return imageStatus.message ?? 'Failed to process image.';
        }
        if (imageStatus.state === 'ready' && imageStatus.original && imageStatus.output) {
            const kb = (b: number) => `${Math.round(b / 1024)} KB`;
            return `Optimized: ${imageStatus.output.width}×${imageStatus.output.height} (${kb(imageStatus.output.bytes)}) — original ${imageStatus.original.width}×${imageStatus.original.height} (${kb(imageStatus.original.bytes)})`;
        }
        return null;
    }, [imageStatus]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/settings/storefront/popups', { forceFormData: true });
    };

    return (
        <>
            <Head title="Storefront Popups — Admin" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/settings/storefront">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    Storefront Popups
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    Upload popup images and choose which one is
                                    active.
                                </p>
                            </div>
                        </div>
                        <Link href="/admin/settings/storefront">
                            <Button variant="outline">
                                Storefront settings
                            </Button>
                        </Link>
                    </div>

                    <form
                        onSubmit={submit}
                        className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Popup Image (jpg/png/webp)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    if (!file) {
                                        form.setData('image', null);
                                        setImageStatus(null);
                                        return;
                                    }

                                    setImageStatus({ state: 'optimizing' });
                                    try {
                                        const optimized = await resizePopupImage(file);
                                        form.setData('image', optimized.file);
                                        setImageStatus({
                                            state: 'ready',
                                            original: optimized.original,
                                            output: optimized.output,
                                        });
                                    } catch (err) {
                                        form.setData('image', file);
                                        setImageStatus({
                                            state: 'error',
                                            message:
                                                err instanceof Error
                                                    ? err.message
                                                    : 'Failed to optimize image',
                                        });
                                    }
                                }}
                            />
                            {imageHelp && (
                                <p
                                    className={[
                                        'mt-1 text-xs',
                                        imageStatus?.state === 'error'
                                            ? 'text-destructive'
                                            : 'text-muted-foreground',
                                    ].join(' ')}
                                >
                                    {imageHelp}
                                </p>
                            )}
                            {form.errors.image && (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.image}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Optional Link URL
                            </label>
                            <input
                                type="url"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={form.data.link_url}
                                onChange={(e) =>
                                    form.setData('link_url', e.target.value)
                                }
                                placeholder="https://..."
                            />
                            {form.errors.link_url && (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.link_url}
                                </p>
                            )}
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.activate_now}
                                onChange={(e) =>
                                    form.setData(
                                        'activate_now',
                                        e.target.checked,
                                    )
                                }
                            />
                            Activate immediately (deactivates others)
                        </label>

                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.image}
                        >
                            {form.processing ? 'Uploading…' : 'Upload'}
                        </Button>
                    </form>

                    <div className="space-y-3">
                        {popups.length === 0 ? (
                            <div className="rounded-lg border border-border bg-card p-10 text-center">
                                <ImageIcon
                                    className="mx-auto size-10 text-muted-foreground"
                                    aria-hidden
                                />
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    No popups uploaded yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Upload an image above, then activate it.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {popups.map((p) => (
                                    <div
                                        key={p.id}
                                        className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                                    >
                                        <div className="relative">
                                            <img
                                                src={p.image_url}
                                                alt=""
                                                className="aspect-4/3 w-full object-cover"
                                            />
                                            {p.is_active && (
                                                <span className="absolute top-3 left-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-3 p-4">
                                            {p.link_url && (
                                                <a
                                                    href={p.link_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                                                >
                                                    <ExternalLink
                                                        className="size-4"
                                                        aria-hidden
                                                    />
                                                    Open link
                                                </a>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        p.is_active
                                                            ? 'secondary'
                                                            : 'default'
                                                    }
                                                    disabled={p.is_active}
                                                    onClick={() =>
                                                        form.put(
                                                            `/admin/settings/storefront/popups/${p.id}/activate`,
                                                        )
                                                    }
                                                >
                                                    {p.is_active
                                                        ? 'Active'
                                                        : 'Set active'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        form.delete(
                                                            `/admin/settings/storefront/popups/${p.id}`,
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
