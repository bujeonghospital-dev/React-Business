// scripts/generate-google-ads-refresh-token.js
/**
 * Script to generate Google Ads API Refresh Token
 *
 * Prerequisites:
 * 1. npm install google-auth-library readline
 * 2. Set up OAuth 2.0 credentials in Google Cloud Console
 *
 * Usage:
 * node scripts/generate-google-ads-refresh-token.js
 */

const { OAuth2Client } = require("google-auth-library");
const readline = require("readline");

// Configuration - Replace with your credentials
const CLIENT_ID =
  process.env.GOOGLE_ADS_CLIENT_ID ||
  "YOUR_CLIENT_ID.apps.googleusercontent.com";
const CLIENT_SECRET =
  process.env.GOOGLE_ADS_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

// Google Ads API scope
const SCOPES = ["https://www.googleapis.com/auth/adwords"];

async function generateRefreshToken() {
  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force to show consent screen to get refresh token
  });

  console.log("\n=================================================");
  console.log("Google Ads API - Refresh Token Generator");
  console.log("=================================================\n");
  console.log("📋 Step 1: Authorize this application");
  console.log("Copy and paste this URL in your browser:\n");
  console.log(authUrl);
  console.log("\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "📝 Step 2: Enter the authorization code from the redirect URL: ",
    async (code) => {
      rl.close();

      try {
        console.log("\n🔄 Exchanging authorization code for tokens...\n");

        const { tokens } = await oauth2Client.getToken(code);

        console.log("✅ Success! Here are your tokens:\n");
        console.log("=================================================");
        console.log("Access Token (expires in 1 hour):");
        console.log(tokens.access_token);
        console.log("\n-------------------------------------------------");
        console.log("🔑 Refresh Token (save this in .env.local):");
        console.log(tokens.refresh_token);
        console.log("=================================================\n");

        console.log("📝 Add this to your .env.local file:\n");
        console.log(`GOOGLE_ADS_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GOOGLE_ADS_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log("GOOGLE_ADS_DEVELOPER_TOKEN=YOUR_DEVELOPER_TOKEN");
        console.log("GOOGLE_ADS_CUSTOMER_ID=YOUR_CUSTOMER_ID\n");
      } catch (error) {
        console.error("❌ Error getting tokens:", error.message);
      }
    }
  );
}

// Check if credentials are set
if (
  CLIENT_ID === "YOUR_CLIENT_ID.apps.googleusercontent.com" ||
  CLIENT_SECRET === "YOUR_CLIENT_SECRET"
) {
  console.error(
    "\n❌ Error: Please set your CLIENT_ID and CLIENT_SECRET in this script first!\n"
  );
  console.log(
    "Get your credentials from: https://console.cloud.google.com/apis/credentials\n"
  );
  process.exit(1);
}

generateRefreshToken();
