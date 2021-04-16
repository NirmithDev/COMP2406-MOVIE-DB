const mc = require('mongodb').MongoClient;
let db;
let dv;
const movies = require("./movie/movie-data.json");
const users = require("./movie/users.json");

mc.connect("mongodb://localhost:27017/", function(err, client){
    if(err)
    {
      console.log("Error connecting to MongoDB");
      console.log(err);
      return;
    }
    //drop all the collection and reinsert them copy code from tutorial 8
    db = client.db('Moivedb');
    //drop all the collection and reinsert the new one everytime this is run copy code from tutorial
    dv=client.db('User')
    db.dropCollection("Movies",function(err,res){
      if(err){
              console.log(" Movies Error dropping collection. Likely case: collection did not exist (don't worry unless you get other errors...)")
          }else{
                  console.log("Cleared movies collection.");
      }
      db.collection("Movies").insertMany(movies, function(err,result){
        if(err) throw err;
        else{
                  console.log("Successfuly inserted " + result.insertedCount + " movie data.")
                  console.log("--------FINISHED--------")
                  process.exit(0)
          }
      });
      dv.dropCollection("Users",function(err,res){
        if(err){
                console.log("Error dropping collection. Likely case: collection did not exist (don't worry unless you get other errors...)")
            }else{
                    console.log("Cleared users collection.");
        }
        dv.collection("Users").insertMany(users, function(err,result){
          if(err) throw err;
          //console.log(result);
          else{
              console.log("Successfuly inserted " + result.insertedCount + " temporary users.")
          }
          
          });
      })
      console.log("Finished")
      
    })
    
     
})