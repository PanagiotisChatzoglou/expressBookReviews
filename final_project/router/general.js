const express = require('express');
const axios = require('axios'); // Ensure you install Axios using `npm install axios`
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});


// Task 10: Get the book list using async/await
public_users.get('/', async (req, res) => {
    try {
        const bookList = await new Promise((resolve) => {
            resolve(books);
        });
        return res.status(200).json({ books: JSON.stringify(bookList, null, 2) });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    })
    .then(book => res.status(200).json({ book }))
    .catch(err => res.status(404).json({ message: err }));
});

// Task 12: Get book details based on Author using async/await
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author.toLowerCase();
        const filteredBooks = await new Promise((resolve) => {
            resolve(Object.values(books).filter(book => book.author.toLowerCase() === author));
        });

        if (filteredBooks.length > 0) {
            return res.status(200).json({ books: filteredBooks });
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Task 13: Get all books based on title using Promise callbacks
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title);
        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject("No books found with this title");
        }
    })
    .then(books => res.status(200).json({ books }))
    .catch(err => res.status(404).json({ message: err }));
});
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json({ reviews: books[isbn].reviews });
    }
    return res.status(404).json({ message: "No reviews found for this book" });
});

module.exports.general = public_users;
