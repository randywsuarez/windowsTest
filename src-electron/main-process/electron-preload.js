// Este archivo debe colocarse en src-electron/main-process/electron-preload.js
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Sin contextIsolation, podemos asignar directamente al objeto global window
window.electronAPI = {
  // Funciones para comunicación con el proceso principal
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  
  // Acceso a módulos de Node
  node: {
    require: require,
    process: process
  },
  
  // Función para obtener ruta de la aplicación
  getAppPath: () => {
    try {
      // Intentamos usar remote si está disponible (en versiones antiguas de Electron)
      const electronRemote = require('electron').remote;
      return electronRemote.app.getAppPath();
    } catch (error) {
      // Fallback: Devolvemos el directorio actual 
      return process.cwd();
    }
  },
  
  // Función para resolver rutas de imágenes
  resolveImagePath: (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return imagePath;
    }
    
    // Si es una URL o data URI, la devolvemos tal cual
    if (imagePath.startsWith('data:') || 
        imagePath.startsWith('http:') || 
        imagePath.startsWith('https:') || 
        imagePath.startsWith('file:')) {
      return imagePath;
    }
    
    // Si es una ruta absoluta, la formateamos como file://
    if (path.isAbsolute(imagePath)) {
      return url.format({
        pathname: imagePath,
        protocol: 'file:',
        slashes: true
      });
    }
    
    // Primero buscamos en el directorio public
    const appPath = process.cwd();
    let publicPath = path.join(appPath, 'public', imagePath);
    
    // Si no existe, intentamos sin el directorio public
    if (!fs.existsSync(publicPath)) {
      publicPath = path.join(appPath, imagePath);
    }
    
    // Si existe alguna de las rutas, devolvemos la URI de archivo
    if (fs.existsSync(publicPath)) {
      return url.format({
        pathname: publicPath,
        protocol: 'file:',
        slashes: true
      });
    }
    
    // Si no se encuentra, tratamos de buscar en resources/app.asar
    try {
      const asarPath = path.join(appPath, 'resources', 'app.asar', 'public', imagePath);
      // No podemos verificar fs.existsSync dentro del asar, así que intentamos con esta ruta
      return url.format({
        pathname: asarPath,
        protocol: 'file:',
        slashes: true
      });
    } catch (e) {
      console.error('Error al resolver ruta en asar:', e);
    }
    
    // Si no se encuentra, devolvemos la ruta original
    return imagePath;
  }
};

// Para compatibilidad con código existente
window.require = require;
window.process = process;

// Imprimir la ruta actual para fines de depuración
console.log('Aplicación ejecutándose desde:', process.cwd());

// Interceptar las solicitudes de imágenes estándar
const originalImage = window.Image;
window.Image = function() {
  const img = new originalImage();
  const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  
  Object.defineProperty(img, 'src', {
    get: function() {
      return originalSrcDescriptor.get.call(this);
    },
    set: function(value) {
      if (value) {
        try {
          const resolvedPath = window.electronAPI.resolveImagePath(value);
          originalSrcDescriptor.set.call(this, resolvedPath);
        } catch (error) {
          originalSrcDescriptor.set.call(this, value);
        }
      } else {
        originalSrcDescriptor.set.call(this, value);
      }
    }
  });
  
  return img;
};

// Sobrescribir XMLHttpRequest para interceptar las solicitudes de imágenes de q-img
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
  const xhr = new originalXHR();
  const originalOpen = xhr.open;
  
  xhr.open = function(method, url, ...args) {
    if (url && typeof url === 'string' && method.toLowerCase() === 'get') {
      // Verificar si parece una imagen
      const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];
      const isImage = imageExts.some(ext => url.toLowerCase().endsWith(ext));
      
      if (isImage) {
        try {
          const resolvedUrl = window.electronAPI.resolveImagePath(url);
          return originalOpen.call(this, method, resolvedUrl, ...args);
        } catch (error) {
          console.error('Error al resolver URL de imagen en XHR:', error);
        }
      }
    }
    
    return originalOpen.call(this, method, url, ...args);
  };
  
  return xhr;
};

// Interceptar el fetch API que podría ser usado por Quasar
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  if (input && typeof input === 'string') {
    // Verificar si parece una imagen
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];
    const isImage = imageExts.some(ext => input.toLowerCase().endsWith(ext));
    
    if (isImage) {
      try {
        const resolvedUrl = window.electronAPI.resolveImagePath(input);
        return originalFetch.call(this, resolvedUrl, init);
      } catch (error) {
        console.error('Error al resolver URL de imagen en fetch:', error);
      }
    }
  }
  
  return originalFetch.call(this, input, init);
};

// Procesar q-img existentes después de que se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Dar tiempo a que Quasar renderice los componentes
  setTimeout(() => {
    // Buscar todos los componentes q-img
    document.querySelectorAll('.q-img').forEach(qImg => {
      // Buscar la imagen dentro o los datos almacenados
      const imgElement = qImg.querySelector('img');
      if (imgElement && imgElement.src) {
        const originalSrc = imgElement.getAttribute('src');
        if (originalSrc) {
          try {
            imgElement.src = window.electronAPI.resolveImagePath(originalSrc);
          } catch (error) {
            console.error('Error al resolver imagen en q-img:', originalSrc, error);
          }
        }
      }
      
      // También intentar procesar el estilo de fondo (usado por q-img)
      const style = getComputedStyle(qImg);
      if (style.backgroundImage && style.backgroundImage.includes('url(')) {
        try {
          const urlMatch = style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            const originalBgUrl = urlMatch[1];
            const resolvedBgUrl = window.electronAPI.resolveImagePath(originalBgUrl);
            qImg.style.backgroundImage = `url("${resolvedBgUrl}")`;
          }
        } catch (error) {
          console.error('Error al resolver imagen de fondo en q-img:', error);
        }
      }
    });
    
    // También procesar imágenes normales por si acaso
    document.querySelectorAll('img').forEach(img => {
      if (img.src) {
        const originalSrc = img.getAttribute('src');
        if (originalSrc) {
          try {
            img.src = window.electronAPI.resolveImagePath(originalSrc);
          } catch (error) {
            console.error('Error al resolver imagen:', originalSrc, error);
          }
        }
      }
    });
  }, 200);
});

// Observar cambios en el DOM para procesar nuevos componentes q-img
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Verificar si el nodo es un q-img
          if (node.classList && node.classList.contains('q-img')) {
            const imgElement = node.querySelector('img');
            if (imgElement && imgElement.src) {
              try {
                imgElement.src = window.electronAPI.resolveImagePath(imgElement.src);
              } catch (error) {
                console.error('Error al resolver imagen en q-img (observador):', error);
              }
            }
          }
          
          // Buscar q-img dentro del nodo agregado
          node.querySelectorAll('.q-img').forEach(qImg => {
            const imgElement = qImg.querySelector('img');
            if (imgElement && imgElement.src) {
              try {
                imgElement.src = window.electronAPI.resolveImagePath(imgElement.src);
              } catch (error) {
                console.error('Error al resolver imagen en q-img (observador):', error);
              }
            }
          });
        }
      });
    }
  }
});

// Comenzar a observar el documento
document.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, { childList: true, subtree: true });
});

// Indicar que se ha cargado correctamente
console.log('Electron preload script cargado correctamente');