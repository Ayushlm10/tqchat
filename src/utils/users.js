const users = [];

//add user to a room
export function addUser({ id, username, room }) {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Need both username and room!",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });
  if (existingUser) {
    return {
      error: "User already exists in this room",
    };
  }

  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return user;
}

//remove a user
export function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

//get a particular user
export function getUser(id) {
  const user = users.find((user) => user.id === id);
  return user;
}

//get users in a room
export function getUsersInRoom(room) {
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom;
}
