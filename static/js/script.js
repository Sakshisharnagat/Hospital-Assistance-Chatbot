const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Auto-focus input on load
window.onload = () => {
    userInput.focus();
};

// Send message on Enter key
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Clear input
    userInput.value = '';
    
    // Disable input while processing
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Append User Message
    appendMessage('user', text);

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        
        // Remove typing indicator
        removeMessage(typingId);

        // Render Markdown to HTML using marked.js
        const htmlResponse = marked.parse(data.response);

        // Append Bot Message
        appendHTMLMessage('bot', htmlResponse);

    } catch (error) {
        console.error('Error:', error);
        removeMessage(typingId);
        appendMessage('bot', 'Sorry, I am having trouble connecting to the server. Please check your connection.');
    } finally {
        // Re-enable input
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    
    if (sender === 'bot') {
        avatarDiv.innerHTML = '<i class="fa-solid fa-robot"></i>';
    } else {
        avatarDiv.innerHTML = '<i class="fa-solid fa-user"></i>';
    }

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // Create a paragraph to hold simple text
    const p = document.createElement('p');
    p.textContent = text;
    contentDiv.appendChild(p);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatBox.appendChild(messageDiv);
    scrollToBottom();
}

// For parsing Markdown HTML
function appendHTMLMessage(sender, htmlContent) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    
    if (sender === 'bot') {
        avatarDiv.innerHTML = '<i class="fa-solid fa-robot"></i>';
    } else {
        avatarDiv.innerHTML = '<i class="fa-solid fa-user"></i>';
    }

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = htmlContent;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatBox.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const typingId = 'typing-' + Date.now();
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot');
    messageDiv.id = typingId;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.innerHTML = '<i class="fa-solid fa-robot"></i>';

    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(typingIndicator);

    chatBox.appendChild(messageDiv);
    scrollToBottom();
    
    return typingId;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}