const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const app = express()
app.use(cors())
app.use(express.json())
const port = 3000


const Usuario = mongoose.model('Usuario', {
    nome: String,
    email: String,
    senha: String,
});

app.post("/usuario", async (req, res) => {
    const { nome, email, senha, confirmarSenha } = req.body
    const saltRounds = 10;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).send({ mensagem: 'E-mail precisa ser um email válido.' })
    }

    if (nome.length <= 3) {
        return res.status(400).send({ mensagem: 'Nome precisa conter mais de 3 letras.' })
    }

    if (senha.length <= 5 || senha === senha.toLowerCase()) {
        return res.status(400).send({ mensagem: 'Senha precisa conter mais de 5 caracteres e ao menos 1 letra MAÍUSCULA.' })
    }

    if (senha !== confirmarSenha) {
        return res.status(400).send({ mensagem: 'Confirmar senha precisa ser igual a senha.' })
    }

    const usuarioBanco = await Usuario.findOne({ email })
    if (usuarioBanco) {
        res.status(400).send({ mensagem: 'Email informado já está cadastrado.' })
        return
    }

    const senhaCriptografada = await bcrypt.hash(senha, saltRounds)

    const usuario = new Usuario({
        nome,
        email,
        senha: senhaCriptografada,
    })

    await usuario.save()
    return res.status(201).send({
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
    })
})

app.post("/login", async (req, res) => {
    const { email, senha } = req.body
    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
        res.status(401).send({ mensagem: 'Usuário inválido' })
        return
    }

    const senhaIgual = bcrypt.compare(senha, usuario.senha)
    if (!senhaIgual) {
        res.status(401).send({ mensagem: 'Senha inválida' })
        return
    }

    res.status(200).send({
        mensagem: 'Usuario logado com sucesso!',
        usuario: { nome: usuario.nome }

    })
})


app.listen(port, () => {
    mongoose.connect('mongodb+srv://alicesouza0310:Kl3iGzTG3n1aB8cy@starwars-api.jczggjj.mongodb.net/?retryWrites=true&w=majority&appName=tela-login');
    console.log('App running')
})