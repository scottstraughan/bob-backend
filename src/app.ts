import express from "express";
import cors from 'cors';
import OpenAI from "openai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("OpenAI API key is not set!");
    process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey,
});


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Send a new message and received a response
app.post('/speak', (req, res) => {
    console.log(req.body)

    const response = openai.responses.create({
        model: "gpt-4o-mini",
        input: req.body['body'],
        store: true,
        instructions: `You are a helpful assistant named "Bob" and you are running on a website called "saorsail.com".
        
        Saorsail.com is an app store, based on the F-Droid database. The app is a PWA app, written in TypeScript using
        the Angular framework. It was created by Scott Straughan (https://strong.scot).
        
        - You should ONLY help with providing information about apps
        - Information about saorsail
        - Installing apps to devices
        - Downloading apps
        
        Avoid any off-topic questions.
        
        If a user asks where can they browse apps, create a link pointing to "/browse".
        `,
    });

    response.then((result) =>
      res.json({ 'message': result.output_text }));
});

app.get('/status', (req, res) => {
    res.json({ 'status': 'available' })
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
