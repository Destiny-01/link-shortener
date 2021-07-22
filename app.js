const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const yup = require("yup");
const monk = require("monk");
const { nanoid } = require("nanoid");

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex("name");

const app = express();
const port = process.env.PORT || 3001;
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.get("/:id", async (req, res) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
    }
    res.redirect(`/?error=${slug} not found`);
  } catch (error) {
    res.redirect(`/?error=Link not found`);
  }
});

app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });
    if (!slug) {
      slug = nanoid(6);
    } else {
      const existing = await urls.findOne({ slug });
      if (existing) {
        throw new Error(
          "Slug has been taken. Try using another or leave blank to get an auto-generated slug"
        );
      }
    }
    slug = slug.toLowerCase();
    const newUrl = {
      slug,
      url,
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "" : error.stack,
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
