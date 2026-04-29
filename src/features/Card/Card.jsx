
import "./Card.css";
import paths from "../App/paths.js";
import { Link } from "react-router-dom";
import { getMedia, renderTextWithLinks } from "../Posts/UnitedPost.jsx";
import MediaUIRenderer from "../UI/unitedMediaUI";

export default function Card({ post, onOpen }) {
const media = getMedia(post, "post");
const date = new Date(post.created_utc * 1000).toLocaleDateString();
const profilePic = `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`;
const subredditIcon = `https://api.dicebear.com/7.x/identicon/svg?seed=${post.subreddit}`;
    return (
        <li className="card" onClick={() => onOpen?.(post)}>
            <h3>{post.title}</h3>
            <div className="meta">
                <span>
                    <img src={subredditIcon} alt={post.subreddit} width={18} height={18} />
                    <Link to={paths.subreddit(post.subreddit)}
                     onClick={(e) => e.stopPropagation()}>
                     r/{post.subreddit}
                    </Link>
                </span>
                <span className="author">
                  <img src={profilePic} alt={post.author} width={20} height={20}/>
                  <Link to={`/user/${post.author}`}onClick={(e) => e.stopPropagation()}>
                   {post.author}
                  </Link>
                </span>
                  {post.link_flair_text && (
                      <span className="tag">{post.link_flair_text}</span>
                  )}
                <span>{date}</span>
            </div>
            <MediaUIRenderer media={media} />
            {post.selftext && (
                <div className="text-post">
                    {renderTextWithLinks(post.selftext)}
                </div>
            )}
            <div className="stats">
                <span>↑ {post.score}</span>
                <span>💬 {post.num_comments}</span>
            </div>
           <Link to={paths.post(post.subreddit, post.id)} onClick={(e) => e.stopPropagation()}>
            💬 {post.num_comments}
           </Link> 
        </li>
    );
}

