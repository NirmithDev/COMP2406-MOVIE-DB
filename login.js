let signUpBut = document.getElementById("signup");
signUpBut.onclick = signup;

function signup(){
  window.location.href = "/signup";
}

let loginBut = document.getElementById("login");
loginBut.onclick = login;
function login(){
  window.location.href="/login"
}