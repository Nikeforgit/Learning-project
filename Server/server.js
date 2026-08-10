import express from 'express';
import cors from 'cors';
import { getPage, closeBrowser, warmUp, getSections, getSectionConfigs} from './playwright.js';
import { fetchRaw } from './fetchRaw.js';
import { normalizePostListing,
         normalizeCommentListing,
         normalizeSubredditListing,
         normalizeSubreddit,
         normalizeUser,
         normalizeAchievements,
         normalizeTrophies } from './normalizePosts.js';

const app = express();
const cache = new Map();
const CACHE_TIME = 1000 * 30;
app.use(cors());
app.use(express.json());

let lastRequestTime = 0;
const REQUEST_DELAY = 1000;

export class UpstreamError extends Error {
    constructor(message, raw) { super(message); this.raw = raw; }
}
 
export async function redditFetchJson(url) {
    const cached = cache.get(url);
    if (cached) {if (cached.expires > Date.now()) {
        return cached.data;
    }
    cache.delete(url);
    };
    const now = Date.now();
    const diff = now - lastRequestTime;
    if (diff < REQUEST_DELAY) await new Promise(r => setTimeout(r, REQUEST_DELAY - diff));
    lastRequestTime = Date.now();
    const raw = await fetchRaw(url);
    if (raw.status >= 400) throw new UpstreamError('Upstream returned non-JSON', raw);
    try {
        const json = JSON.parse(raw.text);
        cache.set(url, {data: json, expires: Date.now() + CACHE_TIME});
        return json;
    } catch (err) {
        throw new UpstreamError(`Invalid JSON: ${err.message}`, raw);
    }
}

async function redditFetch(url, normalizer = (x) => x) {
    const json = await redditFetchJson(url);
    try {
        return normalizer(json);
    } catch (err) {
        const e =  new Error(`Normalizer error: ${err.message}`);
        e.raw = json;
        throw e;
    }
}

app.get('/api/search', async (req, res) => {
    try {
        const { q, sort = 'relevance', t = 'all', after, subreddit } = req.query;
        if (!q) {
            return res.status(400).json({ error: `Query required` });
        }
        const url = new URL('https://www.reddit.com/search.json');
        url.searchParams.set('q', q);
        url.searchParams.set('sort', sort);
        url.searchParams.set('t', t);
        url.searchParams.set('limit', '25');
        if (after) { url.searchParams.set('after', after); }
        const result = await redditFetch(url.toString(), normalizePostListing);
        res.json(result);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/comments/:subreddit/:postId', async (req, res) => {
    try {
        const { subreddit, postId } = req.params;
        const url = new URL(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json`);
        const result = await redditFetch(url.toString(), normalizeCommentListing);
        res.json(result);
    } catch (error) {
        console.error('Comments error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/subreddits', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                error: 'Query required'
            });
        }
        const url = new URL('https://www.reddit.com/subreddits/search.json');
        url.searchParams.set('q', q);
        url.searchParams.set('limit', '3');
        const result = await redditFetch(url.toString(), normalizeSubredditListing);
        res.json(result);
    } catch (error) {
        console.error('Subreddit error:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

app.get('/api/r/:subreddit', async (req, res) => {
    console.log("SUBREDDIT:", req.params.subreddit);
    try {
        const { subreddit } = req.params;
        const { after, limit = '25' } = req.query;
        const url = new URL(`https://www.reddit.com/r/${subreddit}.json`);
        url.searchParams.set('limit', limit);
        if (after) url.searchParams.set('after', after);
        const result = await redditFetch(url.toString(), normalizePostListing);
        res.json(result);
    } catch (error) {
        console.error('Subreddit error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/r/:subreddit/about', async (req, res) => {
    try {
        const { subreddit } = req.params;
        const url = new URL(`https://www.reddit.com/r/${subreddit}/about.json`);
        const api = await redditFetch(url.toString());
        const page = await getPage();
        await page.goto(`https://www.reddit.com/r/${subreddit}`,
            {waitUntil: "networkidle"}
        );
        const sidebar = await getSections(page, await getSectionConfigs("subreddit"));
        const result = normalizeSubreddit(api, sidebar);
        res.json(result);
    } catch (error) {
        console.error('Subreddit error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/popular', async (req, res) => {
    console.log("POPULAR ROUTE");
    try {
        const { after, limit = '25' } = req.query;
        const url = new URL('https://www.reddit.com/r/popular.json');
        url.searchParams.set('limit', limit);
        if (after) url.searchParams.set('after', after);
        const result = await redditFetch(url.toString(), normalizePostListing);
        res.json(result);
    } catch (error) {
        console.error('Subreddit error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { after, limit = '25' } = req.query;
        const url = new URL(`https://www.reddit.com/user/${username}.json`);
        if (after) url.searchParams.set('after', after);
        const result = await redditFetch(url.toString(), normalizePostListing);
        res.json(result);;
    } catch (error) {
        console.error('Subreddit error:', error);
        res.status(500).json({ error: error.message });
}
})

app.get('/api/user/:username/about', async (req, res) => {
    try {
        const { username } = req.params;
        const url = new URL(`https://www.reddit.com/user/${username}/about.json`);
        const api = await redditFetch(url.toString());
        const page = await getPage();
        await page.goto(`https://www.reddit.com/user/${username}`,
            {waitUntil: "networkidle"}
        );
        const sidebar = await getSections(page, await getSectionConfigs("user"));
        const result = normalizeUser(api, sidebar);
        res.json(result);
    } catch (error) {
        console.error('User error:', error);
        res.status(500).json({ error: error.message });
}
})

app.get('/api/user/:username/trophies', async (req, res) => {
    try {
        const { username } = req.params;
        const url = new URL(`https://www.reddit.com/user/${username}/trophies.json`);
        const page = await getPage();
        await page.goto(`https://www.reddit.com/user/${username}`, {waitUntil: 'networkidle'});
        const result = await redditFetch(url.toString(), normalizeTrophies);
        res.json(result);
    } catch (error) {
        console.error('Trophy error:', error);
        res.status(500).json({ error: error.message });
}
})

app.get('/api/user/:username/achievements', async (req, res) => {
    try {
        const { username } = req.params;
        const url = new URL(`https://www.reddit.com/user/${username}/achievements.json`);
        const page = await getPage();
        await page.goto(`https://www.reddit.com/user/${username}`, {waitUntil: 'networkidle'});
        const result = await redditFetch(url.toString(), normalizeAchievements);
        res.json(result);
    } catch (error) {
        console.error('Achievements error:', error);
        res.status(500).json({ error: error.message });
}
})

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok'});
});

await getPage();
await warmUp();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});

let shuttingDown = false;
const FORCE_KILL_TIMEOUT = 10000;
async function shutdown(signal = 'SIGTERM', exitCode = 0) {
    if (shuttingDown) {
        console.log("Shutdown already in progress, ignoring", signal);
        return;
    }
    shuttingDown = true;
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    const closeServer = () => new Promise((resolve) => {
        server.close((err) => {
            if (err) {
                console.error("Error closing HTTP server:", err);
            } else {
                console.log("HTTP server closed");
            }
            resolve();
        });
    });

    const forceKill = setTimeout(() => {
        console.warn(`Shutdown did not complete in ${FORCE_KILL_TIMEOUT}ms, forcing exit`);
        process.exit(1);
    }, FORCE_KILL_TIMEOUT);
    try {
        await closeServer();
        try {
            await closeBrowser();
        } catch (err) {
            console.error("Error duringplaywright close:", err);
        }
        clearTimeout(forceKill);
        console.log("Shutdown complete. Exiting.");
    } catch (err) {
        console.error("Error during shutdown:", err);
        clearTimeout(forceKill);
        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT", 0));
process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("unhandledRejection", (reason, promise) => {
    console.error("unhandled rejection:", reason);
    shutdown("unhandleRejection", 1);
});
process.on("uncaughtException", (err) => {
    console.error("uncaught exception:", err);
    shutdown("uncaughtException", 1);
});