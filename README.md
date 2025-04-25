# Chromecast Stream Controller

A modern web application that allows you to stream local video files to your Chromecast devices with full playback controls.

![Demo](demo.gif)

## Features

- 🔍 Automatic Chromecast device discovery
- 📺 Stream local video files directly to Chromecast
- 🎮 Full playback controls:
  - Play/Pause
  - Rewind 10 seconds
  - Adjust playback speed (0.5x to 2x)
- 🎨 Modern, responsive UI with Material Design icons
- 🔄 Real-time status updates
- 🚀 Built with TypeScript for better reliability

## How It Works

The application consists of two main components:

1. **Frontend**: A modern web interface that:
   - Discovers Chromecast devices on your network
   - Allows you to select local video files
   - Provides playback controls
   - Shows real-time status updates

2. **Backend**: A Node.js server that:
   - Uses SSDP to discover Chromecast devices
   - Handles file streaming to Chromecast
   - Manages playback controls
   - Provides real-time updates via Socket.IO

## Prerequisites

- Node.js 16.x or later
- A Chromecast device on your local network
- Modern web browser (Chrome, Firefox, Edge)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chromecast-stream.git
   cd chromecast-stream
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

The server will automatically restart when you make changes to the source files.

## Building for Production

1. Build the TypeScript files:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── frontend/           # Frontend code
│   ├── index.html     # Main HTML file
│   ├── app.js         # Frontend JavaScript
│   └── styles.css     # Styles
├── server.ts          # Backend server
└── types/             # TypeScript type definitions
```

## Technologies Used

- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Socket.IO Client
  - Material Icons

- **Backend**:
  - Node.js
  - Express
  - Socket.IO
  - node-ssdp
  - castv2-client
  - TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [node-ssdp](https://github.com/diversario/node-ssdp) for device discovery
- [castv2-client](https://github.com/thibauts/node-castv2-client) for Chromecast communication
- [Socket.IO](https://socket.io/) for real-time communication 