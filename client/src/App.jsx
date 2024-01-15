import './App.css';
import { Route, Routes } from 'react-router-dom';
import Layout from './layouts/Layout';
import IndexPage from './pages/IndexPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import { UserContextProvider } from './contexts/UserContext.js';
import CreatePostPage from './pages/CreatePostPage.jsx';
import PostPage from './pages/PostPage.jsx';
import EditPostPage from './pages/EditPostPage.jsx';

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path={"/register"} element={<RegisterPage />} />
          <Route path={"/create"} element={<CreatePostPage />} />
          <Route path={"/post/:id"} element={<PostPage />} />
          <Route path={"/edit/:id"} element={<EditPostPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  )
}

export default App;
