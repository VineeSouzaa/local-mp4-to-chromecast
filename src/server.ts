import express from 'express';
import cors from 'cors';
import { Client, DefaultMediaReceiver } from 'castv2-client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client as SSDPClient } from 'node-ssdp';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('src/frontend'));

let chromecastClient: Client | null = null;
let currentMedia: any = null;
let discoveredDevices: any[] = [];

// SSDP Client for device discovery
const ssdpClient = new SSDPClient();

ssdpClient.on('response', (headers: any, statusCode: number, rinfo: any) => {
  if (headers.ST === 'urn:dial-multiscreen-org:service:dial:1') {
    const device = {
      address: rinfo.address,
      name: headers['FRIENDLY-NAME'] || 'Unknown Chromecast'
    };
    
    if (!discoveredDevices.some(d => d.address === device.address)) {
      discoveredDevices.push(device);
      io.emit('deviceDiscovered', device);
    }
  }
});

// Start device discovery
function startDiscovery() {
  discoveredDevices = [];
  ssdpClient.search('urn:dial-multiscreen-org:service:dial:1');
}

// Connect to Chromecast
async function connectToChromecast(host: string) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    
    client.connect(host, () => {
      console.log('Connected to Chromecast');
      client.launch(DefaultMediaReceiver, (err: any, player: any) => {
        if (err) {
          reject(err);
          return;
        }
        chromecastClient = client;
        currentMedia = player;
        resolve(player);
      });
    });

    client.on('error', (err: any) => {
      console.error('Error:', err);
      client.close();
      reject(err);
    });
  });
}

// API endpoints
app.get('/api/devices', (req, res) => {
  res.json(discoveredDevices);
});

app.post('/api/discover', (req, res) => {
  startDiscovery();
  res.json({ success: true });
});

app.post('/api/connect', async (req, res) => {
  try {
    const { address } = req.body;
    await connectToChromecast(address);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to Chromecast' });
  }
});

app.post('/api/play', async (req, res) => {
  try {
    const { url } = req.body;
    if (!currentMedia) {
      throw new Error('Not connected to Chromecast');
    }

    const media = {
      contentId: url,
      contentType: 'video/mp4',
      streamType: 'BUFFERED',
      autoplay: true
    };

    currentMedia.load(media, { autoplay: true }, (err: any) => {
      if (err) {
        throw err;
      }
      res.json({ success: true });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to play media' });
  }
});

app.post('/api/pause', (req, res) => {
  try {
    if (!currentMedia) {
      throw new Error('Not connected to Chromecast');
    }
    currentMedia.pause();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pause media' });
  }
});

app.post('/api/resume', (req, res) => {
  try {
    if (!currentMedia) {
      throw new Error('Not connected to Chromecast');
    }
    currentMedia.play();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resume media' });
  }
});

app.post('/api/rewind', (req, res) => {
  try {
    if (!currentMedia) {
      throw new Error('Not connected to Chromecast');
    }
    currentMedia.getStatus((err: any, status: any) => {
      if (err) {
        throw err;
      }
      const currentTime = status.currentTime || 0;
      const newTime = Math.max(0, currentTime - 10); // Rewind 10 seconds
      currentMedia.seek(newTime, (err: any) => {
        if (err) {
          throw err;
        }
        res.json({ success: true });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rewind media' });
  }
});

app.post('/api/setPlaybackRate', (req, res) => {
  try {
    const { rate } = req.body;
    if (!currentMedia) {
      throw new Error('Not connected to Chromecast');
    }
    currentMedia.setPlaybackRate(rate);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set playback rate' });
  }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  startDiscovery(); // Start discovery when a client connects
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 