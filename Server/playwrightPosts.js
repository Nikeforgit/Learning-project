
import { normalizePost } from "./normalizePosts.js";
import { extractText, getPage } from "./playwright.js";

export async function fetchSubredditWithPlaywright(subreddit) {
    const page = await getPage();
    await page.goto(
        `https://www.reddit.com/r/${subreddit}`,
        { waitUntil: "domcontentloaded" }
    );
    const title = await page.title();
    const postLocator = page.locator("article");
    const count = await postLocator.count();
    const posts = [];
    for (let i = 0; i < count; i++) {
        const item = postLocator.nth(i);
        if (!(await item.innerText()).trim()) continue;
        const post = await parsePostItem(item);
        if (!post) {posts.push(post)}
        console.log(`PLAYWRIGHT POST ${i}:`, 
            text.slice(0, 300)
        );
    }
    return {
        posts: [],
        after: null,
    };
}