let users = require("./Movie/users.json");
let movies = require("./Movie/movie-data.json");


// create a new user and appending him to the file and the to database
function createUser(newUser){
  if(!newUser.username || !newUser.password){
    return null;
  }
  if(users.hasOwnProperty(newUser.username)){
    return null;
  }
  newUser.accountLevel = ["regular"];
  newUser.reviews = [];
  newUser.following = [];
  newUser.likedMovie = [];
  newUser.followOther = [];
  newUser.contributingHist = [];
  users[newUser.username] = newUser;
  return users[newUser.username];
}


// validating user
function isValidUser(userObj){
  if(!userObj){
    return false;
  }
  if(!userObj.username || !users.hasOwnProperty(userObj.username)){
    return false;
  }
  return true;
}

function authenticateUser(username, password){
  console.log(username)
  try{
    return users.hasOwnProperty(username) && users[username].password == password;
  }
  catch(error){
    return error;
  }
}

function getUser(requestingUser, userID){
    //If the requesting user is invalid
    if(!isValidUser(requestingUser)){
      return null;
    }
    if(users.hasOwnProperty(userID)){
      if(requestingUser.username == userID || requestingUser.friends.includes(userID)){
        return users[userID];
      }
    }
    return null;
}


function getNameArr(str){
  str=str+''
  let arrStr = str.split(',');
  let nameArr = []
  for(let i=0; i < arrStr.length; i++){
    let name = arrStr[i].split('(')[0];
    if(name[0] === ' '){
      name = name.substring(1);
    }
    nameArr.push(name);
  }
  return nameArr;
}

function getRecMovie(movie){
  let movieArr = getMovie(movie);
  let recMovie = [];
  let length = 0;
  for(i in movies){
    if (length == 4){
      return recMovie;
    }
    if(movies[i].Title != movieArr[0].Title && movies[i].Genre.includes(movieArr[0].Genre[0])){
      recMovie.push(movies[i]);
      length++;
    }
  }
  return recMovie;
}

function makeSubscribe(user, people){
    if(!users.hasOwnProperty(user) || !users.hasOwnProperty(people)){
      return 0;
    }
    if(users[user].following.includes(people)){
      return 1;
    }
    users[user].following.push(people);
    return 2;
}

// Purpose: find a user
function searchUsers(requestingUser, searchTerm){
    let results = [];
    if(!isValidUser(requestingUser)){
      return results;
    }
    for(username in users){
      let user = users[username];
      if(user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0){
        if(user.username === requestingUser.username || requestingUser.following.includes(user.username)){
          results.push(user);
        }
      }
    }

  return results;
}


//Purpose: search Movie Title
function searchMovie(movieName){
  let results = [];
  for(nam in movies){
    let movie = movies[nam];
      if(movie.Title.includes(movieName)){
        results.push(movie);
    }
  }
return results;
}

//search people (writer, actor, director)
function searchPeople(peopleName){
  let results = [];
    for(i in movies){
      let moviepeople = movies[i];
      if(moviepeople.Actors.includes(peopleName)){
        results.push(moviepeople);
      }else if(moviepeople.Actors.includes(peopleName)){
        results.push(moviepeople);
      }else if(moviepeople.Director.includes(peopleName)){
        results.push(moviepeople);
      }
    }
  return results;
}

function createReview(requestingUser, title, newRev){
  let reviewArr = [];
  reviewArr.push(title);
  reviewArr.push(newRev);
  requestingUser.reviews.push(reviewArr);
  return newRev;
}

// generating a random movie on the Homepage if the user haven't or has logged in
function getRanMovie(){
  let movArr =[];
  for(let i =0;i< 4;i++){
    let a = Math.floor((Math.random()*2499)+0)
    console.log(a)
    movArr[i] = movies[a];
  }
  return movArr;
}

// get Specific movie by title or name
function getMovie(name){
  let movArr =[];
  for(i in movies){
    if(movies[i].Title == name){
      movArr.push(movies[i]);
    }
  }
  return movArr;

}

console.log("Accessing the JS file");

module.exports = {
  users,
  movies,
  isValidUser,
  createUser,
  getUser,
  makeSubscribe,
  searchUsers,
  searchMovie,
  searchPeople,
  authenticateUser,
  getRanMovie,
  getMovie,
  createReview,
  getNameArr,
  getRecMovie,
}