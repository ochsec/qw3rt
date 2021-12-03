const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  status: String,
  chatId: String,
  socketId: String,
})

const messageSchema = new Schema({
  content: {
    type: String,
    maxLength: 2000,
    minLength: 1,
  },
  username: String,
  chatId: String,
})

module.exports = {
  userSchema,
  messageSchema,
}

