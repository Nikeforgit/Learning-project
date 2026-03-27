import { useState } from "react";
import "./Card.css";
import paths from "../App/paths.js";
import { Link } from "react-router-dom";

function getPostMedia(post) {
    if (post.is_gallery && post.gallery_data && post.media_metadata) {
        const items = post.gallery_data.items.map(item => {
            const meta = post.media_metadata[item.media_id];
            if (!meta) return null;
            const mp4 = meta.variants?.mp4?.source?.url;
            const image = meta.s?.u;
            if (mp4) {
                return {
                    type: "video",
                    url: mp4.replaceAll("&amp;", "&").replaceAll("&amp", "&")
                };
            }
            if (image) {
                return {
                    type: "image",
                    url: image.replaceAll("&amp;", "&").replaceAll("&amp", "&")
                };
            }
            return null;
        })
        .filter(Boolean);
        return { type: "gallery", items };
    }
    if (post.is_video && post.media?.reddit_video?.fallback_url) {
        return {
            type: "video",
            url: post.media.reddit_video.fallback_url
        };
    }
    const gif = post.preview?.images?.[0]?.variants?.mp4?.source?.url;
    if (gif) {
        return {
            type: "video",
            url: gif.replaceAll("&amp;", "&").replaceAll("&amp", "&")
        };
    }
    const image = 
      post.preview?.images?.[0]?.source?.url ||
      post.thumbnail;
    if (image && image.startsWith("http")) {
        return {
            type: "image",
            url: image.replaceAll("&amp;", "&").replaceAll("&amp", "&")
        };
    }
    if (post.selftext && post.selftext.trim().length > 0) {
        return {
            type: "text",
            content: post.selftext
        };
    }
    return null;
}

export default function Card({ post }) {
    const date = new Date(post.created_utc * 1000).toLocaleDateString();
    const media = getPostMedia(post);
    const [currentIndex, setCurrentIndex] = useState(0);
    const next = () => {
        if (media?.type !== "gallery") return;
        setCurrentIndex(i => (i + 1) % media.items.length);
    };
    const prev = () => {
        if (media?.type !== "gallery") return;
        setCurrentIndex(i => i === 0 ? media.items.length - 1 : i - 1);
    };
    const nextItem = media?.type === "gallery"
      ? media.items[currentIndex + 1]
      : null;
    if (nextItem?.type === "image") {
        const img = new Image();
        img.src = nextItem.url;
    }

    return (
        <li className="card">
            <h3>{post.title}</h3>
            <div className="meta">
                <span>
                    <Link to={paths.subreddit(post.subreddit)}>
                     r/{post.subreddit}
                    </Link>
                </span>
                <span> by {post.author}</span>
                <span>{date}</span>
            </div>
            {media?.type === "gallery" && (
                <div className="media">
                    {media.items[currentIndex].type === "video" ? (
                        <video
                          src={media.items[currentIndex].url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          preload="auto" 
                          onEnded={(e) => e.target.play()}
                        />
                    ) : (
                        <img src={media.items[currentIndex].url} alt="" />
                    )
                }
                {media.items.length > 1 && (
                    <>
                      <button className="prev" onClick={prev}>◀</button>
                      <button className="next" onClick={next}>▶</button>
                    </>
                )}
                <div className="gallery-counter">
                    {currentIndex + 1} / {media.items.length}
                </div>
                </div>
            )}
            {media?.type === "video" && (
                <div className="media">
                    <video 
                      src={media.url}
                      controls
                      autoPlay
                      muted
                      playsInline
                      onEnded={(e) => e.target.play()}
                      preload="auto"
                    />
                </div>
            )}
            {media?.type === "image" && (
                <div className="media">
                    <img src={media.url} alt=""/>
                </div>
            )}
            {media?.type === "text" && (
                <div className="text-content">
                    {media.content.slice(0, 300)}\
                    {media.content.length > 300 && "..."}
                </div>
            )
            }
            <div className="stats">
                <span>↑ {post.score}</span>
                <span>💬 {post.num_comments}</span>
            </div>
           <Link to={paths.post(post.subreddit, post.id)}>
            💬 {post.num_comments}
           </Link> 
        </li>
    );
}

