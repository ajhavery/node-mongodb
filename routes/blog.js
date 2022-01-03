const express = require("express");
const mongodb = require("mongodb");

const router = express.Router();
const ObjectId = mongodb.ObjectId;

const db = require("../data/database");

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  // Old Syntax Below
  // const posts = await db
  //   .getDB()
  //   .collection("posts")
  //   .find({}, { title: 1, summary: 1, "author.name": 1 })
  //   .toArray();

  // New Syntax - for using mongodb with nodejs
  const posts = await db
    .getDB()
    .collection("posts")
    .find({})
    .project({ title: 1, summary: 1, "author.name": 1 })
    .toArray();

  res.render("posts-list", { posts: posts });
});

// in the new post, we want to reach out to db to get list of authors
router.get("/new-post", async function (req, res) {
  // we use collection('name of collection') method to access a db collection
  // it will give us a cursor pointing at the collection - useful if have a large dataset
  // as we have a small list of authors, we will import data into an Array
  // const authorsCursor = await db.getDB().collection('authors').find();
  // const authors = await authorsCursor.toArray();

  // or can merge the 2 lines of code into 1
  const authors = await db.getDB().collection("authors").find().toArray();
  // passing this list of authors as a key in our template
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const authorID = new ObjectId(req.body.author);
  // to get author name from authorID
  const author = await db
    .getDB()
    .collection("authors")
    .findOne({ _id: authorID });
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      // form will give id as string. To convert it in Object ID format, we use the below
      // Note that data that will be submitted = authorID only
      id: authorID,
      name: author.name,
    },
  };

  const result = await db.getDB().collection("posts").insertOne(newPost);
  console.log(result);

  // send to all posts after submitting
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res, next) {
  let postID = req.params.id;
  // ExpressJS cannot catch errors in id due to async function 
  // hence we do it manually using try...catch
  try {
    postID = new ObjectId(postID);
  } catch (error) {
    return res.status(404).render("404"); // can use it to manually route to 404 page
    ///////////// METHOD 2 /////////////////
    // Route request if error to next middleware using next(); - to default error handler function
    // return next(error); 
  }
  
  const post = await db
    .getDB()
    .collection("posts")
    .findOne({ _id: postID }, { summary: 0 }); // summary is excluded from fetched data

  // the below does not work and app crashes due to async nature of function
    if (!post) {
    return res.status(404).render("404");
  }
  // toLocaleDateString() is a built in javascript method
  // adding a new property to a javascript object
  post.humanReadableDate = post.date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  post.date = post.date.toISOString();
  res.render("post-detail", { post: post });
});

router.get("/posts/:id/edit", async function (req, res) {
  const postID = new ObjectId(req.params.id);
  const post = await db
    .getDB()
    .collection("posts")
    .findOne({ _id: postID }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: post });
});

router.post("/posts/:id/edit", async function (req, res) {
  const postID = new ObjectId(req.params.id);
  const result = await db
    .getDB()
    .collection("posts")
    .updateOne(
      { _id: postID },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
        },
      }
    );

  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function (req, res) {
  const postID = new ObjectId(req.params.id);
  const result = await db
    .getDB()
    .collection("posts")
    .deleteOne({ _id: postID });

  res.redirect("/posts");
});

module.exports = router;
