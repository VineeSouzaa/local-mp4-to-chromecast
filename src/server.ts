import express from 'express';
import cors from 'cors';
import { Client, DefaultMediaReceiver, Player, Media, PlayerStatus } from 'castv2-client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client as SSDPClient, SsdpHeaders } from 'node-ssdp';

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

let discoveredDevices: any[] = [];
let activeConnections: Map<string, { client: Client; player: Player }> = new Map();

// SSDP Client for device discovery
const ssdpClient = new SSDPClient();

ssdpClient.on('response', (headers: SsdpHeaders, statusCode: number, rinfo: any) => {
  if (headers.ST === 'urn:dial-multiscreen-org:service:dial:1') {
    const device = {
      address: rinfo.address,
      name: headers.USN || 'Unknown Chromecast'
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

// Helper function to get active connection
function getActiveConnection(address: string) {
  const connection = activeConnections.get(address);
  if (!connection) {
    throw new Error('No active connection to Chromecast');
  }
  return connection;
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected');
    startDiscovery(); // Start discovery when a client connects

    socket.on('play', async (data: { address: string; filePath: string }) => {
      console.log('socket play')
        try {
            const client = new Client();
            client.connect(data.address, () => {
                client.launch(DefaultMediaReceiver, (err, player) => {
                    if (err) {
                        socket.emit('error', err.message);
                        return;
                    }

                    // Store the active connection
                    activeConnections.set(data.address, { client, player: player! });

                    const media: Media = {
                        contentId: `file://${data.filePath}`,
                        contentType: 'video/mp4',
                        streamType: 'BUFFERED'
                    };

      
                    player?.on('status', (status: PlayerStatus) => {
                        socket.emit('status', status);
                    });

                    player?.load(media, { autoplay: true }, (err, status) => {
                        if (err) {
                            socket.emit('error', err.message);
                            return;
                        }
                        if (status) {
                            socket.emit('status', status);
                        }
                    });
                });
            });
        } catch (error) {
            if (error instanceof Error) {
                socket.emit('error', error.message);
            } else {
                socket.emit('error', 'An unknown error occurred');
            }
        }
    });

    socket.on('pause', (data: { address: string }) => {
      console.log('socket pause')
        try {
            const { player } = getActiveConnection(data.address);
            player.pause();
        } catch (error) {
            if (error instanceof Error) {
                socket.emit('error', error.message);
            } else {
                socket.emit('error', 'Failed to pause video');
            }
        }
    });

    socket.on('resume', (data: { address: string }) => {
      console.log('socket resume')
        try {
            const { player } = getActiveConnection(data.address);
            player.play();
        } catch (error) {
            if (error instanceof Error) {
                socket.emit('error', error.message);
            } else {
                socket.emit('error', 'Failed to resume video');
            }
        }
    });

    socket.on('rewind', (data: { address: string }) => {
      console.log('socket rewind')
        try {
            const { player } = getActiveConnection(data.address);
            player.getStatus((err, status) => {
                if (err) {
                    socket.emit('error', err.message);
                    return;
                }
                const currentTime = status?.currentTime || 0;
                const newTime = Math.max(0, currentTime - 10); // Rewind 10 seconds
                player.seek(newTime);
            });
        } catch (error) {
            if (error instanceof Error) {
                socket.emit('error', error.message);
            } else {
                socket.emit('error', 'Failed to rewind video');
            }
        }
    });

    socket.on('setPlaybackRate', (data: { address: string; rate: number }) => {
      console.log('socket setPlaybackRate')
        try {
            const { player } = getActiveConnection(data.address);
            player.setPlaybackRate(data.rate);
        } catch (error) {
            if (error instanceof Error) {
                socket.emit('error', error.message);
            } else {
                socket.emit('error', 'Failed to set playback rate');
            }
        }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnect')
        console.log('Client disconnected');
        // Clean up active connections
        activeConnections.forEach(({ client }) => {
            client.close();
        });
        activeConnections.clear();
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 