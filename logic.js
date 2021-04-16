let users = require("./Movie/users.json");
let movies = require("./Movie/movie-data.json");


// Purpose: Create the user with all the defult value; Input: newUser - object; output: object
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


// Purpose: Check the user enter whether valid .
function isValidUser(userObj){
  if(!userObj){
    return false;
  }
  if(!userObj.username || !users.hasOwnProperty(userObj.username)){
    return false;
  }
  return true;
}

// Purpose: Check whether is authenticateUser
function authenticateUser(username, password){
  //if (err) return err;
  console.log(username)
  try{
    return users.hasOwnProperty(username) && users[username].password == password;
  }
  catch(err){
    return err;
  }
}

// Purpose: Get the user infor by given input username,
function getUser(requestingUser, userID){
    //If the requesting user is invalid
    if(!isValidUser(requestingUser)){
      return null;
    }
    //If the requested userID exists and the requesting user is allowed to access it, return the user
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
    //check if the first string whetehr contains space bar
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

  // get 4 movies into array based on users last search
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


/*
Input: user - who want to subscribe, and the people who has been subscribed by other
*/
function makeSubscribe(user, people){
    let flag = 0;
    //If one of the user doesn't exist, stop
    if(!users.hasOwnProperty(user) || !users.hasOwnProperty(people)){
      return flag;
    }
    //If the users are already Subscribe, stop
    if(users[user].following.includes(people)){
      flag = 1;
      return flag;
    }
    users[user].following.push(people);
    flag = 2;
    return flag;
}

// Purpose: search the user
function searchUsers(requestingUser, searchTerm){
    let results = [];

    if(!isValidUser(requestingUser)){
      return results;
    }

    for(username in users){
      let user = users[username];
      //if it satisifes the condition
      if(user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0){
        //If the requesting user is allowed to access the matching user
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

  //If the user is not valid, return an empty array.
  //You could return null to indicate an error or any other value to signify the requesting user was not valid.
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

function createReview(requestingUser, title, newR){
  //Verify the contents of the question and we should verify the user
  let reviewArr = [];

  reviewArr.push(title);
  reviewArr.push(newR);

  requestingUser.reviews.push(reviewArr);

  return newR;
}

// Purpose : generated random movie on the Homepage if the user haven't login
function getRanMovie(){
  let movArr =[];
  for(let i =0;i< 4;i++){
    let a = Math.floor((Math.random()*2499)+0)
    console.log(a)
    movArr[i] = movies[a];
  }
  return movArr;
}

// Purpose : get Specific movie
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