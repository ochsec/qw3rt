const sock = new SockJS('https://qw3rt.ochsec1.repl.co/chat')

const message = document.getElementById('message')
const sendBtn = document.getElementById('send-btn')
/**
 * Message format
 * {
 *  username,
 *  message,
 *  datetime
 * }
 */
let messages = []
let username
let chatId

const checkForSessionVariables = async () => {
    const urlSplit = window.location.href.split('/')
    const chatIdFromUrl = urlSplit[urlSplit.length - 1]
    username = sessionStorage.getItem('username')
    chatId = sessionStorage.getItem('chatId')


    if (!username) {
        window.location.href = '/'
    }

    if (!chatId || (chatId !== chatIdFromUrl)) {
        window.location.href = '/'
    }

    // Todo: Verify user
    // fetch('/verify', {
    //     method: 'POST',
    //     cache: 'no-cache',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         username,
    //         chatId
    //     })
    // })
    // .then(response => response.json())
    // .then(data => {

    // })
}

document.addEventListener('DOMContentLoaded', checkForSessionVariables)

sock.onmessage = (e) => {
  const data = JSON.parse(e.data)
    messages.push(data)
    console.log('Build message component')
}

const onSendClicked = () => {
    const msg = message
    if (msg.textContent.length === 0) {
        return
    }

    const sendData = {
        username,
        message: msg.textContent
    }    

    sock.send(JSON.stringify(sendData))
}
