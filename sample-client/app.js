const myUsername = prompt("Please enter your name") ?? "Anonymous";
const socket = new WebSocket(
    `ws://35.238.216.237/socket/start_web_socket?username=${myUsername}`
);

socket.onmessage = (m) => {
    const data = JSON.parse(m.data);
    switch (data.event) {
        case "update-users":
            let userListHtml = "";
            for (const username of data.usernames) {
                userListHtml += `<div>${username}</div>`;
            }
            document.getElementById("users").innerHTML = userListHtml;
            break;

        case "send-message":
            const conversationDiv = document.getElementById("conversation") 
            conversationDiv.innerHTML += `<b>${data.username}</b>: ${data.message}<br/>`;
            break;
    }
};

window.onload = () => {
    document.getElementById("data").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const inputElement = document.getElementById("data");
            var message = inputElement.value;
            inputElement.value = "";
            socket.send(
                JSON.stringify({
                    event: "send-message",
                    message: message,
                })
            );
        }
    });
};