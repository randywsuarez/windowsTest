module.exports = ({ Vue }) => {
  Vue.prototype.$uploadTextFile = function (fileName, fileContent) {
    try {
      console.log(`Processing text file: ${fileName}`);
      
      // Verificar si fileName ya tiene extensión
      const hasExtension = fileName.includes('.');
      const baseFileName = hasExtension ? fileName : `${fileName}.txt`;
      
      // Obtener la extensión del archivo sin usar path.extname
      const getFileExtension = (filename) => {
        const lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '.txt';
      };
      
      // Convertir contenido a base64 directamente
      const base64Content = Buffer.from(fileContent).toString('base64');
      console.log(`File converted to base64 successfully (${base64Content.length} characters)`);
      
      // Almacenar información del archivo en el prototipo de Vue (opcional)
      Vue.prototype.$textFile = {
        original: {
          name: fileName,
          content: fileContent
        },
        base64: {
          name: `${fileName}_base64`,
          content: base64Content
        }
      };
      
      // Retornar objeto con la información necesaria
      return {
        success: true,
        SerialNumber: fileName,
        EmployeeID: '',
        FileType: '1',
        fileExtension: getFileExtension(baseFileName),
        fileBase64Str: base64Content,
        // No hay filePath porque no se crea un archivo físico
      };
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
  
  // Esta función ya no es necesaria porque no creamos archivos físicos
  // La mantenemos por compatibilidad, pero ahora recupera el contenido de la memoria
  Vue.prototype.$readTextFile = function (fileName) {
    try {
      // Si tenemos el contenido en memoria, lo devolvemos
      if (Vue.prototype.$textFile && Vue.prototype.$textFile.original.name === fileName) {
        return Vue.prototype.$textFile.original.content;
      }
      
      console.error(`File content not found in memory: ${fileName}`);
      return null;
    } catch (error) {
      console.error(`Error reading file content from memory: ${fileName}`, error);
      return null;
    }
  };
};