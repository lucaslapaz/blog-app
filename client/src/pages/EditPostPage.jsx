import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../components/Editor";

export default function EditPostPage(){

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');

    const [redirect, setRedirect] = useState(false);
    const params = useParams();

    useEffect(() => {
        consultarPost(params.id);
    }, [params])

    async function consultarPost(id) {
        const response = await fetch(`https://192.168.3.9:4000/post/${id}`)
        if (!response.ok) return;
        let dados = null;

        try {
            dados = await response.json();
        } catch {
            return;
        }

        if (dados) {
            setTitle(dados.title);
            setSummary(dados.summary);
            setContent(dados.content);
        }
    }
    console.log('renderizou')

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set("_id", params.id);
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        if(files?.[0]){
            data.set('file', files[0])
        }
        const response = await fetch('https://192.168.3.9:4000/update-post', {
            method: "POST",
            body: data,
            credentials: "include",
            // headers: {"Content-Type": "multipart/form-data"}
        })
        if(response.ok){
            setRedirect(true);
        }
    }

    if(redirect){
        return <Navigate to={`/post/${params.id}`}/>
    }

    return (
        <form onSubmit={updatePost} >
            <input
                type="title"
                placeholder={'Tittle'}
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <input
                type="summary"
                placeholder={'Summary'}
                value={summary}
                onChange={e => setSummary(e.target.value)}
            />
            <input
                type="file"
                onChange={ev => setFiles(ev.target.files)}
            />
            <Editor onChange={setContent} value={content} />

            <button style={{ marginTop: '5px' }}>Atualizar Post</button>
        </form>
    )
}