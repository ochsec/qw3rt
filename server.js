require('dotenv').config()
const path = require('path')
const http = require('http')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const sockjs = require('sockjs')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const PORT = 9999
const { 
  createUserNewChat, 
  findAndJoinChat,
  getUsersInChat,
} = require('./dao/service')
const clients = {}

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  function broadcast(message, users) {
    for (let user in users) {
      user.socketId.write(JSON.stringify(message))
    }
  }

  app.use(cors())
  app.use(bodyParser.json())
  app.use(express.static(path.join(__dirname, 'public')))

  app.set('view engine', 'pug')

  app.post('/create', async (req, res) => {
    console.log(req.body)
    const username = req.body.username
    console.log(`User ${username} is creating a new chat.`)
    let data
    try {
      data = await createUserNewChat({ username })
      console.log(data)
      res.json(data)
    } catch (error) {
      console.log(error)
    }
  })

  app.post('/join', async (req, res) => {
    console.log(`User ${username} has requested to join chat ${chatId}.`)
    response = await findAndJoinChat(chatId, username, conn.id)
  })

  app.get('/', (req, res) => {
    res.render('index', {title: 'qw3rt', message: 'qw3rt'})
  })

  app.get('/:id', (req, res) => {
    res.render('chat', {chatId: req.params.id})
  })

  app.post('/:id', (req, res) => {
    const username = req.body.username
    res.render('chat', { chatId: req.params.id, username })
  })  

  const server = http.createServer(app)
  const chatIO = sockjs.createServer()

  chatIO.on('connection', async (conn) => {
    clients[conn.id] = conn
    console.log(conn.id)

    conn.on('data', async (data) => {
      console.log(data)
      const {event, username, chatId, message} = JSON.parse(data);
      let response;

      switch(event) {
        case 'join':
          console.log(`User ${username} has requested to join chat ${chatId}.`)
          response = await findAndJoinChat(chatId, username, conn.id)
          console.log(response)
          conn.write(JSON.stringify(response))
          break;
        case 'create':
          console.log(`User ${username} is creating a new chat.`)
          response = await createUserNewChat({username, socketId: conn.id})
          conn.write(JSON.stringify(response))
          break;
        case 'message':
          response = await getUsersInChat(chatId)
          broadcast(message, users)
          break;
      }
    })

    conn.on('close', function() {
      delete clients[conn.id] 
    })
  })

  chatIO.installHandlers(server, {prefix: "/chat"})

  server.listen(PORT, '0.0.0.0')
}

main()
