import { useRef, useState, useEffect } from "react";
import MediaUIRenderer from "../UI/unitedMediaUI";
import paths from "../App/paths.js";
import { Link } from "react-router-dom";
import { renderTextWithLinks } from "../Posts/UnitedPost.jsx";
import { useSelector } from "react-redux";


function PostCard({ post }) {
    const textRef = useRef(null);
    const [overflow, setOverflow] = useState(false);
    useEffect(() => {
        if (!textRef.current) return;
        const el = textRef.current;
        setOverflow(el.scrollHeight > el.clientHeight);
    }, [post.selftext]);
    const media = post.media;
    const date = new Date(post.created * 1000).toLocaleDateString();
    const subredditIcon = `https://api.dicebear.com/7.x/identicon/svg?seed=${post.subreddit}`;
    console.log("HISTORY POST:", post);
console.log("HISTORY PATH:", paths.post(post));
    return (
        <li>
            <Link to={paths.post(post.subreddit, post.id)}>
            <h3>{post.title}</h3>
            </Link>
            <div>
                <span className="meta">
                    <Link to={paths.subreddit(post.subreddit)}
                     onClick={(e) => e.stopPropagation()}>
                     <img src={subredditIcon} alt={post.subreddit} width={18} height={18} />
                     r/{post.subreddit}
                    </Link>
                    <span>{date}</span>
                </span>
            </div>
            <Link to={paths.post(post.subreddit, post.id)}>
            {post.selftext && (<div>
                {overflow && (<div ref={textRef}>{renderTextWithLinks(post.selftext)}</div>)}
            </div>)}
            <MediaUIRenderer media={media}/>
            </Link>
            <div className="stats">
                <span>↑ {post.score}</span>
                <span>💬 {post.num_comments}</span>
            </div>
        </li>
    )
}

export function HistoryBar() {
    const posts = useSelector(state => state.history.posts);
    return (
        <ul className="history-bar">
            {posts.map(post => (
                <PostCard key={post.id} post={post}/>
            ))}
        </ul>
    );
}