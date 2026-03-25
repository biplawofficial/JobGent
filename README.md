# JobGent

JobGent is an automated job scraping and notification system. It scrapes job postings from LinkedIn, stores them in a MongoDB database to track and avoid duplicates, and automatically emails you the newest job listings every 10 minutes.

## Features

- **Automated LinkedIn Scraping**: Uses Playwright to automatically navigate and scrape the latest job openings on LinkedIn.
- **Smart Duplicate Filtering**: Connects to MongoDB to keep track of already-seen companies and roles, ensuring you only receive alerts for truly *new* openings.
- **Automated Email Alerts**: Uses `node-cron` to schedule runs every 10 minutes and `nodemailer` to send a beautifully formatted HTML email containing the latest job matches (sorted with the most recent first).
- **Time Parsing**: Accurately parses LinkedIn's relative times (e.g. "1 day ago", "3 hours ago") into exact timestamps to store in the database.

## Prerequisites

- Node.js installed
- MongoDB connection string
- A Gmail account with an "App Password" configured for email sending via Nodemailer
- [Playwright](https://playwright.dev/) browsers installed

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/biplawofficial/JobGent.git
   cd JobGent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory for your environment variables. (Make sure to move your hardcoded MongoDB URI and Email credentials into there for security!)

4. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Usage

Start the server and the automated cron jobs:

```bash
node server.js
```

The application will launch an Express server on port `8090` and initialize the cron schedule. Every 10 minutes, the scraper runs in the background, checks for new job postings, and emails the new opportunities to your specified address.
