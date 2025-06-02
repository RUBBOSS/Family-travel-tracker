# Family Travel Tracker

Family Travel Tracker is a web application that allows families to keep track of countries they have visited. Users can add family members, each with their own unique color, and track which countries they've visited on a color-coded world map.

## Features

- **Add Visited Countries:** Users can input the name of a country they have visited, and it will be highlighted on the world map.
- **Family Member Profiles:** Multiple family members can be added, each with their own color to represent their visited countries.
- **Map Visualization:** Visited countries are highlighted on a world map with the family member's chosen color.
- **Error Handling:** The app handles cases where the country does not exist in the database or has already been added.

## Technology Stack

- **Frontend:** HTML, CSS, EJS (Embedded JavaScript)
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Dependencies:** `body-parser`, `ejs`, `express`, `pg`, `dotenv`

## Local Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RUBBOSS/family-travel-tracker.git
   cd family-travel-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following:

   ```
   # Supabase Database
   SUPABASE_HOST=your-supabase-host
   SUPABASE_DB=postgres
   SUPABASE_USER=postgres
   SUPABASE_PASSWORD=your-password
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   
   # For deployment
   PORT=3000
   NODE_ENV=development
   ```
   
4. Set up Supabase:
   - Create a Supabase project
   - Run the SQL in `supabase-setup.sql` in the Supabase SQL Editor

5. Start the application:

   ```bash
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Deployment

### Deploy to Railway (Recommended)

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
3. Login to Railway:
   ```bash
   railway login
   ```
4. Initialize Railway:
   ```bash
   railway init
   ```
5. Deploy:
   ```bash
   railway up
   ```

### Deploy to Render

1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables from your `.env` file
6. Deploy

## Usage

1. **Add a Family Member:**
   - Click "Add Family Member" and fill out the form with the person's name and preferred color.
   
2. **Track Visited Countries:**
   - Select a family member and enter the name of a country they have visited.
   - The country will be highlighted on the world map with their color.

3. **View Total Countries:**
   - The total number of countries visited by the selected family member is displayed at the bottom of the page.

## Database Structure

- **Users Table:**
  - `id`: Integer, Primary Key
  - `name`: Text, Name of the family member
  - `color`: Text, Color associated with the family member

- **Countries Table:**
  - `id`: Integer, Primary Key
  - `country_code`: Text, Two-letter country code
  - `country_name`: Text, Name of the country

- **Visited Countries Table:**
  - `id`: Integer, Primary Key
  - `country_id`: Integer, Foreign Key referencing the `countries` table
  - `user_id`: Integer, Foreign Key referencing the `users` table

## Contributing

If you'd like to contribute to this project, please fork the repository and submit a pull request. All contributions are welcome!


## Acknowledgments

This project was created as part of a coding challenge to demonstrate basic full-stack web development skills using Node.js, Express, and PostgreSQL.
