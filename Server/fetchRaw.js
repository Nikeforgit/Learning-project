
import { getPage } from "./playwright.js";

export async function fetchRaw(url, { headers = {}, timeout = 15000, attempts = 3} = {}) {
    let lastErr = null;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const page = await getPage();
            const context = page.context();
            const resp = await context.request.get(url, {headers, timeout});
            const status = resp.status();
            const respHeaders = resp.headers();
            const text = await resp.text();
            return { status, headers: respHeaders, text, url };
        } catch (err) {
            lastErr = err;
            console.warn(`[fetchRaw] attempt ${attempt} failed for ${url}: ${err.message}`);
            await new Promise(r => setTimeout(r, 200 * attempt));
        }
    }
    const e = new Error(`fetchRaw failed for ${url}: ${lastErr?.message ?? 'unknown'}`);
    e.cause = lastErr;
    throw e; 
}