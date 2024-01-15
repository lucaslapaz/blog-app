import { lightFormat } from 'date-fns';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const keys = ["_id", "title", "summary", "content", "author", "cover", "createdAt", "updatedAt"];

export default function Post(props) {

    const [renderizar, setRenderizar] = useState(false);

    useEffect(() => {
        const ren = keys.every((key) => {
            let inclui = Object.keys(props).includes(key);
            return (inclui && props[key] != null) ? true : false;
        })
        setRenderizar(ren);
    }, [props])

    if (!renderizar) {
        return <></>
    } 

    const { _id, title, summary, content, author, cover, createdAt, updatedAt } = props;
    const data = lightFormat(createdAt, 'HH:mm dd/MM/yyyy');

    return (
        <div className="post">
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img src={`https://192.168.3.9:4000${cover}`} alt="Descrição da imagem" />
                </Link>
            </div>
            <div className="texts">
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className="info">
                    <a style={{ textTransform: "capitalize" }} href="/" className="author">{author.username}</a>
                    <time>{data}</time>
                </p>
                <p className="summary">{summary}</p>
            </div>
        </div>
    )
}