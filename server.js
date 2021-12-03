require('dotenv').config()
const path = require('path')
const http = require('http')
const express = require('express')
const sockjs = require('sockjs')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const PORT = 9999
const { createUserNewChat } = require('./dao/service')
const clients = {}

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  function broadcast(message) {
    for (let client in clients) {
      clients[client].write(JSON.stringify(message))
    }
  }

  app.use(cors())
  app.use(express.static(path.join(__dirname, 'public')))

  app.set('view engine', 'pug')

  app.get('/', (req, res) => {
    res.render('index', {title: 'qw3rt', message: 'qw3rt'})
  })

  app.get('/:id', (req, res) => {
    res.render('chat', {chatId: req.params.id})
  })

  const server = http.createServer(app)
  const chatIO = sockjs.createServer()

  chatIO.on('connection', async (conn) => {
    clients[conn.id] = conn
    console.log(conn.id)

    conn.on('data', async (data) => {
      console.log(data)
      const {event, username, chatId, message} = JSON.parse(data);

      switch(event) {
        case 'join':
          console.log(`User ${username} has requested to join chat ${chatId}.`)
          break;
        case 'create':
          console.log(`User ${username} is creating a new chat.`)
          const id = await createUserNewChat({username, socketId: conn.id})
          console.log(id)
          if (id) {
            const response = {
              event: 'create-success',
              chatId: id
            }
            conn.write(JSON.stringify(response))
          }
          
          break;
        case 'message':
          broadcast(message)
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
