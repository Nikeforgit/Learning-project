
import { getPage } from "./playwright.js";

export async function fetchRaw(url, { headers = {}, timeout = 15000, attempts = 3} = {}) {
    console.log("FETCHRAW ENTER:", url);
    let lastErr = null;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const page = await getPage();
            console.log("FETCHRAW BEFORE GET");
            const result = await page.evaluate(async (url) => {
                const resp = await fetch(url);
                return {
                    status: resp.status,
                    contentType: resp.headers.get("content-type"),
                    text: await resp.text(),
                };
            }, url);
            console.log("FETCHRAW AFTER GET");
            console.log("[fetchRaw] URL:", url);
            console.log("[fetchRaw] STATUS:", result.status);
            console.log("[fetchRaw] CONTENT-TYPE:", result.contentType);
            console.log("[fetchRaw] BODY:", result.text.slice(0, 300));
            return { status: result.status, headers: {"content-type": result.contentType}, text: result.text, url};
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