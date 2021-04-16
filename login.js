let signUpBut = document.getElementById("signup");
signUpBut.onclick = signup;
let loginBut = document.getElementById("login");
loginBut.onclick = login;

function signup(){
  window.location.href = "/signup";
}