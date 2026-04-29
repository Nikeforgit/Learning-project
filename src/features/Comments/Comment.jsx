import { useState } from "react";
import "../App/App.css";
import "./comments.css";
import { getMedia, renderTextWithLinks } from "../Posts/UnitedPost";
import MediaUIRenderer from "../UI/unitedMediaUI";

export default function Comment({ comment, depth = 0 }) {
    const [collapsed, setCollapsed] = useState(false);
    const replies = comment.replies?.data?.children?.filter(c => c.kind === "t1") ?? [];
    const toggle = () => {
        if (replies.length > 0) {
            setCollapsed(v => !v);
        }
    }
    const date = new Date(comment.created_utc * 1000).toLocaleDateString();
    const media = getMedia(comment, "comment");
    const onlyLink = /^https?:\/\/[^\s]+$/.test(comment.body.trim());
    return (
        <li 
        style={{
            marginLeft: depth * 16,
            borderLeft: depth ? "2px solid #ddd" : "none",
            paddingLeft: depth ? 8 : 0,
            marginTop: 8,
        }}>
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
                <p className="comment-body">{renderTextWithLinks(comment.body)}</p>
                )}
                {media && <MediaUIRenderer media={media}/>}
                </>
                )}
            {!collapsed && replies.length > 0 && (
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
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