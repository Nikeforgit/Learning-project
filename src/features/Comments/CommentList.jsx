import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments, fetchMoreComments } from "./commentsSlice.js";
import Comment from "./Comment.jsx";

export default function CommentList({ permalink }) {
    const dispatch = useDispatch();
    const { byPermalink, loading, loadingMore, error } = useSelector(state => state.comments);
    const commentData = byPermalink[permalink];
    const comments = commentData?.comments ?? [];
    const after = commentData?.after ?? null;
    const hasMore = commentData?.hasMore ?? false;
    useEffect(() => {
        if (!permalink || commentData) return;
        dispatch(fetchComments({ permalink }));
    }, [dispatch, permalink, commentData]);
    useEffect(() => {
        const handleScroll = () => {
            if (
                !permalink || !commentData ||
                loading || loadingMore ||
                !hasMore || !after
            ) {
                return;
            }
            const bottom = 
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 50;
            console.log("COMMENT SCROLL:", {
    comments: comments.length,
    after,
    hasMore,
    loadingMore,
    scrollHeight: document.documentElement.scrollHeight,
    scrollY: window.scrollY,
    bottom,
});
            if (!bottom) return;
            dispatch(
                fetchMoreComments({
                    permalink, after
                })
            );
        };
        window.addEventListener("scroll", handleScroll);
        return () => {window.removeEventListener("scroll", handleScroll)};
    }, [dispatch, permalink, commentData, loading, loadingMore, hasMore, after]);
    
    if (loading && !commentData) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>
    return (
    <>
    <ul>
    {comments.map(comment => (
        <Comment key={comment.id} comment={comment} />
    ))}
      </ul>
      {loadingMore && (
        <p>Loading more comments...</p>
      )}
      {!hasMore && comments.length > 0 && (
        <p>No more comments.</p>
      )}
    </>
    );
}