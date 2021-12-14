require('dotenv').config()
const path = require('path')
const http = require('http')
const express = require('express')
const jwt = require('jsonwebtoken')
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
    console.log(`User ${req.body.username} is creating a new chat.`)
    try {
      const { username, chatId } = await createUserNewChat({ username: req.body.username })
      const token = jwt.sign({
        username,
        chatId
      }, process.env.JWT_SECRET, { expiresIn: '30 days' })
      res.json({ status: 'success', token, username, chatId })
    } catch (error) {
      res.json({ status: 'error', error })
    }
  })

  app.post('/join', async (req, res) => {
    console.log(`User ${req.body.username} has requested to join chat ${req.body.chatId}.`)
    try {
      const { username, chatId } = await findAndJoinChat(chatId, username)
      const token = jwt.sign({
        username,
        chatId
      }, process.env.JWT_SECRET, { expiresIn: '30 days' })
      res.json({ status: 'success', token, username, chatId })
    } catch (error) {
      res.json({ status: 'error', error })
    }
  })

  app.get('/:id', (req, res) => {
    res.render('chat', {chatId: req.params.id})
  })

  app.post('/:id', (req, res) => {
    jwt.verify(req.body.token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        res.json({ status: 'error', error })
      }

      if ((decoded.username === req.body.username) && (decoded.chatId === req.body.chatId)) {
        res.json({ status: 'success', message: 'jsonwebtoken verified' })
      } else {
        res.json({ status: 'error', message: "username or chatId don't match" })
      }
    })
  })  

  app.get('/', (req, res) => {
    res.render('index', {title: 'qw3rt', message: 'qw3rt'})
  })

  const server = http.createServer(app)
  const chatIO = sockjs.createServer()

  chatIO.on('connection', async (conn) => {
    clients[conn.id] = conn

    conn.on('data', async (data) => {
      const {event, username, chatId, message, token, sessionId} = JSON.parse(data);
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          
        }
  
        if ((decoded.username === req.body.username) && (decoded.chatId === req.body.chatId)) {
          switch(event) {
            case 'session':
              // update user record with session id
              break
            default:
              // broadcast message
          }
        } else {
          
        }
      })      
    })

    conn.on('close', function() {
      delete clients[conn.id] 
    })
  })

  chatIO.installHandlers(server, {prefix: "/chat"})

  server.listen(PORT, '0.0.0.0')
}

main()
