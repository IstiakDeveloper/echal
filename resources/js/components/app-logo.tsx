import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import AppLogoIcon, {
    BrandLogoPlate,
    brandLogoImageClass,
} from './app-logo-icon';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;

    return (
        <>
            <BrandLogoPlate rounded="lg" className="size-9">
                <AppLogoIcon className={brandLogoImageClass} />
            </BrandLogoPlate>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
