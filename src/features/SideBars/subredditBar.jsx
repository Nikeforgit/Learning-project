import { useEffect, useState } from "react";
import { fetchSideBar } from "./sidebarSlice";
import { useSelector, useDispatch } from "react-redux";
import { href, Link, Links, useParams } from "react-router-dom";
import "./bar.css";
import DOMPurify from "dompurify";
import SideBar from "./SideBar";

const EMPTY_SECTIONS = [];

const UI_CONFIG = {
    rules: {
        layout: "rule",
        components: ["rules"],
    },
    moderators: {
        layout: "horizontal",
        components: ["avatar", "title", "flair"]
    },
    apps: {
        layout: "compact",
        components: ["image", "title"]
    },
    bookmarks: {
        layout: "compact",
        components: ["bookmarks"]
    },
    relatedSubreddits: {
        layout: "compact",
        components: ["image", "title", "text", "flair"],
    },
    generic: {
        layout: "vertical",
        components: ["image", "title", "text", "href"]},
    filterFlair: {
        layout: "compact",
        components: ["filterFlair"],
    },
    flair: {
        layout: "compact",
        components: ["flair"],
    }
};

const SECTION_COMPONENTS = {
    header: HeaderSection,
    generic: GenericSection,
}

function normalizeHref(href) {
    if (!href) return null;
    if (typeof href === "string") {return href;}
    if (typeof href === "object" && typeof href.href === "string") {return href.href;}
    return null;
}

function HeaderSection({item}) {
    if (!item) return null;
    return (
        <div className="header">
            {item.display_name && (<h3>r/{item.display_name}</h3>)}
            {item.description && (<div>{item.description}</div>)}
            {item.visibility && (<div>{item.visibility}</div>)}
            {item.members != null && (<div>{item.members} {item.membersLabel}</div>)}
            {item.online != null && (<div>{item.online}{item.onlineLabel}</div>)}
            {item.created !== null && (<div>Created {new Date(item.created).toLocaleDateString()}</div>)}
            {item.href !== null && (<SideBarLink href={item.href}>
        <button className="bookmarkbutton">
            Community guide
        </button>
      </SideBarLink>)}</div>
    )
}

function RulesSection({item}) {
    const [showDescription, setShowDescription] = useState(false);
    if (!item) return null;
    return (
    <div className="rules">
        {item.title && (<h3>{item.title}</h3>)}
        {item.text && (<div>{item.text}</div>)}
        {item.description && (
        <>
        <button type="button" onClick={() => setShowDescription(!showDescription)}>
            {showDescription ? "▲" : "▼"}
        </button>
        {showDescription && (
            <div>{item.description}</div>
        )}
        </>
        )}
    </div>
    )
}

function BookmarkSection({item}) {
    const [showDescription, setShowDescription] = useState(false);
    if (!item.title) return null;
    if (item.type === "dropdown") {
        return (
            <div className="bookmark-dropdown">
                <button className="bookmarkbutton" onClick={() => setShowDescription(v => !v)}>
                    {item.title}{showDescription ? "▲" : "▼"}
                </button>
                {showDescription && (
                <div className="bookmark-dropdown-menu">
                    {item.items?.map((child, index) => (
                        <SideBarLink key={`${child.href}-${index}`} href={normalizeHref(child.href)}>
                          <span className="bookmarkbutton">
                            {child.title}
                          </span>
                        </SideBarLink>
                    ))}
                </div>)}
            </div>
        )
    }
    return (
      <SideBarLink href={normalizeHref(item.href)}>
        <span className="bookmarkbutton">
            {item.title}
        </span>
      </SideBarLink>
    );
}

function ModeratorSection({item}) {
    if (!item.title) return null;
    return (
        <SideBarLink href={normalizeHref(item.href)}>
            <span className="moderators">
            {item.avatar && <img src={item.avatar} alt=""/>}
            {item.title && (<div>{item.title}</div>)}
            {item.flair && (<>{item.flair}</>)}
            {item.text && (<div>{item.text}</div>)}
            </span>
        </SideBarLink>
    )
}

function ImageSection({item, className}) {
    if (!item.image) return null;
    return (<img className="sidebar-item-image" src={item.image} alt={item.title ?? ""}/>)
}

function AvatarSection({item, className}) {
    if (!item.image) return null;
    return (<img className="sidebar-item-avatar" src={item.image} alt={item.title ?? ""}/>)
}

function SideBarLink({href, children}) {
    const normalizeHref = typeof href === "string" ? href : href?.href ?? null;
    if (!normalizeHref) return <>{children}</>;
    if (normalizeHref.startsWith("/")) {
        return <Link to={normalizeHref}>{children}</Link>;
    }
    return (
        <a href={normalizeHref} target="_blank" rel="noreferrer">
            {children}
        </a>
    );
}

function TitleSection({item}) {
    if (!item.title) return null;
    return (<SideBarLink href={item.href}>{item.title}</SideBarLink>);
}

function TextSection({item}) {
    if (!item.text) return null;
    return item.href ? <SideBarLink href={item.href}>{item.text}</SideBarLink>
    : <p>{item.text}</p>;
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

function FilterFlair({item}) {
    if (!item.title) return null;
    return (
        <SideBarLink href={item.href}>
            <span className="sidebarfilterflair" style={{backgroundColor: item.color || "transparent"}}>
                {item.title}
            </span>
        </SideBarLink>
    )
}

function FlairSection({item}) {
    if (!item?.flair) return null;
    return <span>{item.flair}</span>;
}

function SubredditsSection({item, className}) {
    if (!item) return null;
    return (
        <span>
            {item.icon && <img src={item.icon} alt=""/>}
            {item.title && (<div>{item.title}</div>)}
            {item.members != null && (<div>{item.members} memders</div>)}
            {item.flair && (<>{item.flair}</>)}
            {item.text && (<div>{item.text}</div>)}
        </span>
    )
}

function LinkSection({section}) {
    if (!item) return null;
    if (!item.href) {
        return <>{children}</>;
    }
    return (
        <a href={item.href} target="_blank" rel="noreferrer">
            {children}
        </a>
    )
}

function GenericSection({section}) {
    switch (section.type) {
        case "image": return <img src={section.image} alt={section.title}/>;
        case "richtext": return (<div dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(section.html) 
        }}/>);
        default: return <p>{section.text}</p>;
    }
}

const COMPONENTS = {
    rules: {component: RulesSection, props: {className: "rules"}},
    moderators: {component: ModeratorSection, props: {className: "moderators"}},
    bookmarks: {component: BookmarkSection, props: {className: "bookmark"}},
    image: {component: ImageSection, props: {className: "image"}},
    avatar: {component: AvatarSection, props: {className: "avatar"}},
    title: {component: TitleSection, props: {className: "title"}},
    text: {component: TextSection, props: {className: "text"}},
    stats: {component: StatsSection, props: {className: "stats"}},
    filterFlair: {component: FilterFlair, props: {className: "filterFlair"}},
    flair: {component: FlairSection, props: {className: "flairs"}},
    subreddits: {component: SubredditsSection, props: {className: "relatedSubreddits"}},
}

function Section({section}) {
    if (section?.id === "generic") {
        return (
            <section className="section generic">
                <h2>{section.title}</h2>
                <GenericSection section={section}/>
            </section>
        );
    }
    const items = section?.items ?? [];
    return (
        <section className={`section ${section?.id ?? ""}`.trim()}>
           <h2>{section?.title ?? ""}</h2>
           {items.length === 0 ? (
            <p>No items</p>
           ) : (
            items.map((item, index) => (
                <ItemCard key={`${section.id}-${index}`} item={item} sectionId={section.id}/>
            ))
           )}
        </section>
    )
}

export function ItemCard({item, sectionId}) {
    console.log(sectionId, "ITEM:", item);
    const layout = UI_CONFIG[sectionId] ?? UI_CONFIG.generic;
     return (
        <div className={`sidebar-item ${sectionId}`}>
            {layout.components.map(name => {
                const config = COMPONENTS[name];
                if (!config) {
                    console.warn(`Unknown sidebar component "${name}" in "${sectionId}"`);
                    return null;
                }
                const Component = config.component;
                if (!Component) return null;
                return (
                    <Component key={name} item={item} {...config.props}/>
                );
            })}
        </div>
    );
    return (
        <a href={item.href} target="_blank" rel="noreferrer">{content}</a>
    );
}

export default function SubredditBar() {
    const dispatch = useDispatch();
    const {subreddit} = useParams();
    const sidebar = useSelector(state => state.sidebar.sidebar);
    const sections = useSelector(
        state => state.sidebar.sidebar?.sections ?? EMPTY_SECTIONS
    );
    console.log("SUBREDDIT BAR RENDER");
    console.log("SUBREDDIT:", subreddit);
    console.log("SECTIONS:", sections);
    useEffect(() => {
        if (subreddit) {
            dispatch(fetchSideBar(subreddit));
        }
    }, [dispatch, subreddit]);
    return (
      <div className="subreddit-sidebar">
       <HeaderSection item={sidebar} />
       {sections.map((section, index) => (
          <Section key={`${sections.id}-${index}`} section={section}/> 
        ))}
      </div>
    );
}