import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Circle } from '../../functions/circle.js';
import CardList from "../Card/CardList.js";
import { CommentsList } from '../Comments/commentsList.js';
import { Post } from "../Posts/Post.js"; 


export default function AppLayout() {
    return (
        <div>
            <header>Exteddit</header>
            <nav> Browse(under construction)</nav>
            <main>
            <Outlet/>
            </main>
            <Circle />
        </div>
    );
};