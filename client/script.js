const socket = io("http://localhost:3000", { path: "/room" });

const messages = document.querySelector(".messages");
const sendMsg = document.querySelector(".submit-msg");
const msgTextField = document.querySelector(".input-msg");

const displayName = window.localStorage.getItem("displayName");

socket.emit("joinChat", { displayName: displayName });

socket.on("message", (message) => {
  createMsg(message);
});

sendMsg.addEventListener("click", () => {
  const msg = msgTextField.value;
  if (!msg) return;
  socket.emit("chatMessage", { message: msg, displayName: displayName });
  console.log({ message: msg, displayName: displayName });
});

function createMsg({ message, displayName }) {
  const li = document.createElement("li");
  if (displayName) {
    li.textContent = `${displayName}: ${message}`;
  } else {
    console.log(message);
    li.textContent = `${message}`;
  }

  messages.append(li);
}
