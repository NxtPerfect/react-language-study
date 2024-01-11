import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mysql from "mysql";

dotenv.config();

const app = express();
const port = 6942;

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "vocab-master",
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.post("/api/:language&:level", (req, res) => {
	const { language, level } = req.params;
	const user_id = req.body.user_id;
	const sql =
		"SELECT w.* FROM words w WHERE w.language = ? AND w.level = ? AND w.word_id NOT IN (SELECT u.word_id FROM user_progress u WHERE u.user_id = ?) LIMIT 30;";
	db.query(sql, [language, level, user_id], (err, data) => {
		if (err) return res.json(err);
		return res.json(data);
	});
	console.log("Sent words");
	console.log("\n");
});

// This needs to get user_id from the database
// using the email
// then use that user_id for the insert query
app.post("/api/save_progress", (req, res) => {
	const progressData = req.body.progressData;
	const queries = progressData.map((progressItem) => {
		const { user_id, word_id, language, level } = progressItem;
		const sql =
			"INSERT INTO user_progress (user_id, word_id, language, level) VALUES (?);";
		const values = [user_id, word_id, language, level];
		return new Promise((resolve, reject) => {
			db.query(sql, [values], (err, data) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				console.log("saved progress");
				resolve(data);
			});
		});
	});
	Promise.all(queries)
		.then(() => {
			res.status(200).json("Success");
		})
		.catch((err) => {
			res.status(500).json(err);
		});
});

app.post("/login", (req, res) => {
	const sql = "SELECT * FROM users WHERE email LIKE ?;";
	const values = [req.body.email];
	console.log("requesting fr");
	db.query(sql, [values], (err, data) => {
		if (err) return res.status(500).json("Login failed");
		if (data.length === 0) return res.status(409).json("User doesn't exist");
		console.log("got data");
		return res.status(200).json({ message: "Success", user_id: data });
	});
});

// Check if email in there already, if not add
// validate email, username and password again
app.post("/register", (req, res) => {
	const values = [null, req.body.email, req.body.username, req.body.password];
	console.log("validating");
	const valid = "SELECT email FROM users WHERE email LIKE ?;";
	db.query(valid, [values[1]], (err, data) => {
		if (err) return res.status(500).json("Error validating");
		if (data.length !== 0)
			return res.status(409).json("Email address already exists");
		const sql = "INSERT INTO users (id, email, username, password) VALUES (?);";
		console.log("registering");
		db.query(sql, [values], (err, _data) => {
			if (err) return res.status(500).json("Error registering");
			return res.status(200).json("Success");
		});
	});
});

app.listen(port, () => {
	console.log(`Running on port ${port}`);
});
