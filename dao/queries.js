const mongoose = require('mongoose')
const { v4 } = require('uuid')
const { userSchema, messageSchema } = require('./schemas')
const User = mongoose.model('User', userSchema)
const Message = mongoose.model('Message', messageSchema)

const findOneUserInChat = async (username, chatId) => {
  try {
    const user = User.findOne({username, chatId})
    return user
  } catch (error) {
    return error
  }
}

const createUser = async ({username, chatId, socketId}) => {
  const user = new User({
    username,
    status: 'online',
    chatId,
    socketId
  })
  try {
    const result = await user.save()
    return result

  } catch (error) {
    return error
  }
}

const findUsersInChat = async (chatId) => {
  try {
    const result = User.find({chatId})
    return result
  } catch (error) {
    return error
  }
}

module.exports = {
  createUser,
  findOneUserInChat,
  findUsersInChat,
}
