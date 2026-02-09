import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchComments } from "../store/redditSlice";

function RandomPostInfo() {
    const dispatch = useDispatch();
    const randomPost = useSelector(state => state.posts[0]);
    const postId = randomPost?.id;
    const permalink = randomPost?.permalink;

    useEffect(() => {
        if (postId && permalink) {
            dispatch(fetchComments({ postId, permalink }));
        }
    }, [postId, permalink, dispatch]);
    return null;
};

export default RandomPostInfo;