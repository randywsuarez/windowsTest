const { exec } = require("child_process");

const path = require("path");

// Obtén la ruta del directorio actual
const currentDirectory = __dirname;

// Construye la ruta completa al directorio "scripts"
const scriptsDirectory = path.join(currentDirectory, "..", "scripts");
const CmdHelper = {
  executeScript: function (scriptPath, callback) {
    // Construye la ruta completa al script PowerShell
    const powershellScriptPath = path.join(
      scriptsDirectory,
      `${scriptPath}.ps1`
    );
    exec(
      `cmd /c powershell -File ${powershellScriptPath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }

        try {
          const result = JSON.parse(stdout);
          callback(null, result);
        } catch (parseError) {
          console.error("Error parsing output as JSON:", parseError.message);
          callback(parseError, null);
        }
      }
    );
  },
};

export default ({ app, router, Vue }) => {
  // Agrega el objeto prototipo como un método de Vue.prototype
  Vue.prototype.$cmd = CmdHelper;
};
