const $messageButton = document.getElementById("messageButton");
const $messageFormInput = document.getElementById("msgInput");
const $locationBtn = document.getElementById("location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //visible height
  const visibleHeight= $messages.offsetHeight

  const containerHeight = $messages.scrollHeight 
  //how far we have scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}
socket.on("welcome", (welcomeMsg) => {
  console.log("Welcome message received from the server:", welcomeMsg);
});

//normal messages
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.message,
    createdAt: moment(message.createdAt).format("h:mm a"),
    username : message.username
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

//location messages
socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationTemplate, {
    location: location.message,
    createdAt: moment(location.createdAt).format("h:mm a"),
    username : message.username
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector("#sidebar").innerHTML = html
})

//send message input to the server
document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $messageButton.setAttribute("disabled", "disabled");
  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, (error) => {
    $messageButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      alert(error);
    }
    console.log("Message delivered");
  });
});

//Click on location button to send server the coords
//after fetching from geolocation apis
$locationBtn.addEventListener("click", () => {
  $locationBtn.setAttribute("disabled", "disabled");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      };
      socket.emit("sendLocation", coords, (serverAck) => {
        $locationBtn.removeAttribute("disabled");
        console.log(serverAck);
      });
    });
  }
});

//grab the username and room and send to server
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
