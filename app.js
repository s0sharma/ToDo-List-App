const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");


const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));


// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://admin-saurabh:0Z1O0idcI3bjwct9@cluster0.ryf21.mongodb.net/todolistDB");

const todolistSchema = {
      name : String
}

const Item = mongoose.model("Item", todolistSchema)

const item1 = new Item({
      name: "Welcome"
});

// const item2 = new Item({
//       name: "Hit + to delete"
// });

// const item3 = new Item({
//       name: "<-- Hit this to delete an item"
// });

const defaultItems = [item1];

const listSchema = {
      name : String,
      items : [todolistSchema]
}


const List =  mongoose.model("List", listSchema);




app.get("/", function(req, res) {

      Item.find({})
      .then(function(foundItems){
            if(foundItems.length == 0){
                  Item.insertMany(defaultItems)
                        .then(function(){
                              console.log("Successfully saved defult items to DB");
                        })
                        .catch(function(err) {
                              console.log(err);
                        });
                        res.redirect("/");
            }
            else{
                  res.render("list", {listTitle : "Today", newItems : foundItems} );
            }
      })
      .catch(function(err){
            console.log(err);
      })


})



app.post("/", function(req, res) {
      const itemName = req.body.newItem;
      const listName = req.body.list; 
      
      const item = new Item({
            name : itemName
      })

      if(listName === "Today"){
            // if(itemName.length >= 1){ //Does not allow to add empty item
                  item.save();
            // }
            res.redirect("/");
      }
      else{
            List.findOne({name : listName})
                  .then(function(foundList){
                        foundList.items.push(item);
                        foundList.save();
                        res.redirect("/" + listName);
                  });
      }

      
})

app.post("/delete", function(req, res) {
      const checkedItemId = req.body.checkbox;
      const listName = req.body.listName;

      if(listName === "Today"){
            Item.deleteOne({_id : checkedItemId})
                  .then(function(){
                        console.log("Successfully deleted item from DB");
                        })
                  .catch(function(err) {
                        console.log(err);
                  });
            res.redirect("/");
      } else {
            List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(found){
                  res.redirect("/" + listName);
            });
      }; 


})


app.get("/:customListName", function(req, res) {
      const customListName = lodash.capitalize(req.params.customListName);

      List.findOne({name: customListName})
            .then(function(foundList) {
                  if(foundList === null){
                              const list = new List({
                              name : customListName,
                              items: defaultItems
                        });
                        list.save();
                        res.redirect("/" + customListName);
                        console.log(foundList);

                  }
                  else{
                        console.log("List already exist");
                        res.render("list", {listTitle : foundList.name , newItems : foundList.items} );
                  }
            })
})




app.listen(3000, function() {
      console.log("server is running on port 3000");
})