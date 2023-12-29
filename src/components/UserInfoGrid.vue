<template>
	<div class="user-info-container">
		<!-- División superior con avatar redondo -->
		<div class="avatar-container">
			<div class="avatar">
				{{ initials }}
			</div>
		</div>

		<q-card class="card">
			<!-- División inferior con información detallada -->
			<div class="q-layout q-layout-gutter-md">
				<div class="q-layout q-layout-gutter-md">
					<div class="q-page-container">
						<div class="row">
							<!-- Columna izquierda con la imagen (25% del ancho) -->
							<div class="col-2 img-container">
								<img :src="imageSrc" alt="Imagen" class="img-avatar" />
							</div>
							<!-- Columna derecha con la información (75% del ancho) -->
							<div class="col-9">
								<div class="info-text">
									<p class="info-title">{{ title }}</p>
									<p class="info-subtitle">{{ subtitle }}</p>
									<p class="info-project">{{ project }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</q-card>
	</div>
</template>

<script>
	export default {
		props: {
			// Propiedades para recibir valores
			username: {
				type: String,
				default: 'Username',
			},
			title: {
				type: String,
				default: 'Title',
			},
			subtitle: {
				type: String,
				default: 'Subtitle',
			},
			project: {
				type: String,
				default: 'Project',
			},
			imageSrc: {
				type: String,
				default: 'logo.png', // Imagen por defecto
			},
			// Agrega más propiedades según sea necesario
		},
		data() {
			return {}
		},
		computed: {
			initials() {
				// Obtener las primeras dos letras del nombre de usuario
				return this.username.slice(0, 2).toUpperCase()
			},
		},
	}
</script>

<style scoped>
	.user-info-container {
		display: flex;
		justify-content: center;
	}

	.card {
		border-radius: 15px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 90%; /* Ancho del contenedor al 80% del espacio disponible */
		position: relative; /* Agregado para posicionar correctamente el avatar */
		margin-top: 25px; /* Ajusta según sea necesario para dar espacio al div superior */
	}

	.q-card-section {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.avatar-container {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
	}

	.avatar {
		width: 50px;
		height: 50px;
		background-color: #007bff;
		color: #fff;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 20px;
		position: relative;
		top: 50%; /* Mueve el avatar hacia abajo la mitad de su altura */
	}

	.info-text {
		padding: 10px;
		text-align: center;
		margin-top: 25px; /* Ajusta según sea necesario para dar espacio al texto */
	}

	.info-title {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.info-subtitle {
		font-size: 14px;
		color: #888;
	}
	.info-project {
		font-size: 14px;
		color: #888;
	}

	/* Estilo para la imagen en la columna izquierda */
	.img-container {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 10px; /* Ajusta según sea necesario para agregar margen */
	}

	.img-avatar {
		max-width: 100%;
		max-height: 100%;
		border-radius: 15px 0 0 15px; /* Bordes redondeados solo en la esquina superior izquierda */
	}
</style>
