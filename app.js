
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
const app = express();

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workitems = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("Public"));

//to connect to mongodb--------its only for mongodb:
mongoose.connect("mongodb+srv://admin-maleia:test123@cluster0.rqwbs.mongodb.net/todoListDB",{useNewUrlParser: true});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<--Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);
// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Successfully saved default items to DB.");
//   }
// });   //---till here mongodb

app.get("/", function(req, res){
  // const day = date.getDate();
  // res.render("list", { listTitle: day, newListItems: items });

  //for mongodb

  Item.find({}, function(err, foundItems){
    // console.log(foundItems);
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle: "Today", newListItems: foundItems});
    }
  });
  // res.render("list", { listTitle: "Today", newListItems: foundItems}); //till here mongodb
});

app.get("/:customListName", function(req, res){
  const customListName =  _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // console.log("Doesn't exist!");
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(function(err, result){
          res.redirect("/" + customListName);
        });
      }else{
        // console.log("Exists!");
        //show an existing list!
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){
  // const item = req.body.newItem;
  // if(req.body.list === "work"){
  //   workitems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }
  //console.log(item);
  const itemName = req.body.newItem;  //for mongodb
  const listName = req.body.list;
  // if(itemName != ""){
    const item = new Item({
      name: itemName
    });
    if(listName === "Today"){
      item.save(function(err, result){
        res.redirect("/");
      });
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save(function(err, result){
        res.redirect("/" + listName);
      });
    });
  }
// }
});

app.post("/delete", function(req, res){
  // console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/", + listName);
      }
    });
  }
});

// app.get("/work", function(req, res){
//   res.render("list", {listTitle: "Work List", newListItems: workitems});
// });

// app.post("/work", function(req, res){
//   let item = req.body.newItem;
//   workitems.push(item);
//   res.redirect("/work");
// })

app.get("/about",function(req,res){
  res.render("about");
});
let port = process.env.PORT;
if(port==null || port==""){
  port = 3000;
}
app.listen(port, function(){
  console.log("Server has started Successfully!");
});
