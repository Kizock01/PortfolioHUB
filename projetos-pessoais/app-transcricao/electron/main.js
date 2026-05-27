const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

const isDev = process.env.ELECTRON_DEV === "1";
const backendPort = 8000;
const backendUrl = `http://127.0.0.1:${backendPort}`;

const userDataDir = app.getPath("userData");
const logsDir = path.join(userDataDir, "logs");
const modelsDir = path.join(userDataDir, "models");
fs.mkdirSync(logsDir, { recursive: true });
fs.mkdirSync(modelsDir, { recursive: true });

const electronLogPath = path.join(logsDir, "electron.log");
const backendLogPath = path.join(logsDir, "backend.log");

function logLine(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(electronLogPath, line, "utf8");
}

function resolveFfmpegPath() {
  const bundled = isDev
    ? path.join(process.cwd(), "resources", "ffmpeg", "ffmpeg.exe")
    : path.join(process.resourcesPath, "ffmpeg", "ffmpeg.exe");

  if (fs.existsSync(bundled)) {
    return bundled;
  }
  return process.env.FFMPEG_PATH || "";
}

function resolveBackendCommand() {
  if (isDev) {
    return {
      cmd: path.join(process.cwd(), ".venv", "Scripts", "python.exe"),
      args: [path.join(process.cwd(), "backend", "app_entry.py")],
      cwd: process.cwd(),
    };
  }

  return {
    cmd: path.join(process.resourcesPath, "backend", "backend.exe"),
    args: [],
    cwd: path.join(process.resourcesPath, "backend"),
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function waitForBackendReady() {
  let lastError = "backend not started";
  for (let i = 0; i < 60; i += 1) {
    try {
      const health = await fetchJson(`${backendUrl}/health`);
      const diagnostics = await fetchJson(`${backendUrl}/diagnostics`);
      const criticalErrors = (diagnostics.errors || []).filter((item) => {
        return String(item).includes("faster-whisper") || String(item).includes("model_loadable");
      });

      if (health.status === "ok" && criticalErrors.length === 0) {
        return { ok: true, diagnostics };
      }

      lastError = criticalErrors.join(" | ") || "health check retornou estado invalido";
    } catch (error) {
      lastError = error.message;
    }
    await wait(1000);
  }
  return { ok: false, error: lastError };
}

function startBackend() {
  if (backendProcess) {
    return;
  }

  const ffmpegPath = resolveFfmpegPath();
  const backend = resolveBackendCommand();
  logLine(`Starting backend command: ${backend.cmd} ${backend.args.join(" ")}`);

  backendProcess = spawn(backend.cmd, backend.args, {
    cwd: backend.cwd,
    windowsHide: true,
    env: {
      ...process.env,
      TRANSCRITOR_LOG_DIR: logsDir,
      WHISPER_MODEL_DIR: modelsDir,
      FFMPEG_PATH: ffmpegPath,
    },
  });

  const backendLogStream = fs.createWriteStream(backendLogPath, { flags: "a" });

  backendProcess.stdout.on("data", (chunk) => {
    backendLogStream.write(chunk);
  });

  backendProcess.stderr.on("data", (chunk) => {
    backendLogStream.write(chunk);
  });

  backendProcess.on("exit", (code) => {
    logLine(`Backend exited with code ${code}`);
    backendProcess = null;
  });
}

function stopBackend() {
  if (!backendProcess) {
    return;
  }
  backendProcess.kill();
  backendProcess = null;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const status = await waitForBackendReady();

  if (!status.ok) {
    const errorPage = path.join(__dirname, "startup-error.html");
    await mainWindow.loadFile(errorPage);
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow.webContents.send("startup-error", {
        message: status.error,
        logPath: backendLogPath,
      });
    });
    return;
  }

  if (isDev) {
    await mainWindow.loadURL("http://localhost:3000");
  } else {
    await mainWindow.loadFile(path.join(process.resourcesPath, "app", "frontend", "out", "index.html"));
  }
}

app.whenReady().then(async () => {
  logLine("Electron ready");
  startBackend();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

ipcMain.handle("app:retry-backend", async () => {
  stopBackend();
  await wait(800);
  startBackend();
  const status = await waitForBackendReady();
  if (status.ok && mainWindow) {
    if (isDev) {
      await mainWindow.loadURL("http://localhost:3000");
    } else {
      await mainWindow.loadFile(path.join(process.resourcesPath, "app", "frontend", "out", "index.html"));
    }
  }
  return status;
});

ipcMain.handle("app:open-logs", async () => {
  await shell.openPath(logsDir);
  return true;
});

app.on("window-all-closed", () => {
  stopBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopBackend();
});
