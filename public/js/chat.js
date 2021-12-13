const sock = new SockJS('https://qw3rt.ochsec1.repl.co/chat')

const message = document.getElementById('message')
const sendBtn = document.getElementById('send-btn')
let username
let chatId

function checkForSessionVariables() {
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
}

document.addEventListener('DOMContentLoaded', checkForSessionVariables)
