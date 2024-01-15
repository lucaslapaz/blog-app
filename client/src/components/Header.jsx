import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export default function Header() {

    const { userInfo, setUserInfo } = useContext(UserContext);

    useEffect(() => {
        fetch("https://192.168.3.9:4000/profile", {
            credentials: 'include'
        }).then(async response => {
            if (response.ok) {
                response.json().then(userInfo => {
                    setUserInfo(userInfo);
                })
            }
        })
    }, [setUserInfo])

    function logout() {
        fetch('https://192.168.3.9:4000/logout', {
            credentials: 'include',
            method: 'POST'
        })
        setUserInfo({});
    }

    const { username } = userInfo;

    return (
        <header>
            <Link to="/" className="logo">MyBlog</Link>
            <nav>
                {username && (
                    <>
                        <span style={{textTransform: "capitalize"}}>Hello, {username}</span>
                        <Link to="/create">Create new Post</Link>
                        <a href="/" onClick={logout}>Logout</a>
                    </>
                )}
                {!username && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    )
}