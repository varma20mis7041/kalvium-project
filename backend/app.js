const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.json());

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');



app.use(cors());

// Or, enable CORS for a specific origin (e.g., frontend URL)
// app.use(cors({ origin: 'http://localhost:3000' }));

// Your other routes and middlewares




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
// MongoDB connection and server initialization
const initializeDBAndServer = async () => {

 const username = encodeURIComponent(process.env.username);
    const password = encodeURIComponent(process.env.password);
    const uri = `mongodb+srv://${username}:${password}@cluster0.ki5m4.mongodb.net/ecs?retryWrites=true&w=majority&tls=true&appName=Cluster0`;
  
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB...");
        // Start the server after a successful database connection
        server.listen(9000, () => {
            console.log('Server running on port: 9000');
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

initializeDBAndServer();

const multer = require("multer");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Ensure PdfDetails model is defined
require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");

// Route to upload files
app.post("/upload-files", upload.single("file"), async (req, res) => {
  const title = req.body.title;
  const fileName = req.file.filename;
  console.log(title);
  console.log(fileName)

  try {
    await PdfSchema.create({ title: title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Route to get files
app.get("/get-files", async (req, res) => {
  try {
    const data = await PdfSchema.find({});
    res.send({ status: "ok", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Success!!!!!!");
});


