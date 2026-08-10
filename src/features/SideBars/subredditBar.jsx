import { useEffect } from "react";
import { fetchSideBar } from "./sidebarSlice";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import "./bar.css";

const UI_CONFIG = {
    generic: {
        layout: "vertical",
        components: ["image", "title", "text"]},
    rule: {
        layout: "rule",
        components: ["title", "text"]
    },
    user: {
        layout: "horizontal",
        components: ["image", "title", "text", "flair"]
    },
    link: {
        layout: "compact",
        components: ["image", "title"]
    },
};

function ImageSection({item, className}) {
    if (!item.image) return null;
    return (<img className="image" src={item.image} alt={item.title ?? ""}/>)
}

function AvatarSection({item, className}) {
    if (!item.image) return null;
    return (<img className="avatar" src={item.image} alt={item.title ?? ""}/>)
}

function TitleSection({item, className}) {
    if (!item.title) return null;
    return item.href ? (<Link to={item.href}>{item.title}</Link>)
    : (<h3>{item.title}</h3>);
}

function TextSection({item, className}) {
    if (!item.text) return null;
    return item.href ? (<Link to={item.href}>{item.text}</Link>)
    : (<p>{item.text}</p>);
}

function StatsSection({item, className}) {
    if (!item.image && !item.text) return null;
    return (
    <>
    {item.image && (
    <img src={item.image} alt={item.text ?? ""}/>)}
    {item.text && (
    <span>{item.text}</span>)}
    </>
    );
}

function FlairSection({item, className}) {
    if (!item.flair) return null;
    return (<span>{item.flair}</span>);
}

const COMPONENTS = {
    image: {component: ImageSection, props: {className: "image"}},
    avatar: {component: AvatarSection, props: {className: "avatar"}},
    title: {component: TitleSection, props: {className: "title"}},
    text: {component: TextSection, props: {className: "text"}},
    stats: {component: StatsSection, props: {className: "stats"}},
    flair: {component: FlairSection, props: {className: "flair"}},
}

export function ItemCard({item}) {
    const layout = UI_CONFIG[item.type] ?? UI_CONFIG.generic;
     return (
        <article className={layout.layout}>
            {layout.components.map(name => {
                const config = COMPONENTS[name];
                const Component = config.component;
                if (!Component) return null;
                return (
                    <Component key={name} item={item} {...config.props}/>
                );
            })}
        </article>
    )
}

function Section({section}) {
    const items = section?.items ?? [];
    const safeClass = `section ${section?.id ?? ""}`.trim();
    return (
        <div className={safeClass}>
           <h2>{section.title}</h2>
           {items.length === 0 ? (<p>No items</p>)
           : (items.map(item => (
            <ItemCard key={item.href ?? item.id ?? item.title} item={item}/>
           )))}
        </div>
    )
}

export default function SubredditBar() {
    const sections = useSelector(state => state.sidebar.sections) ?? [];
    const dispatch = useDispatch();
    const {subreddit} = useParams(); 
    useEffect(() => {
        if (subreddit) {
            dispatch(fetchSideBar(subreddit));
        }
    }, [dispatch, subreddit]);
    return (
    <>
     {sections.map(section => (
        <Section key={section.id ?? section.title} section={section}/>
    ))}
    </>
);
}