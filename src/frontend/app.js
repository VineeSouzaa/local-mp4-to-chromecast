document.addEventListener('DOMContentLoaded', () => {
    const deviceSelect = document.getElementById('chromecast-device');
    const refreshBtn = document.getElementById('refresh-btn');
    const videoFileInput = document.getElementById('video-file');
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

    socket.on('status', (status) => {
        updateStatus(`Player status: ${status.playerState}`);
    });

    socket.on('error', (error) => {
        updateStatus(error, true);
    });

    // Event listeners
    refreshBtn.addEventListener('click', () => {
        deviceSelect.innerHTML = '<option value="">Searching for devices...</option>';
        devices = [];
        updateStatus('Searching for Chromecast devices...');
    });

    playBtn.addEventListener('click', () => {
        const file = videoFileInput.files[0];
        const address = deviceSelect.value;

        if (!file) {
            updateStatus('Please select a video file first', true);
            return;
        }

        if (!address) {
            updateStatus('Please select a Chromecast device first', true);
            return;
        }

        try {
            playBtn.disabled = true;
            playBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Playing...';
            
            socket.emit('play', {
                address: address,
                filePath: file.path
            });
            
            updateStatus('Playing video...');
        } catch (error) {
            updateStatus(`Failed to play video: ${error.message}`, true);
        } finally {
            playBtn.disabled = false;
            playBtn.innerHTML = '<span class="material-icons">play_arrow</span> Play Video';
        }
    });

    pauseBtn.addEventListener('click', () => {
        const address = deviceSelect.value;
        if (!address) {
            updateStatus('Please select a Chromecast device first', true);
            return;
        }
        socket.emit('pause', { address });
    });

    resumeBtn.addEventListener('click', () => {
        const address = deviceSelect.value;
        if (!address) {
            updateStatus('Please select a Chromecast device first', true);
            return;
        }
        socket.emit('resume', { address });
    });

    rewindBtn.addEventListener('click', () => {
        const address = deviceSelect.value;
        if (!address) {
            updateStatus('Please select a Chromecast device first', true);
            return;
        }
        socket.emit('rewind', { address });
    });

    playbackRateSelect.addEventListener('change', () => {
        const address = deviceSelect.value;
        const rate = parseFloat(playbackRateSelect.value);
        
        if (!address) {
            updateStatus('Please select a Chromecast device first', true);
            return;
        }
        
        socket.emit('setPlaybackRate', { address, rate });
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
}); 