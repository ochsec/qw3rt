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
} = require('./dao/service')
const clients = {}

const main = async () => {
  mongoose.connect(process.env.MONGO_URI, {
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

  addRoutes(app)

  const server = http.createServer(app)
  const chatIO = sockjs.createServer()

  chatIO.on('connection', async (conn) => {
    conn.on('data', async (data) => {
      const {event, username, chatId, message, token, socketId} = JSON.parse(data);
      jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
        if (error) {
          
        }
  
        if ((decoded.username === username) && (decoded.chatId === chatId)) {
          switch(event) {
            case 'session':
              // update user record with session id
              const result = await updateUserWithSocketId({username, chatId, socketId})
              console.log(result)
              if (result.socketId) {
                if (!clients[chatId]) {
                  clients[chatId] = [conn]
                } else {
                  clients[chatId].push(conn)
                }
                
                console.log(clients)

                let message = { status: 'success', message: 'User socket id registered' }
                conn.write(JSON.stringify(message))
              } else {
                let message = { status: 'error', message: 'There was an error registering the socket id' }
                socketId.write(JSON.stringify(message))
              }
              break
            default:
              // broadcast to chat members
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
