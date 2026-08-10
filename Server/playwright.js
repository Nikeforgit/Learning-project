
import { chromium } from "playwright";

let browser;
let page;
let warmed = false;

const SELECTORS = {
    text: {
    heading: [".i18n-translatable-text", "h1", "h2", "h3", "#title"],
    body: ["p", "md", ".text-body-2"],
    inline: [".text-body-2", "span",],
    search: ['[data-testid="search-warnings"]'],
    description: ['[data-testid="search-subreddit-desc-text"]',
         '[data-testid="profile-description"]', '#-post-rtjson-content'],
    bookmark: [".community-bookmark-title", ".text-body-2", "faceplate-tracker", "span", 'a[href*="developers.reddit.com/apps/"]'],
    ruleTitle: ['summary .i18n-translatable-text'],
    ruleSummary: ['details'],
    ruleDescription: ['#-post-rtjson-content'],
    trophy: ['ul[slot="initial-trophies"] li', 'ul[slot="additional-trophies"] li'],
    preview: ['[data-testid="achievement-entrypoint-image-container"]'],
    badge: ['achievement-badge'],
    warning: ['[data-testid="search-warnings"]'],
    },
    image: {
        avatar: ["img",],
        icon: ["img", "svg",],
        badge: ["svg", "img", "alt"],
    },
    links: {
        default: ["a[href]"],
        rules: ["a[href]", "#-post-rtjson-content", ]
    },
    flair: {default: [".flair-content", "inline"],},
};
const PARSERS = {
    rules: parseRulesItem,
    user: parseUserItem,
    bookmark: parseBookmarkItem,
    trophy: parseTrophyItem,
    flair: parseFlair,
    achievementPreview: parseAchievementPreview,
    achievements: parseAchievementItem,
};
const CONFIGS = {
        subreddit: [
            {id: "rules", match: ['faceplate-tracker[noun="rules"]', 'faceplate-expandable-section-helper'],
                 selector: "details", parser: PARSERS.rules,},
            {id: "moderators", match: ['faceplate-tracker[noun="user"]', 'a[href^="/user/"]'],
                selector: 'a[href^="/user/"]', parser: PARSERS.user},
            {id: "links", match: ['search-telemetry-tracker'], selector: "a[href]", parser: PARSERS.bookmark},
            {id: "communityLinks", match: ["search-telemetry-tracker"], selector: 'a[href]', parser: PARSERS.bookmark},
            {id: "bookmarks", match: ["community-menu"], selector: "faceplate-tracker", parser: PARSERS.bookmark},
            {id: "apps", match: ['a[href*="developers.reddit.com/apps/"]'],
                 selector: 'a[href*="developers.reddit.com/apps/"]', parser: PARSERS.bookmark}
            ],
        user: [
            {id: "trophies", match: ["shreddit-profile-trophy-list"],
                 selector: 'ul[slot="initial-trophies"] li, ul[slot="additional-trophies"] li', parser: PARSERS.trophy},
            {id: "User Flairs", match: ['[aria-label^="Flair:"]'], selector: '[aria-label^="Flair:"]', parser: PARSERS.flair},
            {id: "achievementPreview", match: ['[data-testid="achievement-entrypoint-image-container"]'],
                selector: '[data-testid="achievement-entrypoint-image-container"]', parser: PARSERS.achievementPreview,
            },
            {id: "achievements", match: 'faceplate-tracker[source="achievements"]',
                 selector: 'achievement-badge', parser: PARSERS.achievements,},
            ]
        };

export async function getSectionConfigs(type) {
    return CONFIGS[type] ?? [];
}

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

export async function extractImage(locator, selectors = SELECTORS.image.icon) {
    try {
        const list = Array.isArray(selectors)
        ? selectors
        : SELECTORS.image[selectors] ?? SELECTORS.image.icon;

        const img = locator.locator(list.join(", ")).first();
        if (await img.count()) {
            const src =
             await img.getAttribute("src") ??
             await img.getAttribute("data-src");
            if (src) {
                return { icon: src, source: "img"}
            };
        };
        
        const image = locator.locator('image').first();
        if (await image.count()) {
            const href =
             await image.getAttribute("href") ??
             await image.getAttribute("xlink:href");
            if (href) {
                return { icon: href, source: 'svg-image'}
            }; 
        }

        const iconEl = locator.locator(
            '[icon], [data-icon], .icon, .profile-icon, .snoovatar').first();
        if (await iconEl.count()) {
            const iconSvg = iconEl.locator('image').first();
            if (await iconSvg.count()) {
              const href = 
                    await iconSvg.getAttribute("href") ??
                    await iconSvg.getAttribute("xlink:href");
              if (href) {return {icon: href, source: "icon-svg"};}
            };

            const iconImg = iconEl.locator("img");
            if (await iconImg.count()) {
              const iconSrc = await iconImg.getAttribute("src");
              if (iconSrc) {return {icon: iconSrc, source: "icon"};}  
            };

            const bg = await iconEl.evaluate(el => getComputedStyle(el).backgroundImage); 
            const match = bg.match(/url\(["']?(.*?)["']?\)/);
            if (match) {return {icon: match[1], source: "background-image"};}

            const rawImg = (await iconEl.getAttribute('data-icon'))
            ?? (await iconEl.getAttribute('src'));
            if (rawImg) return {icon: rawImg, source: 'icon-attr'};
        };

        const altEl = locator.locator("[alt]").first();
        const alt = await altEl.count()
        ? await altEl.getAttribute("alt")
        : null; 
        return {icon: null, source: null};
    } catch (err) {
        console.error(err);
        return {icon: null, source: null};
    } 
};

export async function extractText(locator, selectors = "inline") {
    try {
        const list = Array.isArray(selectors)
        ? selectors
        : SELECTORS.text[selectors] ?? SELECTORS.text.inline;
        for (const selector of list) {
            const nodes = locator.locator(selector);
            if (!(await nodes.count())) continue;
            const text = await nodes.first().textContent();
            if (text?.trim()) {return {text: text.trim()};
            }
        }
        return {text: null};
    } catch (err) {
        console.error(err);
        return {text: null};
    }
}

export async function extractHref(locator, selectors = "default") {
    try {
        const list = Array.isArray(selectors)
        ? selectors
        : SELECTORS.links[selectors] ?? SELECTORS.links.default;
        for (const selectors of list) {
            const links = locator.locator(selectors);
            if (!(await links.count())) continue;
            const href = await links.first().getAttribute("href");
            if (href) {return {href}}
        }
        return {href: null};
    } catch {
        console.error(err);
        return null;
    }
}

export async function extractFlair(locator) {
    try {
        const flair = locator.locator('[aria-label^="Flair:"]').first();
        if (!(await flair.count())) return {text: null, image: null, href: null, color: null};
        const container = flair.locator('xpath=ancestor::span[1]');
        const link = flair.locator('xpath=ancestor::a[1]');
        const {text} = await extractText(flair, "inline");
        const {icon: image} = await extractImage(flair, "icon") ?? null;
        const {href} = await extractHref(flair) ?? null;
        const style = await container.getAttribute("style");
        const color = style?.match(/background-color:\s*([^;]+)/)?.[1] ?? null;
        return ({text, image, href, color});
    } catch (err) {
        console.error(err);
        return {text: null, image: null, href: null, color: null};
    }
}

export async function extractWarning(locator, type = "search") {
    try {
        return (await locator.locator('[data-testid="search-warnings"]').count()) > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function extractNumber(locator) {
    try {
        const number = locator.locator("faceplate-number").first();
        if (!(await number.count())) return {number: null};
        const value = await number.getAttribute("number")
        return {number: value};
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function findSectionConfig(section, configs) {
  try {
    for (const config of configs) {
        for (const selector of config.match ?? []) {
            if (await section.locator(selector).count()) {
                return config;
            }
        }
    }
    return null;
    } catch (err) {
    console.warn(err?.message ?? err);
    return null;
    }
}

export async function getSections(page, configs, {debug = false} = {}) {
    try {
        const sidebar = page.locator("#right-sidebar-container").first();
        try {await sidebar.waitFor({state: "visible", timeout: 2000});} catch (e) {};
        const container = sidebar.locator(".py-md");
        const sections = container.locator(":scope > .px-md");
        const count = await sections.count();
        const result = [];
        for (let i = 0; i < count; i++) {
            const section = sections.nth(i);
            const {text: heading} = await extractText(section, "heading");
            const config = await findSectionConfig(section, configs);
            if (!config) {if (debug) {console.log(`Unknown section ${i}: "${heading}"`);
        }
        continue;
        }
            const items = await collectItems(section, config.selector, config.parser);
            console.log({heading, config: config.id, items: items.length});
            if (!items.length) continue;
                result.push({
                    id: config?.id,
                    title: heading || config?.title || `Section ${i + 1}`,
                    image: (await extractImage(section)).icon, text: (await (extractText(section))).text,
                    href: await extractHref(section), flair: await extractFlair(section),
                    items,
                });
        }
        return result;
    } catch (err) {
        console.warn(err?.message ?? err);
        return [];
    }
}

export async function collectItems(section, selector, parser) {
    try {
        const items = await section.locator(selector);
        const count = await items.count();
        const result = [];
        for (let i = 0; i < count; i++) {
            const item = items.nth(i);
            try {
            const parsed = await parser(item);
            if (parsed != null) {
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
        const {text: title} = await extractText(item, "bookmark");
        const { icon } = await extractImage(item, "icon");
        const {href} = await extractHref(item);
        return {
            title, image: icon, href,
        };
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseUserItem(item) {
    try {
        const {text: name} = await extractText(item, "heading");
        const {text: description} = await extractText(item, "description");
        const {number: karma} = await extractNumber(item);
        const {icon: avatar} = await extractImage(item, "avatar");
        const flair = await extractFlair(item);
        const {href} = await extractHref(item);
        const warning = await extractWarning(item);
        return {name, description, karma, avatar, flair, href, warning,};
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseRulesItem(item) {
    try {
        const {text: title} = await extractText(item, "ruleTitle");
        const {text: description} = await extractText(item, "ruleDescription");
        const {href} = await extractHref(item, "rules");
        return {title, description, href};
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseAchievementPreview(item) {
    try {
        const {icon: achievement, alt: title} = await extractImage(item, "icon");
        const {href} = await extractHref(item);
        return {title, achievement, href};
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
        const {text: title} = await extractText(item, "trophy");
        const {icon: image} = await extractImage(item, 'icon');
        const {href} = await extractHref(item);
        return {title, image, href};
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}

export async function parseFlair(item) {
    try {
        return await extractFlair(item);
    } catch (err) {
        console.warn(err?.message, err);
        return null;
    }
}