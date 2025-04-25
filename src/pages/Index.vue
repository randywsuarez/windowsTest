<template>
	<q-page id="test" class=""
		:style="`padding-top: 10px; background: linear-gradient(45deg, #ffffff, ${this.typeUnit})`">
		<user-info-grid v-show="activate.select" :username="select.user" :project="`${project.id}${infoTest.ProgramType != 'BatteryPercentage' ? ' - ' + infoTest.ProgramType : ''
			}`" :title="device.Description" :subtitle="`${device.SKU} - ${device.Serial}`"
			:imageSrc="device.img ? device.img : `${type}.png`" @update:audit="handleAuditUpdate" />
		<div class="main">
			<q-card class="card" v-show="activate.comparation">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Check</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center col row">
					<q-input v-model="check.serial" @input="handleInputChange('serial')" type="text" label="Serial"
						:prefix="miniSerial" placeholder="XX" hint="Write the last 2 digits" class="col-6" />
					<q-input v-model="check.sku" @input="handleInputChange('sku')" type="text" label="SKU"
						:prefix="miniSKU" hint="Write the missing" class="col-6" />
				</q-card-section>
				<q-card-actions align="right" id="actionComparation">
					<q-btn flat color="negative" size="xl" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'" :disable="!isValid" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.type">
				<q-card-section>
					<div class="text-h6">Select type</div>
				</q-card-section><q-separator />
				<q-card-section class="row col" id="actionType" style="justify-content: center">
					<q-btn class="col-md-4 q-ma-sm glow" @click="type = 'laptop'" id="laptop" ref="laptop"><img
							src="laptop.png" /></q-btn>
					<q-btn class="col-md-4 q-ma-sm glow" @click="type = 'desktop'" id="desktop" ref="desktop"><img
							src="desktop.png" /></q-btn>
					<q-btn class="col-md-4 q-ma-sm glow" @click="type = 'all-in-one'" id="all-in-one"
						ref="all-in-one"><img src="all-in-one.png" /></q-btn>
					<!-- <q-btn color="positive" :label="audit ? 'Shut Down' : 'SysPrep'" @click="sdDevice" /> -->
				</q-card-section>
				<q-separator />
				<q-card-section class="center col row" id="actionType" style="justify-content: center">
					<div class="text-center q-mt-md q-pa-md" style="width: 100%; max-width: 350px; border-radius: 8px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); background-color: rgba(255,255,255,0.7);">
						<div class="row items-center q-mb-sm">
							<q-icon name="schedule" color="primary" size="sm" class="q-mr-sm" />
							<div class="text-subtitle1 text-weight-medium">Time Information</div>
						</div>
						<q-separator class="q-mb-sm" />
						
						<div class="row items-center q-mb-xs">
							<q-icon name="play_arrow" color="green" size="xs" class="q-mr-sm" />
							<div class="text-caption text-weight-medium">Start:</div>
							<div class="text-caption q-ml-sm">{{ infDateStart }}</div>
						</div>
						
						<div class="row items-center q-mb-xs">
							<q-icon name="stop" color="red" size="xs" class="q-mr-sm" />
							<div class="text-caption text-weight-medium">End:</div>
							<div class="text-caption q-ml-sm">{{ infDateEnd }}</div>
						</div>
						
						<div class="row items-center q-mb-xs">
							<q-icon name="timer" color="primary" size="xs" class="q-mr-sm" />
							<div class="text-caption text-weight-medium">Duration:</div>
							<div class="text-caption q-ml-sm">{{ (() => {
          // Parseamos las fechas (si ya son Date no hace falta el new Date)
          const start = new Date(infDateStart)
          const end   = new Date(infDateEnd)
          const diff  = end - start            // diferencia en milisegundos

          // Calculamos horas, minutos y segundos
          const hours   = Math.floor(diff / 3600000)
          const minutes = Math.floor((diff % 3600000) / 60000)
          const seconds = Math.floor((diff % 60000) / 1000)

          // Devolvemos un string formateado
          return `${hours}h ${minutes}m ${seconds}s`
        })() }}</div>
						</div>
					</div>
				</q-card-section>
			</q-card>
			<q-card class="card" v-show="activate.logo">
				<q-card-section class="row justify-center" id="actionType" style="padding: 0; width: 100%">
					<div class="column items-center full-width">
						<q-img src="Logo.png" 
							spinner-color="primary" 
							spinner-size="120px"
							style="width: 150px; height: 200px"
							fit="contain" />
					</div>
				</q-card-section>
			</q-card>

			<q-card class="card" v-show="activate.audio">
				<q-card-section>
					<div class="text-h6">Audio Test</div>
				</q-card-section><q-separator />
				<q-card-section class="reproductor-content">
					<q-card-section>
						<Reproductor v-if="activate.audio" ref="reproductorRef" id="audioTest"
							@respuesta="sound = $event" :autoplay="true" />
					</q-card-section>
				</q-card-section>
				<q-card-actions align="right" ref="actionAudio" id="actionAudio">
					<q-btn id="audioFail" ref="audioFail" flat size="xl" color="red" label="FAIL"
						@click="detenerReproduccion('fail')" />
					<q-btn id="audioPass" ref="audioPass" flat size="xl" color="green" label="PASS"
						@click="detenerReproduccion('pass')" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.camera">
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Camera Test</div>
						</div>
						<div class="col-auto">
							<q-btn round color="primary" icon="restart_alt" @click="activateCamera" />
						</div>
					</div>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<template v-if="activate.camera && camera">
						<CameraCapture ref="camaraCapture" :key="componentKey" @capture-result="handleCaptureResult"
							:imageName="device.Serial" v-model="image" v-if="activate.camera" />
					</template>
					<div v-if="!camera">No Found</div>
				</q-card-section>
				<q-card-actions align="right" id="actionCamera">
					<q-btn flat color="negative" size="xl" label="Fail" @click="test['camera'] = 'Webcam test FAIL'" />
					<q-btn flat color="primary" size="xl" label="No Camera (PASS)"
						@click="; (test['camera'] = 'No Webcam test PASS'), (componentes.Webcam = 'NO')" />
					<q-btn flat color="positive" size="xl" label="Pass"
						@click="; (test['camera'] = 'Webcam test PASS'), (componentes.Webcam = 'YES')" />
				</q-card-actions>
			</q-card>
			<!-- Keyboard Start -->
			<q-card class="card" v-show="activate.keyboard">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Keyboard Test</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" style="min-height: 200px">
					<virtual-keyboard @allKeysPressed="handleAllKeysPressed" v-model="rKeyboard"></virtual-keyboard>
				</q-card-section>
				<q-card-actions align="right" v-show="rKeyboard.status" id="actionKeyboard">
					<q-btn flat color="negative" size="xl" label="Fail"
						@click="test['keyboard'] = 'Keyboard test FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass"
						@click="test['keyboard'] = 'Keyboard test PASS'" />
				</q-card-actions>
			</q-card>
			<!-- Keyboard End -->
			<!-- Mic Start -->
			<q-card class="card" v-show="activate.mic">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Mic Test</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" style="min-height: 200px">
					<audio-recorder></audio-recorder>
				</q-card-section>
				<q-card-actions align="right" v-show="activate.mic" id="actionMic">
					<q-btn flat color="negative" size="xl" label="Fail" @click="test['mic'] = 'Mic test FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="test['mic'] = 'Mic test PASS'" />
				</q-card-actions>
			</q-card>
			<!-- Mic End -->
			<!-- Touch Start -->
			<q-card class="card" v-if="activate.touch">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Touch Test</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" style="min-height: 200px">
					<q-btn @click="activateFullScreen" label="Activate Full Screen" />
					<Touch ref="touch" />
				</q-card-section>
				<q-card-actions align="right" v-show="activate.touch" id="actionTouch">
					<q-btn flat color="negative" size="xl" label="Fail" @click="test['touch'] = 'Touch test FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="test['touch'] = 'Touch test PASS'" />
				</q-card-actions>
			</q-card>
			<!-- Mic End -->
			<q-card class="card" v-show="activate.brightness">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Brightness Test</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center"> Is the brightness working? </q-card-section>
				<q-card-actions align="right" v-show="showActions" id="actionBrightness">
					<q-btn flat color="negative" size="xl" label="Fail"
						@click="test['brightness'] = 'Brightness test FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass"
						@click="test['brightness'] = 'Brightness test PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.windows">
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Windows Test</div>
						</div>
						<div class="col-auto">
							<q-btn round color="primary" icon="restart_alt" @click="windows_test(true)" />
						</div>
					</div>
				</q-card-section>
				<q-card-section class="center" v-if="win.os">
					<div>{{ win.edition }}</div>
					<div class="row q-col-gutter-md">
						<div class="col-12">
							<div class="text-subtitle2">Current DPK:</div>
							<div>{{ win.keyWindows }}</div>
						</div>
						<div class="col-12" v-if="win.oldKeyWin">
							<div class="text-subtitle2">Previous DPK:</div>
							<div>{{ win.oldKeyWin }}</div>
						</div>
						<div class="col-12" v-else>
							<div class="text-subtitle2">Status:</div>
							<div class="text-positive">DPK valid and active</div>
						</div>
					</div>
					<div class="q-mt-sm">{{ win.licenseDetails }}</div>
					<div v-if="forceInject" class="text-warning q-mt-sm">
						<i class="fas fa-exclamation-triangle"></i> Force mode activated (Ctrl + Shift + F)
					</div>
				</q-card-section>
				<q-card-section class="center" v-else>
					<div>Wait...</div>
				</q-card-section>
				<pre v-show="false">{{ win }}</pre>
				<q-card-actions align="right" id="actionWindows" v-show="win.activated">
					<q-btn flat color="negative" size="xl" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.battery">
				<q-card-section>
					<div class="text-h6">Battery Test</div>
				</q-card-section>
				<q-separator />
				<q-card-section class="center">
					<p style="text-decoration: red">
						<b>Battery test {{ battery.Status }}</b>
					</p>
					<p><b>Design Capacity</b> = {{ battery.designedCapacity }}</p>
					<p><b>Full Charge Capacity</b> = {{ battery.maxCapacity }}</p>
					<p><b>Battery Health</b> = {{ battery.estimatedLife }}%</p>
					<p><b>Cycle Count</b> = {{ battery.cycleCount }}</p>
					<p><b>Serial</b> = {{ battery.Serial }}</p>
				</q-card-section>
				<q-card-actions align="right" id="actionBattery">
					<q-btn flat color="negative" size="xl" label="Fail" @click="action = 'FAIL'"
						v-if="battery.Status != 'fail'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'"
						v-if="battery.Status != 'fail'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.mousepad">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Mouse Pad Test</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<mouse-pad />
				</q-card-section>
				<q-card-actions align="right" id="actionMousePad">
					<q-btn flat color="negative" size="xl" label="Fail"
						@click="test['mousepad'] = 'Mouse pad test FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass"
						@click="test['mousepad'] = 'Mouse pad test PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.components">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Status Components</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<div class="row justify-between" scroll>
						<div class="col-4">
							<q-list dense bordered>
								<q-item v-for="(item, index) in centerItems" :key="index">
									<q-item-section side>
										<q-checkbox v-model="bios[formatItem(item.label)]" :label="item.label"
											true-value="YES" false-value="NO" left-label disable />
									</q-item-section>
								</q-item>
							</q-list>
						</div>
						<div class="col-4">
							<q-list dense bordered>
								<q-item v-for="(item, index) in rightItems" :key="index">
									<q-item-section side>
										<q-checkbox v-model="bios[formatItem(item.label)]" :label="item.label"
											true-value="YES" false-value="NO" left-label disable />
									</q-item-section>
								</q-item>
							</q-list>
						</div>
						<div class="col-4">
							<q-list dense bordered>
								<q-item v-for="(item, index) in leftItems" :key="index">
									<q-item-section side>
										<q-checkbox v-model="bios[formatItem(item.label)]" :label="item.label"
											true-value="YES" false-value="NO" left-label disable />
									</q-item-section>
								</q-item>
							</q-list>
						</div>
					</div>
				</q-card-section>
				<q-card-actions align="right" id="actionComponents">
					<q-btn flat color="negative" label="Fail" @click="test['components'] = 'Components test FAIL'" />
					<q-btn flat color="positive" label="Pass" @click="test['components'] = 'Components test PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.desktop">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Desktop Information</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<q-select v-model="form.coolerSystem" :options="options" label="Cooling System" filled />
					<q-checkbox left-label v-model="form.lightRAM" label="RGB RAM" />
					<q-input v-model="form.adapter" type="number" label="Adapter/PowerSupply" />
				</q-card-section>
				<q-card-actions align="right" id="actionDesktop">
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.note">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Note</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<q-input v-model="form.note" label="Note" />
				</q-card-section>
				<q-card-actions align="right" id="actionNote">
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.information">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Information</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="row col center">
					<ColorSelect class="col-6" :partsurfer="partsurfer" @color-selected="handleColorSelected"
						@form-generated="resetForm" :brand="device.brand" />
					<q-checkbox v-show="type == 'laptop' || type == 'all-in-one'" size="xl" class="col-6"
						v-model="componentes.touchScreen" true-value="YES" false-value="NO" label="Touch Me" />
				</q-card-section>
				<q-separator />
				<q-card-section class="center">
					<div v-show="this.myDb.TYPE != 'BTO' && type == 'laptop'">
						<q-checkbox size="xl" v-model="test.WWAN" true-value="YES" false-value="NO" label="WWAN" />
						<q-checkbox size="xl" v-model="test.WLAN" true-value="YES" false-value="NO" label="WLAN" />
						<q-checkbox size="xl" v-model="componentes.Keyboard.Privacy" true-value="YES" false-value="NO"
							label="Privacy" />
						<q-checkbox size="xl" v-model="test.NFC" true-value="YES" false-value="NO" label="NFC" />
						<q-checkbox size="xl" v-model="test.SmartCard" true-value="YES" false-value="NO"
							label="Smart Card" />
						<q-checkbox size="xl" v-model="componentes.Keyboard.Backlight" true-value="YES" false-value="NO"
							label="Backlight" />
						<q-checkbox size="xl" v-model="componentes.Keyboard.RGB" true-value="YES" false-value="NO"
							label="RGB Keyboard" />
						<q-checkbox size="xl" v-model="test.Fingerprint" true-value="YES" false-value="NO"
							label="Fingerprint" />
					</div>
				</q-card-section>
				<q-card-section>
					<q-card-section>
						<div class="text-h6">HotKey</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" v-show="type == 'laptop'">
					<b>You need to test the Hotkeys</b>
					<div class="q-gutter-sm row col-6">
						<q-checkbox size="xl" v-model="hotKey.mic" val="80px" label="Mic" />
						<q-checkbox size="xl" v-model="hotKey.speakers" val="80x" label="Speakers" />
						<q-checkbox size="xl" v-model="hotKey.brights" val="80px" label="Brightness" />
						<q-checkbox size="150px" v-model="hotKey.privacy" val="80px" label="Privacy"
							v-if="componentes.Keyboard.Privacy == 'YES'" />
					</div>
				</q-card-section>
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Drivers Test</div>
						</div>
						<div class="col-auto">
							<q-btn round color="primary" icon="restart_alt" @click="$cmd.executeScriptCode(drivers)" />
						</div>
					</div>
				</q-card-section>
				<q-separator />
				<q-card-section class="center">
					Is the Drivers and Video working?
					<div>Driver: {{ driver.status }}</div>
					<div>Video: {{ driver.video ? 'PASS' : 'FAIL' }}</div>
					<q-list bordered v-if="driver.missingDrivers.length">
						<q-item v-for="(d, k) in driver.missingDrivers" :key="k">
							<q-item-section>{{ d }}</q-item-section>
						</q-item>
					</q-list>
				</q-card-section>

				<q-card-actions align="left" id="actionInformation">
					<q-btn flat color="positive" size="xl" label="Next" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.gpu">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">GPU Test</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" v-if="myGpu.length">
					<q-checkbox size="150px" v-model="noGPU" val="80px" label="No GPU" v-if="type == 'desktop'" />
					<q-table class="card" title="List" :data="intDev.video" dense :columns="columns" row-key="name"
						binary-state-sort>
						<template v-slot:body="props">
							<q-tr :props="props">
								<q-td key="Description" :props="props">{{ props.row.Description }}</q-td>
								<q-td key="AdapterRAM" :props="props">
									{{ props.row.AdapterRAM }}
									<q-popup-edit class="card" v-model="props.row.AdapterRAM" title="Update RAM" buttons
										persistent v-slot="scope" v-if="type == 'DESKTOP'">
										<q-input type="text" v-model="scope.value" dense autofocus
											hint="Use buttons to close" />
									</q-popup-edit>
								</q-td>
							</q-tr>
						</template>
					</q-table>
				</q-card-section>
				<q-card-section class="center" v-else>
					<div>Wait...</div>
				</q-card-section>
				<q-card-actions align="right" id="actionGPU" v-show="myGpu.length">
					<q-btn flat color="negative" size="xl" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.done">
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Test completed</div>
						</div>
						<div class="col-auto">
							<q-btn round color="primary" icon="info" @click="activate.txt = true" />
						</div>
					</div>
				</q-card-section>
				<q-separator />
				<q-card-section class="reproductor-content">
					<q-card-section class="row col justify-center" ref="actionDone" id="actionDone"
						style="justify-content: center">
						<div class="col-12 justify-center" v-if="activate.scan">
							<h6 v-html="activate.scan"></h6>
						</div>
						<div class="col-6 justify-center">
							<svg width="75%" id="barcode"></svg>
						</div>
						<div class="col-6 justify-center">
							<svg width="75%" id="barcode2"></svg>
						</div>
						<q-btn color="positive" :label="audit ? 'Shut Down' : 'SysPrep'" @click="sdDevice" />
					</q-card-section>
				</q-card-section>
			</q-card>

			<q-card class="card" v-show="activate.Storage">
				<q-card-section>
					<q-card-section>
						<div class="text-h6">Storage</div>
					</q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<div class="disk-list">
						<q-list bordered padding>
							<q-item v-for="(disk, index) in disks" :key="index">
								<q-item-section avatar>
									<q-icon name="windows" color="blue" size="40px" />
								</q-item-section>
								<q-item-section>
									<q-item-label>{{ disk.name }}</q-item-label>
									<q-item-label caption> {{ disk.description }}</q-item-label>
								</q-item-section>
							</q-item>
						</q-list>
					</div>
				</q-card-section>
				<q-card-actions align="right" id="actionStorage">
					<q-btn flat color="negative" size="xl" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-dialog v-model="msn.active" persistent transition-show="scale" transition-hide="scale">
				<q-card class="card" style="width: 300px">
					<q-card-section>
						<div class="text-h6">{{ msn.title }}</div>
					</q-card-section>
					<q-card-section class="q-pt-none"> {{ msn.message }} </q-card-section>
					<q-card-actions align="right" class="text-teal">
						<q-btn flat label="OK" @click="cerrarVentana" v-close-popup />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<q-dialog v-model="msn.active2" persistent transition-show="scale" transition-hide="scale">
				<q-card class="card" style="width: 300px">
					<q-card-section>
						<div class="text-h6">{{ msn.title }}</div>
					</q-card-section>
					<q-card-section class="q-pt-none"> {{ msn.message }} </q-card-section>
					<q-card-actions align="right" class="text-teal">
						<q-btn flat label="OK" v-close-popup />
					</q-card-actions>
				</q-card>
			</q-dialog>
			<q-dialog v-model="activate.txt">
				<q-card>
					<q-card-section>
						<div class="row items-center no-wrap">
							<div class="col">
								<div class="text-h6">Information</div>
							</div>
						</div>
					</q-card-section>
					<q-separator />
					<q-card-section style="max-height: 80vh" class="scroll">
						<div v-html="formatInfo(txt)"></div>
					</q-card-section>
					<q-separator />
					<q-card-actions align="right">
						<q-btn flat label="Close" color="primary" v-close-popup />
					</q-card-actions>
				</q-card>
			</q-dialog>
		</div>
	</q-page>
</template>
<script>
import UserInfoGrid from '../components/UserInfoGrid.vue'
import Reproductor from '../components/soundTest.vue'
import CameraCapture from '../components/webcam.vue'
import MousePad from '../components/MousePad.vue'
import VirtualKeyboard from '../components/Keyboard.vue'
import AudioRecorder from '../components/audioRecorder.vue'
import Touch from '../components/Touch.vue'
import ColorSelect from '../components/ColorSelect.vue'
import {
	drivers,
	Enrollment,
	intenalDevices,
	GetMntBringhtness,
	imaging,
	spotLights,
	components,
	aWin,
	sWin,
	dWin,
	BitLocker,
} from '../scripts'
import moment from 'moment'
import JsBarcode from 'jsbarcode'
import { title } from 'process'
//import Modernizr from 'modernizr'

export default {
	components: {
		UserInfoGrid,
		Reproductor,
		CameraCapture,
		MousePad,
		VirtualKeyboard,
		AudioRecorder,
		Touch,
		ColorSelect,
	},
	data() {
		return {
			// Cronómetro de actividad
			activityResult: '',
			activityTimer: {
				active: false,
				startTime: null,
				totalTime: 0,
				inactiveTime: 0,
				isInactive: false,
				currentTimer: null,
				inactivityTimeout: null,
				inactivityCounter: null,
				graceTime: 10000, // 10 segundos de gracia después de la última actividad
			},
			dateStartAll: '',
			rKeyboard: {
				status: false,
			},
			color: [],
			optionsColors: [],
			rcolor: '',
			audit: false,
			hotKey: {
				mic: false,
				brights: false,
				speakers: false,
				privacy: false,
			},
			sectionEnabled: false,
			enrollment: '',
			bitLocker:'',
			activate: {
				Storage: false,
				gpu: false,
				done: false,
				txt: false,
				scan: '',
				action: '',
			},
			selectedColor: null,
			partsurfer: {},
			si: {},
			allKeysPressed: false,
			user: {},
			device: { img: '', brand: '' },
			test: {},
			typeUnit: '#87cefa',
			project: {},
			sound: 'nada',
			componentKey: 0,
			commercial: false,
			battery: {},
			action: '',
			camera: true,
			bios: {
				components: {
					Fingerprint: 'NO',
					Backlight: 'NO',
					TouchScreen: 'NO',
					WWAN: 'NO',
					Privacy: 'NO',
					SmartCard: 'NO',
					NFC: 'NO',
					Webcam: 'NO',
					Bluetooth: 'NO',
					Audio: 'NO',
					Microphone: 'NO',
					WLAN: 'NO',
				},
			},
			infDateStart: '',
			infDateEnd: '',
			stepsDate: [],
			check: {},
			Authorization: '',
			itDG: {},
			activate: {
				logo: true,
				type: false,
				select: false,
				audio: false,
				camera: false,
				keyboard: false,
				mic: false,
				brightness: false,
				drivers: false,
				windows: false,
				battery: false,
				gpu: false,
				desktop: false,
				done: false,
				comparation: false,
				mousepad: false,
				note: false,
				scan: '',
				txt: false,
				hotKey: false,
				components: false,
				touch: false,
				information: false,
				Storage: false,
			},
			showActions: false,
			GPUIntegrated: '',
			win: {
				actived: false,
			},
			intDev: {},
			getDev: {},
			driver: {
				missingDrivers: [],
			},
			select: {},
			file: '',
			txt: '',
			componentes: {
				Keyboard: { Privacy: 'NO' },
			},
			image: {},
			miniSerial: '',
			miniSKU: '',
			TOP: 'NO',
			disks: [],
			myDb: {
				Serial: '',
				Model: '',
				Serial_HDD: '',
				Model_HDD: '',
				DATE: '',
				STATUS: '',
				RAM: '',
				GPU: '',
				OS: '',
				GPU_RAM: '',
				OPERATOR: '',
				HDD_CAPACITY: '',
				COLOR: '',
				CPU: '',
				Description: '',
				DateStart: '',
				DateEnd: '',
				CODE: '',
				//GPUIntegrated: '',
			},
			form: {
				lightRAM: false,
				adapter: '',
				coolerSystem: '',
			},
			options: ['Fan Cooler', 'Liquid Cooler', 'Fan Cooler with RGB', 'Liquid Cooler with RGB'],
			type: 'laptop',
			msn: {
				active: false,
			},
			columns: [
				{
					name: 'Description',
					label: 'Description',
					field: 'Description',
					align: 'left',
					sortable: true,
				},
				{ name: 'AdapterRAM', label: 'RAM', field: 'AdapterRAM', align: 'left', sortable: true },
			],
			myGpu: [],
			info: {},
			items: [
				{ label: 'Lock BIOS', value: '' },
				{ label: 'Fingerprint Reset', value: '' },
				{ label: 'Smart Card', value: '' },
				{ label: 'Bluetooth', value: '' },
				{ label: 'Wireless Network', value: '' },
				{ label: 'Lock Wireless', value: '' },
				{ label: 'Internal Speakers', value: '' },
				{ label: 'Microphone', value: '' },
				{ label: 'Integrated Camera', value: '' },
				{ label: 'Fingerprint Device', value: 'Fingerprint' },
				{ label: 'Touch Device', value: '' },
				{ label: 'OS Recovery', value: '' },
				{ label: 'Programming Mode', value: '' },
				{ label: 'NumLock', value: '' },
				{ label: 'Keys mapped', value: '' },
				{ label: 'Backlit', value: 'Backlit' },
				{ label: 'Mobile Network', value: 'WWAN' },
				{ label: 'Headphone', value: '' },
				{ label: 'NFC', value: 'NFC' },
				{ label: 'Platform Cycle', value: 'Cycle' },
			],
			infoSystem: {},
			infoTest: {},
			noGPU: false,
			datetime: '',
			winChange: false,
			forceInject: false, // Cambiado a true por defecto
		}
	},
	computed: {
		leftItems() {
			return this.items.slice(0, Math.ceil(this.items.length / 3))
		},
		centerItems() {
			return this.items.slice(Math.ceil(this.items.length / 3))
		},
		rightItems() {
			return this.items.slice(Math.ceil(this.items.length / 3))
		},
		isValid() {
			const deviceSerial = this.device.Serial ? this.device.Serial.toUpperCase() : ''
			const miniSerial = this.miniSerial ? this.miniSerial.toUpperCase() : ''
			const checkSerial = this.check.serial ? this.check.serial.toUpperCase() : ''
			const deviceSKU = this.device.SKU ? this.device.SKU.toUpperCase() : ''
			const miniSKU = this.miniSKU ? this.miniSKU.toUpperCase() : ''
			const checkSKU = this.check.sku ? this.check.sku.toUpperCase() : ''

			console.log('sku: ', deviceSKU, `${miniSKU}${checkSKU}`)

			return (
				deviceSerial === `${miniSerial}${checkSerial}` &&
				(deviceSKU === `${miniSKU}${checkSKU}` ||
					deviceSKU === `${miniSKU}${checkSKU}`.split('#')[0])
			)
		},
	},
	methods: {
		calculatePercentage(free, total) {
			return (total - free) / total
		},
		formatDisk(diskName) {
			if (confirm(`Are you sure you want to format disk ${diskName}?`)) {
				// Add format logic here
				console.log(`Formatting disk ${diskName}...`)
			}
		},
		async brands() {
			async function getValueByPath(obj, path) {
				return path.split('.').reduce((o, p) => o && o[p], obj)
			}
			console.log('infoSystem: ', this.infoSystem)
			console.log('brand: ', this.infoSystem.system.manufacturer.split(' ')[0].toUpperCase())
			let info = await this.$db
				.collection('typeBrands')
				.conditions({ brand: this.infoSystem.system.manufacturer.split(' ')[0].toUpperCase() })
				.limit(1)
				.admin()
				.get()
			if (info.length) {
				info = info[0]
				this.device.Serial = await getValueByPath(this.infoSystem, info.serial)
				this.device.SKU = await getValueByPath(this.infoSystem, info.sku)
				this.device.Description = await getValueByPath(this.infoSystem, info.description)
				this.device.brand = this.infoSystem.system.manufacturer.split(' ')[0].toUpperCase()
			}
			
		},
		async siSave() {
			let si = await this.$db
				.collection('systemInformation')
				.conditions({ Serial: this.device.Serial })
				.admin()
				.get()
			if (si.length)
				await this.$db
					.doc(`systemInformation/${si[0]._id}`)
					.update({ Serial: this.device.Serial, ...this.infoSystem, ...this.si, infBios: this.bios, Drivers: this.driver, Enrollment: this.enrollment, BitLocker: this.bitLocker })
			else
				await this.$db
					.doc('systemInformation')
					.add({ Serial: this.device.Serial, ...this.infoSystem, ...this.si, infBios: this.bios, Drivers: this.driver, Enrollment: this.enrollment, BitLocker: this.bitLocker })
		},
		handleAuditUpdate(newValue) {
			this.audit = newValue
		},
		formatItem(item) {
			return item.replace(/\s+/g, '').replace(/\b\w/g, (l) => l.toUpperCase())
		},
		formatInfo(info) {
			return info.replace(/\n/g, '<br>')
		},
		async passImaging() {
			const options = {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.select.authToken}`,
				},
			}
			return this.$db
				.funcAdmin('modules/ispt/moveStation', {
					options,
					Serial: this.test.Serial,
					Tenant: this.select.TenantName,
					Project: this.select.ProjectID,
					System: this.$env.project.url,
				})
				.then((v) => {
					return v
				})
				.catch((err) => {
					console.error(err)
					return err
				})
		},
		async saveFile(r) {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.select.authToken}`,
				},
				body: {
					SerialNumber: r.SerialNumber,
					EmployeeID: this.select.operator,
					FileType: r.FileType,
					fileExtension: r.fileExtension,
					fileBase64Str: r.fileBase64Str,
					systemInformationBlob: { ...this.infoSystem, ...this.si },
					WindowsTestResultBlob: await this.convertYesNoValues(this.componentes)

				},
			}
			return this.$db
				.funcAdmin('modules/ispt/UploadFile', {
					options,
					Project: this.select.TenantName,
					System: this.$env.project.url,
				})
				.then((v) => {
					console.info(r.fileExtension, v.message)
					return v.isSuccess
				})
				.catch((err) => {
					console.error(err)
					return false
				})
		},
		async convertYesNoValues(value) {
			// Handle arrays by mapping each element
			if (Array.isArray(value)) {
				return value.map(convertYesNoValues);
			}

			// Handle objects by recursing into each property
			if (value !== null && typeof value === 'object') {
				const result = {};
				for (const [key, val] of Object.entries(value)) {
					result[key] = this.convertYesNoValues(val);
				}
				return result;
			}

			// Convert specific string values
			if (value === 'YES') return true;
			if (value === 'NO') return false;
			if (value === '') return false;

			// Leave other values unchanged
			return value;
		},
		async verifyDPK(fi = false) {
			const options = {
				method: 'POST',
				headers: {
					tenant: `${this.select.TenantName}`,
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.select.authToken}`,
				},
				body: {
					SerialNumber: this.device.Serial,
					ExistingProductKey: this.win.keyWindows,
					ExistingProductEdition: this.win.edition,
				},
			}
			let result = await this.$db.funcAdmin('modules/ispt/verifyDPK', {
				options,
				Project: this.select.TenantId,
				System: this.$env.project.url,
				data: {
					SerialNumber: this.device.Serial,
					ExistingProductKey: this.win.keyWindows,
					ExistingProductEdition: this.win.edition,
					forceInject: this.forceInject || fi,
				},
			})
			console.log('Result: ', result)
			if (result.error && result.errorMessage == 'No available replacement keys') {
				this.$db.funcAdmin('modules/ispt/issueReport', {
					title: result.errorMessage,
					message: `DPK for ${this.win.edition} is not available.`,
				})
				this.$q
					.dialog({
						title: 'Alert<em>!</em>',
						message: `<em>Error: </em> <span class="text-red">${result.errorMessage}.</span> <strong> Talk to your supervisor.</strong>`,
						html: true,
						persistent: true,
					})
					.onOk(async () => {
						await this.verifyDPK()
					})
			}
			return result
		},
		async statusDPK(r) {
			const options = {
				method: 'POST',
				headers: {
					tenant: `${this.select.TenantId}`,
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.select.authToken}`,
				},
				body: {
					SerialNumber: this.device.Serial,
					NewProductKey: this.win.keyWindows,
				},
			}
			return await this.$db.funcAdmin('modules/ispt/statusDPK', {
				options,
				Project: this.select.TenantName,
				System: this.$env.project.url,
				data: {
					SerialNumber: this.device.Serial,
					NewProductKey: this.win.keyWindows,
				},
			})
		},
		async failDPK(r) {
			const options = {
				method: 'POST',
				headers: {
					tenant: `${this.select.TenantName}`,
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.select.authToken}`,
				},
				body: {
					SerialNumber: this.device.Serial,
					dpk: this.win.keyWindows,
				},
			}
			return await this.$db.funcAdmin('modules/ispt/failDPK', {
				options,
				Project: this.select.TenantName,
				System: this.$env.project.url,
				data: {
					SerialNumber: this.device.Serial,
					dpk: this.win.keyWindows,
				},
			})
		},
		activateCamera() {
			this.componentKey += 1
			this.$nextTick(() => {
				this.mostrarComponente = true
			})
		},
		handleInputChange(id) {
			this.check[id] = this.check[id].toUpperCase()
		},
		handleClose(value) {
			this.activate.touch = value
		},
		async report() {
			// Detener el cronómetro de actividad al finalizar la prueba
			this.activityResult = this.stopActivityTimer()
			let res = Object.values(this.test).includes('fail') ? 'FAIL' : 'PASS'
			let lastdate = await this.DateTime()
			this.myDb.DATE = lastdate.wipe
			this.myDb.STATUS = res == 'PASS' ? 'true' : 'false'
			this.myDb.OPERATOR = this.select.operator
			this.myDb.DateEnd = lastdate.end
			this.myDb.CreatedAt = lastdate.end
			this.myDb.LastModified = lastdate.end
			this.myDb.DateStart = lastdate.start

			return `
		       CTL Windows ${this.audit ? 'Audit' : 'Test'} - ${this.$env.version} - ${this.select.TenantName
				} 
		       Operator ID: ${this.select.operator}
		       Operator Name:${this.select.user}
		       Start Date: ${this.test.Date}
		       Start Time: ${this.test.startTime}
		       End Date: ${lastdate.date}
		       End Time: ${lastdate.time}
		       Activity Time: ${this.activityResult.formatted}
		       Inactive Time: ${this.activityResult.inactiveFormatted}
		       Total Process Time: ${this.formatTime(this.activityResult.seconds + this.activityResult.inactiveSeconds)}
		        Program: ${this.infoTest.ProgramType}
		        Battery Program: ${this.infoTest.batteryProgram}
		        BOL: ${this.infoTest.BOL}

		       :::::Devices Information:::::
		       ${this.test.Description}
		       ${this.test.Model}
		       ${this.test.Serial}
		       Windows OS Name: ${this.test.OS} (${this.iTest.Organization ? 'A' : 'M'})
		       Windows Product Key: ${this.test.keyWindows}
		       Windows Product Key old: ${this.test.oldKeyWin}
		       ${this.test.windows}
		       ${this.test.color ? `Color: ${this.test.color}` : ''}
			   BitLocker: ${this.bitLocker.status ? 'YES' : 'NO'}
			   Enrollment: ${this.enrollment.status ? 'YES' : 'NO'}
		       ${this.test.bitLocker? `BitLocker Key: ${this.test.bitLockerKey}` : ''}
		       ${this.test.bitLocker? `BitLocker Key old: ${this.test.oldBitLockerKey}` : ''}
		       Hard Drive: ${this.intDev.HDD.Total}
		       ${this.disks.map((disk) => disk.specs).join('\n')}
		       Memory RAM: ${this.intDev.RAM.Total} - ${this.form.lightRAM ? 'With RBG' : ''}
		       ${this.intDev.RAM.Modules.join('\n')}
		       GPU Verification PASS
		       ${this.type == 'desktop' && this.noGPU
					? ''
					: this.intDev.video.map((v) => `${v.Description} ${v.AdapterRAM}`)
				}
		       ${this.type == 'laptop' || this.type == 'all-in-one' ? 'Resolution' : ''}
		       ${this.test.hasOwnProperty('resolution') ? this.test.resolution : ''}
		       ${this.type == 'laptop' || this.type == 'all-in-one' ? 'Touch Screen' : ''}
		       ${this.test.hasOwnProperty('touchScreen') ? this.test.touchScreen : ''}
		       CPU
		       ${this.intDev.cpu.join('\n')}
		       ${this.type == 'desktop' ? 'Adapter/Power Supply' : ''}
		       ${this.type == 'desktop' ? `${this.form.adapter}W` : ''}
		       ${this.type == 'desktop' ? 'Cooler System' : ''}
		       ${this.type == 'desktop' ? this.form.coolerSystem : ''}

		       :::::Test Status:::::
		       ${this.type != 'desktop' ? this.test.audio : ''}
		       ${this.type != 'desktop' ? this.test.camera : ''}
		       ${this.test.drivers}
			   ${this.driver.missingDrivers.join('\n')}
		       ${this.test.display}
		       ${this.type == 'laptop' ? this.test.battery : ''}
		       ${this.type == 'laptop' ? this.test.keyboard : ''}
		       ${this.type == 'laptop' ? this.test.mic : ''}
		       ${this.type == 'laptop' ? this.test.hotKey : ''}
		       ${this.type == 'laptop' ? this.test.mousepad : ''}
		       ${this.type == 'laptop' && this.hotKey.mic
					? 'Mic hotkey: It works'
					: 'Mic hotkey: Does not work'
				}
		       ${this.type == 'laptop' && this.hotKey.speakers
					? 'Speackers hotkey: It works'
					: 'Speackers hotkey: Does not work'
				}
		       ${this.type == 'laptop' && this.hotKey.brights
					? 'Brightness hotkey: It works'
					: 'Brightness hotkey: Does not work'
				}
		       ${this.type == 'laptop' && this.hotKey.privacy
					? 'Privacy hotkey: It works'
					: 'Privacy hotkey: Does not work'
				}
		       ${this.type != 'desktop' ? this.test.brightness : ''}
		       ${this.type != 'desktop' ? this.test.spotLights : ''}
		       ${this.form.note ? `Note: ${this.form.note}` : ''}

		       :::::Result:::::
		       Test Result is ${res}
		       ${this.audit ? 'Audited' : ''}
		     `.replace(/^\s*[\r\n]/gm, '')
		},
		async rsSave() {
			let sh = await this.$rsDB(this.select.db)
				.select('Serial')
				.from('TestSnResults')
				.where(`Serial = '${this.device.Serial}'`)
				.execute()
			if (sh.length) {
				await this.$rsDB(this.select.db)
					.update('TestSnResults')
					.set(this.myDb)
					.where(`Serial = '${this.device.Serial}'`)
					.execute()
			} else {
				this.myDb['TestSnResultsID'] = 'NEWID()'
				this.myDb['TenantId'] = this.select.TenantId
				console.log('myDb: ', this.myDb)
				await this.$rsDB(this.select.db).insert('TestSnResults').fields(this.myDb).execute()
			}
		},
		cerrarVentana() {
			//this.sdDevice()
			const { remote } = require('electron')
			const ventanaActual = remote.getCurrentWindow()
			ventanaActual.close()
		},
		async infoHP() {
			let data = this.infoTest.Specs
			this.partsurfer = data
			console.log('infoHP: ', data)
			this.test.touchScreen =
				this.bios && this.bios.TouchScreen ? this.bios.TouchScreen : data.touchScreen
			this.color = data.COLOR
			this.myDb.COLOR = data.COLOR ? data.COLOR : ''
			this.test['color'] = data.COLOR
			this.componentes['Color'] = data.COLOR
			this.form.adapter = data.adapter
			this.componentes['Adapter'] = data.adapter
			this.componentes.Keyboard['Backlight'] =
				this.bios && this.bios.components.Backlight
					? this.bios.components.Backlight
					: data.Backlight
			this.componentes.Keyboard['RGB'] = data.BacklitRGB

			this.componentes.Keyboard['Privacy'] =
				this.bios && this.bios.components.Privacy ? this.bios.components.Privacy : data.hasOwnProperty('Privacy')
					? data.Privacy
					: 'NO'
			this.test['WWAN'] =
				this.bios && this.bios.components.WWAN ? this.bios.components.WWAN : 'NO'
			this.test['WLAN'] =
				this.bios && this.bios.components.WLAN ? this.bios.components.WLAN : 'NO'
			this.test.NFC = this.bios && this.bios.components.NFC ? this.bios.components.NFC : 'NO'
			this.test.Fingerprint =
				this.bios && this.bios.Fingerprint
					? this.bios.components.Fingerprint
					: this.componentes.Fingerprint
			this.test.Webcam =
				this.bios && this.bios.components.Webcam ? this.bios.components.Webcam : 'NO'
			this.test.SmartCard =
				this.bios && this.bios.components.SmartCard ? this.bios.components.SmartCard : 'NO'
		},
		getGraphicsInfo(dxdiagContent) {
			const cardNamePattern = /Card name: (.+)/g
			const dedicatedMemoryPattern = /Dedicated Memory: (.+)/g
			let match
			const graphicsInfoArray = []

			while ((match = cardNamePattern.exec(dxdiagContent)) !== null) {
				const cardName = match[1].trim()
				const dedicatedMemoryMatch = dedicatedMemoryPattern.exec(dxdiagContent)
				const dedicatedMemoryString = dedicatedMemoryMatch
					? dedicatedMemoryMatch[1].trim()
					: 'No Found'
				const dedicatedMemoryInGB =
					dedicatedMemoryString !== 'No Found'
						? `${Math.round(parseFloat(dedicatedMemoryString.replace(' MB', '')) / 1024)} GB`
						: 'No Found'

				graphicsInfoArray.push({ Description: cardName, AdapterRAM: dedicatedMemoryInGB })
			}

			return graphicsInfoArray
		},
		async saveMng() {
			const search = await this.$db
				.collection('devices')
				.conditions({ Serial: this.device.Serial })
				.limit(1)
				.all_data()
				.get()
			if (search.length) {
				await this.$db.doc(`devices/${search[0]._id}`).update(this.info)
			} else {
				await this.$db.doc('devices').add(this.info)
			}
			const intDB = {
				...this.myDb,
				project: this.select.TenantName,
				OPERATOR: this.select.operator,
				TYPE: this.type.toUpperCase(),
				PROCESSED: this.iTest.Organization ? 'A' : 'M',
				Authorization: this.Authorization,
			}
			const test = await this.$db
				.collection('TestSnResults')
				.conditions({ Serial: this.device.Serial, TYPE: this.type.toUpperCase() })
				.limit(1)
				.all_data()
				.get()

			if (test.length) {
				await this.$db.doc(`TestSnResults/${test[0]._id}`).update(intDB)
			} else {
				await this.$db.doc('TestSnResults').add(intDB)
			}
		},
		async sdDevice() {
			this.$q.loading.show()
			if (this.audit) await this.$cmd.executeScriptCode(['Stop-Computer -ComputerName localhost'])
			else {
				let code = await this.$db.funcAdmin(`modules/powershell/sysprep`)
				await this.$cmd.executeScriptCode(code)
			}
			this.$q.loading.hide()
		},
		async checkDevice() {
			this.infoTest = await this.$db.funcAdmin('modules/test/infoTest', {
				Serial: this.device.Serial,
				Model: this.device.SKU,
				Name: this.project.db,
			})

			if (this.infoTest.Status) {
				this.$q.notify({ type: 'negative', message: `This unit was tested previously.` })
			}
		},
		async initializeTest() {
			this.$q.loading.show()
			const itDH = await this.hddInfo(this.intDev.HDD.Units)
			this.myDb.Serial_HDD = itDH.group.Serial
			this.myDb.Model_HDD = itDH.group.Description
			this.myDb.HDD_CAPACITY = itDH.group.Size
			this.myDb.RAM = this.intDev.RAM.Total
			this.myDb.CPU = this.intDev.cpuName.join(',')
			await this.brands()
			console.log('brands: ', this.device)
			console.log('Device: ', this.device)

			if (!this.device.SKU) {
				this.test['SKU'] = `SKU ID Check FAIL`
				this.showNotification('No Found', 'The SKU number no found in the device.')
			}
			if (!this.device.Serial) {
				this.test['Serial'] = `SN ID Check FAIL`
				this.showNotification('No Found', 'The Serial number no found in the device.')
			}
			this.info = { ...this.info, ...this.device }
			this.miniSerial = this.device.Serial.slice(0, -2).toUpperCase()
			this.miniSKU = this.device.SKU.includes('#')
				? this.device.SKU.split('#')[0].slice(0, -2).toUpperCase()
				: this.device.SKU.slice(0, -4).toUpperCase()
			this.miniSKU = this.miniSKU.toUpperCase()
			this.myDb.Serial = this.device.Serial
			this.myDb.Model = this.device.SKU
			let projectInfo = await this.getProjectInfo(this.device.Serial)
			console.log('projectInfo: ', projectInfo)
			if (!projectInfo) {
				this.$q.loading.hide()
				this.winChange = true
				this.showNotification('No Found', 'The Serial number no found in the system.')
				return
			}
			await this.checkDevice()
			this.setTypeUnit()
			this.$q.loading.show()
			if (this.device.brand == 'HP') {
				this.bios = JSON.parse(JSON.stringify(await this.$cmd.biosData(this.device.Serial)))
				console.log('BIOS: ', this.bios.components)
				console.log('Select: ', this.select)
				await this.infoHP()
			}
			//if (this.device.brand == 'HP')
			if (!this.select.validateSKU && this.device.brand == 'HP') {
				this.$q.loading.hide()
				this.showNotification(
					'No Math',
					`SKUs are not the same, Device: ${this.device.SKU} <> System: ${this.select.useSKU}`,
				)
				return
			}

			if (!projectInfo.StationID == 13 || !projectInfo.StationID) {
				this.$q.loading.hide()
				this.showNotification('Error', 'The unit has not passed through any previous station.')
				return
			}
			const datetime = this.datetime
			let test = {
				Date: datetime.date,
				startTime: datetime.time,
				Serial: `SN ID Check PASS, SNID: ${this.device.Serial}`,
				Model:
					this.device.SKU == projectInfo.ArrivedSKU
						? `Model (SKU ID) Check PASS, SKUID: ${this.device.SKU}`
						: '',
				Description: `Product Description: ${this.device.Description}`,
				//touchScreen: `NO`,
			}
			this.test = { ...this.test, ...test }

			this.$q.loading.hide()

			this.activate.logo = false
			this.activate.type = true
			this.startActivityTimer()
			//this.stepsDate['']
			await this.espera2('actionType')
			this.activate.type = false
			//if (this.device.brand == 'HP') await this.simpleTest('Comparation')
			//await this.windows_test()
			this.activate.comparation = true
			await this.espera3('actionComparation')
			this.activate.comparation = false
			this.activate.select = true
		},
		async simpleTest(v) {
			this.activate[v.toLowerCase()] = true
			//console.log(`${v.toLowerCase()}: ${this.activate[v.toLowerCase()]}`)
			await this.espera(`action${v}`)
			this.activate[v.toLowerCase()] = false
			return
		},
		async performTests() {
			//await this.keyboardT()
			//Modulo de Color
			this.$q.loading.show()
			this.si = await this.si
			await this.siSave()
			this.$q.loading.hide()
			this.si.battery['estimatedLife'] = (
				(this.si.battery.maxCapacity / this.si.battery.designedCapacity) *
				100
			).toFixed(0)
			console.log('SI: ', this.si)
			this.test.touchScreen =
				this.device.brand == 'HP' && this.partsurfer.hasOwnProperty('Display') ? this.partsurfer.Display.TouchScreen : 'NO'
			await this.$cmd.executeScriptCode(`Start-Process "devmgmt.msc"`)
			await this.simpleTest('Information')
			this.test['hotKey'] = 'HotKeys test PASS'
			this.test['drivers'] = 'Drivers test PASS'
			this.test['drivers'] =
				this.driver.status == 'PASS'
					? 'Device Manager Drivers Test PASS'
					: 'Device Manager Drivers Test FAIL'
			this.test['display'] = this.driver.video
				? 'Display Adapter Drivers Test PASS'
				: 'Display Adapter Drivers Test FAIL'
			this.activate.drivers = false
			if (this.type == 'laptop') {
				await this.testLaptopSpecifics()
			}
			console.log(this.type)
			if (this.type != 'desktop') {
				await this.testNonDesktopSpecifics()
			}

			if (this.type == 'laptop' || this.type == 'all-in-one') {
				//const mires = await this.$cmd.executeScriptCode(resolution)
				this.test[
					'resolution'
				] = `${this.si.graphics.displays[0].resolutionX}x${this.si.graphics.displays[0].resolutionY}`
				await this.checkCameraAvailability()
				this.activate.camera = true
				this.componentes.Webcam = this.test.camera
				await this.espera('actionCamera')
				this.activate.camera = false
			}

			this.win = await this.win
			if (this.win && typeof this.win === 'object') {
				this.win.actived = false
				console.log('Windows: ', this.win)
				localStorage.setItem('dpk', this.win.keyWindows)
			} else {
				console.error('Error: Windows information is not available')
				console.error('PowerShell returned:', this.win)
				this.win = {
					edition: 'Unknown',
					activate: 0,
					keyWindows: 'No license found',
					licenseDetails: 'Unlicensed',
					source: 'None',
					os: 'Unknown',
					licenseStatus: 0,
					actived: false,
				}
			}
			await this.windows_test()
			await this.testDisk()

			if (this.intDev.video.length) {
				await this.testGPU()
			}

			await this.saveComponents()

			if (this.type == 'desktop') {
				this.activate.desktop = true
				await this.espera('actionDesktop')
				this.info = { ...this.info, ...this.form }
				this.activate.desktop = false
			}

			if (this.componentes.color) {
				this.activate.note = true
				await this.espera('actionNote')
				this.activate.note = false
			}
			this.myDb.COLOR = this.color
			this.test['color'] = this.color
			this.componentes['Color'] = this.color
			this.info = { ...this.info, ...this.form }
			this.componentes['TYPE'] = this.type.toUpperCase()
		},
		async finalizeTest() {
			this.$q.loading.show()
			this.info = {
				...this.info,
				video: await this.intDev.video,
				cpuName: this.intDev.cpuName,
				cpu: this.intDev.cpu,
				RAM: this.intDev.RAM,
				HDD: this.intDev.HDD,
			}
			console.log('Before Create: ', this.componentes)
			if (!this.audit) {
				await this.$db
					.funcAdmin('modules/bypass/createModel', this.componentes)
					.then(async (v) => {
						this.myDb['CODE'] = v.Code
						this.myDb.Description = v.Description
						this.myDb['InternalDescription'] = this.device.Description
						this.test.color = v.Color
						this.myDb['COLOR'] = v.Color
					})
			}
			this.txt = await this.report()
			this.file = await this.$uploadTextFile(this.device.Serial, this.txt)
			if (this.file) await this.saveFile(this.file)
			if (!this.audit) {
				if (this.image && this.type != 'desktop') await this.saveFile(this.image)
			}

			this.info = { ...this.info, report: this.txt }
			if (!this.audit) await this.rsSave()	
				
			await this.$db.collection('logTest').add({
				Serial: this.device.Serial,
				sku: this.device.SKU,
				Model: this.device.Description,
				Brand: this.device.brand,
				systemInformation:{
					start: this.infDateStart,
					end: this.infDateEnd
				},
				ActivityTime: this.activityResult ? this.activityResult.formatted : '00:00:00',
				InactiveTime: this.activityResult ? this.activityResult.inactiveFormatted : '00:00:00',
				TotalProcessTime: this.activityResult ? this.formatTime(this.activityResult.seconds + this.activityResult.inactiveSeconds) : '00:00:00',
				timeAllProcess: {
					start: this.dateStartAll,
					end: new Date()
				},
				Status: 'Completed',
			})

			await this.saveMng()
			this.activate.scan = await this.passImaging()
			this.$q.loading.hide()
			this.activate.done = true

			JsBarcode('#barcode', this.device.Serial, {
				format: 'CODE128',
				lineColor: '#000',
				width: 1,
				height: 50,
				displayValue: true,
				textAlign: 'center',
				fontSize: 12,
			})
			JsBarcode('#barcode2', this.device.SKU, {
				format: 'CODE128',
				lineColor: '#000',
				width: 1,
				height: 50,
				displayValue: true,
				textAlign: 'center',
				fontSize: 12,
			})
			this.$q.loading.hide()
		},
		async setTypeUnit() {
			if (this.device.SKU.includes('AV')) {
				this.typeUnit = '#fa8787'
				this.commercial = true
				this.myDb['TYPE'] = 'CTO'
			} else if (this.device.SKU.includes('UAR') || this.device.SKU.includes('U8')) {
				this.myDb['TYPE'] = 'CTO'
				this.typeUnit = '#8bfa87'
				this.commercial = false
			} else if (this.device.SKU.includes('UA')) {
				this.myDb['TYPE'] = 'BTO'
				this.commercial = false
			} else {
				this.myDb['TYPE'] = 'COM'
				this.typeUnit = '#8bfa87'
				this.commercial = true
			}
		},
		async getProjectInfo(Serial) {
			let infoToken = (await this.$rsNeDB('credenciales').find())[0]
			let result = this.$db.funcAdmin('modules/ispt/validateUnit', {
					Serial,
					sku: this.device.SKU,
				})
				.then((v) => {
					v = v[0]
					this.project = {
						Station: v.StationTypeID,
						TenantId: v.TenantId,
						id: v.ProjectName,
						db: v.DB,
						operator: infoToken.id,
					}
					this.select = {...infoToken,...v,...this.project }
					console.log('Select: ', this.select)
					return v
				})
				.catch((e) => {
					console.log('Error: ', e)
					this.showNotification('Error', 'The unit has not passed through any previous station.')
				})
				return result
				/* 
			let infoUnit = (
				await this.$db.funcAdmin('modules/ispt/validateUnit', {
					Serial,
					sku: this.device.SKU,
				})
			)[0]
			console.log('infoUnit: ', infoUnit)
			this.project = {
				Station: infoUnit.StationTypeID,
				TenantId: infoUnit.TenantId,
				id: infoUnit.ProjectName,
				db: infoUnit.DB,
				operator: infoToken.id,
			}
			this.select = { ...infoToken, ...infoUnit, ...this.project }
			console.log('Select: ', this.select)
			return infoUnit */
		},
		showNotification(title, message) {
			this.msn = { title, message, active: true }
		},
		async checkBiosItems() {
			const itemsToCheck = [
				'ProgrammingMode',
				'Microphone',
				'IntegratedCamera',
				'TouchDevice',
				'Headphone',
				'LockWireless',
				'WirelessNetwork',
				'Bluetooth',
				'SmartCard',
				'LockBIOS',
				'ProgrammingMode',
			]
			console.log(this.bios)
			const itemsNotSet = itemsToCheck.filter((item) => {
				if (this.bios[item] !== null) {
					if (['LockWireless', 'LockBIOS'].includes(item)) {
						return this.bios[item] === 'YES'
					} else {
						console.log(this.bios[item] === 'NO')
						return this.bios[item] === 'NO'
					}
				}
				return false
			})
			console.log('itemsNotSet', itemsNotSet)
			if (itemsNotSet.length > 0) {
				this.activate.components = true
				this.$q
					.dialog({
						title: 'BIOS Settings',
						message: `The following BIOS settings need to be adjusted:\n\n${itemsNotSet.join(
							', ',
						)}`,
						persistent: true,
						color: 'red',
						ok: {
							label: 'Restart',
						},
					})
					.onOk(async () => {
						await this.$cmd.executeScriptCode(`shutdown -s -t 2`)
					})
				await this.espera('actionComponents')
			} else {
				console.log('Components')
				this.test['components'] = 'Components test PASS'

				this.activate.components = false

				return true
			}
		},
		async testLaptopSpecifics() {
			let battery = await this.si.battery
			battery['Status'] =
				battery.maxCapacity == 0
					? 'fail'
					: battery.estimatedLife < this.infoTest.batteryProgram
						? 'fail'
						: 'pass'

			if (battery.Status.includes('fail')) {
				this.test[
					'battery'
				] = `Battery test FAIL, Design Capacity = ${battery.designedCapacity}, Full Charge Capacity = ${battery.maxCapacity}, Battery Health = ${battery.estimatedLife}%, Cycle Count = ${battery.cycleCount} Serial = ${battery.serial}`
				await this.$db
					.doc('failTest')
					.add({ Serial: this.device.Serial, type: 'battery', result: this.test.battery })
			} else {
				this.test[
					'battery'
				] = `Battery test PASS, Design Capacity = ${battery.designedCapacity}, Full Charge Capacity = ${battery.maxCapacity}, Battery Health = ${battery.estimatedLife}%, Cycle Count = ${battery.cycleCount} Serial = ${battery.serial}`
			}

			this.info = { ...this.info, battery }
			this.battery = battery
			await this.simpleTest('Battery')
			this.activate.mousepad = true
			await this.espera('actionMousePad')
			this.activate.mousepad = false
			if (this.device.brand == 'HP') {
				await this.checkBiosItems()
			}
		},
		async testNonDesktopSpecifics() {
			this.activate.audio = true
			await this.espera('actionAudio')
			this.activate.brightness = true
			this.$cmd.executeScriptCode(GetMntBringhtness)
			setTimeout(() => {
				this.showActions = true
			}, 4000)
			await this.espera('actionBrightness')
			this.activate.brightness = false

			/*  */
			if (this.type == 'laptop') {
				await this.simpleTest('Mic')
				//await this.simpleTest('Keyboard')

				this.activate.keyboard = true
				await this.espera('actionKeyboard')
				console.log('Keyboard:', this.rKeyboard)
				this.activate.keyboard = false
			}
			this.test['spotLights'] =
				(await this.$cmd.executeScriptCode(spotLights)).result == 'PASS'
					? 'Spot Lights Test PASS'
					: 'Spot Lights Test FAIL'
		},
		async checkCameraAvailability() {
			if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
				await navigator.mediaDevices
					.enumerateDevices()
					.then(async (devices) => {
						const cameras = devices.filter((device) => device.kind === 'videoinput')
						this.camera = cameras.length > 0
					})
					.catch((error) => {
						this.camera = true
					})
			} else {
				console.log('La API de MediaDevices no es compatible con tu navegador.')
			}
		},
		async testDisk() {
			for (let disk of this.si.diskLayout) {
				if (disk.interfaceType !== 'USB') {
					let totalSpace = await this.bytesToStandard(disk.size)
					let description = `${totalSpace} ${disk.type} ${disk.interfaceType}`
					let specs = `Serial: ${disk.serialNum}, Model: ${disk.name}, Size: ${totalSpace}, Type: ${disk.type}, Interface: ${disk.interfaceType}`
					this.disks.push({
						name: disk.name,
						total: disk.size,
						totalSpace,
						description,
						specs,
					})
				}
			}
			this.activate.Storage = true
			await this.espera('actionStorage')
			this.activate.Storage = false
		},

		async testGPU() {
			this.myGpu = await this.myGpu
			console.log('Initial state:', { myGpu: this.myGpu, intDevVideo: this.intDev.video })

			if (!this.myGpu || !this.myGpu.length) {
				console.error('myGpu is empty or not defined:', this.myGpu)
				return
			}

			this.activate.gpu = true

			const dedicatedGPUs = this.intDev.video.filter((v) => v.Type === 'Dedicated')
			const integratedGPUs = this.intDev.video.filter((v) => v.Type === 'Integrated')
			console.log('Dedicated GPUs:', dedicatedGPUs)
			console.log('Integrated GPUs:', integratedGPUs)

			if (dedicatedGPUs.some((obj) => obj.AdapterRAM && obj.AdapterRAM.includes('4'))) {
				console.log('Resolving myGpu as a Promise:', this.myGpu)
				this.myGpu = await this.myGpu
				console.log('Resolved myGpu:', this.myGpu)

				this.intDev.video = this.intDev.video.map((objA) => {
					const matchB = this.myGpu.find((objB) => objB.Description === objA.Description)
					console.log('Matching object:', { objA, matchB })
					return matchB ? { ...objA, AdapterRAM: matchB.AdapterRAM } : objA
				})
			} else {
				this.myGpu = dedicatedGPUs
			}

			const dGPUInfoArray = await this.GPUInfo(this.myGpu)
			console.log('GPUInfo result:', dGPUInfoArray)

			this.myDb.GPU = dGPUInfoArray.GPU || ''
			this.myDb.GPU_RAM = dGPUInfoArray.RAM_GPU || ''

			const iGPUInfo = await this.IntegratedGPUInfo(integratedGPUs)
			this.GPUIntegrated = iGPUInfo || ''
			console.log('IntegratedGPUInfo result:', iGPUInfo)

			await this.espera('actionGPU')
			console.log('Finished espera("actionGPU")')

			if (this.type === 'desktop' && this.noGPU) {
				console.log('Setting GPU and GPU_RAM to empty for desktop with no GPU')
				this.myDb.GPU = ''
				this.myDb.GPU_RAM = ''
			}

			this.activate.gpu = false
			console.log('Final state:', {
				myGpu: this.myGpu,
				intDevVideo: this.intDev.video,
				myDb: this.myDb,
			})
		},
		async saveComponents() {
			this.componentes = {
				...this.componentes,
				...this.bios,
				GPU:
					this.type == 'desktop' && this.noGPU
						? ''
						: await this.IntegratedGPUInfo(
							this.intDev.video.filter((v) => v.Type === 'Dedicated'),
						),
				GPUIntegrated: this.GPUIntegrated.replace(/\s+/g, ' ').trim(),
				Memory: this.intDev.RAM.Total,
				Storage: this.disks.map((disk) => disk.description).join(','),
				Serial: this.device.Serial,
				Model: this.device.SKU,
				Description: this.device.Description.replace(/\s+/g, ' ').trim(),
				OSEdition: this.test.OS,
				SmartCard: this.test.hasOwnProperty('SmartCard')
					? this.test.SmartCard
					: Object.keys(this.bios).length !== 0 && this.bios.hasOwnProperty('SmartCard')
						? this.bios.SmartCard
						: '',
				NFC: this.test.hasOwnProperty('NFC') ? this.test.NFC : this.componentes.NFC,
				Fingerprint: this.test.hasOwnProperty('Fingerprint')
					? this.test.Fingerprint
					: this.componentes.Fingerprint,
				WWAN: this.test.hasOwnProperty('WWAN') ? this.test.WWAN : this.componentes.WWAN,
				CPU: this.intDev.cpu.join(',').replace(/\s+/g, ' ').trim(),
				Bluetooth:
					Object.keys(this.bios).length !== 0 && this.bios.hasOwnProperty('Bluetooth')
						? this.bios.Bluetooth
						: this.componentes.Bluetooth,
				Keyboard: this.componentes.Keyboard,
				Color: this.color,
				version: this.$env.version,
				ProgramType: this.infoTest.ProgramType,
				BOL: this.infoTest.BOL,
				DB: this.project.db,
				Display: {
					Resolution: `${this.si.graphics.displays[0].resolutionX}x${this.si.graphics.displays[0].resolutionY}`,
					TouchScreen: this.componentes.touchScreen,
				},
			}
		},
		async getGPUInfo() {
			return await this.GPUInfo(this.myGpu)
		},
		async myTest() {
			await this.initializeTest()
			await this.performTests()
			await this.finalizeTest()
		},
		ramInfo(i) {
			let objetos = i.map((item) => {
				let [serialNumber, manufacturer, capacity, speed, ddrVersion] = item.split(',')

				let objeto = {
					SerialNumber: serialNumber.trim(),
					Manufacturer: manufacturer.trim(),
					Capacity: capacity.trim(),
					Speed: speed.trim(),
					DDRVersion: ddrVersion.trim(),
				}

				// Verificar si hay una descripción y agregarla al objeto
				if (item.includes('Description')) {
					let [, description] = item.match(/Description=([^;]*)/)
					objeto.Description = description.trim()
				}

				return objeto
			})

			let capacidadMap = new Map() // Mapa para realizar el seguimiento de la cantidad por variedad

			objetos.forEach((objeto) => {
				let { Capacity } = objeto
				let cantidad = capacidadMap.has(Capacity) ? capacidadMap.get(Capacity) + 1 : 1
				capacidadMap.set(Capacity, cantidad)
			})

			let total = [...capacidadMap.keys()]
				.reduce((acc, capacidad) => {
					let cantidad = capacidadMap.get(capacidad)
					return `${acc}${cantidad > 1 ? `, ${cantidad} x ${capacidad}` : `, 1 x ${capacidad}`}`
				}, '')
				.slice(2) // Eliminar la coma inicial

			let totalString = total ? ` (Total: ${total})` : ''

			let resultado = {
				Information: objetos,
				Total: totalString,
			}

			return resultado
		},
		async hddInfo(informacion) {
			let discos = informacion.map((item) => {
				let [serial, description, size] = item.split(',')

				return {
					Serial: serial.trim(),
					Description: description.trim(),
					Size: size.trim(),
				}
			})

			let sizeMap = new Map() // Mapa para realizar el seguimiento de la cantidad por tamaño

			discos.forEach((disco) => {
				let { Size } = disco
				let cantidad = sizeMap.has(Size) ? sizeMap.get(Size) + 1 : 1
				sizeMap.set(Size, cantidad)
			})

			let total = [...sizeMap.keys()]
				.reduce((acc, size) => {
					let cantidad = sizeMap.get(size)
					return `${acc}${cantidad > 1 ? `, ${cantidad} x ${size}` : `, ${size}`}`
				}, '')
				.slice(2) // Eliminar la coma inicial

			let totalString = total ? ` (Total: ${total})` : ''

			// Construir el objeto group
			let group = {
				Serial: discos.map((disco) => disco.Serial).join(', '),
				Description: discos.map((disco) => disco.Description).join(', '),
				Size: discos.map((disco) => disco.Size).join(', '),
			}

			let resultado = {
				Information: discos,
				Total: totalString,
				group,
			}

			return resultado
		},
		async GPUInfo(gpuArray) {
			// Construir el objeto resultante
			let result = {
				GPU: gpuArray.map((gpu) => gpu.Description).join(', '),
				RAM_GPU: gpuArray.map((gpu) => gpu.AdapterRAM).join(', '),
				General: gpuArray.map((gpu) => gpu.AdapterRAM).join(', '),
			}

			return result
		},
		async IntegratedGPUInfo(gpuArray) {
			// Construir el objeto resultante concatenando Description y AdapterRAM

			return gpuArray
				.map((gpu) => {
					const descriptionNoSpaces = gpu.Description.replace(/\s+/g, '')
					const adapterRAMNoSpaces = gpu.AdapterRAM.replace(/\s+/g, '')

					return descriptionNoSpaces.includes(adapterRAMNoSpaces)
						? gpu.Description.replace(/(\d)([a-zA-Z]+)/, '$1 $2')
						: `${gpu.Description.replace(/\s+/g, ' ').trim()} ${gpu.AdapterRAM}`
				})
				.join(', ')
		},
		handleCaptureResult(result) {
			this.$children[0].$emit('stopCamera')
			// Realizar acciones adicionales según el resultado de la captura
			if (result) {
				// Acciones después de una captura exitosa
			} else {
				// Acciones después de una captura fallida
			}
		},
		handleAction(action) {
			this.test['camera'] = `Webcam test ${action.toUpperCase()} `
			this.activate.camera = false
		},
		detenerReproduccion(r) {
			if (r == 'pass') {
				this.test['audio'] = 'Internal Speaker Test PASS '
				this.activate.audio = false
			} else if (r == 'fail') {
				this.test['audio'] = 'Internal Speaker Test FAIL '
				this.activate.audio = false
			}
			this.$refs.reproductorRef.detenerReproduccion(r)
		},
		DateTime() {
			// Usar directamente la lógica local en lugar de hacer la solicitud al endpoint
			let comp = new Date()
			let fechaInicialMoment = moment(comp)
			let minutosAleatorios1 = Math.floor(Math.random() * 10) + 1
			let fecha1 = fechaInicialMoment.clone().subtract(minutosAleatorios1, 'minutes')
			let minutosAleatorios2 = Math.floor(Math.random() * 11) + 25
			let fecha2 = fecha1.clone().subtract(minutosAleatorios2, 'minutes')
			let fechaFormateadaInicial = fechaInicialMoment.format('YYYY-MM-DD HH:mm:ss.SSS')
			let fechaFormateada1 = fecha1.format('YYYY-MM-DD HH:mm:ss.SSS')
			let fechaFormateada2 = fecha2.format('YYYY-MM-DD HH:mm:ss.SSS')

			return {
				date: fechaInicialMoment.format('MM/DD/YYYY'), // Formato "MM/DD/YYYY"
				time: fechaInicialMoment.format('HH:mm'), // Formato "HH:mm"
				complete: comp, // Objeto Date
				start: fechaFormateada1, // Fecha restada con minutos aleatorios
				end: fechaFormateada2, // Otra fecha restada
				wipe: fechaFormateadaInicial, // Fecha original en el formato deseado
			}
		},
		handleColorSelected(color) {
			if (color) {
				this.selectedColor = color // Manejar la selección de color desde el componente hijo
				this.color = color

				this.myDb.COLOR = color
				this.test['color'] = color
				this.componentes['Color'] = color
			}
		},
		resetForm() {
			this.selectedColor = null // Resetear `selectedColor` al limpiar el formulario
		},
		async espera(a) {
			return new Promise((resolve) => {
				let cardActions = document.querySelector(`#${a}`)

				let clickHandler = (event) => {
					// Asegúrate de capturar solo los clics en el botón
					let target = event.target.closest('.q-btn') // Filtrar solo por clase 'q-btn'

					if (!target) return // Si no es un botón, salimos

					// Verificar si el botón tiene el atributo 'disable'
					if (target.hasAttribute('disable') && target.disabled) {
						return // No hacemos nada si el botón está deshabilitado
					}

					// Convertir el texto del botón a mayúsculas para comparación
					let targetText = target.innerText.toUpperCase()

					// Comparar el texto en mayúsculas
					if (targetText.includes('PASS') || targetText === 'NEXT' || targetText === 'FAIL') {
						cardActions.removeEventListener('click', clickHandler)
						resolve()
					}
				}

				// Asignar el event listener
				cardActions.addEventListener('click', clickHandler)
			})
		},
		async espera3(a) {
			return new Promise((resolve) => {
				let cardActions = document.querySelector(`#${a}`)
				let self = this // Guardamos la referencia a "this" en una variable

				let clickHandler = (event) => {
					let target = event.target

					// Verificar si el botón tiene la propiedad 'disabled' y si está deshabilitado
					if (target.hasAttribute('disabled') && target.disabled) {
						// Si el botón está deshabilitado, no hacemos nada
						return
					}

					// Validar el valor de self.isValid (this.isValid)
					if (!self.isValid) {
						console.log('El valor de isValid es falso, no se puede continuar.')
						return
					}
					// Convertir el texto del target a mayúsculas para la comparación
					let targetText = target.innerText.toUpperCase()

					// Comparar el texto en mayúsculas
					if (targetText === 'PASS' || targetText === 'FAIL') {
						cardActions.removeEventListener('click', clickHandler)
						resolve()
					}
				}

				cardActions.addEventListener('click', clickHandler)
			})
		},
		async bytesToStandard(bytes) {
			const units = [
				{ value: 32 * 1024 * 1024, label: '32 MB' },
				{ value: 64 * 1024 * 1024, label: '64 MB' },
				{ value: 128 * 1024 * 1024, label: '128 MB' },
				{ value: 256 * 1024 * 1024, label: '256 MB' },
				{ value: 512 * 1024 * 1024, label: '512 MB' },
				{ value: 1 * 1024 * 1024 * 1024, label: '1 GB' },
				{ value: 2 * 1024 * 1024 * 1024, label: '2 GB' },
				{ value: 3 * 1024 * 1024 * 1024, label: '3 GB' },
				{ value: 4 * 1024 * 1024 * 1024, label: '4 GB' },
				{ value: 6 * 1024 * 1024 * 1024, label: '6 GB' },
				{ value: 8 * 1024 * 1024 * 1024, label: '8 GB' },
				{ value: 12 * 1024 * 1024 * 1024, label: '12 GB' },
				{ value: 16 * 1024 * 1024 * 1024, label: '16 GB' },
				{ value: 24 * 1024 * 1024 * 1024, label: '24 GB' },
				{ value: 32 * 1024 * 1024 * 1024, label: '32 GB' },
				{ value: 64 * 1024 * 1024 * 1024, label: '64 GB' },
				{ value: 128 * 1024 * 1024 * 1024, label: '128 GB' },
				{ value: 256 * 1024 * 1024 * 1024, label: '256 GB' },
				{ value: 512 * 1024 * 1024 * 1024, label: '512 GB' },
				{ value: 1 * 1024 * 1024 * 1024 * 1024, label: '1 TB' },
				{ value: 2 * 1024 * 1024 * 1024 * 1024, label: '2 TB' },
				{ value: 3 * 1024 * 1024 * 1024 * 1024, label: '3 TB' },
				{ value: 4 * 1024 * 1024 * 1024 * 1024, label: '4 TB' },
				{ value: 6 * 1024 * 1024 * 1024 * 1024, label: '6 TB' },
				{ value: 8 * 1024 * 1024 * 1024 * 1024, label: '8 TB' },
				{ value: 10 * 1024 * 1024 * 1024 * 1024, label: '10 TB' },
				{ value: 12 * 1024 * 1024 * 1024 * 1024, label: '12 TB' },
			]

			let closest = units[0]
			let minDiff = Math.abs(bytes - units[0].value)

			for (let i = 1; i < units.length; i++) {
				const diff = Math.abs(bytes - units[i].value)
				if (diff < minDiff) {
					closest = units[i]
					minDiff = diff
				}
			}

			return closest.label
		},

		async espera2(a) {
			return new Promise((resolve) => {
				let cardActions = document.querySelector(`#${a} #laptop`)
				let cardActions2 = document.querySelector(`#${a} #desktop`)
				let cardActions3 = document.querySelector(`#${a} #all-in-one`)
				let clickHandler = (event) => {
					let target = event.target.innerHTML ? event.target.innerHTML : event.target.src
					if (
						target.includes('laptop') ||
						target.includes('desktop') ||
						target.includes('all-in-one')
					) {
						cardActions.removeEventListener('click', clickHandler)
						cardActions2.removeEventListener('click', clickHandler)
						cardActions3.removeEventListener('click', clickHandler)
						return resolve()
					}
				}

				cardActions.addEventListener('click', clickHandler)
				cardActions2.addEventListener('click', clickHandler)
				cardActions3.addEventListener('click', clickHandler)
			})
		},
		handleAllKeysPressed(status) {
			this.allKeysPressed = status
		},
		async validation() {
			if (!this.iTest.Organization) {
				this.iTest.Date = moment(this.iTest.Date, 'MM/DD/YYYY, h:mm:ss A').format(
					'YYYY-MM-DD HH:mm:ss.SSS',
				)
				this.$q
					.dialog({
						title: 'Authorization Required',
						message: 'You need to call your leader',
						prompt: {
							model: '',
							type: 'password', // Hace que el campo sea de tipo contraseña
							isValid: (val) => val.length > 0 || 'Please enter a password',
						},
						persistent: true,
					})
					.onOk(async (data) => {
						this.$q.loading.show()
						let i = await this.$db
							.collection('securityTest')
							.conditions({ key: data })
							.limit(1)
							.all_data()
							.get()
						if (i.length) {
							this.Authorization = i[0].Description
							this.$q.notify({ type: 'positive', message: `Authorizated...` })
							this.$q.loading.hide()
							this.info = this.iTest
							this.myTest()
						} else {
							this.$q.loading.hide()
							this.$q.notify({ type: 'negative', message: `The code is bad try again...` })
							this.validation()
						}
					})
					.onCancel(() => {
						//this.cerrarVentana()
					})
					.onDismiss(() => {
						//this.cerrarVentana()
					})
			} else {
				this.iTest.Date = moment(this.iTest.Date, 'MM/DD/YYYY, h:mm:ss A').format(
					'YYYY-MM-DD HH:mm:ss.SSS',
				)
				this.info = this.iTest
				this.myTest()
			}
		},
		handleKeyPress(event) {
			// Check if it's Ctrl + Shift + F
			if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') {
				event.preventDefault()
				this.forceInject = !this.forceInject // Toggle the value
				this.$q.notify({
					message: this.forceInject ? 'Force mode activated' : 'Force mode deactivated',
					color: this.forceInject ? 'warning' : 'info',
					position: 'top',
					timeout: 2000,
				})
			}
		},
		clearLocalStorage() {
			localStorage.removeItem('infoSystem')
			localStorage.removeItem('iTest')
			localStorage.removeItem('intDev')
			localStorage.removeItem('componentes')
			localStorage.removeItem('datetime')
			localStorage.removeItem('driver')
			localStorage.removeItem('winDPK')
			localStorage.removeItem('enrollment')
			localStorage.removeItem('bitLocker')
			
			this.enrollment = JSON.parse(localStorage.getItem('enrollment'))
			this.bitLocker = JSON.parse(localStorage.getItem('bitLocker'))
			return true
		},

		
		// Inicia el cronómetro de actividad
		startActivityTimer() {
			if (this.activityTimer.active) return; // Evitar iniciar múltiples veces

			this.activityTimer.active = true;
			this.activityTimer.startTime = new Date();
			this.activityTimer.totalTime = 0;
			this.activityTimer.inactiveTime = 0;
			this.activityTimer.isInactive = false;
			this.activityTimer.graceTime = 10000; // Aumentado a 10 segundos

			// Iniciar el contador de segundos
			this.activityTimer.currentTimer = setInterval(() => {
				if (!this.activityTimer.isInactive) {
					this.activityTimer.totalTime++;
					console.log(`Tiempo de actividad: ${this.activityTimer.totalTime} segundos`);
				}
			}, 1000);

			// Agregar eventos para detectar actividad
			document.addEventListener('mousemove', this.resetInactivityTimer);
			document.addEventListener('mousedown', this.resetInactivityTimer);
			document.addEventListener('keydown', this.resetInactivityTimer);

			// Iniciar el temporizador de inactividad
			this.resetInactivityTimer();

			console.log('Cronómetro de actividad iniciado');
		},

		// Detiene el cronómetro de actividad
		stopActivityTimer() {
			if (!this.activityTimer.active) return;

			// Limpiar temporizadores
			clearInterval(this.activityTimer.currentTimer);
			clearTimeout(this.activityTimer.inactivityTimeout);
			
			// Limpiar el contador de inactividad si está activo
			if (this.activityTimer.inactivityCounter) {
				clearInterval(this.activityTimer.inactivityCounter);
				this.activityTimer.inactivityCounter = null;
			}

			// Calcular tiempo total
			const endTime = new Date();
			const totalTimeMs = endTime - this.activityTimer.startTime;
			const activeTime = this.activityTimer.totalTime;
			const inactiveTime = this.activityTimer.inactiveTime;
			
			// Tiempo total real (sin inactividad)
			const realActiveTime = activeTime;
			const totalTimeFormatted = this.formatTime(realActiveTime);
			const inactiveTimeFormatted = this.formatTime(inactiveTime);

			// Restablecer estado
			this.activityTimer.active = false;

			console.log(`Cronómetro de actividad detenido.`);
			console.log(`Tiempo total activo: ${totalTimeFormatted}`);
			console.log(`Tiempo total inactivo: ${inactiveTimeFormatted}`);
			console.log(`Tiempo total del proceso: ${this.formatTime(activeTime + inactiveTime)}`);
			
			return {
				seconds: realActiveTime,
				formatted: totalTimeFormatted,
				inactiveSeconds: inactiveTime,
				inactiveFormatted: inactiveTimeFormatted
			};
		},

		// Reinicia el temporizador de inactividad
		resetInactivityTimer() {
			if (!this.activityTimer.active) return;

			// Si estaba inactivo, registrar que volvió a la actividad
			if (this.activityTimer.isInactive) {
				this.activityTimer.isInactive = false;
				console.log('Actividad reanudada, cronómetro continuando');
				
				// Detener el contador de inactividad si estaba activo
				if (this.activityTimer.inactivityCounter) {
					clearInterval(this.activityTimer.inactivityCounter);
					this.activityTimer.inactivityCounter = null;
				}
				
				// Reiniciar el contador de segundos si estaba pausado
				if (!this.activityTimer.currentTimer) {
					this.activityTimer.currentTimer = setInterval(() => {
						if (!this.activityTimer.isInactive) {
							this.activityTimer.totalTime++;
							console.log(`Tiempo de actividad: ${this.activityTimer.totalTime} segundos`);
						}
					}, 1000);
				}
			}

			// Limpiar el temporizador de inactividad existente
			clearTimeout(this.activityTimer.inactivityTimeout);

			// Establecer un nuevo temporizador de inactividad
			this.activityTimer.inactivityTimeout = setTimeout(() => {
				// Marcar como inactivo y pausar el contador
				this.activityTimer.isInactive = true;
				clearInterval(this.activityTimer.currentTimer);
				this.activityTimer.currentTimer = null;
				
				// Iniciar contador de tiempo inactivo
				this.activityTimer.inactivityCounter = setInterval(() => {
					this.activityTimer.inactiveTime++;
				}, 1000);
				
				console.log('Inactividad detectada, cronómetro pausado');
			}, this.activityTimer.graceTime);
		},

		// Formatea el tiempo en segundos a formato hh:mm:ss
		formatTime(seconds) {
			const hours = Math.floor(seconds / 3600);
			const minutes = Math.floor((seconds % 3600) / 60);
			const secs = seconds % 60;

			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		},

		async _handleKeyReplacement(replacementKey, activationMode, contextMessage = '') {
			try {
				// Save the old key before replacing it
				const oldKey = this.win.keyWindows;
				console.log(`[KEY-REPLACEMENT${contextMessage}] Before saving - keyWindows:`, this.win.keyWindows);
				console.log(`[KEY-REPLACEMENT${contextMessage}] Before saving - oldKeyWin:`, this.win.oldKeyWin);
				this.win.oldKeyWin = oldKey;
				console.log(`[KEY-REPLACEMENT${contextMessage}] After saving - oldKeyWin:`, this.win.oldKeyWin);

				// 1. Deactivate current key
				console.log(`[KEY-REPLACEMENT${contextMessage}] Deactivating current product key...`);
				this.$q.loading.show({ message: 'Deactivating current Windows key...' });
				const deactivateResult = await this.$cmd.executeScriptCode(dWin);
				console.log(`[KEY-REPLACEMENT${contextMessage}] Deactivation result:`, deactivateResult);

				// 2. Inject and activate new key
				console.log(`[KEY-REPLACEMENT${contextMessage}] Injecting new product key:`, replacementKey);
				this.$q.loading.show({
					message: `Activating Windows with ${activationMode === 'online' ? 'new DPK' : 'DPK (offline mode)'
						}...`,
				});

				const activateScript = aWin.replace('$dpk', replacementKey).replace('$mode', activationMode);

				let activationSuccessful = false;
				let retryCount = 0;
				const MAX_RETRIES = 3;
				let activateResult = {}; // Define activateResult outside the loop

				while (retryCount < MAX_RETRIES && !activationSuccessful) {
					retryCount++;
					console.log(`[KEY-REPLACEMENT${contextMessage}] Activation attempt ${retryCount} of ${MAX_RETRIES}...`);

					activateResult = await this.$cmd.executeScriptCode(activateScript); // Assign result here
					console.log(`[KEY-REPLACEMENT${contextMessage}] Activation result (attempt ${retryCount}):`, activateResult);

					// Update Windows key info immediately after attempt
					console.log(`[KEY-REPLACEMENT${contextMessage}] Before key update - keyWindows:`, this.win.keyWindows);
					console.log(`[KEY-REPLACEMENT${contextMessage}] Before key update - oldKeyWin:`, this.win.oldKeyWin);
					this.win.keyWindows = activateResult.productKeyUsed ? activateResult.productKeyUsed : replacementKey;
					this.win.licenseDetails = activateResult.message ? activateResult.message : '';
					console.log(`[KEY-REPLACEMENT${contextMessage}] After key update - keyWindows:`, this.win.keyWindows);
					console.log(`[KEY-REPLACEMENT${contextMessage}] After key update - oldKeyWin:`, this.win.oldKeyWin);

					if (activateResult && activateResult.activated === 1 && !activateResult.error) {
						console.log(`[KEY-REPLACEMENT${contextMessage}] Activation successful on attempt`, retryCount);
						activationSuccessful = true;
						this.win.activated = true; // Update activation status
						this.$q.notify({
							type: 'positive',
							message: `Windows product key replaced and activated successfully${contextMessage}.`,
						});

						// Report success to backend
						await this.statusDPK({
							SerialNumber: this.device.Serial,
							NewProductKey: replacementKey,
							Status: true,
							Message: activateResult.message || `Activation successful${contextMessage}`
						});
						break; // Exit loop
					} else {
						const errorMessage = activateResult.message ? activateResult.message : 'Unknown error during activation';
						if (retryCount < MAX_RETRIES) {
							console.log(`[KEY-REPLACEMENT${contextMessage}] Activation failed on attempt ${retryCount}. Retrying...`);
							this.$q.notify({
								type: 'warning',
								message: `Activation attempt ${retryCount} failed. Retrying...`,
							});
							await new Promise(resolve => setTimeout(resolve, 5000)); // Wait
						} else {
							console.error(`[KEY-REPLACEMENT${contextMessage}] All activation attempts failed`);
							this.$q.notify({
								type: 'negative',
								message: `Windows product key replacement failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
							});
							// Report failure to backend
							await this.statusDPK({
								SerialNumber: this.device.Serial,
								NewProductKey: replacementKey,
								Status: false,
								Message: errorMessage
							});
							// Open activation settings
							console.log(`[KEY-REPLACEMENT${contextMessage}] Opening activation settings...`);
							await this.$cmd.executeScriptCode(`Start-Process "ms-settings:activation"`);
						}
					}
				}
				return activationSuccessful; // Return status
			} catch (error) {
				console.error(`[KEY-REPLACEMENT${contextMessage}] Error:`, error);
				this.$q.notify({
					type: 'negative',
					message: `Error replacing Windows product key${contextMessage}: ` + (error.message || error),
				});
				// Report DPK failure (using failDPK might be appropriate here)
				await this.failDPK({
					SerialNumber: this.device.Serial,
					dpk: replacementKey // Use the key we tried to activate with
				});
				// Open activation settings
				console.log(`[KEY-REPLACEMENT${contextMessage}] Opening activation settings after error...`);
				await this.$cmd.executeScriptCode(`Start-Process "ms-settings:activation"`);
				return false; // Return failure
			}
		},
		async windows_test() {
    // Guardamos la clave original al inicio del proceso
    const originalKey = this.win.keyWindows
    this.win.oldKeyWin = originalKey
    this.activate.windows = true
    console.log('[CASE-0] Starting Windows verification process')
    console.log('[CASE-0] Initial keyWindows:', this.win.keyWindows)
    console.log('[CASE-0] Initial oldKeyWin:', this.win.oldKeyWin)
    this.$q.loading.show({
        message: 'Starting Windows activation verification...',
    })

    try {
        // CASE 1: Initial verification of existing DPK
        console.log('[CASE-1] Verifying initial local DPK:', JSON.stringify(this.win))
        console.log('[CASE-1] Current keyWindows:', this.win.keyWindows)
        console.log('[CASE-1] Current oldKeyWin:', this.win.oldKeyWin)
        
        // Verificar estado actual de activación
        const initialActivationStatus = await this.$cmd.executeScriptCode(sWin)
        console.log('[CASE-1] Initial activation status:', JSON.stringify(initialActivationStatus))
        
        // Actualizar win con los datos más recientes
        if (initialActivationStatus) {
            this.win = { ...this.win, ...initialActivationStatus }
            // Asegurar que mantenemos las claves originales
            this.win.oldKeyWin = originalKey
        }
        
        const isCurrentlyActivated = 
            this.win.activate === 1 || 
            this.win.licenseStatus === 1 || 
            (this.win.licenseType && 
             this.win.licenseType !== 'None' && 
             this.win.licenseType !== 'Error');
        
        if (
            !this.win ||
            !this.win.hasOwnProperty('keyWindows') ||
            this.win.keyWindows === 'Key not found' ||
            this.win.keyWindows === 'Error'
        ) {
            console.error('[CASE-1-ERROR] Initial DPK invalid or not found')
            // Handle DPK not found error
            console.error('[DPK-ERROR] Error with DPK: No DPK Found Locally')
            this.$q.notify({
                type: 'negative',
                message: `DPK Error: No DPK Found Locally`,
            })
            this.test.keyWindows = this.win.keyWindows
            this.test.oldKeyWin = this.win.oldKeyWin || 'N/A'
            this.test.windows = 'Windows Activation Test FAIL'
            
            // Si no hay clave, intentamos forzar una nueva siempre
            console.log('[CASE-1-RECOVERY] No valid key found, forcing DPK request...')
            const forcedDkpResult = await this.verifyDPK(true) // Force injection
            
            if (!forcedDkpResult.error && forcedDkpResult.needsNewProductKey) {
                console.log('[CASE-1-RECOVERY] New DPK obtained via forced request. Starting replacement...')
                const replacementKey = forcedDkpResult.replacementProductKey
                const activationMode = (this.infoTest && this.infoTest.DPKMode) || 'online'
                await this._handleKeyReplacement(replacementKey, activationMode, ' (Recovery Request)')
            }
            // Proceed to CASE 6 for final status check
        } else {
            // CASE 2: Verify with backend and handle activation/replacement
            console.log('[CASE-2] Verifying DPK with backend (initial check)...')
            this.$q.loading.show({ message: 'Verifying DPK with the system...' })
            
            // Si ya está activado, podríamos evitar forzar una clave
            let shouldForceKeyRequest = !isCurrentlyActivated;
            console.log('[CASE-2] Initial activation check - Activated:', isCurrentlyActivated);
            console.log('[CASE-2] Should force key request:', shouldForceKeyRequest);
            
            // Verificación inicial - sin forzar primero
            const initialDkpResult = await this.verifyDPK(false)
            console.log('[CASE-2] Initial verification result:', JSON.stringify(initialDkpResult))

            if (initialDkpResult.error) {
                // Error en verificación inicial
                console.error(
                    '[CASE-2-ERROR] Error in initial DPK verification:',
                    initialDkpResult.errorMessage,
                )
                
                // Verificar estado actual directamente del OS como fallback
                const currentWinStatusFallback = await this.$cmd.executeScriptCode(sWin)
                
                // Actualizar estado actual y verificar activación
                if (currentWinStatusFallback) {
                    this.win = { ...this.win, ...currentWinStatusFallback }
                    // Mantener claves originales
                    this.win.oldKeyWin = originalKey 
                }
                
                const isActivatedFallback = 
                    currentWinStatusFallback && 
                    (currentWinStatusFallback.activate === 1 ||
                    currentWinStatusFallback.licenseStatus === 1 ||
                    (currentWinStatusFallback.licenseType &&
                    currentWinStatusFallback.licenseType !== 'None' &&
                    currentWinStatusFallback.licenseType !== 'Error'));
                
                if (isActivatedFallback) {
                    console.log('[CASE-2-RECOVERY] Windows is activated despite DPK verification error')
                    this.$q.notify({
                        type: 'info',
                        message: 'DPK verification failed, but Windows appears activated.',
                    })
                    shouldForceKeyRequest = false;
                } else {
                    // Si el OS también muestra no activado, intentamos forzar una nueva clave
                    console.log('[CASE-2-RECOVERY] Windows not activated and DPK verification failed. Forcing key request...')
                    shouldForceKeyRequest = true;
                }
            } else if (initialDkpResult.needsNewProductKey) {
                // Backend dice que se necesita una nueva clave
                console.log('[CASE-2] New DPK required by backend. Starting replacement...')
                const replacementKey = initialDkpResult.replacementProductKey
                const activationMode = (this.infoTest && this.infoTest.DPKMode) || 'online'
                await this._handleKeyReplacement(replacementKey, activationMode, ' (Initial Request)')
                shouldForceKeyRequest = false; // Ya estamos reemplazando
            } else {
                // Backend dice que la clave actual está bien O no se necesita nueva clave
                console.log('[CASE-2] Backend indicates no new DPK needed initially.')
                
                // Verificar si el sistema está realmente activado localmente
                if (isCurrentlyActivated) {
                    console.log('[CASE-2] System is already activated locally. Proceeding to final check.')
                    shouldForceKeyRequest = false;
                } else {
                    // No activado localmente, pero el backend no requirió una nueva clave inicialmente.
                    // **Este es exactamente tu caso problemático**
                    console.warn(
                        '[CASE-2] System not activated, but backend did not initially require a new key. Will force request...',
                    )
                    shouldForceKeyRequest = true;
                }
            }
            
            // Forzar solicitud de clave si es necesario después de todas las verificaciones
            if (shouldForceKeyRequest) {
                console.log('[CASE-2-FORCE] Forcing DPK request due to activation issues...')
                this.$q.loading.show({ message: 'Forcing DPK request...' })
                
                // Siempre intentar forzar una nueva clave si no estamos activados
                const forcedDkpResult = await this.verifyDPK(true) // Force injection
                console.log('[CASE-2-FORCE] Forced verification result:', JSON.stringify(forcedDkpResult))

                if (!forcedDkpResult.error && forcedDkpResult.needsNewProductKey) {
                    // Solicitud forzada produjo una nueva clave
                    console.log('[CASE-2-FORCE] New DPK obtained via forced request. Starting replacement...')
                    const replacementKey = forcedDkpResult.replacementProductKey
                    const activationMode = (this.infoTest && this.infoTest.DPKMode) || 'online'
                    await this._handleKeyReplacement(replacementKey, activationMode, ' (Forced Request)')
                } else {
                    // La solicitud forzada falló o no proporcionó una clave
                    console.error(
                        '[CASE-2-FORCE] Forced DPK request failed or did not provide a new key.',
                        forcedDkpResult.errorMessage || '',
                    )
                    this.$q.notify({
                        type: 'warning',
                        message:
                            'Could not obtain a required DPK even after forcing the request. ' +
                            (forcedDkpResult.errorMessage || ''),
                    })
                }
            }
        }

        // CASE 6: Final verification (Runs after all previous logic)
        console.log('[CASE-6] Performing final activation verification')
        this.$q.loading.show({ message: 'Verifying final activation status...' })

        // Get updated Windows status directly from the OS
        const currentWinStatus = await this.$cmd.executeScriptCode(sWin)
        console.log('[CASE-6-CHECK] Current Windows status:', JSON.stringify(currentWinStatus))

        // Update this.win with the latest data from the OS check
        if (currentWinStatus) {
            // Guardamos las claves originales antes de actualizar el objeto win
            const originalOldKey = this.win.oldKeyWin
            const originalCurrentKey = this.win.keyWindows
            console.log('[CASE-6] Before update - keyWindows:', this.win.keyWindows)
            console.log('[CASE-6] Before update - oldKeyWin:', originalOldKey)
            
            // Actualizamos el objeto win con los datos más recientes
            this.win = { ...this.win, ...currentWinStatus }
            
            console.log('[CASE-6] After update - keyWindows:', this.win.keyWindows)
            console.log('[CASE-6] After update - oldKeyWin:', this.win.oldKeyWin)
            
            // Restauramos las claves originales, asegurándonos que no se sobrescriban
            this.win.oldKeyWin = originalOldKey
            this.win.keyWindows = originalCurrentKey
            
            console.log('[CASE-6] After restoration - keyWindows:', this.win.keyWindows)
            console.log('[CASE-6] After restoration - oldKeyWin:', this.win.oldKeyWin)
        }

        // Check if Windows is activated based on the updated data
        if (
            this.win.activate === 1 ||
            this.win.licenseStatus === 1 ||
            (this.win.licenseDetails &&
                this.win.licenseDetails.toLowerCase().includes('successfully activated')) ||
            (this.win.licenseType &&
                this.win.licenseType !== 'None' &&
                this.win.licenseType !== 'Error')
        ) {
            console.log('[CASE-6-SUCCESS] Final verification confirms Windows is activated.')
            console.log('[CASE-6-SUCCESS] Final keyWindows:', this.win.keyWindows)
            console.log('[CASE-6-SUCCESS] Final oldKeyWin:', this.win.oldKeyWin)
            this.win.activated = true // Ensure activated flag is set

            // Enhanced notification with license type information
            let activationMessage = 'Windows activation completed successfully.'
            if (this.win.licenseType) {
                activationMessage += ` (${this.win.licenseType})`

                // Special warning for KMS with few days remaining
                if (
                    this.win.licenseType === 'KMS' &&
                    this.win.daysRemaining > 0 &&
                    this.win.daysRemaining < 15
                ) {
                    console.log(
                        `[CASE-6-WARNING] KMS activation with only ${this.win.daysRemaining} days remaining`,
                    )
                    activationMessage += ` - Warning: Only ${this.win.daysRemaining} days remaining`
                }
            }

            this.$q.notify({
                type: 'positive',
                message: activationMessage,
            })

            this.test.keyWindows = this.win.keyWindows
            this.test.oldKeyWin = this.win.oldKeyWin || 'N/A'
            this.test.windows = 'Windows Activation Test PASS'
        } else {
            console.log('[CASE-6-FAIL] Final verification indicates Windows is not activated.')
            console.log('[CASE-6-FAIL] Final keyWindows:', this.win.keyWindows)
            console.log('[CASE-6-FAIL] Final oldKeyWin:', this.win.oldKeyWin)
            this.win.activated = false // Ensure activated flag is false

            // Notify about failure based on final check
            this.$q.notify({
                type: 'negative',
                message: 'Final verification failed. Windows is not activated.',
            })

            // Set test variables for failed activation
            this.test.keyWindows = this.win.keyWindows || 'Not Found/Error'
            this.test.oldKeyWin = this.win.oldKeyWin || 'N/A'
            this.test.windows = 'Windows Activation Test FAIL'
        }
    } catch (error) {
        console.error('[CASE-ERROR] Unexpected error in windows_test:', error)
        this.$q.notify({
            type: 'negative',
            message: 'An unexpected error occurred during Windows activation: ' + error.message,
        })

        // Set test variables when there's an error
        this.test.keyWindows = this.win ? this.win.keyWindows : 'Error'
        this.test.oldKeyWin = this.win && this.win.oldKeyWin ? this.win.oldKeyWin : 'N/A'
        this.test.windows = 'Windows Activation Test FAIL'
    } finally {
        // Ensure OS edition is captured
        this.test.OS = this.win ? this.win.edition : 'Unknown'
        console.log('[CASE-END] Finishing windows_test process')
        this.$q.loading.hide()

        // IMPORTANT: Always execute espera('actionWindows') before finishing
        console.log('[CASE-END] Waiting for user action in actionWindows')
        await this.espera('actionWindows')
        console.log('[CASE-END] User completed action in actionWindows')

        this.activate.windows = false
        console.log('[CASE-END] windows_test method completely finished')
    }
},
	},
	async beforeCreate() {
		this.dateStartAll = new Date()
		this.$q.loading.show({ message:'Logging in...'})
		try {
			this.user = await this.$rsNeDB('credenciales').findOne({})
			this.si = this.$si()
		} catch (error) {
			console.error('Error during beforeCreate:', error)
		}
	},
async mounted() {
    // Create loading instance
    const loading = this.$q.loading.show({
        message: 'Some important <b>process</b> is in progress.<br/><span class="text-orange text-weight-bold">Hang on...</span>',
        spinnerColor: 'primary',
        spinnerSize: 140,
        backgroundColor: 'grey-2'
    })

    try {
        this.infDateStart = new Date()
        console.log(this.infDateStart, 'Begin System Information...')

        // Initialize the win variable
        this.win = this.$cmd.executeScriptCode(sWin)

        if (!localStorage.getItem('infoSystem')) {
            try {
                // Execute all promises concurrently
                let [is, it, id, cp, dt, dr, w, enlmt, btlkr ] = await Promise.all([
                    this.$system(),
                    this.$cmd.executeScriptCode(imaging),
                    this.$cmd.executeScriptCode(intenalDevices),
                    this.$cmd.executeScriptCode(components),
                    this.DateTime(),
                    this.$cmd.executeScriptCode(drivers),
                    this.$cmd.executeScriptCode(sWin),
					this.$cmd.executeScriptCode(Enrollment),
					this.$cmd.executeScriptCode(BitLocker)
                ])

                // Assign results to variables
                this.infoSystem = is
                this.iTest = it
                this.intDev = id
                this.componentes = cp
                this.datetime = dt
                this.driver = dr
                this.win = w
				this.enrollment = enlmt
				this.bitLocker = btlkr
				if (this.bitLocker.status === true)
				this.showNotification('The unit has a volume with BitLocker. Fix it and reload the system.')
				if (this.enrollment.status === true)
				this.showNotification('The unit has MDM (Enrollment). You need to run the Enrollment app...')
                // Save results to localStorage
                localStorage.setItem('infoSystem', JSON.stringify(this.infoSystem))
                localStorage.setItem('iTest', JSON.stringify(this.iTest))
                localStorage.setItem('intDev', JSON.stringify(this.intDev))
                localStorage.setItem('componentes', JSON.stringify(this.componentes))
                localStorage.setItem('datetime', JSON.stringify(this.datetime))
                localStorage.setItem('driver', JSON.stringify(this.driver))
                localStorage.setItem('winDPK', JSON.stringify(this.win))
				localStorage.setItem('enrollment', JSON.stringify(this.enrollment))
				localStorage.setItem('bitLocker', JSON.stringify(this.bitLocker))
            } catch (error) {
                console.error('Error during system information retrieval:', error)
                this.clearLocalStorage()
                throw error // Re-throw the error to handle it in the catch block below
            }
        } else {
            // Load data from localStorage
            this.infoSystem = JSON.parse(localStorage.getItem('infoSystem'))
            this.iTest = JSON.parse(localStorage.getItem('iTest'))
            this.intDev = JSON.parse(localStorage.getItem('intDev'))
            this.componentes = JSON.parse(localStorage.getItem('componentes'))
            this.datetime = JSON.parse(localStorage.getItem('datetime'))
            this.driver = JSON.parse(localStorage.getItem('driver'))
            this.win = JSON.parse(localStorage.getItem('winDPK'))
			this.enrollment = JSON.parse(localStorage.getItem('enrollment'))
			this.bitLocker = JSON.parse(localStorage.getItem('bitLocker'))
        }

        // Perform GPU check if conditions are met
        if (
            this.intDev.video
                .filter((v) => v.Type === 'Dedicated')
                .some((obj) => obj.AdapterRAM.includes('4'))
        ) {
            this.myGpu = this.$cmd.getDx({ Serial: this.infoSystem.system.serial })
        }

        console.log('Drivers: ', this.driver)
        this.infDateEnd = new Date()
        console.log(this.infDateEnd, 'End System Information...')

        // Final validation

        this.validation()

        window.addEventListener('keydown', this.handleKeyPress)
    } catch (error) {
        // Display error dialog using Quasar
        this.$q
            .dialog({
                title: 'Error',
                message: `An error occurred during initialization: ${error.message}`,
                persistent: true,
                color: 'red',
                ok: {
                    label: 'Retry',
                },
            })
            .onOk(async () => {
                await this.clearLocalStorage() // Clear localStorage
                window.location.reload() // Reload the page to retry
            })
    } finally {
        // Ensure loading is hidden after a small delay
        setTimeout(() => {
            loading.hide()
        }, 500)
    }
},
	beforeDestroy() {
		window.removeEventListener('keydown', this.handleKeyPress)
		// Limpiar los eventos del cronómetro de actividad
		this.stopActivityTimer()
		document.removeEventListener('mousemove', this.resetInactivityTimer)
		document.removeEventListener('mousedown', this.resetInactivityTimer)
		document.removeEventListener('keydown', this.resetInactivityTimer)
	},

}
</script>

<style scoped>
.main {
	display: flex;
	justify-content: center;
}

.card {
	border-radius: 15px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	width: 90%;
	margin-top: 25px;
}

.q-card-section {
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.glow:hover {
	animation-name: glowEffect;
	animation-duration: 0.5s;
	animation-timing-function: ease-in-out;
	animation-iteration-count: infinite;
}

.disk-list {
	width: 400px;
	margin: 0 auto;
}

.q-linear-progress {
	margin-top: 10px;
}

@keyframes glowEffect {
	0% {
		box-shadow: 0 0 10px rgba(0, 102, 255, 0.8);
	}

	50% {
		box-shadow: 0 0 20px rgba(0, 102, 255, 0.6);
	}

	100% {
		box-shadow: 0 0 10px rgba(0, 102, 255, 0.8);
	}
}
</style>
