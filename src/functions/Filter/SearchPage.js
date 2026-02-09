import React, { useState } from "react";
import Search from "./search";
import { createIndex, sEngine } from "./sEngine";
import { Circle } from "../circle";

function createInitialData() {
    const initialData = [];
    for (let i = 0; i < 10; i++){
    initialData.push({
        id: i,
        title: `${i}`,
        tags: [""]
    });
    }
    return initialData;
};

export function SearchPage() {
    const [searchFill, setSearchFill] = useState(createInitialData);
    const [text, setText] = useState("");
    const result = [];
    return (
        <div>
        <input value={text}
        onChange={e => setText(e.target.value)} Search={e.text.value}/>
        <div createIndex={e.target.value} sEngine={Search}>{Circle}</div>
        </div>
    )
};

export default SearchPage;