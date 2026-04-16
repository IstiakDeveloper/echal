export type RouteQueryOptions = {
    query?: Record<string, unknown>;
    mergeQuery?: Record<string, unknown>;
};

export type RouteDefinition<TMethod extends string | readonly string[]> = {
    url: string;
    method: TMethod extends readonly string[] ? TMethod[number] : TMethod;
};

export type RouteFormDefinition<TMethod extends string> = {
    action: string;
    method: TMethod;
};

export function applyUrlDefaults(url: string): string {
    return url;
}

function toSearchParams(value: Record<string, unknown>): URLSearchParams {
    const params = new URLSearchParams();

    for (const [key, v] of Object.entries(value)) {
        if (v === undefined || v === null) continue;
        params.set(key, String(v));
    }

    return params;
}

export function queryParams(options?: RouteQueryOptions): string {
    if (!options) return '';

    const q = options.query ?? options.mergeQuery;
    if (!q || Object.keys(q).length === 0) return '';

    const sp = toSearchParams(q);
    const s = sp.toString();
    return s ? `?${s}` : '';
}

