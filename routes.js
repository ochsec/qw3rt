const res = require('express/lib/response')
const jwt = require('jsonwebtoken')
const { 
  createUserNewChat, 
  findAndJoinChat,
  getUsersInChat,
  getMessagesForChat,
} = require('./dao/service')

const addRoutes = (app) => {
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
    
      app.post('/join', async(req, res) => {
        console.log(`User ${req.body.username} has requested to join chat ${req.body.chatId}.`)
        try {
          const data = await findAndJoinChat(req.body.chatId, req.body.username)
          let response

          if (data.status === 'error') {
            response = { status: 'error', message: data.message }
          } else {
            const token = jwt.sign({
              username: data.username,
              chatId: data.chatId
            }, process.env.JWT_SECRET, { expiresIn: '30 days' })
            response = { 
              status: 'success', 
              token, 
              username: data.username, 
              chatId: data.chatId
            }
          }
          
          res.json(response)
        } catch (error) {
          console.log(error)
          res.json({ status: 'error', error })
        }
      })
    
      app.get('/:id', (req, res) => {
        res.render('chat', {chatId: req.params.id})
      })
    
      app.post('/:id', async (req, res) => {
        jwt.verify(req.body.token, process.env.JWT_SECRET, async (error, decoded) => {
          if (error) {
            res.json({ status: 'error', error })
          }

          console.log('decoded.username: ' + decoded.username)
          console.log('decoded.chatId: ' + decoded.chatId)
          if ((decoded.username === req.body.username) && (decoded.chatId === req.body.chatId)) {
            const messages = await getMessagesForChat(req.params.id)
            console.log('Got messages for chat')
            res.json({ status: 'success', message: 'jsonwebtoken verified', content: messages })
          } else {
            res.json({ status: 'error', message: "username or chatId don't match" })
          }
        })
      })  
    
      app.get('/', (req, res) => {
        res.render('index', {title: 'qw3rt', message: 'qw3rt'})
      })
}

module.exports = addRoutes