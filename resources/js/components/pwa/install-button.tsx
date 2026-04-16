import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { isStandaloneMode } from '@/lib/pwa';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
};

type InstallButtonProps = {
    variant?: React.ComponentProps<typeof Button>['variant'];
    size?: React.ComponentProps<typeof Button>['size'];
    className?: string;
};

export function PwaInstallButton({
    variant = 'outline',
    size = 'sm',
    className,
}: InstallButtonProps) {
    const [promptEvent, setPromptEvent] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    const canInstall = useMemo(
        () => !installed && promptEvent != null,
        [installed, promptEvent],
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateInstalled = () => setInstalled(isStandaloneMode());
        updateInstalled();

        const onBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setPromptEvent(e as BeforeInstallPromptEvent);
        };

        const onAppInstalled = () => {
            setInstalled(true);
            setPromptEvent(null);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);
        window
            .matchMedia?.('(display-mode: standalone)')
            .addEventListener?.('change', updateInstalled);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                onBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', onAppInstalled);
            window
                .matchMedia?.('(display-mode: standalone)')
                .removeEventListener?.('change', updateInstalled);
        };
    }, []);

    if (!canInstall) return null;

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            onClick={async () => {
                if (!promptEvent) return;
                await promptEvent.prompt();
                try {
                    await promptEvent.userChoice;
                } finally {
                    setPromptEvent(null);
                }
            }}
        >
            <Download className="mr-2 size-4" aria-hidden />
            Install app
        </Button>
    );
}
