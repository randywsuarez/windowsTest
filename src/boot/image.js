const fs = require('fs')
const path = require('path')

// Helper function to get path with fallback to current directory
function getBasePath(targetFolder = '') {
  // Get current directory
  const currentDir = process.cwd();
  console.log('Executing from:', currentDir);
  
  // Get drive letter
  const driveLetter = currentDir.split(path.sep)[0] + path.sep;
  
  // Primary path (using drive letter)
  // NOTA: He eliminado '..' ya que puede causar problemas con la resolución de rutas
  // path.join(driveLetter, '..', targetFolder) -> path.join(driveLetter, targetFolder)
  const primaryPath = path.join(driveLetter, targetFolder);
  
  // Alternate path (using current directory)
  const alternatePath = path.join(currentDir, targetFolder);
  
  // Check if primary path exists
  if (fs.existsSync(primaryPath)) {
    console.log(`Using primary path: ${primaryPath}`);
    return primaryPath;
  } else {
    // Use current directory as fallback
    console.log(`Primary path not found, using alternate path: ${alternatePath}`);
    // Crear el directorio si no existe
    ensureDirectoryExists(alternatePath);
    return alternatePath;
  }
}

// Función para asegurarse de que un directorio exista
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Directory created successfully: ${dirPath}`);
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error.message);
    }
  }
  return dirPath;
}

// Función para generar un nombre de archivo único
function getUniqueFileName(baseName, extension) {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${baseName}-${timestamp}-${randomStr}${extension}`;
}

module.exports = ({ Vue }) => {
  Vue.prototype.$uploadImage = function (imageName, imageData, options = {}) {
    try {
      console.log(`Iniciando carga de imagen: ${imageName}`);
      
      // Get directory path where images will be saved with fallback
      const imagesDirectory = getBasePath('LogPics');
      console.log(`Directorio para imágenes: ${imagesDirectory}`);

      // Create directory if it doesn't exist (ya está manejado en getBasePath)
      
      // Opción para usar nombres de archivo únicos
      const useUniqueNames = options.useUniqueNames !== false; // Por defecto true
      
      // Determinar el nombre final del archivo
      let finalImageName = imageName;
      if (useUniqueNames) {
        const extension = path.extname(imageName) || '.jpg';
        const baseName = path.basename(imageName, extension);
        finalImageName = getUniqueFileName(baseName, extension);
        console.log(`Usando nombre único para la imagen: ${finalImageName}`);
      }
      
      // Complete path to save the image
      const imagePath = path.join(imagesDirectory, finalImageName);
      console.log(`Ruta completa de la imagen: ${imagePath}`);

      // Verificar si es base64 o ya es un buffer
      let imageBuffer;
      if (typeof imageData === 'string') {
        // Remove the header from base64 data (e.g., "data:image/jpeg;base64,")
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        
        // Convert base64 data to buffer
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (Buffer.isBuffer(imageData)) {
        imageBuffer = imageData;
      } else {
        throw new Error('Formato de datos de imagen no soportado');
      }

      // Save buffer as a JPG file in the directory
      try {
        fs.writeFileSync(imagePath, imageBuffer);
        sessionStorage.setItem('image', imagePath);
        console.log(`Image saved successfully at: ${imagePath}`);
        
        // Opcional: verificar que el archivo se haya guardado correctamente
        if (fs.existsSync(imagePath)) {
          const stats = fs.statSync(imagePath);
          console.log(`Archivo guardado (tamaño: ${stats.size} bytes)`);
        } else {
          console.warn('El archivo parece no haberse guardado correctamente');
        }
        
        // Add image to "image" prototype
        Vue.prototype.$imageFile = {
          name: finalImageName,
          path: imagePath,
          size: imageBuffer.length
        };
        
        // Devolver información sobre la imagen guardada para mayor flexibilidad
        return {
          success: true,
          name: finalImageName,
          path: imagePath,
          size: imageBuffer.length
        };
      } catch (error) {
        // Add more information to error message
        console.error('Error saving image:', error.message);
        console.error('Error details:', error);
        
        // También devolver información sobre el error
        return {
          success: false,
          error: error.message,
          name: finalImageName,
          path: imagePath
        };
      }
    } catch (mainError) {
      // Capturar cualquier error que pueda ocurrir en el proceso
      console.error('Error crítico en uploadImage:', mainError.message);
      console.error('Error details:', mainError);
      
      // Devolver información sobre el error
      return {
        success: false,
        error: mainError.message
      };
    }
  };
  
  // Método adicional para cargar múltiples imágenes
  Vue.prototype.$uploadMultipleImages = function (imagesArray) {
    if (!Array.isArray(imagesArray)) {
      console.error('Expected an array of images');
      return { success: false, error: 'Invalid input: expected an array' };
    }
    
    const results = [];
    
    imagesArray.forEach((imageItem, index) => {
      if (!imageItem.name || !imageItem.data) {
        results.push({
          success: false,
          error: 'Missing name or data for image',
          index
        });
        return;
      }
      
      const result = this.$uploadImage(imageItem.name, imageItem.data, imageItem.options);
      results.push({
        ...result,
        index
      });
    });
    
    return {
      success: results.every(r => r.success),
      results
    };
  };
};