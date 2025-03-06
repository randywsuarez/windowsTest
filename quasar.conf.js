/* eslint-env node */
const packageJson = require('./package.json');

module.exports = function (/* ctx */) {
	return {
		lang: {
			default: 'en-us',
			locales: ['en-us', 'es'],
		},
		supportTS: false,
		boot: [
			'i18n',
			'axios',
			'rsNeDB',
			'env',
			'cmd',
			'db',
			'image',
			'txt',
			'systemInformation',
		],
		css: ['app.scss'],
		extras: [
			'roboto-font',
			'material-icons',
		],
		build: {
			transpileDependencies: ['uuid'],
			extendWebpack(cfg) {
				// Configura webpack para tratar ciertos módulos como externos
				cfg.externals = {
					url: 'commonjs url',
					path: 'commonjs path',
					fs: 'commonjs fs',
					os: 'commonjs os',
				};
				
				// Para compatibilidad con Electron
				cfg.target = 'electron-renderer';
			}
		},
		devServer: {
			https: false,
			port: 8080,
			open: true,
		},
		framework: {
			iconSet: 'material-icons',
			lang: 'en-us',
			config: {
				dark: false,
			},
			importStrategy: 'all',
			plugins: ['Loading', 'Notify', 'LocalStorage', 'Dialog'],
		},
		animations: [],
		ssr: {
			pwa: false,
		},
		pwa: {
			workboxPluginMode: 'GenerateSW',
			workboxOptions: {},
			manifest: {
				name: `Windows Test -ISPT Services`,
				short_name: `Windows Test -ISPT Services`,
				description: `Unit Test`,
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#ffffff',
				theme_color: '#027be3',
				icons: [
					{
						src: 'icons/icon-128x128.png',
						sizes: '128x128',
						type: 'image/png',
					},
					{
						src: 'icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'icons/icon-256x256.png',
						sizes: '256x256',
						type: 'image/png',
					},
					{
						src: 'icons/icon-384x384.png',
						sizes: '384x384',
						type: 'image/png',
					},
					{
						src: 'icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
			},
		},
		cordova: {},
		capacitor: {
			hideSplashscreen: true,
		},
		electron: {
			bundler: 'builder',
			
			// Configuración para packager
			packager: {
				extraResource: [
					'.quasar/electron/electron-preload.js',
					'src-electron/main-process/electron-preload.js'
				],
				// Asegurar que las imágenes se copien correctamente
				ignore: [
					/node_modules/,
					/src/
				]
			},
			
			// Configuración para builder
			builder: {
				// Información básica del producto
				appId: `com.${packageJson.author?.name?.toLowerCase().replace(/\s+/g, '') || 'randysuarez'}.${packageJson.name}`,
				productName: packageJson.productName,
				copyright: packageJson.copyright || `Copyright © ${new Date().getFullYear()} ${packageJson.author?.name || 'Randy Suarez'}`,
				buildVersion: packageJson.buildVersion || packageJson.version,
				
				// Configuración para Windows 
				win: {
					certificateFile: 'local_signature.pfx',
					certificatePassword: 'V3n3zu3l@#',
					
					// Generar las versiones según configuración
					target: [
						{
							target: 'portable',
							arch: ['x64']
						},
						{
							target: 'dir',
							arch: ['x64']
						}
					],
					
					// Información desde package.json
					publisherName: packageJson.publisherName || packageJson.author?.name || 'Randy Suarez',
					legalTrademarks: packageJson.legalTrademarks || packageJson.companyName || packageJson.author?.name || 'Randy Suarez',
					
					// Solicitar privilegios de administrador según package.json
					requestedExecutionLevel: packageJson.requestAdminPrivileges ? 
						'requireAdministrator' : 'asInvoker',
					
					// Icono de la aplicación
					icon: 'src-electron/icons/icon.ico',
				},
				
				// Configuración específica para portable
				portable: {
					artifactName: `${packageJson.productName.replace(/\s+/g, '-')}-Portable-${packageJson.version}.exe`,
					unicode: false
				},
				
				// Otras configuraciones para optimizar el empaquetado
				asar: true,
				compression: 'maximum',
				
				// IMPORTANTE: Copiar los archivos de public/ a la raíz del directorio de salida
				extraFiles: [
					{
						from: "public",
						to: "public"
					}
				],
				
				// Esta configuración generará el archivo versioninfo.rc dinámicamente
				beforeBuild: (context) => {
					const fs = require('fs');
					const path = require('path');
					
					// Convertir versión con formato 1.1.9 a 1,1,9,0
					const fileVersionParts = (packageJson.fileVersion || packageJson.version).split('.');
					while (fileVersionParts.length < 4) fileVersionParts.push('0');
					const fileVersionFormatted = fileVersionParts.join(',');
					
					const productVersionParts = (packageJson.productVersion || packageJson.version).split('.');
					while (productVersionParts.length < 4) productVersionParts.push('0');
					const productVersionFormatted = productVersionParts.join(',');
					
					// Crear el contenido del archivo versioninfo.rc dinámicamente
					const versionInfoContent = `1 VERSIONINFO
FILEVERSION ${fileVersionFormatted}
PRODUCTVERSION ${productVersionFormatted}
FILEOS 0x40004
FILETYPE 0x1
{
BLOCK "StringFileInfo"
{
	BLOCK "040904b0"
	{
		VALUE "CompanyName", "${packageJson.companyName || packageJson.author?.name || 'Randy Suarez'}"
		VALUE "FileDescription", "${packageJson.description || 'Windows Test Application'}"
		VALUE "FileVersion", "${packageJson.version}"
		VALUE "InternalName", "${packageJson.name}"
		VALUE "LegalCopyright", "${packageJson.copyright || `Copyright © ${new Date().getFullYear()} ${packageJson.author?.name || 'Randy Suarez'}`}"
		VALUE "OriginalFilename", "${packageJson.productName || 'Windows Test'}.exe"
		VALUE "ProductName", "${packageJson.productName || 'Windows Test'}"
		VALUE "ProductVersion", "${packageJson.version}"
		VALUE "Developer", "${packageJson.author?.name || 'Randy Suarez'}"
		VALUE "DeveloperContact", "${packageJson.author?.email || 'suarez9ster@gmail.com'}"
	}
}

BLOCK "VarFileInfo"
{
	VALUE "Translation", 0x0409 0x04B0
}
}`;
					
					// Crear la carpeta resources si no existe
					const resourcesDir = path.join(__dirname, 'resources');
					if (!fs.existsSync(resourcesDir)) {
						fs.mkdirSync(resourcesDir, { recursive: true });
					}
					
					// Escribir el archivo versioninfo.rc
					fs.writeFileSync(
						path.join(resourcesDir, 'versioninfo.rc'),
						versionInfoContent
					);
					
					console.log('Archivo versioninfo.rc generado dinámicamente');
					
					// Verificar que el directorio public existe y contiene las imágenes
					const publicDir = path.join(__dirname, 'public');
					if (fs.existsSync(publicDir)) {
						console.log('Directorio public encontrado - se copiará al paquete final');
					} else {
						console.warn('ADVERTENCIA: El directorio public no existe. Las imágenes pueden no estar disponibles en la aplicación empaquetada.');
					}
					
					return true;
				},
				
				// Incluir el archivo de recursos generado
				extraResources: [
					{
						from: "resources/versioninfo.rc",
						to: "versioninfo.rc"
					}
				],
				
				// Excluir archivos no necesarios pero manteniendo los recursos en public
				files: [
					"**/*",
					"!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
					"!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
					"!**/node_modules/*.d.ts",
					"!**/node_modules/.bin",
					"!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
					"!.editorconfig",
					"!**/._*",
					"!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
					"!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
					"!**/{appveyor.yml,.travis.yml,circle.yml}",
					"!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
				]
			},
			
			// Habilitar la integración de Node.js
			nodeIntegration: true,
			
			// Archivos principales para Electron
			mainProcessFile: '.quasar/electron/electron-main.js',
			preloadFile: 'src-electron/main-process/electron-preload.js',
			
			extendWebpack(cfg) {
				cfg.target = 'electron-renderer';
				
				// Asegurarse de que los archivos estáticos se copien correctamente
				cfg.plugins = cfg.plugins || [];
			},
		},
	}
}