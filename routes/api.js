/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require("mongoose");
const mySecret = process.env['DB'];
var ObjectId = require('mongodb').ObjectID;
mongoose.connect(mySecret, {userNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  name: {type: String, required: true},
  comments: {type: Array, required: true}
});

const Book = mongoose.model("Book", bookSchema);

const createBook = async name =>{
  const book = await Book.create({name, comments: []});
  return  book;
};

const getAllBooks = async () =>{
  const books = await Book.find({});
  return books;
}

const deleteAllBooks = async () => {
  await Book.deleteMany({});
  return true;
}

const getBook = async id =>{
  if(!ObjectId.isValid(id)) return false;
  const book = await Book.findById(id, (err, data)=>{
    if(err) return false;
    else return data;
  });
  return book;
}

const addComment = async (id, comment)=>{
  if(!ObjectId.isValid(id)) return false;
  // let comments = await Book.findById(id, (err, data)=>{
  //   if(err) return false;
  //   else return data;
  // });
  // console.log(comments);
  // if(!comments) return false; 
  // if(comments === null) return false;
  // comments = comments.comments;
  // const book = await Book.findOneAndUpdate({"_id": id}, {$push: {"comments": comment}}, (err, data)=>{
  //   if(err) return false;
  //   else console.log("test");
  // });
  const book = await getBook(id);
  if(book){
    book.comments.push(comment);
    book.save();
  }
  
  // console.log(book);
  return book;
}

const deleteOneBook = async id => {
  if(!ObjectId.isValid(id)) return false;
  // let book = false;
  const book = await Book.find({"_id": id}, (err, data)=>{
    if(err) return false;
    else return data;
  });
  if(!book.length) return false;
  Book.findOneAndDelete({"_id": id})
  return true

}


module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const books = await getAllBooks();
      const response = books.map(book=> {
        return {"_id": book.id, "title": book.name, commentcount: book.comments.length}
        })
      
      res.json(response);
    
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title) return res.send("missing required field title");
      const book = await createBook(title);
      if(book) res.json({"_id": book.id, title: book.name});
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      const allDeleted = await deleteAllBooks();
      if(allDeleted) res.json("complete delete successful");
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const book = await getBook(bookid);
      if(book) return res.json({"_id": book.id, title: book.name, comments: book.comments});
      else return res.json("no book exists");

    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      console.log(bookid, comment);
      if(!comment) return res.send("missing required field comment");
      if(!bookid) return res.send("missing required field title");
      //json res format same as .get
      const book = await addComment(bookid, comment);
      console.log(book)
      if(book === null) return res.send("no book exists")
      return res.json({"_id": book.id, title: book.name, comments: book.comments, commentcount: book.comments.length});
      // return res.send("no books exists")
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;

      const deleted = await deleteOneBook(bookid);
      if(deleted) return res.send("delete successful");
      else return res.send("no book exists")

    });
  
};
