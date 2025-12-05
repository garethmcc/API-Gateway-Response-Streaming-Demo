const output = document.getElementById('output');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const progressFill = document.getElementById('progressFill');
const apiEndpointInput = document.getElementById('apiEndpoint');

// Load saved endpoint from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedEndpoint = localStorage.getItem('apiEndpoint');
    if (savedEndpoint) {
        apiEndpointInput.value = savedEndpoint;
    }
});

// Save endpoint to localStorage when it changes
apiEndpointInput.addEventListener('change', () => {
    localStorage.setItem('apiEndpoint', apiEndpointInput.value);
});

async function startStream() {
    const apiUrl = apiEndpointInput.value.trim();

    // Validate endpoint URL
    if (!apiUrl) {
        updateStatus('error', 'Status: Error - Please enter an API endpoint URL');
        addMessage('Error: API endpoint URL is required', 'error');
        return;
    }

    try {
        new URL(apiUrl);
    } catch (e) {
        updateStatus('error', 'Status: Error - Invalid URL format');
        addMessage('Error: Please enter a valid URL', 'error');
        return;
    }

    // Clear previous output
    output.innerHTML = '';
    progressFill.style.width = '0%';

    // Update UI state
    startBtn.disabled = true;
    updateStatus('streaming', 'Status: Streaming data...');

    try {
        addMessage('Connecting to stream endpoint...', 'info');
        addMessage('URL: ' + apiUrl, 'info');

        // Use Fetch API with streaming
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        addMessage('Connection established. Receiving data...', 'info');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Read the stream
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                addMessage('Stream completed successfully!', 'success');
                updateStatus('complete', 'Status: Complete');
                startBtn.disabled = false;
                break;
            }

            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // Keep incomplete message in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonData = line.substring(6);
                    try {
                        const data = JSON.parse(jsonData);

                        if (data.error) {
                            addMessage(`Error: ${data.error}`, 'error');
                        } else {
                            addMessage(`[${data.id}] ${data.message}`, 'data');

                            // Update progress bar
                            if (data.progress !== undefined) {
                                progressFill.style.width = data.progress + '%';
                            }
                        }
                    } catch (e) {
                        console.error('Failed to parse JSON:', e);
                        addMessage(`Received: ${jsonData}`, 'data');
                    }
                }
            }
        }
    } catch (error) {
        console.error('Streaming error:', error);
        addMessage('Error: ' + error.message, 'error');
        updateStatus('error', 'Status: Error - ' + error.message);
        startBtn.disabled = false;
    }
}

function addMessage(text, type = 'data') {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type;

    const timestamp = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `
        <div>${escapeHtml(text)}</div>
        <div class="timestamp">${timestamp}</div>
    `;

    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
}

function updateStatus(statusType, text) {
    status.className = 'status ' + statusType;
    status.textContent = text;
}

function clearOutput() {
    output.innerHTML = '';
    progressFill.style.width = '0%';
    updateStatus('idle', 'Status: Ready');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow Enter key to start stream
apiEndpointInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !startBtn.disabled) {
        startStream();
    }
});
