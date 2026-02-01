// netlify/functions/getTexts.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "texts.json");

// Initialize file if missing
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));

exports.handler = async () => {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return { statusCode: 200, body: data };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
