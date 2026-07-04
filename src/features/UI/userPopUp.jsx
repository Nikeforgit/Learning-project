import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";


export default function ProfilePopup({ type, onClose }) {
  const profile = useSelector(
    state => state.user.profile
  ); 
  const contributions = (profile?.posts ?? 0) + (profile?.comments ?? 0);
  useEffect(() => {
        document.body.style.overflow = "hidden";
      const handleEscape = (e) => {
          if (e.key === "Escape") {handleClose();};
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
    let content;
    if (type === "contributions") {
      content = (
        <>
          <div className="popup-header">
            <h3>{contributions}</h3>
            <h2>Contributions</h2>
            <h2>Total posts and comments</h2>
          </div>
          <div className="popup-stat">
            <h3>{profile?.posts ?? 0}</h3><span>Posts</span>
          </div>
          <div className="popup-stat">
            <h3>{profile?.comments ?? 0}</h3><span>Comments</span>
          </div>
        </>
      );
    }
    if (type === "activeIn") {
      content = (
        <>
          <div className="popup-header">
            <h2>Active in</h2>
          </div>
          <div className="active-subreddits">
            {profile?.activeIn?.map(subreddit => (
              <Link key={subreddit} to={`/r/${subreddit}`} onClick={handleClose}>
                r/{subreddit}
              </Link>
            ))}
          </div>
        </>
      )
    }
  if (!content) {return null;}
  return (
    <div className="popup" onClick={handleClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <button className="popup-close" onClick={(e) => {e.stopPropagation(); handleClose();}}>X</button>
                {content}
              </div>
    </div>
  )
}