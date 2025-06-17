# Small Engine Parts Agent

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-active-green)

An automated system for searching small engine parts across multiple dealers, finding local used equipment, and cross-referencing part numbers between different manufacturer systems.

## Core Features

- 🔍 **Multi-Dealer Search**: Search across PartsTree, Stens, Rotary, JacksSmallEngine, Sears Parts Direct, and more
- 🚜 **Local Used Mower Search**: Find used equipment within a 30-mile radius of Shawnee, OK
- 🔄 **Cross-Reference System**: Translate between OEM and aftermarket part numbers
- 📊 **Priority Dealers**: Preserve all results from priority dealers (Stens and Rotary)
- 💰 **Price Comparison**: Compare prices across multiple sources
- 📱 **Modern UI**: Clean, responsive interface with tab navigation

## Project Structure

```
SmallEnginePartsAgent/
├── agent/               # Web scraping agent code
│   ├── sites/          # Scrapers for individual websites
│   ├── taskQueue.js    # Task management for searches
│   └── poolManager.js  # Browser management
├── Client/             # React frontend application
│   ├── components/     # UI components
│   ├── services/       # API and service integrations
│   └── public/         # Static assets
├── CONFIG.md           # Configuration documentation
└── MODEL_NUMBER_CHEATSHEET.md  # Part number reference guide
```

## Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/smallenginepartsagent.git
cd smallenginepartsagent
```

2. Install dependencies:
```bash
npm install
cd Client
npm install
cd ../agent
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Basic Usage

1. **Search for parts**:
   - Enter a part number or description in the search box
   - View results from multiple dealers
   - Click on part listings to see details

2. **Search for local used mowers**:
   - Click on the "Local Used Mowers" tab
   - View listings within 30 miles of Shawnee, OK
   - Click "Refresh" to update listings

3. **Cross-reference parts**:
   - Search for a part number
   - The system automatically finds and displays cross-references
   - Click on a cross-referenced part to search for it directly

## Technology Stack

- **Frontend**: React + Framer Motion + TailwindCSS
- **Scraping**: Puppeteer for headless browser automation
- **Data Processing**: Custom cross-reference system using pattern matching
- **Location Services**: Browser geolocation with distance calculation

## Documentation

- [CONFIG.md](./CONFIG.md) - Detailed configuration options and enhancement plans
- [MODEL_NUMBER_CHEATSHEET.md](./MODEL_NUMBER_CHEATSHEET.md) - Part numbering reference guide

## Testing

Run various test scripts to verify functionality:

```bash
# Test all scrapers
node agent/test-all-scrapers.js

# Test cross-reference functionality
node agent/test-cross-reference.js

# Run integrated cross-reference test
node agent/integrated-cross-ref-test.js
```

## Available Scripts

- `npm start`: Start the application
- `npm run dev`: Start development environment with hot reloading
- `npm run build`: Build the application for production
- `npm test`: Run the test suite

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details
