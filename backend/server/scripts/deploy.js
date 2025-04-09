/**
 * Deployment script for Hassuru
 * This script will:
 * 1. Run the slug migration
 * 2. Start the server
 */

const { exec } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Function to run the migration
async function runMigration() {
  console.log('Starting deployment process...');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hassuru');
    console.log('Connected to MongoDB successfully');
    
    // Run the slug generation script
    console.log('Running slug migration...');
    const generateSlugsScript = path.join(__dirname, 'generateSlugs.js');
    
    await new Promise((resolve, reject) => {
      exec(`node ${generateSlugsScript}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running migration: ${error}`);
          reject(error);
          return;
        }
        console.log(stdout);
        if (stderr) {
          console.error(`Migration warnings: ${stderr}`);
        }
        resolve();
      });
    });
    
    console.log('Migration completed successfully');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed ');
    
    // Start the server
    console.log('Starting server...');
    const serverScript = path.join(__dirname, '..', 'server.js');
    
    exec(`node ${serverScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting server: ${error}`);
        return;
      }
      console.log(stdout);
      if (stderr) {
        console.error(`Server warnings: ${stderr}`);
      }
    });
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
runMigration(); 