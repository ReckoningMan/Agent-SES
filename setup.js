const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
};

console.log(`${colors.bright}Setting up Small Engine Parts Agent...${colors.reset}\n`);

const directories = ['backend', 'frontend', 'scrapers'];
let success = true;

// Function to run npm install in a directory
function installDependencies(dir) {
    try {
        console.log(`\n${colors.blue}Installing dependencies in ${dir}...${colors.reset}`);
        execSync('npm install', {
            cwd: path.join(__dirname, dir),
            stdio: 'inherit'
        });
        console.log(`${colors.green}✓ Dependencies installed successfully in ${dir}${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Failed to install dependencies in ${dir}:${colors.reset}`, error.message);
        return false;
    }
}

// Check if directories exist
directories.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, dir))) {
        console.error(`${colors.red}✗ Directory '${dir}' not found${colors.reset}`);
        success = false;
    }
});

if (!success) {
    console.error(`\n${colors.red}Setup failed: Missing required directories${colors.reset}`);
    process.exit(1);
}

// Install dependencies in each directory
directories.forEach(dir => {
    if (!installDependencies(dir)) {
        success = false;
    }
});

// Create necessary directories for data storage
const dataDirs = [
    path.join(__dirname, 'backend/data'),
    path.join(__dirname, 'scrapers/results'),
    path.join(__dirname, 'frontend/build')
];

dataDirs.forEach(dir => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`${colors.green}✓ Created directory: ${dir}${colors.reset}`);
        }
    } catch (error) {
        console.error(`${colors.red}✗ Failed to create directory ${dir}:${colors.reset}`, error.message);
        success = false;
    }
});

// Check for required environment variables
const requiredEnvVars = [
    'NODE_ENV',
    'PORT'
];

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
    console.log(`\n${colors.yellow}Warning: Missing environment variables:${colors.reset}`);
    console.log(missingEnvVars.join(', '));
    console.log(`${colors.yellow}Create a .env file with these variables${colors.reset}`);
}

if (success) {
    console.log(`\n${colors.bright}${colors.green}Setup completed successfully!${colors.reset}`);
    console.log(`\nTo start the application:`);
    console.log(`1. Start the backend: ${colors.blue}cd backend && npm start${colors.reset}`);
    console.log(`2. Start the frontend: ${colors.blue}cd frontend && npm start${colors.reset}`);
    console.log(`3. Run test scraper: ${colors.blue}cd scrapers && npm run test${colors.reset}\n`);
} else {
    console.error(`\n${colors.red}Setup completed with errors. Please fix the issues above.${colors.reset}\n`);
    process.exit(1);
}