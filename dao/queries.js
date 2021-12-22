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

const createUser = async ({username, chatId}) => {
  const user = new User({
    username,
    status: 'online',
    chatId
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

const updateUser = async ({username, chatId, socketId}) => {
  const filter = { username, chatId }
  const update = { socketId }
  try {
    const result = await User.findOneAndUpdate(filter, update, { new: true })
    return result
  } catch (error) {
    return error
  }
}

const findMessagesForChat = async (chatId) => {
  try {
    const result = await Message.find({chatId})
    return result
  } catch (error) {
    return error
  }
}

const createMessage = async ({content, username, chatId}) => {
  const message = new Message({
    content, username, chatId
  })
  try {
    const result = await message.save()
    return result
  } catch (error) {
    return error
  }
}

module.exports = {
  createUser,
  findOneUserInChat,
  findUsersInChat,
  updateUser,
  findMessagesForChat,
  createMessage,
}
