const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/blogplatform")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Test Route
app.get("/", (req, res) => {
    res.send("Blog Backend Working");
});

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({
            message: "Signup successful"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id
            },
            "secretkey",
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// ---------------- POSTS ----------------

// Create Post
app.post("/posts", async (req, res) => {
    try {
        const { title, content, author } = req.body;

        const post = new Post({
            title,
            content,
            author
        });

        await post.save();

        res.json({
            message: "Post created successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// Get All Posts
app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find();

        res.json(posts);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// Update Post
app.put("/posts/:id", async (req, res) => {
    try {
        await Post.findByIdAndUpdate(
            req.params.id,
            req.body
        );

        res.json({
            message: "Post updated successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// Delete Post
app.delete("/posts/:id", async (req, res) => {
    try {
        await Post.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "Post deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// ---------------- COMMENTS ----------------

// Add Comment
app.post("/comments", async (req, res) => {
    try {
        const { postId, userName, text } = req.body;

        const comment = new Comment({
            postId,
            userName,
            text
        });

        await comment.save();

        res.json({
            message: "Comment added successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// Get Comments for a Post
app.get("/comments/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({
            postId: req.params.postId
        });

        res.json(comments);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});

// ---------------- SERVER ----------------

app.listen(5000, () => {
    console.log("Server running on port 5000");
});