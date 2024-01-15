import { lightFormat } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export default function PostPage(props) {

    const [postInfo, setPostInfo] = useState(null);
    const { userInfo } = useContext(UserContext)
    const params = useParams();

    async function consultarPost(id) {
        const response = await fetch(`https://192.168.3.9:4000/post/${id}`)
        if (!response.ok) return;
        let dados = null;

        try {
            dados = await response.json();
        } catch {
            return;
        }

        if (dados) setPostInfo(dados);
    }

    useEffect(() => {
        consultarPost(params.id);
    }, [params])

    if (!postInfo) {
        return '';
    }

    return (
        <div className="post-page">
            <h1>{postInfo.title}</h1>
            <time >{lightFormat(postInfo.createdAt, 'HH:mm dd/MM/yyyy')}</time>
            <div style={{textTransform: "capitalize"}} className="author">by @{postInfo.author.username}</div>
            {userInfo.id === postInfo.author._id && (
                <div>
                    <div className="edit-row">
                        <Link to={`/edit/${postInfo._id}`} className="edit-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            Editar esse post
                        </Link>
                    </div>
                </div>
            )}
            <div className="image">
                <img src={`https://192.168.3.9:4000${postInfo.cover}`} alt="" />
            </div>
            <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }}></div>
        </div>

    )
}