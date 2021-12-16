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
const addRoutes = require('./routes')
const { 
  updateUserWithSocketId,
  saveMessage
} = require('./dao/service')
const clients = {}

const main = async () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  app.use(cors())
  app.use(bodyParser.json())
  app.use(express.static(path.join(__dirname, 'public')))

  app.set('view engine', 'pug')

  addRoutes(app)

  const server = http.createServer(app)
  const chatIO = sockjs.createServer()

  chatIO.on('connection', async (conn) => {
    conn.on('data', async (data) => {
      const {event, username, chatId, content, token, socketId} = JSON.parse(data);
      jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
        if (error) {
          
        }
  
        if ((decoded.username === username) && (decoded.chatId === chatId)) {
          let result
          switch(event) {
            case 'session':
              // update user record with session id
              result = await updateUserWithSocketId({username, chatId, socketId})
              console.log(result)
              if (result.socketId) {
                if (!clients[chatId]) {
                  clients[chatId] = [conn]
                } else {
                  clients[chatId].push(conn)
                }

                let message = { 
                  status: 'success', 
                  event: 'register', 
                  message: 'User socket id registered'
                }
                conn.write(JSON.stringify(message))
              } else {
                let message = { 
                  status: 'error',
                  event: 'register',
                  message: 'There was an error registering the socket id' 
                }
                conn.write(JSON.stringify(message))
              }
              break
            default:
              // save message
              result = await saveMessage({username, chatId, content})
              if (result.status === 'error') {
                console.log('There was an error saving the message')
              }
              // broadcast to chat members
              clients[chatId].forEach(user => {
                user.write(JSON.stringify({
                  status: 'success',
                  event: 'broadcast',
                  content: result.content,
                  username: result.username,
                  createdAt: result.createdAt
                }))
              })
          }
        } else {
          conn.write(JSON.stringify({
            status: 'error',
            event: 'register',
            message: 'Invalid token for user'
          }))
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
