const apiKey = '';  // Ganti dengan API key yang sesuai
const apiEndpoint = 'http://localhost:3000/api/bard';

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const inputField = document.getElementById('input');
    const sendButton = document.getElementById('send');
    const clearButton = document.getElementById('clear');

    // Muat pesan dari localStorage saat halaman dimuat
    loadMessages();

    // Menyapa pengguna jika tidak ada pesan sebelumnya
    if (!localStorage.getItem('messages')) {
        addMessage('Halo! 👋\n\nSelamat datang di live chat kami. Bagaimana kami bisa membantu Anda hari ini?', 'bot');
    }

    sendButton.addEventListener('click', () => {
        const message = inputField.value.trim();
        if (message) {
            addMessage(message, 'user');
            inputField.value = '';
            sendMessage(message);
        }
    });

    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
        }
    });

    clearButton.addEventListener('click', () => {
        clearChat();
    });

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.innerHTML = formatMessage(text);  // Gunakan innerHTML untuk mendukung format HTML
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        saveMessages();
    }
    
    function formatMessage(message) {
        // Konversi judul
        message = message.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        message = message.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        message = message.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
        // Konversi teks tebal
        message = message.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
        // Konversi teks miring
        message = message.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
        // Konversi poin-poin
        message = message.replace(/^\* (.+)$/gm, '<ul><li>$1</li></ul>');
        // Menghindari elemen <ul> duplikat
        message = message.replace(/<\/ul>\s*<ul>/g, '');
    
        // Konversi gambar
        message = message.replace(/\[Image of Earth\]/g, '<img src="path-to-your-image.jpg" alt="Image of Earth">');
    
        // Menghapus tanda bintang satu yang tidak digunakan
        // Ini untuk kasus di mana bintang satu tidak diinginkan
        message = message.replace(/\*(?!\s|[\*\(\[])|(?<=\s)\*(?=\s|[\*\(\[])|(?<!\*)\*(?!\*)/g, '');
    
        return message;
    }    
    
    function saveMessages() {
        const messages = Array.from(messagesContainer.children).map(child => ({
            text: child.innerHTML,  // Simpan innerHTML untuk menjaga format
            sender: child.className.includes('user') ? 'user' : 'bot'
        }));
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    function loadMessages() {
        const savedMessages = localStorage.getItem('messages');
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            messages.forEach(message => addMessage(message.text, message.sender));
        }
    }

    function clearChat() {
        // Hapus semua pesan dari tampilan
        messagesContainer.innerHTML = '';
        // Hapus pesan dari localStorage
        localStorage.removeItem('messages');
        // Menyapa pengguna setelah menghapus chat
        addMessage('Halo! 👋\n\nSelamat datang kembali di live chat kami. Bagaimana kami bisa membantu Anda hari ini?', 'bot');
    }

    async function sendMessage(message) {
        try {
            const messages = Array.from(messagesContainer.children).map(child => ({
                text: child.innerHTML,
                sender: child.className.includes('user') ? 'user' : 'bot'
            }));
    
            // Ambil satu pesan bot terakhir, kecuali pesan sapaan awal
            let previousBotResponse = '';
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].sender === 'bot' && !messages[i].text.includes('Halo!')) {
                    previousBotResponse = messages[i].text;
                    break;
                }
            }
    
            // Gabungkan pesan sebelumnya dengan pesan saat ini
            let messageText = previousBotResponse ? previousBotResponse + '\n' : '';
            messageText += message;
    
            // Hapus elemen HTML dan baris baru
            messageText = stripHtml(messageText);
            messageText = messageText.replace(/\s+/g, ' ').trim();
    
            console.log(messageText);
    
            const response = await axios.get(`${apiEndpoint}?q=${encodeURIComponent(message)}&apikey=${apiKey}`);
            const responseData = response.data;
            if (responseData.status) {
                addMessage(responseData.data.message, 'bot');
            } else {
                addMessage('Terjadi kesalahan, coba lagi nanti.', 'bot');
            }
        } catch (error) {
            addMessage('Terjadi kesalahan, coba lagi nanti.', 'bot');
        }
    }
    

    // Fungsi untuk menghapus elemen HTML
    function stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }
});
