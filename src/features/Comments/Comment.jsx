
import "../App/App.css";
import "./comments.css";
import { renderTextWithLinks } from "../Posts/UnitedPost.jsx";
import MediaUIRenderer from "../UI/unitedMediaUI.jsx";
import { useState, useRef, useEffect } from "react";

export default function Comment({ comment, depth = 0 }) {
    const textRef = useRef(null);
    const [overflow, setOverflow] = useState(false);
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
        if (!textRef.current || expanded) return;
        const el = textRef.current;
        setOverflow(el.scrollHeight > el.clientHeight);
    }, [expanded]);
    const [collapsed, setCollapsed] = useState(false);
    const replies = comment.replies?.data?.children?.filter(c => c.kind === "t1") ?? [];
    const toggle = () => {
        if (replies.length > 0) {
            setCollapsed(v => !v);
        }
    }
    const date = new Date(comment.created_utc * 1000).toLocaleDateString();
    const media = comment.media;
    const onlyLink = /^https?:\/\/[^\s]+$/.test(comment.body.trim());
    const hasDirectImageLink = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(comment.body);
    return (
        <li 
        className="comment">
            <div 
            onClick={toggle}
            style={{
                cursor: replies.length > 0 ? "pointer" : "default",
                userSelect: "none",
            }}
            >
                <strong>{comment.author}</strong>
                {replies.length > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 12, color: "#666" }}>
                        {collapsed ? "[+]" : "[-]"}
                    </span>
                )}
                </div>
                {!collapsed && (
                <>
                {!onlyLink && (
                <>
                <p ref={textRef} className={expanded ? "text-post collapse show-all" : "text-post collapse"}>{renderTextWithLinks(comment.body)}</p>
                {overflow && (
                    <button className="collapse-btn" onClick={(e) => {e.stopPropagation(); setExpanded(prev => !prev)}}>{expanded ? "Show less" : "Show more"}</button>
                )}
                </>
                )}
                {media && !hasDirectImageLink && <MediaUIRenderer media={media}/>}
                </>
                )}
            {!collapsed && replies.length > 0 && (
                <ul className="replies">
                    {replies.map(reply => (
                        <Comment
                        key={reply.data.id}
                        comment={reply.data}
                        depth={depth + 1} 
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}