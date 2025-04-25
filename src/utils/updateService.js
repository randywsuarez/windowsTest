const fs = require('fs')
const path = require('path')

// Función simplificada que SOLAMENTE usa el directorio actual como base
// sin intentar usar la letra de unidad u otras alternativas
function getBasePath(targetFolder = '') {
  // Obtener directorio actual donde se está ejecutando la aplicación
  const currentDir = process.cwd();
  console.log('Executing from:', currentDir);
  
  // Construir ruta al directorio objetivo relativo al directorio actual
  // Siempre será currentDir + targetFolder
  const targetPath = path.join(currentDir, targetFolder);
  console.log(`Target path: ${targetPath}`);
  
  return targetPath;
}

// Función para asegurar que un directorio exista
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory successfully at: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error.message);
      return false;
    }
  }
  return true;
}

module.exports = ({ Vue }) => {
  Vue.prototype.$uploadTextFile = function (fileName, fileContent) {
    try {
      console.log(`Starting text file upload: ${fileName}`);
      
      // Obtener ruta a la carpeta Logs relativa al directorio actual
      // Esta es la parte clave: siempre usa currentDir/Logs sin alternativas
      const logsFolderPath = getBasePath('Logs');
      console.log(`Logs directory path: ${logsFolderPath}`);

      // Crear carpeta "Logs" si no existe
      if (!ensureDirectoryExists(logsFolderPath)) {
        throw new Error('Failed to create logs directory');
      }

      // Ruta completa del archivo
      const hasExtension = fileName.includes('.');
      const finalFileName = hasExtension ? fileName : `${fileName}.txt`;
      const textFilePath = path.join(logsFolderPath, finalFileName);
      console.log(`Full file path: ${textFilePath}`);

      // Convertir contenido a base64
      const base64Content = Buffer.from(fileContent).toString('base64');

      // Función para guardar archivos con reintentos
      const saveFile = (filePath, content, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            fs.writeFileSync(filePath, content);
            console.log(`File saved successfully at: ${filePath} (attempt ${attempt})`);
            
            // Verificar que el archivo se guardó correctamente
            if (fs.existsSync(filePath)) {
              const stats = fs.statSync(filePath);
              console.log(`File saved (size: ${stats.size} bytes)`);
              return true;
            } else {
              console.warn(`File appears not to have been saved correctly, retrying...`);
              continue;
            }
          } catch (error) {
            console.error(`Error saving file (attempt ${attempt}): ${filePath}`, error);
            if (attempt === retries) {
              return false;
            }
            // Pequeña pausa antes de reintentar
            console.log(`Retrying in 100ms...`);
            const startTime = new Date().getTime();
            while (new Date().getTime() - startTime < 100) { /* esperar */ }
          }
        }
        return false;
      };

      // Guardar archivo original con reintentos
      const saveResult = saveFile(textFilePath, fileContent);
      
      if (saveResult) {
        sessionStorage.setItem('txt', textFilePath);
        
        // Almacenar información del archivo en el prototipo de Vue
        Vue.prototype.$textFile = {
          original: {
            name: fileName,
            path: textFilePath,
          },
          base64: {
            name: `${fileName}_base64`,
            content: base64Content,
          },
        };
        
        return {
          success: true,
          SerialNumber: fileName,
          EmployeeID: '',
          FileType: '1',
          fileExtension: '.txt',
          fileBase64Str: base64Content,
          filePath: textFilePath
        };
      } else {
        throw new Error(`Failed to save file after multiple attempts`);
      }
    } catch (error) {
      console.error('Error in uploadTextFile:', error.message);
      console.error('Error details:', error);
      
      return {
        success: false,
        error: error.message,
        fileName: fileName
      };
    }
  };

  Vue.prototype.$readTextFile = function (filePath) {
    try {
      console.log(`Attempting to read file: ${filePath}`);
      
      // Si la ruta es relativa, resolverla desde el directorio actual
      if (!path.isAbsolute(filePath)) {
        // Primero intentar desde la carpeta Logs relativa al directorio actual
        const logsPath = getBasePath('Logs');
        const resolvedPath = path.join(logsPath, filePath);
        
        if (fs.existsSync(resolvedPath)) {
          filePath = resolvedPath;
          console.log(`Resolved relative path to: ${filePath}`);
        } else {
          // Si no se encuentra, intentar directamente desde el directorio actual
          const currentDirPath = path.join(process.cwd(), filePath);
          
          if (fs.existsSync(currentDirPath)) {
            filePath = currentDirPath;
            console.log(`Resolved relative path to: ${filePath}`);
          }
        }
      }
      
      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
      }
      
      // Leer el archivo
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`File read successfully: ${filePath} (${fileContent.length} characters)`);
      
      return fileContent;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null; // Retornar null si hay un error
    }
  };
};