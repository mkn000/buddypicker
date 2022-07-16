class Room {
  constructor(host, id, description) {
    this.users = new Map();
    this.selected = [];
  }

  addUser(user) {
    this.users.set(user.id, user);
  }

  removeUser(user) {
    this.users.delete(user.id);
  }
}

module.exports = { Room };
