import { useEffect, useState } from "react";
import Post from "../components/Post";

export default function IndexPage() {

    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('https://192.168.3.9:4000/get-posts')
        .then(response => response.json())
        .then(dados => {
            setPosts(dados);
        })
    }, [])
    
    return (
        <div>
            {posts.length > 0 && (
                posts.map((post, indice) => {
                    return <Post key={indice} {...post} />
                })
            )}
        </div>
    )
}