const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();

const port = normalizePort(process.env.PORT || "4200");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

//ip address here?
server.listen(port);
server.on("listening", onListening);
server.on("error", onError);

/**
 * Socket events
 *
 */

let rooms = new Map();
let clients = {};
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("New connection, id: " + socket.id);
  socket.on("find", (id, callback) => {
    if (rooms.has(id)) {
      const room = rooms.get(id);
      callback({
        id: id,
        host: room.host,
        title: room.title,
      });
    }
  });
  socket.on("check", (sesId) => {
    if (rooms.has(sesId)) {
      socket.emit("receive", {
        success: true,
        session: rooms.get(sesId),
      });
    } else {
      socket.emit("receive", {
        success: false,
        session: "no such session",
      });
    }
  });

  socket.on("join", (sesId, user, callback) => {
    try {
      const room = rooms.get(sesId);
      user.id = socket.id;
      room.users[user.id] = user;
      Object.keys(room.users).forEach((key) => {
        socket.to(key).emit("new_user", user);
      });
      socket.to(room.host.id).emit("new_user", user);
      clients[socket.id] = { session: sesId };
      callback({
        success: true,
      });
    } catch {
      callback({
        success: false,
        msg: "No such session",
      });
    }
  });

  socket.on("leave", (sesId) => {
    try {
      const room = rooms.get(sesId);
      delete room.users[socket.id];
      delete clients[socket.id];
      Object.keys(room.users).forEach((key) => {
        socket.to(key).emit("remove_user", socket.id);
      });
      socket.to(room.host.id).emit("remove_user", socket.id);
    } catch {
      console.log("attempted removal from non-existing session");
    }
  });

  socket.on("create", (ses, callback) => {
    ses.host.id = socket.id;
    let sesId;
    do {
      sesId = crypto.randomBytes(3).toString("hex");
    } while (rooms.has(sesId));
    console.log("New session created, id: " + sesId);
    ses.sesId = sesId;
    rooms.set(sesId, ses);
    clients[socket.id] = { session: sesId };
    callback({ sesId: sesId });
  });

  socket.on("send_message", (clients, msg) => {
    clients.forEach((client) => {
      socket.to(client).emit("message", msg);
    });
  });

  socket.on("update_id", (data) => {
    console.log(data);
    clearTimeout(clients[data.oldId].timer);
    let room = rooms.get(data.sesId);
    if (data.oldId === room.host.id) {
      room.host.id = data.currentId;
      clients[data.currentId] = data.sesId;
      delete clients[data.oldId];
    } else {
      let user = rooms.get(data.sesId).users[data.old_id];
      user.id = data.current_id;
    }
  });

  socket.on("disconnect", (reason) => {
    try {
      console.log(reason);
      let sesId = clients[socket.id].session;
      let room = rooms.get(sesId);
      if (!(sesId && room)) {
        console.log("nothing to do");
        return;
      }

      if (socket.id === room.host.id) {
        console.log("setting timer");
        clients[socket.id].timer = setTimeout(() => {
          Object.keys(room.users).forEach((key) => {
            socket.to(key).emit("session_closed");
          });
          rooms.delete(sesId);
        }, 1 * 1000); //1 minute
      } else {
        clients[socket.id].timer = setTimeout(() => {
          delete room.users[socket.id];
          delete clients[socket.id];
          Object.keys(room.users).forEach((key) => {
            socket.to(key).emit("remove_user", socket.id);
          });
          socket.to(room.host.id).emit("remove_user", socket.id);
        }, 15 * 1000); //15 seconds
      }
    } catch {
      console.log("session was already closed");
    }
  });
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}

// view engine setup

/*
app.set('index', path.join(__dirname, '/dist/loppurealtime/'));
app.set('view engine', 'html');
*/
app.use(express.json());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./dist/buddypicker")));

const index = require("./utils/index");
app.use("/", index); // index-reitti

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
