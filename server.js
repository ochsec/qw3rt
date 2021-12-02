require('dotenv').config()
const path = require('path')
const http = require('http')
const express = require('express')
const sockjs = require('sockjs')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const PORT = 9999
const clients = {}

function broadcast(message) {
  for (let client in clients) {
    clients[client].write(JSON.stringify(message))
  }
}

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'pug')

app.get('/', function(req, res) {
  res.render('index', {title: 'qw3rt', message: 'qw3rt'})
})

const server = http.createServer(app);

const chatIO = sockjs.createServer()
chatIO.on('connection', function(conn) {
  clients[conn.id] = conn

  conn.on('data', function(message) {
    console.log(message)
    broadcast(JSON.parse(message))
  })

  conn.on('close', function() {
    delete clients[conn.id] 
  })
})

chatIO.installHandlers(server, {prefix: "/chat"})

server.listen(PORT, '0.0.0.0')
