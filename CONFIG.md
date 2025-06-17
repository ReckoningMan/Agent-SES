# Small Engine Parts Agent - Configuration and Documentation

## Overview

The Small Engine Parts Agent is a comprehensive web application for searching small engine parts across multiple dealer websites, finding local used mowers, and cross-referencing part numbers between different numbering systems. This document outlines the system's current functionality, configuration options, and potential enhancements.

## Current Features

### 1. Multi-Dealer Parts Search
- Searches across multiple dealer websites, including:
  - PartsTree
  - Stens
  - Rotary
  - JacksSmallEngine
  - MedArt
  - MarrsBro
- Supports priority dealers (Stens and Rotary) that preserve all results even when duplicate part numbers exist
- Displays search results in a user-friendly interface with part details, pricing, and availability

### 2. Local Used Mowers Search
- Searches for used mowers from private sellers within a 30-mile radius of Shawnee, OK 74804
- Displays listings with images, pricing, location, and distance
- Connects to local classifieds and marketplace listings

### 3. Cross-Reference Functionality
- Cross-references part numbers between different numbering systems (OEM, aftermarket)
- Extracts potential cross-references from search results
- Performs secondary searches based on discovered cross-references
- Prioritizes cross-references based on likelihood of being useful (dash format, length, etc.)

### 4. User Interface Features
- Tab navigation system for switching between parts search and local mower search
- Search history tracking and recall
- Embedded website viewer for direct access to dealer websites

## Configuration Options

### Priority Dealers Configuration

Priority dealers (currently Stens and Rotary) always show all results even when duplicate part numbers exist from other dealers. To modify the priority dealer list:

```jsx
// In ResultPanel.jsx, modify the priorityDealers array:
const priorityDealers = ['stens', 'rotary']; // Add or remove dealers as needed
```

### Local Mower Search Configuration

The local mower search is configured with a default location and radius. To modify these settings:

```jsx
// In LocalMowerSearch.jsx:
<LocalMowerSearch radius={30} location="Shawnee, OK 74804" /> // Change radius (miles) or location
```

### Cross-Reference Search Depth

The cross-reference search can be configured for depth and maximum number of cross-references to search:

```javascript
// In taskQueue.js, modify the runCrossReferenceSearch options:
const searchDepth = options.depth || 1; // Increase for deeper searches (more resource-intensive)
const maxCrossRefs = options.maxCrossRefs || 3; // Increase for more comprehensive searches
```

## Adding New Search Sources

To add a new search source (like Sears Parts Direct), follow these steps:

### 1. Create a new scraper module
Create a new JavaScript file in the `agent/sites/` directory, e.g., `searspartsdirect.js`:

```javascript
// Example structure for a new scraper
module.exports = async function scrapeSearsPartsDirect(page, query) {
  try {
    // Navigate to the site
    await page.goto(`https://www.searspartsdirect.com/search/${query}`);
    
    // Wait for results to load
    await page.waitForSelector('.search-results-item', { timeout: 10000 });
    
    // Extract data
    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.search-results-item'));
      return items.map(item => ({
        title: item.querySelector('.product-title')?.innerText || 'Unknown Part',
        partNumber: item.querySelector('.product-number')?.innerText || 'N/A',
        price: item.querySelector('.price')?.innerText || 'Price not available',
        imageUrl: item.querySelector('img')?.src || '',
        link: item.querySelector('a')?.href || '',
        description: item.querySelector('.product-description')?.innerText || '',
        crossReferences: [], // Extract cross-references if available
        inStock: item.querySelector('.availability')?.innerText || 'Unknown',
        site: 'searspartsdirect.com'
      }));
    });
    
    return results;
  } catch (error) {
    console.error('Error scraping Sears Parts Direct:', error);
    return []; // Return empty array on error
  }
};
```

### 2. Update the sites index file
Add the new scraper to `agent/sites/index.js`:

```javascript
module.exports = {
  partstree: require('./partstree'),
  stens: require('./stens'),
  rotary: require('./rotary'),
  jackssmallengine: require('./jackssmallengine'),
  medart: require('./medart'),
  marrsbro: require('./marrsbro'),
  searspartsdirect: require('./searspartsdirect') // Add the new scraper
};
```

### 3. Update the UI to include the new site
Add the site to the MarketplaceTabs component:

```jsx
// In MarketplaceTabs.jsx
const sites = [
  {
    name: 'PartsTree',
    domain: 'partstree.com',
    icon: 'partstree-icon.png',
    baseUrl: 'https://www.partstree.com/search/?q='
  },
  // ... other sites ...
  {
    name: 'Sears Parts Direct',
    domain: 'searspartsdirect.com',
    icon: 'sears-icon.png',
    baseUrl: 'https://www.searspartsdirect.com/search/'
  }
];
```

## Adding a Settings Area to the UI

To add a settings area for adding new website search tabs, consider implementing a Settings component:

```jsx
// Settings.jsx 
import React, { useState, useEffect } from 'react';

const Settings = ({ onSave }) => {
  const [settings, setSettings] = useState({
    priorityDealers: ['stens', 'rotary'],
    searchRadius: 30,
    defaultLocation: 'Shawnee, OK 74804',
    searchSites: [
      { name: 'PartsTree', enabled: true },
      { name: 'Stens', enabled: true },
      // ... other sites
    ]
  });
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(settings);
  };
  
  // Handle dealer priority toggle
  const togglePriorityDealer = (dealer) => {
    setSettings(prev => {
      if (prev.priorityDealers.includes(dealer)) {
        return {
          ...prev,
          priorityDealers: prev.priorityDealers.filter(d => d !== dealer)
        };
      } else {
        return {
          ...prev,
          priorityDealers: [...prev.priorityDealers, dealer]
        };
      }
    });
  };
  
  // Handle site toggle
  const toggleSite = (siteName) => {
    setSettings(prev => {
      const updatedSites = prev.searchSites.map(site => {
        if (site.name === siteName) {
          return { ...site, enabled: !site.enabled };
        }
        return site;
      });
      
      return { ...prev, searchSites: updatedSites };
    });
  };
  
  // Render the form
  return (
    <div className="bg-white p-6 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Application Settings</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Search Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Search Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Search Radius (miles)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={settings.searchRadius}
                onChange={(e) => setSettings({...settings, searchRadius: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Default Location</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={settings.defaultLocation}
                onChange={(e) => setSettings({...settings, defaultLocation: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        {/* Priority Dealers */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Priority Dealers</h3>
          <p className="text-sm text-gray-600 mb-2">
            Priority dealers will always show all results, even when duplicate part numbers exist.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {settings.searchSites.map((site) => (
              <div key={site.name} className="flex items-center">
                <input
                  type="checkbox"
                  id={`priority-${site.name}`}
                  checked={settings.priorityDealers.includes(site.name.toLowerCase())}
                  onChange={() => togglePriorityDealer(site.name.toLowerCase())}
                  className="mr-2"
                />
                <label htmlFor={`priority-${site.name}`}>{site.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Search Sites */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Search Sites</h3>
          <p className="text-sm text-gray-600 mb-2">
            Enable or disable search sites.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {settings.searchSites.map((site) => (
              <div key={site.name} className="flex items-center">
                <input
                  type="checkbox"
                  id={`site-${site.name}`}
                  checked={site.enabled}
                  onChange={() => toggleSite(site.name)}
                  className="mr-2"
                />
                <label htmlFor={`site-${site.name}`}>{site.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add New Site Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Add New Search Site</h3>
          {/* Form fields for adding a new site */}
          {/* ... */}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
```

## Future Enhancements

1. **Sears Parts Direct Integration**
   - Add scraper for Sears Parts Direct website
   - Integrate Sears Parts Direct into UI

2. **Enhanced Cross-Reference System**
   - Build a database of known cross-references
   - Improve pattern matching for identifying part numbers in descriptions
   - Add user-contributed cross-references

3. **Model Number Cheat Sheet**
   - Create a reference guide for different model number formats by brand
   - Add tooltips in the UI to help users understand part numbering schemes

4. **Expanded Local Search**
   - Add support for searching within user-specified locations
   - Integrate with more local classifieds and marketplace websites
   - Add filtering options for mower type, brand, and price range

5. **User Accounts**
   - Save search history across sessions
   - Allow saving favorite parts and cross-references
   - Create email alerts for price drops or inventory changes

6. **Mobile App Integration**
   - Develop companion mobile app for in-store part lookup
   - Add barcode/QR code scanning for quick part identification

7. **Analytics Dashboard**
   - Track most searched parts and brands
   - Identify trends in part popularity and pricing
   - Generate reports for inventory planning

## Troubleshooting

### Common Issues

1. **Search results not appearing**
   - Check browser console for errors
   - Verify that the search query is valid (part number or description)
   - Check if the dealer website is accessible directly

2. **Cross-references not found**
   - Some parts may not have known cross-references
   - Try searching with and without dashes in part numbers
   - Try adding a manufacturer name to the search query

3. **Local mower search returning no results**
   - Verify location settings
   - Try expanding the search radius
   - Check if mock data is being used (development mode)

### Debugging Tools

Debugging tools for troubleshooting search issues:

1. Agent test scripts:
   - `test-scraper.js` - Tests individual scrapers
   - `test-cross-reference.js` - Tests cross-reference functionality
   - `integrated-cross-ref-test.js` - Tests end-to-end cross-reference workflow

2. Developer Tools:
   - Check browser console (F12) for errors
   - Network tab can show API requests and responses
   - React Developer Tools extension helps debug component state

## Contact and Support

For questions, suggestions, or issues:
- GitHub Repository: [github.com/username/smallenginepartsagent](https://github.com/username/smallenginepartsagent)
- Documentation: [docs.smallenginepartsagent.com](https://docs.smallenginepartsagent.com)
- Email Support: support@smallenginepartsagent.com
