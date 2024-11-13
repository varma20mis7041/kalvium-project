const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.json());

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');



app.use(cors());



app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);


const http = require("http");

const server = http.createServer(app);

const {Server} = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("A new user has connected", socket.id);

  try {
    socket.on("page", (data) => {
      socket.broadcast.emit("currentpage", data);
      console.log("currentpage", data);
    });

    socket.on("index", (index) => {
      socket.broadcast.emit("currentindex", index);
      console.log("currentindex", index);
    });

    socket.on("admin", (presentationDetails) => {
      if(presentationDetails) {
        socket.broadcast.emit("currentAdmin", presentationDetails);
        console.log(presentationDetails)
      } else {
        console.error("userName is undefined");
      }
    });
  } catch (error) {
    console.error("Error in socket event handling:", error);
  }
});



app.use(express.json());


app.use("/files",express.static("files"))

const initializeDBAndServer = async () => {

 const username = encodeURIComponent("bhargavcoding");
    const password = encodeURIComponent("bv@9177221342");
    const uri = `mongodb+srv://${username}:${password}@cluster0.ki5m4.mongodb.net/ecs?retryWrites=true&w=majority&tls=true&appName=Cluster0`;
  
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB...");
        server.listen(9000, () => {
            console.log('Server running on port: 9000');
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

initializeDBAndServer();

