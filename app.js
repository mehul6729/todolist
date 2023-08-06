

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

//to create a mongoose model it takes to parameter singular verison of collection name, schema
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Welcome to todolist",
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- hit to delete the item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  item: [itemsSchema]
}

const List = mongoose.model("list", listSchema);




app.get("/", function (req, res) {

  Item.find({})
    .then(function (foundItems) {

      if (foundItems.length == 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved defult items to DB");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      }
      else {
        res.render("list", { listTitle: "today", newListItems: foundItems });
      }

    })
    .catch(function (err) {
      console.log(err);
    });
});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();

  res.redirect("/");
});


app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId)
  .then(function(){
    console.log("delete");
    })
  .catch(function (err){
    console.log(err);
  });
  res.redirect("/");
});

app.get("/:customListName", function(req,res){

  const customListName = req.params.customListName
 
 List.findOne({name: customListName})
 .then(foundItems =>{
  if(foundItems){
    res.render("list", {
      listTitle: foundItems.name,
      newListItems: foundItems.items
    })
  }
  else{
    const list = new List({
      name: customListName,
      items: defaultItems
    })
    list.save()
    res.redirect("/" + customListName)
  }
 })



});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
