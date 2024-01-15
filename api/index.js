const express = require('express');
const https = require("https");
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const multer = require('multer');


const DEBUG_MODE = true;
const uploadMiddleware = multer({ dest: 'uploads/' })

const privateKey = fs.readFileSync("../ssl/example.com+6-key.pem", 'utf8');
const certificate = fs.readFileSync("../ssl/example.com+6.pem", "utf8");
const cred = { key: privateKey, cert: certificate };
const jwtSecret = "Rmxl9w91Dpusq18BW15WdQ==";

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://192.168.3.9:3000',
    'http://192.168.3.3:4000',
];
app.use(cors({ 
    credentials: true, 
    origin: function(origin, callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error('Origem não permitida pelo CORS'))
        }
    }, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization' 
}));

app.use(express.json());
app.use(cookieParser());

//lucaslapaz  68R0bRr2hzbb0kIv
mongoose.connect('mongodb+srv://lucaslapaz:68R0bRr2hzbb0kIv@blogcluster.nuscdp5.mongodb.net/?retryWrites=true&w=majority')

app.get("/teste", (req, res) => {
    res.json({username: 'lucaslapaz', password: '123'});
})

app.use('/uploads', express.static(__dirname + '/uploads'))


app.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, 5)
        })
        return res.status(200).json(userDoc);
    } catch (e) {
        return next(new Error("Falha ao se registrar"))
    }
})

app.post("/login", async (req, res, next) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
        return next(new Error('Credenciais incorretas.'));
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) { //logado
        jwt.sign({ username, id: userDoc._id }, jwtSecret, {}, (err, token) => {
            if (err) {
                return next(new Error("Erro ao gerar o token."));
            }
            return res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                id: userDoc._id,
                username
            });
        });
    } else {
        return next(new Error("Dados incorretos."))
    }
})

app.get("/profile", (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        throw new Error("Usuário não logado")
    }

    jwt.verify(token, jwtSecret, {}, (err, info) => {
        if (err) throw new Error(err);
        res.json(info);
    })
});

app.post("/logout", (req, res) => {
    res.cookie('token', '', { sameSite: 'none', secure: true }).sendStatus(200);
})

app.post("/create-post", uploadMiddleware.single('file'), async (req, res, next) => {
    
    const { token } = req.cookies;
    if (!token) return next(new Error("Usuário não logado"));

    jwt.verify(token, jwtSecret, {}, async (err, info) => {

        if (err) return next(new Error(err));

        const { title, summary, content } = req.body;
        const file = req.file;
    
        if (!file) return next(new Error('Arquivo não definido.'));;
    
        const { mimetype, filename, originalname } = file;
        const extParts = originalname.split('.');
        const ext = extParts[extParts.length - 1];
    
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
            const novoCaminho = `/uploads/${filename}.${ext}`
            fs.renameSync(`./uploads/${filename}`, "." + novoCaminho);
            const postDoc = await Post.create({
                title, 
                summary, 
                content, 
                cover: novoCaminho,
                author: info.id
            })
            return res.sendStatus(200);
        } else {
            fs.rmSync(`./uploads/${filename}`);
            return next(new Error('Formato de arquivo não permitido.'));
        }
    })
})

app.get('/get-posts', async (req, res) => {
    const posts = await Post.find()
    .populate('author')
    .sort({createdAt: -1})
    .limit(20);
    res.json(posts);
})

app.get("/post/:id", async (req, res, next) => {
    const {id} = req.params;
    let post = {}
    try{
        post = await Post.findOne({_id:id}).populate('author', ['username']);
    }catch (e){
        return next(new Error("Falha ao encontrar o post"))
    }
    return res.status(200).json(post);
})

app.post("/update-post", uploadMiddleware.single('file'), (req, res, next) => {
    const { token } = req.cookies;
    if (!token) return next(new Error("Usuário não logado"));

    jwt.verify(token, jwtSecret, {}, async (err, info) => {

        if (err) return next(new Error(err));
        const idAuthor = info.id; 
        const author = info.username;

        const idPost = req.body._id;
        const {title, summary, content } = req.body;

        let consulta = {}
        try{
            consulta = await Post.findById(idPost).populate('author', ['username']);
        }catch (e){
            return next(new Error("Falha ao encontrar o post"))
        }
        
        if (consulta.author._id.toString() !== idAuthor.toString()){
            return next(new Error("Usuário não é o autor do Post."))
        }

        const file = req.file;
        let novoCaminho = null;

        if(file){
            const { mimetype, filename, originalname } = file;
            const extParts = originalname.split('.');
            const ext = extParts[extParts.length - 1];
        
            if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
                novoCaminho = `/uploads/${filename}.${ext}`
                fs.renameSync(`./uploads/${filename}`, "." + novoCaminho);
            } else {
                fs.rmSync(`./uploads/${filename}`);
                return next(new Error('Formato de arquivo não permitido.'));
            }
        }

        try{
            await Post.findByIdAndUpdate(idPost, {title, summary, content, cover: novoCaminho ? novoCaminho : consulta.cover})
            return res.sendStatus(200);
        }catch (e){
            return next(new Error("Falha ao atualizar post."))
        }
    });
})

app.use((err, req, res, next) => {
    res.status(500);
    if (DEBUG_MODE) {
        if (err instanceof Error) {
            console.log(`Erro interno: ${err.message}`);
            return res.send(`Erro interno: ${err.message}`);
        } else {
            console.log(`Erro interno: ${err}`);
            return res.send(`Erro interno: ${err}`);
        }
    } else {
        return res.send();
    }
})

const server = https.createServer(cred, app);
server.listen(4000, () => {
    console.log('Servidor iniciado na porta 4000!');
})