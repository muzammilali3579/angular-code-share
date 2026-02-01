// netlify/functions/addText.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "texts.json");

if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { title, body } = JSON.parse(event.body);

        if (!title || !body) return { statusCode: 400, body: "Title and body required" };

        const texts = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (texts.some(t => t.title.toLowerCase() === title.toLowerCase())) {
            return { statusCode: 400, body: "Heading already exists" };
        }

        texts.push({ title, body });
        fs.writeFileSync(filePath, JSON.stringify(texts, null, 2));

        return { statusCode: 200, body: JSON.stringify({ message: "Added successfully", texts }) };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
