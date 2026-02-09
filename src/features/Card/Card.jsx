import { useState } from "react";
import "./Card.css";
import paths from "../App/paths.js";
import { Link } from "react-router-dom";

const getImage = (post) =>
    post.preview?.images?.[0]?.source?.url?.replaceAll("&amp;", "&") ??
    (typeof post.thumbnail === "string" && post.thumbnail.startsWith("http")
        ? post.thumbnail
        : null);

export default function Card({ post }) {
    const date = new Date(post.created_utc * 1000).toLocaleDateString();
    const [showVideo, setShowVideo] = useState(false);
    const image = getImage(post);
    const redditVideo = post.is_video && post.media?.reddit_video?.fallback_url;

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
            {!showVideo && image && (
                <div className="media">
                    <img src={image} alt="" />
                    {redditVideo && (
                        <button
                            className="play"
                            onClick={() => setShowVideo(true)}
                        >
                            ▶
                        </button>
                    )}
                </div>
            )}
            {showVideo && redditVideo && (
                <div className="media">
                    <video
                        src={redditVideo}
                        controls
                        autoPlay
                        muted
                        playsInline
                    />
                </div>
            )}
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
