import React from "react";
import { useSelector } from "react-redux";
import Card from "./Card";

export default function CardList() {
    const cardIds = useSelector(state => state.card.allIds);
    return (
        <ul>
            {cardIds.map(id => (
                <Card key={id} id={id} />
            ))}
        </ul>
    );
}