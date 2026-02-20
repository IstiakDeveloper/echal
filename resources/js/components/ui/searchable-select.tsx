import { Check, ChevronsUpDown, Search, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type SearchableSelectProps = {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
    stepNumber?: number;
    breadcrumb?: string;
};

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    disabled = false,
    error,
    label,
    stepNumber,
    breadcrumb,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="space-y-2" ref={containerRef}>
            {label && (
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {stepNumber && (
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {stepNumber}
                        </span>
                    )}
                    {label}
                    {breadcrumb && (
                        <>
                            <ChevronRight className="size-3.5 text-muted-foreground" />
                            <span className="text-xs font-normal text-muted-foreground">({breadcrumb})</span>
                        </>
                    )}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={cn(
                        'flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors',
                        disabled && 'cursor-not-allowed opacity-50',
                        isOpen && 'border-primary ring-2 ring-primary/20',
                        !isOpen && 'hover:border-primary/50',
                        error && 'border-destructive'
                    )}
                >
                    <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                        {/* Search Input */}
                        <div className="border-b border-border p-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto p-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    No results found
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                                            value === option.value && 'bg-primary/10 text-primary font-medium'
                                        )}
                                    >
                                        <span className="flex-1 text-left">{option.label}</span>
                                        {value === option.value && (
                                            <Check className="size-4 shrink-0 text-primary" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
