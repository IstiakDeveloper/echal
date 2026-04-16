import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = Omit<ComponentPropsWithoutRef<'img'>, 'src'> & {
    src?: string;
};

/** Use inside `BrandLogoPlate` — natural size, no extra scale */
export const brandLogoImageClass =
    'h-full w-full min-h-0 min-w-0 object-contain';

type PlateProps = {
    className?: string;
    rounded?: 'lg' | 'xl' | 'full';
    children: ReactNode;
};

/** White backing so the logo stays visible on tinted headers and dark UI */
export function BrandLogoPlate({
    className,
    rounded = 'xl',
    children,
}: PlateProps) {
    const roundedCls =
        rounded === 'lg'
            ? 'rounded-lg'
            : rounded === 'full'
              ? 'rounded-full'
              : 'rounded-xl';

    return (
        <span
            className={cn(
                'flex shrink-0 items-center justify-center overflow-hidden bg-white p-0.5 shadow-sm ring-1 ring-border/65 dark:bg-white dark:ring-border/80',
                roundedCls,
                className,
            )}
        >
            {children}
        </span>
    );
}

export default function AppLogoIcon({
    className,
    alt = '',
    src = '/logo.png',
    ...props
}: Props) {
    return (
        <img
            src={src}
            alt={alt}
            className={cn('object-contain', className)}
            {...props}
        />
    );
}
