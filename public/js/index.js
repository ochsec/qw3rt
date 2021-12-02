const sock = new SockJS('https://qw3rt.ochsec1.repl.co/chat')

const username = document.getElementById('username')
const invalidUsername = document.getElementById('invalid-username')
const chatId = document.getElementById('chat-id')
const invalidChatId = document.getElementById('invalid-chat-id')
const joinBtn = document.getElementById('join-btn')
const createBtn = document.getElementById('create-btn')

const usernameIsValid = () => {
  if (!username.textContent) {
    invalidUsername.style.visibility = 'visible'
    return false
  }
  return true
}
const chatIdIsValid = () => {
  if (!chatId.textContent) {
    invalidChatId.style.visibility = 'visible'
    return false
  }
  return true
}
const onUsernameChange = (e) => {
  invalidUsername.style.visibility = 'hidden'
  username.textContent = e.target.value
}
const onChatIdChange = (e) => {
  invalidChatId.style.visibility= 'hidden'
  chatId.textContent = e.target.value
}
const onJoinClicked = () => {
  const uValid = usernameIsValid()
  const cValid = chatIdIsValid()
  if (!uValid || !cValid) return
}
const onCreateClicked = () => {
  if (!usernameIsValid()) return
}

username.addEventListener('input', onUsernameChange)
chatId.addEventListener('input', onChatIdChange)
joinBtn.addEventListener('click', onJoinClicked)
createBtn.addEventListener('click', onCreateClicked)
