# How it works

This system comprises a Dashboard App, Node JS Server, and Python GPS Backend.
This repository assumes you already have the Python GPS Backend Code, which will run on a single-board computer (e.g. Raspberry Pi) that is interfaced with GPS module.
On the other hand, the Dashboard App and Node JS Server must run on the same device but can be separated from the Python code. The data communication is done with Socket IO (https://socket.io/).
The Node JS Server will act as Socket IO server that handles other clients: the Dashboard App and the Python Backend Code. Adjust Socket IO connection from Python Backend Code to Node JS Server because there will be a case in which the two of them will be running on different devices. This can be done by changing the IP Address of the Node JS Server device on the Python Backend Code.

Download packaged Dashboard App here: https://ncjpn01.sharepoint.com/:u:/r/sites/ITBdeLabo/Shared%20Documents/MSD700-ITB/MSD700%20GPS/GPS-Dashboard%20App/GPS-Dashboard-Forklift.zip?csf=1&web=1&e=Cx13p7

## Installation

For Dashboard App and Node JS Server device:

1. Install Node js and NPM (use latest stable version)
   [Download Node js](https://nodejs.org/en/).
   check node js and npm version :

```bash
node -v
npm -v
```

2. Install Socket IO library

```bash
npm i socket.io
```

3. Install express

```bash
npm install express
```

4. Install cors

```bash
npm i cors
```

For Python GPS Backend:

1. Make sure Socket IO connect to the Node JS Server. Check the server address if it is already matches with the IP Address of Node JS Server device running.
   Check the following code:

```bash
sio.connect("http://<IP-address-or-localhost>:3000)
```

2. Make sure the port of GPS module is correct.
   Check port address:

```bash
ls -l /dev/tty*
```

3. Make sure the GPS data emitter point to the correct "gps" event.
   Check the following code:

```bash
sio.emit("gps",payload)
```

## Running the App

1. Running Node to start the server
   make sure the directory is on ../server

```bash
node server.js
```

2. Make sure the Python GPS Backend already running. You can check if the data already passed from it in the Node JS Server terminal.

3. Running the App
   just launch the application file from the downloaded app folder
