/* Function To Save The User Input */
function saveMessage() {
    var userInput = "First Name: ";
    userInput += document.getElementById("firstName").value;
    userInput += ";Second Name: ";
    userInput += document.getElementById("lastName").value;
    userInput += ";Email: ";
    userInput += document.getElementById("email").value;
    userInput += ";Subject: ";
    userInput += document.getElementById("subject").value;

    alert("Mail Sent Successfully")
}