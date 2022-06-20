/* Function To Get Element From HTML*/
/* Used To Get Player Name*/
function getPlayerName() {
    var startName = document.getElementById("playerName").value;
    sessionStorage.setItem("playerInitialName", startName);
}

/* Function To Start The Game*/
/* Transfer The HTML File From index.html to game.html*/
function startGame() {
    getPlayerName();
    window.location.href = "game.html";
}

/* Variable Used To Display The Current Time In The HTML*/
setInterval(updataTime, 1000);
function updataTime() {
    document.getElementById("currentDate").innerHTML = Date();
}

function onloadUpdateTime() {
    document.getElementById("currentDate").innerHTML = Date();
}