/* Function To Get Element From HTML*/
/* Used To Get Player Name*/
function getPlayerName() {
    var startName = document.getElementById("myText").value;
    sessionStorage.setItem("playerInitialName", startName);
}