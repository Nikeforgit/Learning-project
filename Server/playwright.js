
import { chromium } from "playwright";
import { normalizePost } from "./normalizePosts.js";
import { href } from "react-router-dom";
import { text } from "express";

let browser;
let page;
let warmed = false;

const SELECTORS = {
    post: {
        title: ['[slot="title"]', '[data-testid="post-title"]', 'h2'],
        author: ['[data-testid="post_author_link"]', 'a[href^="/user/"]', 'a[href^="/u/"]'],
        subreddit: ['a[href^="/r/"]'],
        body: ['[slot="text-body"]', '[data-testid="post-content"]', '[id$="-post-rtjson-content"]'],
        permalink: ['a[data-click-id="comments"]', 'a[href*="/comments/"]'],
        media: ['img', 'video', 'source'],
        thumbnail: ['img'],
        flair: ['[aria-label^="Flair:"]', '.flair-content'],
    },
    text: {
    heading: [".i18n-translatable-text", "h1", "h2", "h3", "#title"],
    users: ["[li.relative.group]", ".flex-col", '[aria-label^="Flair:"]', ".text-body-2", ".i18n-translatable-text", "span"],
    body: ["p", "md", ".text-body-2"],
    inline: [".text-body-2", "span",],
    search: ['[data-testid="search-warnings"]'],
    description: ['[data-testid="search-subreddit-desc-text"]',
         '[data-testid="profile-description"]', '#-post-rtjson-content'],
    bookmark: [".community-bookmark-title", ".text-body-2", 'a[href*="developers.reddit.com/apps/"]', "span"],
    ruleTitle: ['summary .i18n-translatable-text'],
    ruleSummary: ['details'],
    ruleDescription: ['#-post-rtjson-content'],
    trophy: ['ul[slot="initial-trophies"] li', 'ul[slot="additional-trophies"] li'],
    preview: ['[data-testid="achievement-entrypoint-image-container"]'],
    badge: ['achievement-badge'],
    warning: ['[data-testid="search-warnings"]'],
    generic: ['.md'],
    },
    image: {
        avatar: ["img"],
        icon: ["img", "svg"],
        badge: ["svg", "img"],
        app: ["svg"]
    },
    links: {
        default: ["a[href]"],
        rules: ["a[href]", "#-post-rtjson-content", ]
    },
    filterFlair: ["span"],
    flair: {default: [".flair-content", '[aria-label^="Flair:"]']},
    search: ['[data-testid="search-author"]'],
    user: {
        author: ['a[href^="/user/"]', 'a[href^="/u/"]', '[data-testid="search-author"]'],
        name: [".text-body-2", "span", ".i18n-translatable-text"],
        avatar: ['img'],
    },
};
const PARSERS = {
    rules: parseRulesItem,
    user: parseUserItem,
    bookmark: parseBookmarkItem,
    trophy: parseTrophyItem,
    filterFlair: parseFilterFlair,
    flair: parseFlair,
    achievementPreview: parseAchievementPreview,
    achievements: parseAchievementItem,
    generic: parseGenericSection,
};
const CONFIGS = {
        subreddit: [
            {id: "rules", match: ['faceplate-tracker[noun="rules"]', 'faceplate-expandable-section-helper'],
                 selector: "details", parser: PARSERS.rules,},
            {id: "users", match: ['faceplate-tracker[source="moderator_list"]'],
                selector:  'ul > li:has(faceplate-tracker[source="moderator_list"][noun="user"])',
                 parser: PARSERS.user, links: 'a.button-secondary'},
            {id: "relatedSubreddits", match: ['faceplate-tracker[source="subreddit_list_widget"]'], selector: 'li:has(a[href^="/r/"])', parser: PARSERS.bookmark},
            {id: "bookmarks", match: ['a.button-secondary', 'faceplate-dropdown-menu:has(button[aria-haspopup="true"])'], selector: 'a.button-secondary, faceplate-dropdown-menu:has(button[aria-haspopup="true"])', parser: PARSERS.bookmark,},
            {id: "apps", match: ['a[href*="developers.reddit.com/apps/"]'],
                 selector: 'a[href*="developers.reddit.com/apps/"]', parser: PARSERS.bookmark},
            {id: "filterFlair", match: ['ul:has(a[href*="f=flair_name"])'], selector: 'li:has(a[href*="f=flair_name"])', parser: PARSERS.filterFlair},
            {id: "flair", match: ['[aria-label^="Flair:"]'], selector: '[aria-label^="Flair:"]', parser: PARSERS.flair},
            {id: "generic", match: [".md"], type: "generic", parser: PARSERS.generic,}
            ],
        users: [
            {id: "trophies", match: ["shreddit-profile-trophy-list"],
                 selector: 'ul[slot="initial-trophies"] li, ul[slot="additional-trophies"] li', parser: PARSERS.trophy},
            {id: "flair", match: ['[aria-label^="Flair:"]'], selector: '[aria-label^="Flair:"]', parser: PARSERS.flair},
            {id: "achievementPreview", match: ['[data-testid="achievement-entrypoint-image-container"]'],
                selector: '[data-testid="achievement-entrypoint-image-container"]', parser: PARSERS.achievementPreview,
            },
            {id: "achievements", match: ['faceplate-tracker[source="achievements"]'],
                 selector: 'achievement-badge', parser: PARSERS.achievements,},
            ],
        search: [
            {id: "users", match: ['[data-testid="search-author"]'], selector: '[data-testid="search-author"]', parser: PARSERS.user},
        ]
        };

export async function getSectionConfigs(type) {
    return CONFIGS[type] ?? [];
}

export async function safe(fn, fallback = null) {
    try {
        return await fn();
    } catch (err) {
        console.warn(err?.message ?? err);
        return fallback;
    }
}

export async function getPage() {
    if (page) return page;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        viewport: { width: 1366, height: 768 },
        locale: "en-US",
        colorScheme: "light",
        timezoneId: "Europe/London"
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
            return safe(async () => {
                await page.goto("https://www.reddit.com", { waitUntil: "load", timeout: 5000});
                await page.waitForTimeout(1000);
                warmed = true;
                console.log("Playwright warm-up complete");
            }) 
        }
    };

export async function closeBrowser() {
    return safe(async () => {
        if (page && typeof page.isClosed === "function" ? !await page.isClosed() : page) {
            try { await page.close(); } catch (e) {}
        }
        page = null;
        if (browser) {
            try { await browser.close(); } catch (e) {}
            browser = null;
            warmed = false;
        }
        console.log("Playwright browser closed");
    })
}
export function isWarmed() { return warmed; }



export async function getSubreddit(subreddit) {
    try {
        const page = await getPage();
        await page.goto(`https://www.reddit.com/r/${subreddit}`,
             {waitUntil: "domcontentloaded"});
    } catch (err) {
        console.error(err);
    }
}

export async function parsePostItem(article) {
    return safe(async () => {
      const raw = {
        id: await extractAtribute(article, "id"),
        title: (await extractText(article, SELECTORS.post.title)).text,
        author: (await (extractAtribute(article, "author"))),
        subreddit: (await (extractAtribute(article, "subreddit-name"))),
        score: Number(await extractAtribute(article, "score")) || 0,
        permalink: (await extractAtribute(article, "permalink")),
        url: (await extractAtribute(article, "content-href")),
        selftext: (await (extractText(article, SELECTORS.post.body))).text,
        thumbnail: (await extractImage(article, SELECTORS.post.thumbnail)).icon,
        domain: (await (extractAtribute(article, "domain"))),
        num_comments: Number(await extractAtribute(article, "comment-count")) || 0,
        created: (await extractAtribute(article, "created-timestamp")),
        flair: (await extractFlair(article)),
        upvote_ratio: Number(await extractAtribute(article, "upvote-ratio")) || null,
        spoiler: (await extractAtribute(article, "spoiler")) !== null,
        locked: (await Atribute(article, "locked")) !== null,
        stickied: (await extractAtribute(article, "stickied")) !== null,
        over_18: (await extractAtribute(article, "over-18")) !== null,
      };
      return normalizePost(raw);
    })
}

async function postScroll(page, targetCount) {
    const postLocator = page.locator("shreddit-post");
    let stableRound = 0;
    const maxStableRounds = 5;
    while (await postLocator.count() < targetCount && stableRound < maxStableRounds) {
        const before = await postLocator.count();
        await page.mouse.wheel(0, 4000);
        await page.waitForTimeout(1200);
        const after = await postLocator.count();
        if (after === before) {stableRound++;} else {stableRound = 0;}
    }
}

export async function fetchSubredditWithPlaywright(subreddit, {after, limit = 25} = {}) {
    const page = await getPage();
    await page.goto(
        `https://www.reddit.com/r/${subreddit}`,
        { waitUntil: "domcontentloaded" }
    );
    const title = await page.title();
    const postLocator = page.locator("shreddit-post");
    const start = Number(after) || 0;
    const targetCount = start + Number(limit);
    await postScroll(page, targetCount);
    const count = await postLocator.count();
    const end = Math.min(targetCount, count);
    const nextAfter = count >= targetCount ? String(end) : null;
    const posts = [];
    for (let i = start; i < end; i++) {
        const item = postLocator.nth(i);
        if (!(await item.innerText()).trim()) continue;
        const post = await parsePostItem(item);
        console.log("PLAYWRIGHT NORMALIZED POST:", post);
        if (post) {posts.push(post)}
        console.log(`PLAYWRIGHT POST ${i}:`,(await item.innerText()).slice(0, 300));
        
    }
    console.log("PLAYWRIGHT NORMALIZED POSTS:", posts.length);
    return {
        title: title,
        posts,
        after: nextAfter,
    };
}

export async function fetchSidebarWithPlaywright(subreddit) {
    const page = await getPage();
    await page.goto(`https://www.reddit.com/r/${subreddit}`,
        { waitUntil: "domcontentloaded" }
    );
    const visibilityState = await page.evaluate(() => document.visibilityState);
    const hasFocus = await page.evaluate(() => document.hasFocus());
    console.log("visibilityState:", visibilityState, "hasFocus:", hasFocus);
    const configs = await getSectionConfigs("subreddit");
    const sections = await getSections(page, configs);
    const sidebar = page.locator("#right-sidebar-container").first();
    await sidebar.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    console.log(
    "HAS MODERATORS TEXT:",
    (await sidebar.innerText()).includes("Moderators")
);
    console.log(
       "Mod trackers:",
       await sidebar.locator('faceplate-tracker[source="moderator_list"]').count()
    );
    const moderators = await extractModers(page);
    if (moderators) {
       sections.push(moderators);
    }
    return sections;
};

export async function fetchSearchWithPlaywright({q, sort = "relevance", t = "all", after, limit = 25, subreddit}) {
    const page = await getPage();
    const url = new URL("https://www.reddit.com/search/");
    url.searchParams.set("q", q);
    url.searchParams.set("sort", sort);
    url.searchParams.set("t", t);
    if (subreddit) {
        url.searchParams.set("restrict_sr", "on");
    }
    await page.goto(url.toString(), {
        waitUntil: "domcontentloaded",
    });
    const postLocator = page.locator("shreddit-post");
    const start = Number(after) || 0;
    const count = await postLocator.count();
    const end = Math.min(start + Number(limit), count);
    const posts = [];
    for (let i = start; i < end; i++) {
        const item = postLocator.nth(i);
        if (!(await item.innerText()).trim()) {
            continue;
        }
        const post = await parsePostItem(item);
        if (post) {
            posts.push(post);
        }
    }
    return {
        posts, after: end < count ? String(end) : null,
    };
}

export async function fetchCommentsWithPlaywright(subreddit, postId, {after, limit=25} = {}) {
    const page = await getPage();
    await page.goto(
    `https://www.reddit.com/r/${subreddit}/comments/${postId}`,
    { waitUntil: "domcontentloaded" });
    const commentsLocator = page.locator("shreddit-comment");
    const count = await commentsLocator.count();
    const start = Number(after) || 0;
    const end = Math.min(start + Number(limit), count);
    const comments = [];
    for (let i = start; i < end; i++) {
        const item = commentsLocator.nth(i);
        const id = await item.getAttribute("thingid");
        const author = await item.getAttribute("author");
        const score = Number(await item.getAttribute("score")) || 0;
        const body = (await item.locator(`[id^="comment-body"], .md, [data-testid="comment"]`)
        .first().textContent())?.trim() ?? "";
        comments.push({id, author, body, score,});
    }
    return {post: null, comments, after: end < count ? String(end) : null,};
    
}

export async function fetchModerators(page) {
    return safe(async () => {
        const sidebar = page.locator("#right-sidebar-container").first();
        const section = sidebar.locator(".px-md")
        .filter({
            has: page.locator('h2 .i18n-translatable-text').filter({hasText: /^Moderators$/})
        }).first();
        if (!(await section.count())) {
            console.log("Moderator Section: not found");
            return null;
        }
        const message = section.locator('a[href*="/message/compose?to="]').first();
        const users = section.locator('faceplate-tracker[source="moderator_list"][noun="user"]');
        const count = await users.count();
        const moderators = [];
        for (let i = 0; i < count; i++) {
            const tracker = users.nth(i);
            const li = tracker.locator("xpath=ancestor::li[1]");
            const link = tracker.locator('a[href^="/user/"]').first();
            const name = (await link.textContent())?.trim() ?? null;
            const href = await link.getAttribute("href");
            const avatarImage = li.locator("image").first();
            const avatar = await avatarImage.getAttribute("href") ??
            await avatarImage.getAttribute("xlink:href");
            const flair = await extractFlair(li);
            moderators.push({name, href, avatar: avatar ?? null, flair,});
        }
         return {
            id: "users",
                title: "Moderators",
                messageMods: {
                    href: await message.getAttribute("href"),
                    text: (await message.textContent())?.trim() ?? "Message Mods",
                },
                items: moderators,
                };
    })
}

export async function extractAtribute(locator, name) {
    return safe(async () => {
        const value = await locator.getAttribute(name);
        return value ?? null;
    })
}

export async function extractImage(locator, selectors = SELECTORS.image.icon) {
    return safe(async () => {
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
        return {icon: null, source: null, alt};
    })
};

export async function extractText(locator, selectors = "inline") {
    return safe(async () => {
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
    })
}

export async function extractHref(locator, selectors = "default") {
    return safe(async () => {
        if (await locator.evaluate(el => el.matches("a[href]"))) {
            return {
                href: await locator.getAttribute("href")
            };
        }
        const list = Array.isArray(selectors)
        ? selectors
        : SELECTORS.links[selectors] ?? SELECTORS.links.default;
        for (const selector of list) {
            const links = locator.locator(selector);
            if (!(await links.count())) continue;
            const href = await links.first().getAttribute("href");
            if (href) {return {href}}
        }
        return {href: null};
    })
}

export async function extractFlair(locator) {
    return safe(async () => {
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
    })
}

export async function extractWarning(locator, type = "search") {
    return safe(async () => {
        return (await locator.locator('[data-testid="search-warnings"]').count()) > 0;
    })
}

export async function extractNumber(locator, selectors = "faceplate-number") {
    return safe(async () => {
        const list = Array.isArray(selectors) ? selectors : [selectors];
        for (const selectors of list) {
            const number = locator.locator(selectors).first();
            if (!(await number.count())) continue;
            const value = await number.getAttribute("number");
            if (value !== null) {
                return {
                    number: value
                };
            }
        }
        return {number: null};
    })
}

export async function extractModers(page) {
    return safe(async () => {
        const section = page.locator("#right-sidebar-container .px-md")
        .filter({has: page.locator("h2 .i18n-translatable-text").filter({hasText: /^Moderators$/})}).first();
        if (!(await section.count())) {return null;}
        const messageMods = section.locator('a[href*="/message/compose?to="]').first();
        const users = section.locator('faceplate-tracker[source="moderator_list"][noun="user"]');
        const items = [];
        for (let i = 0; i < await users.count(); i++) {
            const li = users.nth(i);
            const user = await parseUserItem(li);
            if (user) {items.push(user);} 
        }
        return {
            id: "moderators",
            title: "Moderators",
            messageMods: {
                href: await messageMods.getAttribute("href"),
                text: (await messageMods.textContent())?.trim() ?? "Message Mods",
            },
            items,
        }
    })
}

async function  settleTime(page, {maxWait = 800, quietPeriod = 500, interval = 150} = {}) {
    const container = page.locator("#right-sidebar-container .py-md");
    const start = Date.now();
    let lastCount = -1;
    let stableSince = Date.now();
    while (Date.now() - start < maxWait) {
        let count = 0;
        try {
            count = await container.locator(":scope > .px-md").count();
        } catch (e) {}
        if (count !== lastCount) {
            lastCount = count;
            stableSince = Date.now();
        } else if (count > 0 && Date.now() - stableSince >= quietPeriod) {
            return count;
        }
        await page.waitForTimeout(interval);
    }
    return lastCount;
}

export async function findSectionConfig(section, configs) {
  return safe(async () => {
    for (const config of configs) {
        for (const selector of config.match ?? []) {
            if (await section.locator(selector).count()) {
                return config;
            }
        }
    }
    return null;
    })
}

export async function getSections(page, configs, {debug = false} = {}) {
    return safe(async () => {
        const sidebar = page.locator("#right-sidebar-container").first();
        try {await page.locator('#right-sidebar-container .px-md').first().waitFor({state: "visible", timeout: 10000});} catch (e) {console.warn(e.message)};
        await page.evaluate(() => window.scrollBy(0, 2000));
        const settleCount = await settleTime(page);
        console.log("Sidebar settled in", settleCount, "sections");
        const container = sidebar.locator(".py-md");
        const sections = container.locator(":scope > .px-md");
        const count = await sections.count();
        const result = [];
        for (let i = 0; i < count; i++) {
            const section = sections.nth(i);
            const {text: heading} = await extractText(section, "heading");
            console.log("SECTION FOUND:", i, `"${heading}"`);
            const config = await findSectionConfig(section, configs);
            if (!config) {
                const generic = await parseGenericSection(section);
                if (generic) {result.push({id: "generic", ...generic,})}
              continue;
            };
            if (config.type === "generic") {
                const content = await parseGenericSection(section);
                if (content) {
                    result.push({id: config.id, title: heading || config.title || `Section ${i + 1}`, ...content})
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
    })
}

export async function collectItems(section, selector, parser) {
    return safe(async () => {
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
    })
}

export async function parseGenericSection(section) {
    return safe(async () => {
        const {text: title} = await extractText(section, "heading");
        const img = section.locator("img").first();
        if (await img.count()) {
            return {
                title, type: "image", image: await img.getAttribute("src")
            };
        } 
        const md = section.locator(".md").first();
        if (await md.count()) {
            return {
                title, type: "richtext", html: await md.innerHTML() 
            };
        }
        const links = await section.locator("a[href]");
        const LinkCount = await links.count();
        if (LinkCount) {
            const items = [];
            for (let i = 0; i < LinkCount; i++) {
                const a = links.nth(i);
                items.push({
                    title: (await a.textContent())?.trim() ?? null,
                    href: await a.getAttribute("href"),
                });
            }
            return {title, type: "links", links: items };
        }
        return {title, type: "text", text: (await section.textContent())?.trim() ?? "", links};
    })
}

export async function parseBookmarkItem(item) {
    return safe(async () => {
        const tag = await item.evaluate(el => el.tagName);
        if (tag === "FACEPLATE-DROPDOWN-MENU") {
            return await parseMenuItem(item);
        }
        const {text: title} = await extractText(item, "bookmark");
        const { icon } = await extractImage(item, "icon");
        const { href } = await extractHref(item);
        return {title, image: icon, type: "link", href: href ?? null,};
    })
}

export async function parseMenuItem(item) {
    return safe(async () => {
        const button = item.locator('button[aria-haspopup="true"]').first();
        if (!(await button.count())) return null;
            const {text: title} = await extractText(item, "inline");
            const menu = item.locator('faceplate-menu[slot="menu"]').first();
            if (!(await menu.count())) return null;
            const linkEls = menu.locator('a[href]');
            const linkCount = await linkEls.count(); 
            const items = [];
            for (let i = 0; i < linkCount; i++) {
                const link = linkEls.nth(i);
                items.push({
                    title: (await link.textContent())?.trim() ?? null, href: await link.getAttribute("href"),
                });
            }
            return {title, type: "dropdown", items,};
    })
}

export async function parseUserItem(item) {
    return safe(async () => {
        console.log("USER ITEM HTML:", await item.evaluate(el => el.outerHTML));
        const [{text: name}, {text: description}, {number: karma}, {icon: avatar}, flair, {href}, warning] = 
        await Promise.all([extractText(item, "heading"), extractText(item, "description"), extractNumber(item), 
            extractImage(item, "avatar"), extractFlair(item), extractHref(item), extractWarning(item),
        ]);
        console.log("USER LINK COUNT:", await item.locator('a[href]').count());
console.log("USER IMG COUNT:", await item.locator('img').count());
console.log(
    "USER FLAIR COUNT:",
    await item.locator('[aria-label^="Flair:"]').count()
);
        return {name, description, karma, avatar, flair, href, warning,};
    })
}

export async function parseRulesItem(item) {
    return safe(async () => {
        const {text: title} = await extractText(item, "ruleTitle", ["strong"]);
        const {text: description} = await extractText(item, "ruleDescription");
        const {href} = await extractHref(item, "rules");
        return {title, description, href};
    })
}

export async function parseAchievementPreview(item) {
    return safe(async () => {
        const {icon: achievement, alt: title} = await extractImage(item, "icon");
        const {href} = await extractHref(item);
        return {title, achievement, href};
    })
}

export async function parseAchievementItem(item) {
    return safe(async () => {
        const [id, title, image, unlockedAt] = await Promise.all([
            item.getAttribute("id"), item.getAttribute("title"),
            item.getAttribute("url"), item.getAttribute("unlocked-at")
        ]);
        return { id, title, image, unlockedAt};
    })
}

export async function openAchievementModal(page) {
    return safe(async () => {
        const button = page.locator('[data-testid="achievements-view-link"]');
        await button.waitFor({state: "visible"});
        await button.click();
        const modal = page.locator("achievement-modal");
        await modal.waitFor({state: "visible"});
        await page.locator(".loading-spinner").waitFor({state: "hidden"});
        return modal;
    })
}

export async function parseTrophyItem(item) {
    return safe(async () => {
        const {text: title} = await extractText(item, "trophy");
        const {icon: image} = await extractImage(item, 'icon');
        const {href} = await extractHref(item);
        return {title, image, href};
    })
}

export async function parseFilterFlair(item) {
    return safe(async () => {
        const link = item.locator('a[href*="f=flair_name"]').first();
        if (!(await link.count())) return null;
        const span = link.locator("span").first();
        if (!(await span.count())) return null;
        const title = (await span.textContent())?.trim() || null;
        const href = await link.getAttribute("href");
        const style = await span.getAttribute("style");
        const color = style?.match(/background-color:\s*([^;]+)/)?.[1] ?? null;
        return {
            title, href: href ?? null, color,
        }
    })
}

export async function parseFlair(item) {
    return safe(async () => {
        return extractFlair(item);
    })
}