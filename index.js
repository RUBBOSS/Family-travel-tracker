import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Use Supabase PostgreSQL connection
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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

let users = [
  { id: 1, name: "Angela", color: "#008080" },
  { id: 2, name: "Jack", color: "#B0E0E6" },
];

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
  return users.find((user) => user.id == currentUserId);
}

app.get("/", async (req, res) => {
  try {
    const countries = await checkVisisted();
    const currentUser = await getCurrentUser();
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
        color: currentUser.color,
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
      color: currentUser.color,
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
