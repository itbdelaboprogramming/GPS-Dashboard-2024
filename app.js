const { app, BrowserWindow, protocol } = require("electron")
const url = require("url")
const path = require("path")

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: true,
    },
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/olmap/index.html`),
      protocol: "file:",
      slashes: true,
    }),
  )
  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on("closed", function () {
    mainWindow = null
  })
  mainWindow.webContents.on("did-fail-load", () =>
    {
      console.error(`Failed to load URL: ${event.errorDescription}`)
      mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, `/dist/olmap/index.html`),
          protocol: "file:",
          slashes: true,
        }),
      )
    }
  )

  // protocol.registerFileProtocol('file', (request, callback) => {
  //   const filePath = request.url.replace('file:///', '');
  //   const normalizedPath = path.normalize(`${__dirname}/${filePath}`);
  //   callback(normalizedPath);
  // });

  // protocol.interceptFileProtocol('file', (request, callback) => {
  //   const url = request.url.substr(7); // Remove the 'file://' prefix
  //   callback({ path: path.normalize(`${__dirname}/${url}`) });
  // });
}

app.on("ready", createWindow)

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})

app.on("will-prevent-unload", (event) => {
  // Handle the event to prevent the default behavior, if necessary
  event.preventDefault()
})

app.on("activate", function () {
  if (mainWindow === null) createWindow()
})
