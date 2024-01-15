import { useState } from 'react';
import 'react-quill/dist/quill.snow.css'
import { Navigate } from 'react-router-dom';
import Editor from '../components/Editor';


export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev) {
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0])
        ev.preventDefault();
        const response = await fetch('https://192.168.3.9:4000/create-post', {
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
        return <Navigate to="/"/>
    }

    return (
        <form onSubmit={createNewPost}>
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

            <button style={{ marginTop: '5px' }}>Criar Post</button>
        </form>
    )
}