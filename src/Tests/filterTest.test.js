export function getFilterMode(filters) {
    if (filters.min && filters.max) return "range";
    if (filters.min) return "min";
    if (filters.max) return "max";
    return "off";
}