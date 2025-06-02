import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Use Supabase PostgreSQL connection with explicit configuration
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Force IPv4 and connection timeout
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
  statement_timeout: 30000,
  idle_in_transaction_session_timeout: 30000
});

// Connect to database with error handling
db.connect()
  .then(() => console.log('Connected to database'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [];

async function checkVisisted() {
  const result = await db.query(
    "SELECT c.country_code FROM visited_countries vc JOIN countries c ON c.id = vc.country_id WHERE vc.user_id = $1;",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  
  // If no users exist, return null
  if (users.length === 0) {
    return null;
  }
  
  // If currentUserId doesn't exist, set it to the first user
  const currentUser = users.find((user) => user.id == currentUserId);
  if (!currentUser && users.length > 0) {
    currentUserId = users[0].id;
    return users[0];
  }
  
  return currentUser;
}

app.get("/", async (req, res) => {
  try {
    const currentUser = await getCurrentUser();
    
    // If no users exist, render with default values
    if (!currentUser) {
      res.render("index.ejs", {
        countries: [],
        total: 0,
        users: [],
        color: "#008080", // Default color
      });
      return;
    }
    
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: currentUser.color,
    });
  } catch (err) {
    console.error('Error loading home page:', err);
    res.status(500).send('Server Error');
  }
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const currentUser = await getCurrentUser();
  
  // If no users exist, redirect to create a new user
  if (!currentUser) {
    return res.render("new.ejs");
  }

  try {
    const result = await db.query(
      "SELECT id, country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    if (result.rows.length === 0) {
      const countries = await checkVisisted();
      return res.render("index.ejs", {
        countries: countries,
        users: users,
        color: currentUser.color,
        total: countries.length,
        error: "Country name does not exist, try again.",
      });
    }

    const data = result.rows[0];
    const countryId = data.id;
    
    try {
      await db.query(
        "INSERT INTO visited_countries (country_id, user_id) VALUES ($1, $2)",
        [countryId, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      const countries = await checkVisisted();
      const currentUser = await getCurrentUser();
      res.render("index.ejs", {
        countries: countries,
        users: users,
        color: currentUser ? currentUser.color : "#008080",
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    const currentUser = await getCurrentUser();
    res.render("index.ejs", {
      countries: countries,
      users: users,
      color: currentUser ? currentUser.color : "#008080",
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name;
  const color = req.body.color;

  const result = await db.query(
    "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
    [name, color]
  );

  const id = result.rows[0].id;
  currentUserId = id;

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const userIdToDelete = req.body.userId;
  
  try {
    // First, delete all visited countries for this user
    await db.query("DELETE FROM visited_countries WHERE user_id = $1", [userIdToDelete]);
    
    // Then delete the user
    await db.query("DELETE FROM users WHERE id = $1", [userIdToDelete]);
    
    // If the deleted user was the current user, switch to another user or reset
    if (currentUserId == userIdToDelete) {
      const result = await db.query("SELECT * FROM users LIMIT 1");
      if (result.rows.length > 0) {
        currentUserId = result.rows[0].id;
      } else {
        currentUserId = 1; // Reset to default when no users exist
      }
    }
    
    res.redirect("/");
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
