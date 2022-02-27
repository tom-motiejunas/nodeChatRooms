const emailInput = document.querySelector(".email-input");
const passwordInput = document.querySelector(".password-input");
const logInBtn = document.querySelector(".logIn-btn");

const storage = window.localStorage;

logInBtn.addEventListener("click", async () => {
  const emailValue = emailInput.value;
  const passwordValue = passwordInput.value;

  if (!emailValue || !passwordValue) return;
  const logInData = {
    email: emailValue,
    password: passwordValue,
  };
  const response = await sendLogIn(logInData);
  storage.setItem("displayName", response.displayName);
  window.location.replace("http://localhost:8080/room.html");
});

const sendLogIn = async function (logInData) {
  const response = await fetch("http://localhost:3000/user/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(logInData),
  });
  return response.json();
};
