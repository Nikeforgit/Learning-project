import express from 'express';
import cors from 'cors';
import { getPage, closeBrowser, warmUp } from './playwright.js';

const app = express();
const cache = new Map();
const CACHE_TIME = 1000 * 30;
app.use(cors());
app.use(express.json());

let lastRequestTime = 0;
const REQUEST_DELAY = 1000;

async function browserFetch(url) {
    const page = await getPage();
    const context = page.context();
    const maxAttempts = 3;
    let lastErr = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const resp = await context.request.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Referer': 'https://www.reddit.com/'
                },
                timeout: 15000
            });
            const status = resp.status();
            const headers = resp.headers();
            const contentType = (headers['content-type'] || '').toLowerCase();
            const text = await resp.text();

            if (status >= 400) {throw new Error(`HTTP ${status} - ${text.slice(0, 200)}`);}
            if (contentType.includes('application/json') || /^[\[{]/.test(text.trim())) {
                try {
                    return JSON.parse(text);
                } catch (err) { throw new Error(`Invalid JSON (parse error): ${err.message}; snippet=${text.slice(0, 200)}`);}
            }
            throw new Error(`Non-JSON response (content-type=${contentType}) snippet=${text.slice(0, 200)}`);
        } catch (err) {
            lastErr = err;
            console.warn(`[browserFetch] attempt ${attempt} failed for ${url}: ${err.message}`);
            await new Promise(r => setTimeout(r, 300 * attempt));
        }
      }
      throw lastErr;
    };

async function redditFetch(url) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
        return cached.data;
    }
    const now = Date.now();
    const diff = now - lastRequestTime;
    if (diff < REQUEST_DELAY) {
        await new Promise(r => setTimeout(r, REQUEST_DELAY - diff));
    }
    lastRequestTime = Date.now();
    const data = await browserFetch(url);
    if (!data) throw new Error("Empty response from browserFetch")
    cache.set(url, {
        data,
        timestamp: Date.now()
    });
   return data;
}

function normalizePosts(data) {
    if (!data) return [];
    if (Array.isArray(data)) {
        for (const item of data) {
            const children = item?.data?.children;
            if (Array.isArray(children)) return children.map(c => data).filter(Boolean);
        }
        return [];
    }
    const children = data?.data?.children;
    if (!Array.isArray(children)) return [];
    return children.map(c => c.data).filter(Boolean);
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
        const data = await redditFetch(url.toString());
        if (!data) {
            console.error('redditFetch returned empty for', url.toString());
            return res.status(502).json({ error: 'Empty response from upstream' });
        }
        const posts = normalizePosts(data);
        res.json({ posts, after: data.data.after ?? null });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/comments/:subreddit/:postId', async (req, res) => {
    try {
        const { subreddit, postId } = req.params;
        const url = new URL(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json`);
        const data = await redditFetch(url.toString());
        if (!Array.isArray(data) || !data[1]) return res.json([]);
        const comments = data[1].data.children
          .filter((item) => item.kind === "t1")
          .map((item) => item.data);
        res.json(comments);
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
        const url = new URL(
            'https://www.reddit.com/subreddits/search.json'
        );
        url.searchParams.set('q', q);
        url.searchParams.set('limit', '3');
        const data = await redditFetch(url.toString());
        if (!data || !data.data) return res.status(502).json({ error: `Unexpected upstream response`});
        const subs = (data.data.children).map(c => c.data).filter(Boolean);
        res.json(subs);
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
        const data = await redditFetch(url.toString());
        if (!data) return res.status(502).json({ error: 'Empty response from upstream'});
        res.json({
            posts: normalizePosts(data),
            after: data?.data?.after ?? null
        });
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
        const data = await redditFetch(url.toString());
        res.json({
            posts: normalizePosts(data),
            after: data.data.after
        });
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
        const data = await redditFetch(url.toString());
        res.json({
            posts: normalizePosts(data),
            after: data.data.after
        });
    } catch (error) {
        console.error('Subreddit error:', error);
        res.status(500).json({ error: error.message });
}
})

app.get('/api/user/:username/about', async (req, res) => {
    try {
        const { username } = req.params;
        const url = new URL(`https://www.reddit.com/user/${username}/about.json`);
        const data = await redditFetch(url.toString());
        res.json(data.data);
    } catch (error) {
        console.error('Subreddit error:', error);
        res.status(500).json({ error: error.message });
}
})

app.get('/api/user/:username/trophies', async (req, res) => {
    try {
        const { username } = req.params;
        const url = new URL(`https://www.reddit.com/user/${username}/trophies.json`);
        const data = await redditFetch(url.toString());
        res.json(data.data);
    } catch (error) {
        console.error('Trophy error:', error);
        res.status(500).json({ error: error.message });
}
})

app.get('/api/user/:username/achievements', async (req, res) => {
    try {
        const { username } = req.params;
        const url = new URL(`https://www.reddit.com/user/${username}/achievements.json`);
        const data = await redditFetch(url.toString());
        res.json(data.data);
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