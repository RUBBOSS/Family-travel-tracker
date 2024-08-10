# Travel Tracker

Travel Tracker is a web application that allows users to keep track of countries they have visited. Users can add new countries to their list, and the total number of visited countries will be displayed on a map. The app also supports multiple users, each with their own unique color-coded profile.

## Features

- **Add Visited Countries:** Users can input the name of a country they have visited, and it will be highlighted on the world map.
- **User Profiles:** Multiple users can be added, each with their own color to represent their visited countries.
- **Map Visualization:** Visited countries are highlighted on a world map.
- **Error Handling:** The app handles cases where the country does not exist in the database or has already been added.

## Technology Stack

- **Frontend:** HTML, CSS, EJS (Embedded JavaScript)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Dependencies:** `body-parser`, `ejs`, `express`, `pg`

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/travel-tracker.git
   cd travel-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up PostgreSQL database:

   - Create a PostgreSQL database named `world`.
   - Use the provided SQL scripts to create the required tables: `users` and `visited_countries`.

4. Update the database connection details in `index.js`:

   ```javascript
   const db = new pg.Client({
     user: "your-username",
     host: "localhost",
     database: "world",
     password: "your-password",
     port: 5432,
   });
   db.connect();
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Add a Family Member:**
   - Click "Add Family Member" and fill out the form with the person's name and preferred color.
   
2. **Track Visited Countries:**
   - Select a user and enter the name of a country they have visited.
   - The country will be highlighted on the world map.

3. **View Total Countries:**
   - The total number of countries visited by the selected user is displayed at the bottom of the page.

## Database Structure

- **Users Table:**
  - `id`: Integer, Primary Key
  - `name`: Text, Name of the user
  - `color`: Text, Color associated with the user

- **Visited Countries Table:**
  - `id`: Integer, Primary Key
  - `country_code`: Text, Country code of the visited country
  - `user_id`: Integer, Foreign Key referencing the `users` table

## Contributing

If you'd like to contribute to this project, please fork the repository and submit a pull request. All contributions are welcome!

## License

This project is licensed under the MIT License.

## Acknowledgments

This project was created as part of a coding challenge to demonstrate basic full-stack web development skills using Node.js, Express, and PostgreSQL.
