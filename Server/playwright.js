
import { chromium } from "playwright";

let browser;
let page;
let warmed = false;
const DEFAULT_TEXT_SELECTORS = [".i18n-translatable-text",
             "h1", "h2", "h3", "h4", "span", "p", "a"];
const CONFIGS = {
        subreddit: [
            {id: "rules", title: "Community Rules", fetch: fetchRules},
            {id: "moderators", title: "Community Moderators", fetch: fetchUsers},
            {id: "links", title: "Useful links", fetch: fetchLink},
            {id: "communityLinks", title: "Community Links", fetch: fetchCommunityLinks},
            {id: "bookmarks", title: "Community Bookmarks", fetch: fetchBookmarks},
            ],
        user: [
            {id: "trophies", title: "Trophy Case", fetch: fetchTrophies},
            {id: "User Flairs", title: "User Flairs", fetch: fetchUserFlairs},
            ]
        };
const SUBREDDIT_CONFIGS = new Map(
    CONFIGS.subreddit.map(config => [config.title, config])
);

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

export async function extractImage(locator) {
    try {
        const img = locator.locator('img');
        const src = (await img.getAttribute("src")) ?? (await img.getAttribute("data-src"));
        if (src) {return { icon: src, source: "img"}};

        const image = locator.locator('image');
        const href = (await image.getAttribute("href"))
                      ?? (await image.getAttribute("xlink:href"));
        if (href) {return { icon: href, source: 'svg-image'}};

        const iconEl = locator.locator('[icon], [data-icon], .icon, .profile-icon, .snoovatar');

        const iconSvg = (await iconEl.locator('image').getAttribute("href"));
        if (iconSvg) {return {icon: iconSvg, source: "icon-svg"};}

        const iconImg = iconEl.locator("img");
        const iconSrc = await iconImg.getAttribute("src");
        if (iconSrc) {return {icon: iconSrc, source: "icon"};}

        if (await iconEl.count()){
        const bg = await iconEl.evaluate(el => getComputedStyle(el).backgroundImage); 
        const match = bg.match(/url\(["']?(.*?)["']?\)/);
        if (match) {return {icon: match[1], source: "background-image"};}
        }
        const rawImg = (await iconEl.getAttribute('data-icon')) ?? (await iconEl.getAttribute('src'));
        if (rawImg) return {icon: rawImg, source: 'icon-attr'};
        return {icon: null, source: null};
    } catch (err) {
        console.warn(err?.message ?? err);
        return {icon: null, source: null};
    } 
};

export async function extractText(locator, selectors = DEFAULT_TEXT_SELECTORS) {
    try {
        for (const selector of selectors) {
            const element = locator.locator(selector);
            if (await element.count()) {
                const text = (await element.textContent())?.trim();
                if (text) {return {text, source: selector};
            }
            }
        }
        return {text: null, source: null};
    } catch (err) {
        console.warn(err?.message ?? err);
        return {text: null, source: null};
    }
}

export async function extractHref(anchor) {
    try {
        return await anchor.getAttribute("href");
    } catch {
        return null;
    }
}

export async function extractHeading(locator) {
    try {
        const selectors = ["#title", "h2 .i18n-translatable-text", "h2", "h1"];
        for (const selector of selectors) {
            try {
                const text = await locator.locator(selector).first().textContent();
                if (text?.trim()) {
                    return text.trim();
                } 
            } catch {}
        }
      return null;
    } catch {return null;}
}

export async function extractFlair(locator) {
    try {
        const flair = locator.locator('[aria-label^="Flair:"]').first();
        if (!(await flair.count())) return null;
        const container = flair.locator('xpath=ancestor::span[1]');
        const link = flair.locator('xpath=ancestor::a[1]');
        const text = (await flair.innerText())?.trim();
        const image = (await flair.locator('img').getAttribute("src")) ?? null;
        const href = (await link.getAttribute("href")) ?? null;
        const style = await container.getAttribute("style");
        const color = style?.match(/background-color:\s*([^;]+)/)?.[1] ?? null;
        return ({text, image, href, color});
    } catch (err) {
        console.warn(err?.message ?? err);
        return null;
    }
}

export async function extractWarning(item) {
    try {
        return (await item.locator('[data-testid="search-warnings"]').count()) > 0;
    } catch (err) {
        console.warn(err?.message ?? err);
        return null;
    }
}

export async function extractName(item) {
    try {
        return item.locator("h3").textContent();
    } catch (err) {
        console.warn(err?.message ?? err);
        return null;
    }
}

export async function extractKarma(item) {
    try {
        return item.locator("faceplate-number").getAttribute("number").catch(() => null);
    } catch (err) {
        console.warn(err?.message ?? err);
        return null;
    }
}

export async function extractDescription(item) {
    try {
        const description = await item.locator('[data-testid="search-subreddit-desc-text"], [data-testid="profile-description"]')
        .textContent().catch(() => null);
        return description?.trim() ?? "";
    } catch (err) {
        console.warn(err?.message ?? err);
        return null;
    }
}

export async function getSections(page, {debug = false} = {}) {
    try {
        const sidebar = page.locator("#right-sidebar-container").first();
        await sidebar.waitFor({state: "visible"});
        const sections = sidebar.locator("section");
        const result = [];
        for (let i = 0; i < await sections.count(); i++) {
            const section = sections.nth(i);
            const heading = await extractHeading(section);
            console.log("Heading:", heading);
            const config = SUBREDDIT_CONFIGS.get(heading);
        console.log("5");
            if (!config) continue;
            result.push({id: config.id, title: heading,
                 image: await extractImage(section), text: await extractText(section),
                  href: await extractHref(section), flair: await extractFlair(section),
                  items: await config.fetch(section)});
        }
        return result;
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}

export async function collectItems(section, selector, parser) {
    try {
        const items = await section.locator(selector).all();
        const result = [];
        for (const item of items) {
            try {
            const parsed = await parser(item);
            if (parsed) {
            result.push(parsed);
            }
            } catch (err) {
                console.warn(err);
            }
        }
        return result;
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}

export async function parseBookmarkItem(item) {
    try {
        const {text: title} = await extractText(item);
        return {
            title, image: await extractImage(item), href: await extractHref(item),
        };
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseUserItem(item) {
    try {
        return {
            name: await extractName(item),
            description: await extractDescription(item),
            karma: await extractKarma(item),
            avatar: await extractImage(item),
            flair: await extractFlair(item),
            href: await extractHref(item),
            warning: await extractWarning(item),
        };
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseRulesItem(item) {
    try {
        const {text: title} = await extractText(item);
        const {text: description} = await extractText(item, ["span", "h3", "md", "p"]);
        return {
            title,
            description,
            href: await extractHref(item),
        };
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseAchievementPreview(item) {
    try {
        const title = await item.locator("img").getAttribute("alt");
        return {
            title,
            image: await extractImage(item),
        };
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseAchievementItem(item) {
    try {
        const [id, title, image, unlockedAt] = await Promise.all([
            item.getAttribute("id"), item.getAttribute("title"),
            item.getAttribute("url"), item.getAttribute("unlocked-at")
        ]);
        return { id, title, image, unlockedAt};
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function openAchievementModal(page) {
    try {
        const button = page.locator('[data-testid="achievements-view-link"]');
        await button.waitFor({state: "visible"});
        await button.click();
        const modal = page.locator("achievement-modal");
        await modal.waitFor({state: "visible"});
        await page.locator(".loading-spinner").waitFor({state: "hidden"});
        return modal;
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseTrophyItem(item) {
    try {
        const title = await item.locator('img').getAttribute("alt");
        const {icon: image} = await extractImage(item);
        return {title, image};
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function fetchRules(section) {
    try {
    return collectItems(section,
         'li, .rule, .faceplate-expandable-section-helper', parseRulesItem);
} catch (err) {
    console.warn('fetchRules error', err?.message ?? err);
    return [];
}
};

export async function fetchUsers(section) {
    try {
        return collectItems(section, 'a[href^="/user/"], a[href*="/user/"], search-telemetry-tracker',
             parseUserItem);
    } catch (err) {
        console.warn('fetchUsers error', err?.message ?? err);
        return [];
    }
};

export async function fetchLink(section) {
    try {
        return collectItems(section, 'a[href]', parseBookmarkItem); 
    } catch (err) {
        console.warn('fetchLinks error', err?.message ?? err);
        return [];
    }
};

export async function fetchApps(section) {
    try {
        return collectItems(section,
             'li, .presentation, .app-card, .app', parseBookmarkItem);
    } catch (err) {
        console.warn('fetchApps failed', err?.message ?? err);
        return [];
    }
};

export async function fetchProjects(section) {
    try {
        return collectItems(section, 'a[href]', parseBookmarkItem);
    } catch (err) {
        console.warn('fetchProjects failed', err?.message ?? err);
        return [];
    }
};

export async function fetchTrophies(section) {
    try {
        return collectItems(section,
             'ul[slot="initial-trophies"] li, ul[slot="additional-trophies"] li',
            parseTrophyItem);
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
} 

export async function fetchAchievementsPreview(section) {
    try {
        return collectItems(section,
             '[data-testid="achievement-entrypoint-image-container"]', parseAchievementPreview);
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}

export async function fetchAchievements(page) {
    try {
        const modal = await openAchievementModal(page);
        return collectItems(modal, "achievement-badge", parseAchievementItem);
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}

export async function fetchBookmarks(section) {
    try {
        return collectItems(section, "faceplate-tracker", parseBookmarkItem);
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}

export async function fetchCommunityLinks(section) {
    try {
        return collectItems(section, 'a', parseBookmarkItem);
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}

export async function fetchUserFlairs(section) {
    try {
        return collectItems(section, '[aria-label^="Flair:"]', extractFlair);
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}
