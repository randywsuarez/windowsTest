// src/boot/image.js

// Función para resolver rutas de imágenes en entorno Electron
export default async ({ Vue }) => {
	// Directiva personalizada para resolver rutas de imágenes
	Vue.directive('img-src', {
	  bind(el, binding) {
		// Si estamos en Electron y tenemos el API para resolver imágenes
		if (window.electronAPI && window.electronAPI.resolveImagePath) {
		  el.src = window.electronAPI.resolveImagePath(binding.value);
		} else {
		  // Fallback para entorno web normal
		  el.src = binding.value;
		}
	  },
	  update(el, binding) {
		if (binding.oldValue !== binding.value) {
		  if (window.electronAPI && window.electronAPI.resolveImagePath) {
			el.src = window.electronAPI.resolveImagePath(binding.value);
		  } else {
			el.src = binding.value;
		  }
		}
	  }
	});
  
	// Método global para resolver rutas de imágenes
	Vue.prototype.$resolveImage = (imagePath) => {
	  if (window.electronAPI && window.electronAPI.resolveImagePath) {
		return window.electronAPI.resolveImagePath(imagePath);
	  }
	  return imagePath;
	};
  }