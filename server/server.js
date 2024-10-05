const express = require("express")
const cors = require("cors")
const app = express()

app.use(express.json())

/* Setting Up CORS */
app.use(cors())
app.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  next()
})

/* Running the server on port */
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  let ports = server.address().port
  console.log("App now running on port", ports)
})

/* Setting up socket.io */
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
})

const MOVING_TIMEOUT = 5000
const CONNECTION_TIMEOUT = 10000
const DISCONNECTED = "Disconnected"
const IDLE = "Idle"
const WORKING = "Working"

var vehicleList = []
var movingTimeouts = []
var connectionTimeout = []
io.on("connection", (socket) => {
  socket.on("gps", (data) => {
    payload = JSON.parse(data)

    let vehicleFound = false
    /* Search for exising robot */
    for (let i = 0; i < vehicleList.length; i++) {
      if (vehicleList[i].id == payload.id) {
        vehicleList[i].data.latitude = payload.data.latitude
        vehicleList[i].data.longitude = payload.data.longitude
        vehicleList[i].data.status = payload.data.status
        vehicleList[i].data.vehicleName = payload.data.vehicleName
        if (!(vehicleList[i].data.longitude == payload.data.longitude && vehicleList[i].data.latitude == payload.data.latitude)) {
          resetMovingTimeout(payload.id)
          vehicleList[i].data.state = WORKING
        }
        if (vehicleList[i].data.state == DISCONNECTED) {
          resetMovingTimeout(payload.id)
          vehicleList[i].data.state = WORKING
        }
        resetConnectionTimeout(payload.id)

        vehicleFound = true
        break
      }
    }
    if (!vehicleFound) {
      /* Assume every robot working when connected in the first time */
      payload.data.state = WORKING
      vehicleList.push(payload)
      registerConnectionTimeout(payload.id)
      registerMovingTimeout(payload.id)
    }
  })
})

setInterval(()=>{
  console.log("vehicle-list", vehicleList)
  io.emit("vehicle-list", vehicleList)
}, 3000);

function setState(id, state) {
  for (let i = 0; i < vehicleList.length; i++) {
    if (vehicleList[i].id == id) {
      if (vehicleList[i].data.state == DISCONNECTED && state == IDLE) return; /* Safe guard for moving and connection timeout race condition */
      vehicleList[i].data.state = state
      break
    }
  }
}

function registerMovingTimeout(id) {
  timeout = setTimeout(() => {
    console.log("Timeout for ", id)
    setState(id, IDLE)
  }, MOVING_TIMEOUT)
  movingTimeouts.push({ id: id, timeout: timeout })
}

function registerConnectionTimeout(id) {
  timeout = setTimeout(() => {
    setState(id, DISCONNECTED)
  }, CONNECTION_TIMEOUT)
  connectionTimeout.push({ id: id, timeout: timeout })
}

function resetMovingTimeout(id) {
  console.log("Resetting moving timeout for ", id)
  for (let i = 0; i < movingTimeouts.length; i++) {
    if (movingTimeouts[i].id == id) {
      clearTimeout(movingTimeouts[i].timeout)
      movingTimeouts[i].timeout = setTimeout(() => {
        setState(id, IDLE)
      }, MOVING_TIMEOUT)
      break
    }
  }
}

function resetConnectionTimeout(id) {
  for (let i = 0; i < connectionTimeout.length; i++) {
    if (connectionTimeout[i].id == id) {
      clearTimeout(connectionTimeout[i].timeout)
      connectionTimeout[i].timeout = setTimeout(() => {
        setState(id, DISCONNECTED)
      }, CONNECTION_TIMEOUT)
      break
    }
  }
}

