export function generateMessage(username, message) {
  return {
    username,
    message,
    createdAt: new Date().getTime(),
  };
}
