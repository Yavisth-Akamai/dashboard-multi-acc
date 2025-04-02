import { google } from 'googleapis';
import * as readline from 'readline';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '966112730828-bi5i60if92g1q66s4q533poaefl0b4oa.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback'; 

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
CLIENT_ID,
CLIENT_SECRET,
REDIRECT_URI
);

// Define the scopes your application needs
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Generate the authorization URL
const authUrl = oauth2Client.generateAuthUrl({
access_type: 'offline', // "offline" to get a refresh token
scope: SCOPES,
prompt: 'consent' // Force consent screen to ensure refresh token is returned
});

console.log('Authorize this app by visiting this url:', authUrl);

// Create a readline interface for inputting the code
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
});

// Prompt the user to get the code from the URL
rl.question('Enter the authorization code here: ', async (code) => {
rl.close();
try {
// Exchange the code for tokens
const { tokens } = await oauth2Client.getToken(code);
console.log('Access Token:', tokens.access_token);
console.log('Refresh Token:', tokens.refresh_token);
console.log('Expires In:', tokens.expiry_date);
// Optionally store token values in your environment file (.env)
} catch (err) {
console.error('Error retrieving access token', err);
}
});