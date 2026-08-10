
import { getMedia } from "./UnitedPost2.js";

export function normalizePost(raw = {}) {
    if (typeof raw !== "object" || raw === null) return null;
    const createdUtc = raw.created_utc ?? raw.created ?? null;
    const createdMs = typeof createdUtc === "number" ? Math.round(createdUtc * 1000) : null;
    return {
        id: raw.id ?? null,
        title: raw.title ?? '',
        author: raw.author ?? null,
        subreddit: raw.subreddit ?? (typeof raw.subreddit_name_prefixed === "string"
             ? raw.subreddit_name_prefixed.replace(/^r\//, '')
              : null),
        members: raw.subreddit_subscribers
                 ?? raw.subscribers 
                 ?? raw.num_subscribers ?? null,
        online: raw.active_user_count ?? null,

        media: getMedia(raw, "post"),
        thumbnail: typeof raw.thumbnail === "string"
                    && raw.thumbnail?.startsWith("http") ? raw.thumbnail : null,
        url: raw.url ?? null,
        domain: raw.domain ?? null,

        score: raw.score ?? 0,
        num_comments: raw.num_comments ?? 0,
        upvote_ratio: typeof raw.upvote_ratio === "number" ? raw.upvote_ratio : null,

        permalink: raw.permalink ? `https://reddit.com${raw.permalink}` : null,
        created: createdMs,
        created_utc_ms: createdMs,
        selftext: raw.selftext ?? "",

        link_flair_text: raw.link_flair_text ?? null,
        link_flair_type: raw.link_flair_type ?? null,

        spoiler: !!raw.spoiler,
        stickied: !!raw.stickied,
        locked: !!raw.locked,
        over_18: raw.over_18 ?? raw.over18 ?? false,
        removed_by: raw.removed_by ?? null
    };
}

export function normalizePostListing(raw = {}) {
    const children = raw?.data?.children ?? [];
    const posts = Array.isArray(children)
          ? children.map(c => normalizePost(c.data)).filter(Boolean)
          : [];
        return { posts, after: raw?.data?.after ?? null };
}

export function normalizeComment(raw = {}) {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: raw.id ?? null,
        author: raw.author ?? null,
        author_fullname: raw.author_fullname ?? null,
        body: raw.body ?? raw.body_html ?? '',
        score: raw.score ?? raw.total_score ?? 0,
        permalink: raw.permalink ? `https://reddit.com${raw.permalink}`
                                 : null,
        created: raw.created_utc != null
                ? raw.created_utc * 1000 : raw.created != null
                ? raw.created * 1000 : null,
        edited: !!raw.edited,
        stickied: !!raw.stickied,
        locked: !!raw.locked,
        controversiality: raw.controversiality ?? 0,
        parent_id: raw.parent_id ?? null,
        link_id: raw.link_id ?? null,
        replies: raw.replies ?? null,
        media: getMedia(raw, 'comment')
    }
}

export function normalizeCommentListing(raw = []) {
    if (!Array.isArray(raw) || !raw[1]) return { post: null, comments: [] };
    const post = raw[0] ? normalizePost(raw[0].data.children[0].data) : null;
    const children = raw[1]?.data?.children ?? [];
    const comments = Array.isArray(children)
         ? children.filter(item => item.kind === "t1").map(item => normalizeComment(item.data)).filter(Boolean)
         : [];
    return { post, comments };
}

export function normalizeSubreddit(raw = {}, extras = {}) {
            const s = raw.data ?? raw;
            return {
                id: s.id ?? null,
                name: s.name ?? '',
                display_name: s.display_name ?? s.name ?? null,
                url: s.url ?? s.display_name_prefixed ?? null,

                icon: s.community_icon ?? s.icon_img ?? null,
                banner: s.banner_background_image 
                        ?? s.banner_img ?? s.mobile_banner_image ?? null,

                description: s.public_description ?? s.description ?? "",

                members: s.subscribers ?? s.total_subscribers ?? s.num_subscribers ?? 0,
                online: s.active_user_count ?? s.accounts_active ?? null,
                onlineLabel: "online",
                contributors: s.total_contributors ?? null,
                contributorsLabel: "contributors",
                visitors: s.total_visitors ?? null,
                visitorsLabel: "visitors",
                membersLabel: "members",

                visibility: s.subreddit_type ?? "public",
                over18: s.over_18 ?? false,

                created: s.created_utc != null
                     ? s.created_utc * 1000 : s.created != null
                     ? s.created * 1000 : null,

                rules: extras.rules ?? [],
                moderators: extras.moderators ?? [],
                links: extras.links ?? [],
                apps: extras.apps ?? [],

                related: extras.related ?? [],
                wiki: extras.wiki ?? null,
                guide: extras.guide ?? null,
                flairs: extras.flairs ?? {
                       user: [],
                       post: []
                },
                bookmarks: extras.bookmarks ?? [],
                communityLinks: extras.communityLinks ?? [],
        }
        console.log(JSON.stringify(sidebar, null, 2));
}

export function normalizeSubredditListing(raw = {}) {
    const children = raw?.data?.children ?? [];
    return {
        subreddit: children.map(c => normalizeSubreddit(c.data)).filter(Boolean),
        after: raw?.data?.after ?? null

        };
    };


export function normalizeUser(raw = {}, extras = {}) {
    const u = raw?.data ?? {};
    return {
        id: u.id ?? null,
        name: u.name ?? null,
        icon: u.icon_img ?? u.snoovatar_img ?? null,
        banner: u.subreddit?.banner_img ?? null,
        karma: u.total_karma ?? u.link_karma ?? 0,
        link_karma: u.link_karma ?? 0,
        comment_karma: u.comment_karma ?? 0,
        verified: !!u.verified,
        created: u.created_utc ? u.created_utc * 1000 : null,
        subreddit: u.subreddit?.display_name ?? null,
        followers: u.subreddit?.subscribers ?? null,
        online: u.subreddit?.active_user_count ?? null,
        description: u.subreddit?.public_description ?? u.subreddit?.description ?? '',
        trophies: extras.trophies ?? [],
        achievements: extras.achievements ?? [],
        flairs: extras.flairs ?? [],
    };
}


export function normalizeAchievements(raw = {}) {
    return { achievements: raw?.data ?? raw ?? null}
}

export function normalizeTrophies(raw = {}) {
    return { trophies: raw?.data ?? raw ?? null}
}