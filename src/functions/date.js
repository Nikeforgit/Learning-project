export function toTimestamp(value) {
    if (value === null) return null;
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    if (number < 1e12) {
        return number * 1000;
    }
    return number;
}

export function formatAge(created) {
    const timestamp = toTimestamp(created);
    if (!timestamp) return "";
    const now = Date.now();
    let years = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24 * 365.25));
    if (years < 0) years = 0;
    if (years === 1) return "1 year";
    return `${years} years`;
}