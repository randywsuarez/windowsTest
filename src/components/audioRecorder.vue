<template>
	<div class="q-pa-md main-container">
	  <div ref="waveform" class="waveform"></div>
	  <div class="controls">
		<q-btn v-if="!isRecording" @click="startRecording" color="red" round icon="mic" size="lg" />
		<q-btn v-else @click="stopRecording" color="red" round icon="stop" size="lg" />
	  </div>
	</div>
  </template>
  
  <script>
  // Importamos WaveSurfer y el plugin de micrófono por separado
  import WaveSurfer from 'wavesurfer.js'
  // Si el plugin de micrófono es un módulo separado, debes importarlo así:
  // import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js'
  // o la ruta correcta según tu instalación
  
  export default {
	props: {
	  recordDuration: {
		type: Number,
		default: 3,
	  },
	},
	data() {
	  return {
		isRecording: false,
		audioBlob: null,
		recorder: null,
		wave: null,
		mediaStream: null,
	  }
	},
	mounted() {
	  // Sólo creamos el wavesurfer básico en el montaje
	  this.createWaveform()
	},
	methods: {
	  createWaveform() {
		if (!this.wave && this.$refs.waveform) {
		  this.wave = WaveSurfer.create({
			container: this.$refs.waveform,
			waveColor: 'violet',
			progressColor: 'purple',
			backend: 'MediaElement',
		  })
		}
	  },
	  async startRecording() {
		try {
		  // Primero obtenemos acceso al micrófono directamente
		  this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
		  
		  // Configuramos el estado y limpiamos datos anteriores
		  this.isRecording = true
		  this.audioBlob = null
		  
		  // Configuramos el MediaRecorder para grabar el audio
		  this.recorder = new MediaRecorder(this.mediaStream)
		  const audioChunks = []
  
		  this.recorder.ondataavailable = (event) => {
			audioChunks.push(event.data)
		  }
  
		  this.recorder.onstop = () => {
			if (audioChunks.length > 0) {
			  this.audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
			  
			  // Limpiamos y cargamos el blob en wavesurfer
			  if (this.wave) {
				this.wave.empty()
				this.wave.loadBlob(this.audioBlob)
			  }
			  
			  this.playRecording()
			}
		  }
  
		  // Iniciamos la grabación
		  this.recorder.start()
		  
		  // No usamos el plugin de micrófono de wavesurfer, 
		  // ya que está causando problemas. En su lugar, solo grabamos el audio.
		  
		  // Configuramos el temporizador para detener la grabación
		  setTimeout(() => {
			if (this.isRecording) {
			  this.stopRecording()
			}
		  }, this.recordDuration * 1000)
		} catch (error) {
		  console.error('Error accessing microphone:', error)
		  this.isRecording = false
		}
	  },
	  stopRecording() {
		// Detenemos la grabación
		if (this.recorder && this.recorder.state === 'recording') {
		  this.recorder.stop()
		}
		
		// Detenemos las pistas de audio
		if (this.mediaStream) {
		  this.mediaStream.getTracks().forEach((track) => track.stop())
		}
		
		this.isRecording = false
	  },
	  playRecording() {
		if (this.audioBlob) {
		  const audioUrl = URL.createObjectURL(this.audioBlob)
		  const audio = new Audio(audioUrl)
		  audio.volume = 1.0
		  audio.play()
		}
	  }
	},
	beforeDestroy() {
	  this.stopRecording()
	  if (this.wave) {
		this.wave.destroy()
	  }
	}
  }
  </script>
  
  <style scoped>
	.main-container {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  min-height: 200px;
	}
  
	.waveform {
	  width: 100%;
	  height: 100px;
	}
  
	.controls {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  margin-top: 20px;
	}
  
	.q-btn {
	  margin: 0 10px;
	}
  </style>