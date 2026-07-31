import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments } from "./commentsSlice.js";
import Comment from "./Comment.jsx";

export default function CommentList({ permalink }) {
    const dispatch = useDispatch();
    const commentState = useSelector(state => state.comments);
    if (!commentState) {return null;}
    const { byPermalink, loading, error } = commentState;
    const comments = byPermalink[permalink];
    const safeComments = comments?.comments ?? [];
    useEffect(() => {
        if (!permalink || comments) return;
        dispatch(fetchComments({ permalink }));
    }, [dispatch, permalink, comments]);
    
    if (loading && !comments) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>
    return (
    <ul>
    {safeComments.map(comment => (
        <Comment key={comment.id} comment={comment} />
    ))}
      </ul>
    );
}