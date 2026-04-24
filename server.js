const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/extract-event", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing image data." });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are an AI that extracts structured event data from banquet event orders (BEO).

Return ONLY valid JSON with this exact structure:

{
  "name": "",
  "client": "",
  "date": "",
  "startTime": "",
  "endTime": "",
  "guests": "",
  "venue": "",
  "status": ""
}

Rules:
- date must be YYYY-MM-DD when possible
- time must be HH:MM (24h) when possible
- guests must be a number as a string
- status should be one of: Draft, Confirmed, In Preparation, Ready
- if missing, leave empty string
- no explanations, only JSON
              `,
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    const text = response.output_text;
    console.log("RAW AI OUTPUT:", text);

    let parsed;
    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON PARSE ERROR:", parseError);
      return res.status(500).json({
        error: "Invalid AI response",
        raw: text
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({
      error: "Extraction failed",
      details: error.message
    });
  }
});

app.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});