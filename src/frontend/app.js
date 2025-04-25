document.addEventListener('DOMContentLoaded', () => {
    const deviceSelect = document.getElementById('chromecast-device');
    const refreshBtn = document.getElementById('refresh-btn');
    const videoPathInput = document.getElementById('video-path');
    const connectBtn = document.getElementById('connect-btn');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const playbackRateSelect = document.getElementById('playback-rate');
    const statusDiv = document.getElementById('status');

    const socket = io();
    let devices = [];

    function updateStatus(message, isError = false) {
        const icon = isError ? 'error' : 'check_circle';
        statusDiv.innerHTML = `
            <span class="material-icons">${icon}</span>
            ${message}
        `;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        
        // Add animation
        statusDiv.style.animation = 'none';
        statusDiv.offsetHeight; // Trigger reflow
        statusDiv.style.animation = 'fadeIn 0.3s ease-in-out';
    }

    async function makeRequest(endpoint, data) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    async function loadDevices() {
        try {
            const response = await fetch('/api/devices');
            devices = await response.json();
            updateDeviceList();
        } catch (error) {
            updateStatus('Failed to load devices', true);
        }
    }

    function updateDeviceList() {
        deviceSelect.innerHTML = devices.length
            ? devices.map(device => `<option value="${device.address}">${device.name}</option>`).join('')
            : '<option value="">No devices found</option>';
    }

    // Socket.io event handlers
    socket.on('deviceDiscovered', (device) => {
        if (!devices.some(d => d.address === device.address)) {
            devices.push(device);
            updateDeviceList();
            updateStatus(`Found Chromecast: ${device.name}`);
        }
    });

    // Event listeners
    refreshBtn.addEventListener('click', async () => {
        deviceSelect.innerHTML = '<option value="">Searching for devices...</option>';
        try {
            await makeRequest('discover', {});
            updateStatus('Searching for Chromecast devices...', false);
        } catch (error) {
            updateStatus('Failed to start device discovery', true);
        }
    });

    connectBtn.addEventListener('click', async () => {
        const address = deviceSelect.value;
        if (!address) {
            updateStatus('Please select a Chromecast device', true);
            return;
        }

        try {
            connectBtn.disabled = true;
            connectBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Connecting...';
            await makeRequest('connect', { address });
            updateStatus('Connected to Chromecast successfully');
        } catch (error) {
            updateStatus(`Connection failed: ${error.message}`, true);
        } finally {
            connectBtn.disabled = false;
            connectBtn.innerHTML = '<span class="material-icons">link</span> Connect';
        }
    });

    playBtn.addEventListener('click', async () => {
        const videoPath = videoPathInput.value.trim();
        if (!videoPath) {
            updateStatus('Please enter a video path', true);
            return;
        }

        try {
            playBtn.disabled = true;
            playBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Loading...';
            await makeRequest('play', { url: videoPath });
            updateStatus('Playing video');
        } catch (error) {
            updateStatus(`Failed to play video: ${error.message}`, true);
        } finally {
            playBtn.disabled = false;
            playBtn.innerHTML = '<span class="material-icons">play_arrow</span> Play Video';
        }
    });

    pauseBtn.addEventListener('click', async () => {
        try {
            await makeRequest('pause', {});
            updateStatus('Video paused');
        } catch (error) {
            updateStatus(`Failed to pause video: ${error.message}`, true);
        }
    });

    resumeBtn.addEventListener('click', async () => {
        try {
            await makeRequest('resume', {});
            updateStatus('Video resumed');
        } catch (error) {
            updateStatus(`Failed to resume video: ${error.message}`, true);
        }
    });

    rewindBtn.addEventListener('click', async () => {
        try {
            await makeRequest('rewind', {});
            updateStatus('Video rewound 10 seconds');
        } catch (error) {
            updateStatus(`Failed to rewind video: ${error.message}`, true);
        }
    });

    playbackRateSelect.addEventListener('change', async () => {
        const rate = parseFloat(playbackRateSelect.value);
        try {
            await makeRequest('setPlaybackRate', { rate });
            updateStatus(`Playback speed set to ${rate}x`);
        } catch (error) {
            updateStatus(`Failed to set playback speed: ${error.message}`, true);
        }
    });

    // Add touch feedback for mobile devices
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.98)';
        });
        button.addEventListener('touchend', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // Initial device discovery
    loadDevices();
}); 