import { useEffect } from "react";
import MediaUIRenderer from "../UI/unitedMediaUI";
import { getMedia, renderTextWithLinks } from "./UnitedPost";
import "./fullscreen.css";

export default function Fullscreen({ post, onClose }) {
    const media = getMedia(post, "post")
    useEffect(() => {
      document.body.style.overflow = "hidden";
    const handleEscape = (e) => {
        if (e.key === "Escape") {document.bosy.style.overflow = ""; onClose()};
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);
  const handleClose = () => {
    document.body.style.overflow = "";
    onClose();
  }

  return (
    <div className="fullscreen" onClick={onClose}>
      <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
        <button className="fullscreen-close" onClick={(e) => {e.stopPropagation(); handleClose();}}>X</button>
        <div className="fullscreen-header">
            <h3>{post.title}</h3>
            <div className="fullscreen-meta">
            <span>r/{post.subreddit}</span>
            <span>by {post.author}</span>
            <span>{new Date(post.created_utc * 1000).toLocaleDateString()}</span>
            </div>
            <MediaUIRenderer media={media} />
            {post.selftext && (
                <div className="fullscreen-text-post">
                    {renderTextWithLinks(post.selftext)}
                </div>
            )}
            <div className="fullscreen-stats">
          <span>↑ {post.score}</span>
          <span>💬 {post.num_comments}</span>
        </div>
        </div>
      </div>
    </div>
  );
}