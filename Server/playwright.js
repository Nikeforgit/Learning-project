import { chromium } from "playwright";

let browser;
let page;
let warmed = false;

export async function getPage() {
    if (page) return page;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        viewport: { width: 1366, height: 768 },
        locale: "en-US",
        colorScheme: "light",
        timezoneId: "Europe/Sofia"
    });
    page = await context.newPage();
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", {
            get: () => undefined
        });
    });
    return page;
}

export async function warmUp() {
    if (!page) { throw new Error("Call getPage() before warmUp()")};
        if (!warmed) {
            try {
                await page.goto("https://www.reddit.com", { waitUntil: "load", timeout: 5000});
                await page.waitForTimeout(1000);
                warmed = true;
                console.log("Playwright warm-up complete");
            } catch (err) {
                console.warn("Playwright warm-up failed (continuing):", err.message);
            }
        }
    };

export async function closeBrowser() {
    try {
        if (page && typeof page.isClosed === "function" ? !await page.isClosed() : page) {
            try { await page.close(); } catch (e) {}
        }
        page = null;
        if (browser) {
            try { await browser.close(); } catch (e) {}
            browser = null;
        }
        console.log("Playwright browser closed");
    } catch (err) {
        console.log("Error closing Playwright:", err);
    }
}
export function isWarmed() { return warmed; }