import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLogoIcon, {
    BrandLogoPlate,
    brandLogoImageClass,
} from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <Link
                        href={home.url()}
                        className="flex items-center gap-2 self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to home
                    </Link>
                    <div className="flex flex-col items-center gap-5">
                        <Link
                            href={home.url()}
                            className="flex flex-col items-center gap-2 text-foreground no-underline"
                        >
                            <BrandLogoPlate className="size-11">
                                <AppLogoIcon className={brandLogoImageClass} />
                            </BrandLogoPlate>
                            <span className="sr-only">{title}</span>
                        </Link>
                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-bold text-foreground">
                                {title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
