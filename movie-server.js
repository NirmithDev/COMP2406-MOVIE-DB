const express = require('express');
const pug = require("pug");
const model = require("./logic.js");
const fs = require("fs");
const mongo = require('mongodb');
const movies = require("./movie/movie-data.json");
const users = require("./movie/users.json");

const app = express();
app.set("view engine", "pug");
const session = require('express-session');
const mc = require('mongodb').MongoClient;
const { constants } = require('buffer');
let db;
let dv;

app.use(session({ secret: 'some secret here'}))
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

const renderLogin = pug.compileFile('pages/login.pug');
const renderHome = pug.compileFile('pages/Home.pug');
const renderSignup = pug.compileFile('pages/Signup.pug');
const renderProfile = pug.compileFile('pages/Profile.pug');
const renderMovie = pug.compileFile('pages/Movie.pug');
const renderView = pug.compileFile('pages/View.pug');
const renderOther = pug.compileFile('pages/Other.pug');
const renderAdd=pug.compileFile('pages/addMovie.pug')

app.use(express.static("stylesheets"));
app.use(express.json());

function auth(req, res, next){
  if(!req.session.user){
    res.status(403).send(" You need to be logged in to do this request");
    return;
  }
  next();
}

app.get("/", getHome)
app.get('/logOut', logOut);
app.get("/movies/:mid", getMovie);
app.get("/other", getOther);
app.get("/other/:uid",getOther);
app.get("/people/:uid", getPeople);
app.get("/upgrade",upgradePeep);
app.get("/add",addMov);
app.get("/addmovies",addmov);

//logo and background images
app.get("/img/logo.jpg", getImg);
app.get("/movies/img/logo.jpg", getImg);
app.get("/users/img/logo.jpg", getImg);
app.get("/people/img/logo.jpg", getImg);
app.get("/other/img/logo.jpg", getImg);
//background
app.get("/img/Background.png", getBackgroundImg);
app.get("/movies/img/Background.png", getBackgroundImg);
app.get("/users/img/Background.png", getBackgroundImg);
app.get("/other/img/Background.png", getBackgroundImg);


app.post("/movies", searchMovie, getMovie);
app.post("/people", searchPeople, getPeople);
app.post("/other", searchUser, getOther);
app.post('/signUpUser', signUpUser, logInUser);
app.post('/logInUser', logInUser);
app.post("/movies/:mid", auth, addWatchList, getMovie);
app.post("/subscribe/:pid", auth, subscribePeo, getPeople);
app.post("/reviewmovie/:mid", auth, makeReview);
app.post('/upgrade',upgradePeep);
app.post('/add',addMov);
app.post('/addmovies',addmov);

function addMov(req,re,next){
  
  //console.log("I WAS CLICKED SUCCESSFULLY")
  //console.log(req.session)
  if(req.session.user.accountLevel[0]=="contributing"){
    //console.log("HE IS")
    re.status(200).send(renderAdd({}));
  }
  else{
    re.status(403).send("You need to be a contributing user")
  }
}

function addmov(rep,res,next){
  if(rep.session.loggedin){
    let newMov={Actors:[],Genre:[],Director:[],Writer:[]}
    //console.log("I WAS CLICKED SUCCESSFULLY")
    //bad naming practice since I am low on time
    a=rep.body.names || " "
    b=rep.body.plot || " "
    c=rep.body.actor || " "
    d=rep.body.genre || " "
    e=rep.body.duration || " "
    f=rep.body.yearRel +" min" || "0"+" min"
    g=rep.body.post || " "
    h=rep.body.writer || " "
    i=rep.body.director || " "

    newMov.Title=a;
    newMov.Plot=b;
    newMov.Actors=c.split(',')
    newMov.Genre=d.split(',')
    newMov.Writer=h.split(',')
    newMov.Director=i.split(',')
    newMov.Runtime=e;
    newMov.Released=f;
    newMov.Poster=g;
    console.log(newMov);
    console.log(movies.length)
    movies[movies.length]=newMov
    console.log(movies.length)
    console.log(movies[movies.length-1])
    //model.updateMOV()
    res.status(200).send(renderAdd({})) 
  }else{
    res.status(401).send("USER IS NOT LOGGED IN")
  }
}

function upgradePeep(req,re,next){

  if(req.session.user.accountLevel[0]=="regular"){
    req.session.user.accountLevel.shift();
    //console.log(req.session)
    req.session.user.accountLevel.push("contributing")
    dv.collection("Users").updateOne({"username":req.session.user.username},{$set:{"accountLevel":req.session.user.accountLevel}},function(err,rz){
      if (err) throw err
      data = renderProfile({user: req.session.user, session:req.session, movName:req.session.user.likedMovie,
        subName:req.session.user.following , review: req.session.user.reviews,
        subOtherName:req.session.user.followOther});
      re.status(200).send(data);
    })
  }else if(req.session.user.accountLevel[0]=="contributing"){
    req.session.user.accountLevel.shift();
    //console.log(req.session)
    req.session.user.accountLevel.push("regular")
    dv.collection("Users").updateOne({"username":req.session.user.username},{$set:{"accountLevel":req.session.user.accountLevel}},function(err,rz){
      if (err) throw err
      data = renderProfile({user: req.session.user, session:req.session, movName:req.session.user.likedMovie,
        subName:req.session.user.following , review: req.session.user.reviews,
        subOtherName:req.session.user.followOther});
      re.status(200).send(data);
    })
  }
}

//render the home page
function getHome(req, res, next){
  let movArr = model.getRanMovie();
  let movName = movArr[0].Title;
  //console.log(movArr)
  //convert this to database or nah
  let a=movies
  let allMov=[]
  //console.log(`MOVIES LENGTH ${a.length}`)
  for(i=0;i<a.length;i++){
    allMov.push(a[i])
  }
  //pass on all the movies so that the user can be able to view all the options
  let data = renderHome({movie: movArr, name: movName, session: req.session,mov:allMov});
  res.status(200).send(data);
}

function searchMovie(req, res, next){
  //console.log(req.body.movName)
  db.collection("Movies").find({Title:req.body.movName}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading Database");
      return;
    }
    //console.log(result)
    if(result.length<1||result==undefined){
      res.send("Please enter the full name or correct name (Movie Name)");
    }else{
      res.redirect("/movies/" + req.body.movName);
    }
  });
}

function searchPeople(req, res, next){
  let result=model.searchPeople(req.body.peoName);

  if(result.length<1||result==undefined){
      res.send("Please enter the correct name (People Name)");
    }else{
      res.redirect("/people/" + req.body.peoName);
  }
}

function searchUser(req, res, next){
  dv.collection("Users").find({username:req.body.userName}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading Database");
      return;
    }
    if(result.length<1||result==undefined){
      res.send("Please enter the full name or correct name (Users Name)");
    }else{
      //console.log()
      res.redirect("/other/" + req.body.userName);
    }
  });
}

//render the movie page
function getMovie(req, res, next){
  let movArr = model.getMovie(req.params.mid);
  let directorName = model.getNameArr(movArr[0].Director);
  let writerName = model.getNameArr(movArr[0].Writer);
  let actorName = model.getNameArr(movArr[0].Actors);
  let url = movArr[0].Poster;
  let recMovie = model.getRecMovie(req.params.mid);
 // console.log(directorName)
  let data = renderMovie({movie: movArr, link: url, session:req.session, movName: req.params.mid,
                          otherName: directorName, writerName: writerName, actorName: actorName,
                        recMovie: recMovie});
  res.status(200).send(data);
}

// render people page
function getPeople(req, res, next){
  let name = req.params.uid;
  //make it so that it finds all people that they collabed with
  db.collection("Movies").find({$or:[{Writer:{$eq:name}}, {Director: {$eq:name}}, {Actors: {$eq:name}}]}).toArray(function(err,result){
		if(err) throw err;
    if(result.length < 1 || result == undefined){
      //empty
      res.redirect("/");
      return;
    }
    //console.log(result[0])
    let writerName=""
    if(result[0].Writer.length>=4){
      writerName = model.getNameArr(result[0].Writer);
    }else if(result[0].Actors.length>=4){
      writerName = model.getNameArr(result[0].Actors);
    }
    let data = renderView({name:name, session:req.session, movie:result, writerName:writerName});
    res.status(200).send(data);
	});
}
//to get other users
function getOther(req, res, next){
  let name = req.params.uid;

  req.session.hasSubOthers = true;
  req.session.user.followOther.push(req.params.uid);

  dv.collection("Users").find({username:req.params.uid}).toArray(function(err,result){
    if(err) throw err;
    //console.log(result[0])
    //console.log(req.session)
    //console.log(result[0])
    let data = renderOther({name:name,session:req.session,res:result[0]});
    res.status(200).send(data);
        });
}

// add the movie to users watch List -post/subscribeMovie
function addWatchList(req, res, next){
  req.session.hasMovies = true;
  req.session.user.likedMovie.push(req.params.mid);
  //update it in the database
  next();
}

function subscribePeo(req, res,next){
  if(req.session.user.following.includes(req.params.pid)){
    res.status(200).redirect("/people/" + req.params.pid);
    return;
  }
  req.session.hasSubscribe = true;
  req.session.user.following.push(req.params.pid);
  //console.log(req.session)
  //console.log(req.params.pid)
  res.status(200).redirect("/people/" + req.params.pid);
}

//Purpose : add review to the user profile page and movie page
function makeReview(req, res, next){
    let movName = req.params.mid;
    let review = {username: req.session.user.username, movName :movName , review: req.body.moviereview}

    req.session.hasReview = true;
    req.session.user.reviews.push(review);
    //update database reviews
    res.status(200).redirect("/movies/" + req.params.mid);
}

// this the logo we have to create so yeah
function getImg(req, res, next){
  fs.readFile("img/logo.jpg", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
}

function getBackgroundImg(req, res, next){
  fs.readFile("img/Background.png", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
}

// provide css style
app.get("/movie/style.css", function(req, res, next){
  fs.readFile("stylesheet/style.css", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})

app.get("/movie/style2.css", function(req, res, next){
  fs.readFile("stylesheet/style2.css", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})

app.get("/movie/style3.css",function(req, res, next){
  fs.readFile("stylesheet/style3.css", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})

app.get("/movie/style4.css",function(req, res, next){
  fs.readFile("stylesheet/style4.css", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})

app.get("/add/style_dyna.css", function(req, res, next){
  fs.readFile("stylesheet/style_dyna.css", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})

app.get("/add/style_editor.css", function(req, res, next){
  fs.readFile("stylesheet/style_editor.css", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})
//render sign up page
app.get("/signup", function(req, res, next){
  let data = renderSignup("./pages/Signup.pug",{session:req.session})
  res.status(200).send(data);
})

//render sign up page
app.get("/signin", function(req, res, next){
  let data = renderLogin("./pages/login.pug",{session:req.session})
  res.status(200).send(data);
})

app.get("/login", function(req, res, next){
  let data = renderLogin("./pages/login.pug",{session:req.session})
  res.status(200).send(data);
})

//render the profile page
app.get("/profile", function(req, res, next){
  
    dv.collection("Users").findOne({"username":req.session.user.username},function(err,resu){
      //"likedMovie":req.session.user.likedMovie,
      req.session.user.likedMovie=[...new Set(req.session.user.likedMovie)]
      req.session.user.followOther=[...new Set(req.session.user.followOther)]
      req.session.user.reviews=[...new Set( req.session.user.reviews)]
      req.session.user.following=[...new Set(req.session.user.following)]
      dv.collection("Users").updateOne({"username":req.session.user.username},{$set:{"likedMovie":req.session.user.likedMovie,"followOther":req.session.user.followOther,"reviews": req.session.user.reviews,"following":req.session.user.following}},function(err,result){
        if (err) throw err
        //console.log(resu)
        //req.session.user.followOther=[...new Set(req.session.user.followOther)]
        data = renderProfile({user: req.session.user, session:req.session, movName:req.session.user.likedMovie,
          subName:req.session.user.following , review: req.session.user.reviews,
          subOtherName:req.session.user.followOther});
        res.status(200).send(data);
      })
    })
})

//render the movie
app.get("/view", function(req, res, next){
  let data = renderView();
  res.status(200).send(data);
})

app.get("/login.js", function(req, res, next){
  fs.readFile("login.js", function(err, data){
    if(err){
      res.status(500).send("Unknown resource");
      return;
    }
      res.status(200).send(data);
  });
})


//the post request for the log in function
function logInUser(req, res, next){
  dv.collection("Users").find({"username":req.body.username,"password":req.body.password}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading From Database");
      return;
    }
    if(model.authenticateUser(req.body.username, req.body.password)){
        //they have logged in successfully
        req.session.user = model.users[req.body.username];
        
        //console.log( model.users[req.body.username])
        req.session.loggedin = true;
        //console.log("IT REACHED HERE")
        res.status(200).redirect("/users/" + req.body.username);
    }else if(result.length==1){
      //once the session restarts you will not be able to login with the already registered people
      req.session.loggedin = true;
    //  console.log("YEPP")
     // console.log(result)
      res.status(200).redirect("/users/" +req.body.username);
    }
    
    else if(result.length<1||result==undefined){
      //they did not log in successfully.
      res.status(401).send("You entered the wrong username or password.");
    }
    next();
  });
}

//the post request for the sign up function
function signUpUser(req, res, next){
  let newUser =req.body;

  dv.collection("Users").find({username:newUser.username}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading From Database");
      return;
    }
    if(result.length<1||result==undefined){
      let usernew= model.createUser(newUser);
      dv.collection("Users").insertOne(usernew,function(err,result){
        if(err){
          res.status(500).send("Error Reading From Database");
          return;
        }
        next();
      });
    }else if(result[0].username===(newUser.username)){
      res.status(300).send("You are already registered and in the database");
    }
  });
}

function logOut(req, res){
  req.session.destroy();
  res.redirect('/login');
}


//2. get request for the Reading a user (getUser), input the uid to get the user information
app.get("/users/:uid", auth,function(req, res, next){
  let result = model.getUser(req.session.user, req.params.uid);

  dv.collection("Users").find({username:req.session.user.username}).toArray(function(err,re){
    if(err){
      res.status(500).send("Error Reading Database");
      return;
    }
    else{
      if(re==null){
        res.status(404).send("Unknown user")
      }else{
        
        if(req.session.user.likedMovie.length>0){
          result.likedMovie.push(req.session.user.likedMovie)
        }
        
        req.session.user.followOther=re[0].followOther
        req.session.user.likedMovie=re[0].likedMovie
        req.session.user.reviews=re[0].reviews
        req.session.user.following=re[0].following
        req.session.user.accountLevel=re[0].accountLevel
        
        let data = renderProfile({user: re[0], session:req.session, movName:re[0].likedMovie, subName:re[0].following, 
        review:re[0].reviews, subOtherName: re[0].followOther
        });
        
        res.status(200).send(data);
        return;
      }
    }
  })
})


//3. Searching for users (searchUsers),
app.get("/users", function(req, res, next){
//just here because it is there
res.status(200).send("OOPS NOTHING IS HERE")
})


//4. Searching for moive (searchMovie),
app.post("/SearchMovie", function(req, res, next){

  if(req.query.title==undefined){
    req.query.title="";
  }
  let result =model.searchMovie(req.session.user, req.query.name);

  let data = renderMovie({movie: result});
  res.status(200).send(data);
})


//5. Searching for People (searchPeople),
app.get("/SearchPeople", function(req, res, next){

  if(req.query.name==undefined){
    req.query.name="";
  }
  let result =model.searchPeople(req.session.user, req.query.name);
  res.status(200).json(result);
})

// set up the mongodb server
mc.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;
  db = client.db('Moivedb');
  dv = client.db('User')
  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("Listening on port 3000");
});
