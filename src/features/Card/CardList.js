import React from "react";
import { useSelector } from "react-redux";
import Card from "./Card.jsx";

export default function CardList() {
    const posts = useSelector((state) => state.reddit.posts);
    if (!posts.length) {
        return <p>Nothing more to load</p>
    }
    return (
        <ul>
        {posts.map(post => (
            <Card key={post.id} post={post} />
        ))}
        </ul>
    );
}