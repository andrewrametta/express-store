require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const { v4: uuidv4 } = require("uuid");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(express.json());
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

const users = [
  {
    id: "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    username: "sallyStudent",
    password: "c00d1ng1sc00l",
    favoriteClub: "Cache Valley Stone Society",
    newsLetter: "true",
  },
  {
    id: "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    username: "johnBlocton",
    password: "veryg00dpassw0rd",
    favoriteClub: "Salt City Curling Club",
    newsLetter: "false",
  },
];

app.get("/", (req, res) => {
  res.send("Express Store");
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("POST request recieved");
});

/*
{
  "username": "String between 6 and 20 characters",
  "password": "String between 8 and 36 characters, must contain at least one number",
  "favoriteClub": "One of 'Cache Valley Stone Society', 'Ogden Curling Club', 'Park City Curling Club', 'Salt City Curling Club', or 'Utah Olympic Oval Clurling Club'",
  "newsLetter": "True - receive newsletters or False - no newsletters"
}
*/

app.post("/register", (req, res) => {
  console.log(req.body);
  const clubs = [
    "Cache Valley Stone Society",
    "Ogden Curling Club",
    "Park City Curling Club",
    "Salt City Curling Club",
    "Utah Olympic Oval Clurling Club",
  ];
  const { username, password, favoriteClub, newsLetter = false } = req.body;

  if (!username) {
    return res.status(400).send("Username Required");
  }
  if (!password) {
    return res.status(400).send("Password Required");
  }
  if (!favoriteClub) {
    return res.status(400).send("Favorite Club Required");
  }

  if (username.length < 6 || username.length > 20) {
    return res.status(400).send("Username must be between 6 and 20 characters");
  }

  if (password.length < 8 || password.length > 36) {
    return res.status(400).send("Password must be between 8 and 36 characters");
  }

  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res.status(400).send("Password must be contain at least one digit");
  }

  if (!clubs.includes(favoriteClub)) {
    return res.status(400).send("Not a valid club");
  }

  const id = uuidv4(); //generate a unique id

  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter,
  };

  users.push(newUser);

  res.status(201).location(`http://localhost8000/user/${id}`).json(newUser);
});

app.get("/user/:id", (req, res) => {
  console.log(req.params);
});

app.delete("/user/:id", (req, res) => {
  const { id } = req.params;
  res.send(id);

  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).send("User not found");
  }

  users.splice(index, 1);

  res.send("Deleted");
});

app.use("/users", (req, res) => {
  res.send(users);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "product") {
    response = { error: { message: "server error" } };
  } else {
    console.log(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
