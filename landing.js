// if (localStorage.getItem("username")) {
//     document.getElementById("landing-page").style.display = "none";
// }

function startGame(){
  
  const el = document.getElementById("landing-page");
  let username = document.getElementById("username").value.trim()
  if (username != "") {
    localStorage.setItem("username", username);
    el.style.display = "none";
    showTadekDialog(0);

  }else{
    alert("Nazwa użytkownika nie może być pusta!")
  }
}
