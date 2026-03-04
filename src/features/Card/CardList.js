import React from "react";
import { useSelector } from "react-redux";
import Card from "./Card";

export default function CardList() {
    const posts = useSelector(state => state.card.card);
    return (
        <ul>
            {posts.map(id => (
                <Card key={id} id={id} />
            ))}
        </ul>
    );
}