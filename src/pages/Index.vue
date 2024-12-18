<template>
	<q-page
		id="test"
		class=""
		:style="`padding-top: 10px; background: linear-gradient(45deg, #ffffff, ${this.typeUnit})`"
	>
		<user-info-grid
			v-show="activate.select"
			:username="select.user"
			:project="`${project.id}${
				infoTest.ProgramType != 'BatteryPercentage' ? ' - ' + infoTest.ProgramType : ''
			}`"
			:title="device.Description"
			:subtitle="`${device.SKU} - ${device.Serial}`"
			:imageSrc="device.img ? device.img : `${type}.png`"
			@update:audit="handleAuditUpdate"
		/>
		<div class="main">
			<q-card class="card" v-show="activate.comparation">
				<q-card-section>
					<q-card-section> <div class="text-h6">Check</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center col row">
					<q-input
						v-model="check.serial"
						@input="handleInputChange('serial')"
						type="text"
						label="Serial"
						:prefix="miniSerial"
						placeholder="XX"
						hint="Write the last 2 digits"
						class="col-6"
					/>
					<q-input
						v-model="check.sku"
						@input="handleInputChange('sku')"
						type="text"
						label="SKU"
						:prefix="miniSKU"
						hint="Write the missing"
						class="col-6"
					/>
				</q-card-section>
				<q-card-actions align="right" id="actionComparation">
					<q-btn flat color="negative" size="xl" label="Fail" @click="action = 'FAIL'" />
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="action = 'PASS'"
						:disable="!isValid"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.type">
				<q-card-section> <div class="text-h6">Select type</div> </q-card-section><q-separator />
				<q-card-section class="row col" id="actionType" style="justify-content: center">
					<q-btn class="col-md-4 q-ma-sm glow" @click="type = 'laptop'" id="laptop" ref="laptop"
						><img src="laptop.png"
					/></q-btn>
					<q-btn class="col-md-4 q-ma-sm glow" @click="type = 'desktop'" id="desktop" ref="desktop"
						><img src="desktop.png"
					/></q-btn>
					<q-btn
						class="col-md-4 q-ma-sm glow"
						@click="type = 'all-in-one'"
						id="all-in-one"
						ref="all-in-one"
						><img src="all-in-one.png"
					/></q-btn>
					<!-- <q-btn color="positive" :label="audit ? 'Shut Down' : 'SysPrep'" @click="sdDevice" /> -->
				</q-card-section>
			</q-card>
			<q-card class="card" v-show="activate.audio">
				<q-card-section> <div class="text-h6">Audio Test</div> </q-card-section><q-separator />
				<q-card-section class="reproductor-content">
					<q-card-section>
						<Reproductor
							v-if="activate.audio"
							ref="reproductorRef"
							id="audioTest"
							@respuesta="sound = $event"
							:autoplay="true"
						/>
					</q-card-section>
				</q-card-section>
				<q-card-actions align="right" ref="actionAudio" id="actionAudio">
					<q-btn
						id="audioFail"
						ref="audioFail"
						flat
						size="xl"
						color="red"
						label="FAIL"
						@click="detenerReproduccion('fail')"
					/>
					<q-btn
						id="audioPass"
						ref="audioPass"
						flat
						size="xl"
						color="green"
						label="PASS"
						@click="detenerReproduccion('pass')"
					/>
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
						<CameraCapture
							ref="camaraCapture"
							:key="componentKey"
							@capture-result="handleCaptureResult"
							:imageName="device.Serial"
							v-model="image"
							v-if="activate.camera"
						/>
					</template>
					<div v-if="!camera">No Found</div>
				</q-card-section>
				<q-card-actions align="right" id="actionCamera">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['camera'] = 'Webcam test FAIL'"
					/>
					<q-btn
						flat
						color="primary"
						size="xl"
						label="No Camera (PASS)"
						@click=";(test['camera'] = 'No Webcam test PASS'), (componentes.Webcam = 'NO')"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click=";(test['camera'] = 'Webcam test PASS'), (componentes.Webcam = 'YES')"
					/>
				</q-card-actions>
			</q-card>
			<!-- Keyboard Start -->
			<q-card class="card" v-show="activate.keyboard">
				<q-card-section>
					<q-card-section> <div class="text-h6">Keyboard Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" style="min-height: 200px">
					<virtual-keyboard @allKeysPressed="handleAllKeysPressed"></virtual-keyboard>
				</q-card-section>
				<q-card-actions align="right" v-show="activate.keyboard" id="actionKeyboard">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['keyboard'] = 'Keyboard test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="test['keyboard'] = 'Keyboard test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<!-- Keyboard End -->
			<!-- Mic Start -->
			<q-card class="card" v-show="activate.mic">
				<q-card-section>
					<q-card-section> <div class="text-h6">Mic Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" style="min-height: 200px">
					<audio-recorder></audio-recorder>
				</q-card-section>
				<q-card-actions align="right" v-show="activate.mic" id="actionMic">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['mic'] = 'Mic test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="test['mic'] = 'Mic test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<!-- Mic End -->
			<!-- Touch Start -->
			<q-card class="card" v-if="activate.touch">
				<q-card-section>
					<q-card-section> <div class="text-h6">Touch Test</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center" style="min-height: 200px">
					<q-btn @click="activateFullScreen" label="Activate Full Screen" />
					<Touch ref="touch" />
				</q-card-section>
				<q-card-actions align="right" v-show="activate.touch" id="actionTouch">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['touch'] = 'Touch test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="test['touch'] = 'Touch test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<!-- Mic End -->
			<q-card class="card" v-show="activate.brightness">
				<q-card-section>
					<q-card-section> <div class="text-h6">Brightness Test</div> </q-card-section
					><q-separator />
				</q-card-section>
				<q-card-section class="center"> Is the brightness working? </q-card-section>
				<q-card-actions align="right" v-show="showActions" id="actionBrightness">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['brightness'] = 'Brightness test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="test['brightness'] = 'Brightness test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.drivers">
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Drivers Test</div>
						</div>
						<div class="col-auto">
							<q-btn
								round
								color="primary"
								icon="restart_alt"
								@click="$cmd.executeScriptCode(drivers)"
							/>
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
				<q-card-actions align="right" id="actionDrivers">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['brightness'] = 'Brightness test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="test['brightness'] = 'Brightness test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.windows">
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Windows Test</div>
						</div>
						<div class="col-auto">
							<q-btn round color="primary" icon="restart_alt" @click="testWindows" />
						</div>
					</div>
				</q-card-section>
				<q-card-section class="center" v-if="win.os">
					<div>{{ win.edition }}</div>
					<div>{{ win.keyWindows }}</div>
					<div>{{ win.licenseDetails }}</div>
				</q-card-section>
				<q-card-section class="center" v-else>
					<div>Wait...</div>
				</q-card-section>
				<pre v-show="false">{{ win }}</pre>
				<q-card-actions align="right" id="actionWindows" v-show="win.actived">
					<q-btn flat color="negative" size="xl" label="Fail" @click="action = 'FAIL'" />
					<q-btn flat color="positive" size="xl" label="Pass" @click="action = 'PASS'" />
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.battery">
				<q-card-section>
					<q-card-section> <div class="text-h6">Battery Test</div> </q-card-section><q-separator />
				</q-card-section>
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
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="action = 'FAIL'"
						v-if="battery.Status != 'fail'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="action = 'PASS'"
						v-if="battery.Status != 'fail'"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.mousepad">
				<q-card-section>
					<q-card-section> <div class="text-h6">Mouse Pad Test</div> </q-card-section
					><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<mouse-pad />
				</q-card-section>
				<q-card-actions align="right" id="actionMousePad">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['mousepad'] = 'Mouse pad test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="test['mousepad'] = 'Mouse pad test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.hotKey">
				<q-card-section>
					<q-card-section> <div class="text-h6">HotKey</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<b>You need to test the Hotkeys</b>
					<div class="q-gutter-sm row col-6">
						<q-checkbox size="150px" v-model="hotKey.mic" val="80px" label="Mic" />
						<q-checkbox size="150px" v-model="hotKey.speakers" val="80x" label="Speakers" />
						<q-checkbox size="150px" v-model="hotKey.brights" val="80px" label="Brightness" />
						<q-checkbox
							size="150px"
							v-model="hotKey.privacy"
							val="80px"
							label="Privacy"
							v-if="componentes.Keyboard.Privacy == 'YES'"
						/>
						<!-- <q-checkbox
							size="150px"
							v-model="componentes.Keyboard.Privacy"
							val="80px"
							label="Privacy"
							v-if="componentes.Keyboard.Privacy == 'YES'"
						/> -->
					</div>
					<!-- <q-checkbox left-label v-model="hotkey.speakers" label="Speackers" /> -->
				</q-card-section>
				<q-card-actions align="right" id="actionHotKey">
					<q-btn
						flat
						color="negative"
						size="xl"
						label="Fail"
						@click="test['hotKey'] = 'HotKeys test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						size="xl"
						label="Pass"
						@click="test['hotKey'] = 'HotKeys test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.components">
				<q-card-section>
					<q-card-section> <div class="text-h6">Status Components</div> </q-card-section
					><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<div class="row justify-between" scroll>
						<div class="col-4">
							<q-list dense bordered>
								<q-item v-for="(item, index) in centerItems" :key="index">
									<q-item-section side>
										<q-checkbox
											v-model="bios[formatItem(item.label)]"
											:label="item.label"
											true-value="YES"
											false-value="NO"
											left-label
											disable
										/>
									</q-item-section>
								</q-item>
							</q-list>
						</div>
						<div class="col-4">
							<q-list dense bordered>
								<q-item v-for="(item, index) in rightItems" :key="index">
									<q-item-section side>
										<q-checkbox
											v-model="bios[formatItem(item.label)]"
											:label="item.label"
											true-value="YES"
											false-value="NO"
											left-label
											disable
										/>
									</q-item-section>
								</q-item>
							</q-list>
						</div>
						<div class="col-4">
							<q-list dense bordered>
								<q-item v-for="(item, index) in leftItems" :key="index">
									<q-item-section side>
										<q-checkbox
											v-model="bios[formatItem(item.label)]"
											:label="item.label"
											true-value="YES"
											false-value="NO"
											left-label
											disable
										/>
									</q-item-section>
								</q-item>
							</q-list>
						</div>
					</div>
				</q-card-section>
				<q-card-actions align="right" id="actionComponents">
					<q-btn
						flat
						color="negative"
						label="Fail"
						@click="test['components'] = 'Components test FAIL'"
					/>
					<q-btn
						flat
						color="positive"
						label="Pass"
						@click="test['components'] = 'Components test PASS'"
					/>
				</q-card-actions>
			</q-card>
			<q-card class="card" v-show="activate.desktop">
				<q-card-section>
					<q-card-section> <div class="text-h6">Desktop Information</div> </q-card-section
					><q-separator />
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
					<q-card-section> <div class="text-h6">Note</div> </q-card-section><q-separator />
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
					<q-card-section> <div class="text-h6">Information</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="row col center">
					<ColorSelect
						class="col-6"
						:partsurfer="partsurfer"
						@color-selected="handleColorSelected"
						@form-generated="resetForm"
						:brand="device.brand"
					/>
					<q-checkbox
						size="xl"
						class="col-6"
						v-model="test.touchScreen"
						true-value="YES"
						false-value="NO"
						label="Touch Me"
					/>
				</q-card-section>
				<q-separator />
				<q-card-section class="center">
					<div v-show="this.myDb.TYPE != 'BTO'">
						<q-checkbox
							size="xl"
							v-model="test.WWAN"
							true-value="YES"
							false-value="NO"
							label="WWAN"
						/>
						<q-checkbox
							size="xl"
							v-model="test.WLAN"
							true-value="YES"
							false-value="NO"
							label="WLAN"
						/>
						<q-checkbox
							size="xl"
							v-model="componentes.Keyboard.Privacy"
							true-value="YES"
							false-value="NO"
							label="Privacy"
						/>
						<q-checkbox
							size="xl"
							v-model="test.NFC"
							true-value="YES"
							false-value="NO"
							label="NFC"
						/>
						<q-checkbox
							size="xl"
							v-model="test.SmartCard"
							true-value="YES"
							false-value="NO"
							label="Smart Card"
						/>
						<q-checkbox
							size="xl"
							v-model="componentes.Keyboard.Backlight"
							true-value="YES"
							false-value="NO"
							label="Backlight"
						/>
						<q-checkbox
							size="xl"
							v-model="componentes.Keyboard.RGB"
							true-value="YES"
							false-value="NO"
							label="RGB Keyboard"
						/>
						<q-checkbox
							size="xl"
							v-model="test.Fingerprint"
							true-value="YES"
							false-value="NO"
							label="Fingerprint"
						/>
					</div>
				</q-card-section>
				<q-card-section>
					<q-card-section> <div class="text-h6">HotKey</div> </q-card-section><q-separator />
				</q-card-section>
				<q-card-section class="center">
					<b>You need to test the Hotkeys</b>
					<div class="q-gutter-sm row col-6">
						<q-checkbox size="xl" v-model="hotKey.mic" val="80px" label="Mic" />
						<q-checkbox size="xl" v-model="hotKey.speakers" val="80x" label="Speakers" />
						<q-checkbox size="xl" v-model="hotKey.brights" val="80px" label="Brightness" />
						<q-checkbox
							size="150px"
							v-model="hotKey.privacy"
							val="80px"
							label="Privacy"
							v-if="componentes.Keyboard.Privacy == 'YES'"
						/>
						<!-- <q-checkbox
							size="150px"
							v-model="componentes.Keyboard.Privacy"
							val="80px"
							label="Privacy"
							v-if="componentes.Keyboard.Privacy == 'YES'"
						/> -->
					</div>
					<!-- <q-checkbox left-label v-model="hotkey.speakers" label="Speackers" /> -->
				</q-card-section>
				<q-card-section>
					<div class="row items-center no-wrap">
						<div class="col">
							<div class="text-h6">Drivers Test</div>
						</div>
						<div class="col-auto">
							<q-btn
								round
								color="primary"
								icon="restart_alt"
								@click="$cmd.executeScriptCode(drivers)"
							/>
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
					<q-card-section> <div class="text-h6">GPU Test</div> </q-card-section><q-separator />
				</q-card-section>
				<pre>{{ myGpu }}</pre>
				<q-card-section class="center" v-if="myGpu.length">
					<q-checkbox
						size="150px"
						v-model="noGPU"
						val="80px"
						label="No GPU"
						v-if="type == 'desktop'"
					/>
					<q-table
						class="card"
						title="List"
						:data="intDev.video"
						dense
						:columns="columns"
						row-key="name"
						binary-state-sort
					>
						<template v-slot:body="props">
							<q-tr :props="props">
								<q-td key="Description" :props="props">{{ props.row.Description }}</q-td>
								<q-td key="AdapterRAM" :props="props">
									{{ props.row.AdapterRAM }}
									<q-popup-edit
										class="card"
										v-model="props.row.AdapterRAM"
										title="Update RAM"
										buttons
										persistent
										v-slot="scope"
										v-if="type == 'DESKTOP'"
									>
										<q-input
											type="text"
											v-model="scope.value"
											dense
											autofocus
											hint="Use buttons to close"
										/>
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
					<q-card-section
						class="row col justify-center"
						ref="actionDone"
						id="actionDone"
						style="justify-content: center"
					>
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
					<q-card-section> <div class="text-h6">Storage</div> </q-card-section><q-separator />
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
									<!-- <q-item-label caption>{{ disk.totalSpace }}</q-item-label> -->
									<q-item-label caption>{{ disk.description }}</q-item-label>
								</q-item-section>

								<!--
        <q-item-section>
          <q-item-label>{{ disk.name }}</q-item-label>
          <q-item-label caption>{{ disk.freeSpace }} free of {{ disk.totalSpace }}</q-item-label>
          <q-linear-progress :value="calculatePercentage(disk.free, disk.total)" color="primary" rounded />
        </q-item-section>
        -->

								<!-- <q-item-section side>
									<q-btn flat icon="delete" color="negative" @click="formatDisk(disk.device)" />
								</q-item-section> -->
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
			<!--
			<q-dialog v-model="winChange" class="login-card" persistent>
				<q-card class="bg-white text-dark q-pa-md" style="max-width: 400px">
					<q-card-section class="text-center">
						<q-icon name="error" color="negative" size="40px" />
						<div class="text-h6 q-mt-md">Failed to change the DPK</div>
						<p>Please click retry or call your supervisor</p>
					</q-card-section>

					<q-card-actions align="center">
						<q-btn color="negative" label="Retry" @click="retryAction" />
					</q-card-actions>
				</q-card>
			</q-dialog>
      -->
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
		windows,
		intenalDevices,
		GetMntBringhtness,
		imaging,
		spotLights,
		components,
		aWin,
		sWin,
		dWin,
		Sysprep,
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
				check: {},
				Authorization: '',
				itDG: {},
				activate: {
					type: true,
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
				return (
					this.device.Serial === `${this.miniSerial}${this.check.serial}` &&
					this.device.SKU === `${this.miniSKU}${this.check.sku}`
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
				let info = await this.$db
					.collection('typeBrands')
					.conditions({ brand: this.infoSystem.system.manufacturer.split(' ')[0].toUpperCase() })
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
						.update({ Serial: this.device.Serial, ...this.infoSystem, ...this.si })
				else
					await this.$db
						.doc('systemInformation')
						.add({ Serial: this.device.Serial, ...this.infoSystem, ...this.si })
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
			async verifyDPK() {
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
						})
						.onOk(async () => {
							await this.verifyDPK()
						})
						.onCancel(() => {
							// console.log('Cancel')
						})
						.onDismiss(() => {
							// console.log('I am triggered on both OK and Cancel')
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
		       CTL Windows Test - ${this.$env.version} - ${this.select.TenantName}
		       Operator ID: ${this.select.operator}
		       Operator Name:${this.select.user}
		       Start Date: ${this.test.Date}
		       Start Time: ${this.test.startTime}
		       End Date: ${lastdate.date}
		       End Time: ${lastdate.time}
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
		       Hard Drive: ${this.intDev.HDD.Total}
		       ${this.disks.map((disk) => disk.specs).join('\n')}
		       Memory RAM: ${this.intDev.RAM.Total} - ${this.form.lightRAM ? 'With RBG' : ''}
		       ${this.intDev.RAM.Modules.join('\n')}
		       GPU Verification PASS
		       ${
							this.type == 'desktop' && this.noGPU
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
		       ${this.test.display}
		       ${this.type == 'laptop' ? this.test.battery : ''}
		       ${this.type == 'laptop' ? this.test.keyboard : ''}
		       ${this.type == 'laptop' ? this.test.mic : ''}
		       ${this.type == 'laptop' ? this.test.hotKey : ''}
		       ${this.type == 'laptop' ? this.test.mousepad : ''}
		       ${
							this.type == 'laptop' && this.hotKey.mic
								? 'Mic hotkey: It works'
								: 'Mic hotkey: Does not work'
						}
		       ${
							this.type == 'laptop' && this.hotKey.speakers
								? 'Speackers hotkey: It works'
								: 'Speackers hotkey: Does not work'
						}
		       ${
							this.type == 'laptop' && this.hotKey.brights
								? 'Brightness hotkey: It works'
								: 'Brightness hotkey: Does not work'
						}
		       ${
							this.type == 'laptop' && this.hotKey.privacy
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
					this.bios && this.bios.components.Privacy ? this.bios.components.Privacy : data.Privacy
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

				if (!this.device.SKU) {
					this.test['SKU'] = `SKU ID Check FAIL`
					this.showNotification('No Found', 'The SKU number no found in the device.')
				}
				if (!this.device.Serial) {
					this.test['Serial'] = `SN ID Check FAIL`
					this.showNotification('No Found', 'The Serial number no found in the device.')
				}
				this.info = { ...this.info, ...this.device }
				this.miniSerial = this.device.Serial.slice(0, -2)
				this.miniSKU = this.device.SKU.includes('#')
					? this.device.SKU.split('#')[0].slice(0, -2)
					: this.device.SKU.slice(0, -4)
				this.myDb.Serial = this.device.Serial
				this.myDb.Model = this.device.SKU
				let projectInfo = await this.getProjectInfo(this.device.Serial)
				if (!projectInfo) {
					this.$q.loading.hide()
					this.winChange = true
					this.showNotification('No Found', 'The Serial number no found in the system.')
					return
				}
				await this.checkDevice()
				this.setTypeUnit()
				if (this.device.brand == 'HP') {
					this.bios = JSON.parse(JSON.stringify(await this.$cmd.biosData()))
					console.log('BIOS: ', this.bios.components)
					await this.infoHP()
				}
				//if (this.device.brand == 'HP')
				if (projectInfo.ArrivedSKU !== this.device.SKU && this.device.brand == 'HP') {
					this.$q.loading.hide()
					this.showNotification(
						'No Math',
						`SKUs are not the same, Device: ${this.device.SKU} <> System: ${projectInfo.ArrivedSKU}`,
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
				this.activate.type = true
				await this.espera2('actionType')
				this.activate.type = false
				//if (this.device.brand == 'HP') await this.simpleTest('Comparation')
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
					this.device.brand == 'HP' ? this.partsurfer.Display.TouchScreen : 'NO'
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
				/* if (this.intDev.video.length) {
						await this.testGPU()
					} */
				//Drivers
				/* await this.$cmd.executeScriptCode(`Start-Process "devmgmt.msc"`)
				this.activate.drivers = true
				await this.espera('actionDrivers')
				this.test['drivers'] =
					this.driver.status == 'PASS'
						? 'Device Manager Drivers Test PASS'
						: 'Device Manager Drivers Test FAIL'
				this.test['display'] = this.driver.video
					? 'Display Adapter Drivers Test PASS'
					: 'Display Adapter Drivers Test FAIL'
				this.activate.drivers = false */

				if (this.type == 'laptop') {
					await this.testLaptopSpecifics()
				}

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

				this.win = { ...(await this.win), actived: false }
				localStorage.setItem('dpk', this.win.keyWindows)
				await this.testWindows()
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

				await this.$db.funcAdmin('modules/bypass/createModel', this.componentes).then(async (v) => {
					this.myDb['CODE'] = v.Code
					this.myDb.Description = v.Description
					this.myDb['InternalDescription'] = this.device.Description
					this.test.color = v.Color
					this.myDb['COLOR'] = v.Color
				})
				this.txt = await this.report()
				this.file = await this.$uploadTextFile(this.device.Serial, this.txt)
				if (this.file) await this.saveFile(this.file)
				if (this.image && this.type != 'desktop') await this.saveFile(this.image)

				this.info = { ...this.info, report: this.txt }
				await this.rsSave()
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
				let infoUnit = await this.$db.funcAdmin('modules/ispt/validateUnit', { Serial })
				this.project = {
					Station: infoUnit[0].StationTypeID,
					TenantId: infoUnit[0].TenantId,
					id: infoUnit[0].ProjectName,
					db: infoUnit[0].DB,
					operator: infoToken.id,
				}
				this.select = { ...infoToken, ...infoUnit[0], ...this.project }
				console.log('Select: ', this.select)
				return infoUnit[0]
			},
			async getProjectInfoOld(serial) {
				let res = ''
				for (let x of this.$env.project) {
					let u = await this.$rsNeDB('credenciales').findOne({ tenant: x.id })

					const options = {
						method: 'POST',
						headers: {
							tenant: `${this.select.TenantName}`,
							Authorization: `Bearer ${this.select.authToken}`,
						},
					}
					let status = await this.$db
						.funcAdmin('modules/ispt/statusStation', {
							options,
							Serial: this.test.Serial,
							Project: this.select.TenantName,
							System: this.$env.project.url,
						})
						.then((v) => {
							return v
						})
						.catch((err) => {
							console.error(err)
							return err
						})
					res = await this.$rsDB(x.db)
						.select('SerialNumber, ArrivedSKU, StationID, SKU, TenantId')
						.from('WorkTracking')
						.where(`SerialNumber = '${serial}'`)
						.execute()
					if (res.length) {
						this.project = {
							...this.project,
							Station: res[0].StationID,
							TenantId: res[0].TenantId,
							id: x.id,
							db: x.db,
							operator: u.id,
							user: u.user,
						}
						this.select = { ...x, ...u }
						//console.log('Select: ', this.select)
						return res[0]
					}
				}
				return null
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

				const itemsNotSet = itemsToCheck.filter((item) => {
					if (this.bios[item] !== null) {
						if (['LockWireless', 'LockBIOS'].includes(item)) {
							return this.bios[item] === 'YES'
						} else {
							return this.bios[item] === 'NO'
						}
					}
					return false
				})
				if (itemsNotSet.length > 0) {
					this.activate.components = true
					await this.espera('actionComponents')
					this.$q.dialog({
						title: 'BIOS Settings',
						message: `The following BIOS settings need to be adjusted:\n\n${itemsNotSet.join(
							', ',
						)}`,
						persistent: true,
						color: 'red',
						ok: {
							label: 'Restart',
							handler: () => {
								this.$cmd.executeScriptCode(`shutdown -s -t 2`)
							},
						},
					})
				} else {
					this.test['components'] = 'Components test PASS'
				}
			},
			async testLaptopSpecifics() {
				//this.activate.battery = true
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
				/* await this.espera('actionBattery')
					this.activate.battery = false */
				this.activate.mousepad = true
				await this.espera('actionMousePad')
				this.activate.mousepad = false
				if (this.device.brand == 'HP') {
					await this.checkBiosItems()
					this.activate.components = false
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
					//HotKey
					/* this.activate.hotKey = true
					await this.espera('actionHotKey')
					this.activate.hotKey = false */
					await this.simpleTest('Keyboard')
				}
				this.test['spotLights'] =
					(await this.$cmd.executeScriptCode(spotLights)).result == 'PASS'
						? 'Spot Lights Test PASS'
						: 'Spot Lights Test FAIL'
				//this.test['touchScreen'] = (await this.$cmd.executeScriptCode(touchScreen)).result
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
			async testWindows() {
				//this.win.actived = false
				this.$q.loading.show({
					message:
						'Obtaining <b>DPK</b> status.<br/><span class="text-orange text-weight-bold">Hang on...</span>',
				})
				this.activate.windows = true
				//await this.$cmd.executeScriptCode(`Start-Process "ms-settings:activation"`)
				this.$q.loading.hide()
				console.log(this.win, this.infoTest.ProductKeys)
				if (this.infoTest.DPK) {
					let nDPK = this.win.hasOwnProperty('fail') ? this.win.fail : await this.verifyDPK()
					if (nDPK.error) {
						setTimeout(() => {
							this.$q.notify({
								type: 'negative',
								message: nDPK.errorMessage,
							})
						}, 30000)
					} else if (nDPK.needsNewProductKey) {
						this.$q.loading.show({
							message:
								'Deactivating the active <b>DPK</b><br/><span class="text-orange text-weight-bold">Hang on...</span>',
						})
						await this.$cmd.executeScriptCode(dWin)
						let ndpk = aWin
							.replace('$dpk', nDPK.replacementProductKey)
							.replace('$mode', this.infoTest.DPKMode)

						this.$q.loading.hide()
						this.$q.loading.show({
							message:
								'Activating <b>Windows</b><br/><span class="text-orange text-weight-bold">Hang on...</span>',
						})
						let iny = await this.$cmd.executeScriptCode(ndpk)
						this.$q.loading.hide()
						if (iny.error) {
							console.log(iny.message)
							this.$q
								.dialog({
									title: 'Alert<em>!</em>',
									message: `<em>The following DPK </em> <span class="text-red">${nDPK.replacementProductKey}</span> <strong> is invalid</strong>`,
									html: true,
								})
								.onOk(async () => {
									this.$q.loading.show()
									let ndpk = aWin
										.replace(
											'$dpk',
											this.win.keyWindows != 'No license found'
												? this.win.keyWindows
												: localStorage.getItem('dpk'),
										)
										.replace('$mode', this.infoTest.DPKMode)
									await this.$cmd.executeScriptCode(ndpk)
									this.$q.loading.hide()
									this.testWindows()
									this.win.actived = true

									if (this.infoTest.DPKRetry) {
										this.win.fail = await this.failDPK()
									}
								})
						} else {
							this.win.actived = true
							this.$q.notify({
								type: 'positive',
								message: iny.message,
							})
							this.win.oldKeyWin = this.win.keyWindows
							this.win.keyWindows = iny.productKeyUsed
							this.win.licenseDetails = iny.message
							let sDPK = await this.statusDPK()
							console.log('sDPK: ', sDPK)
						}
					}
				}
				this.win.actived = true
				await this.$cmd.executeScriptCode(`Start-Process "ms-settings:activation"`)
				await this.espera('actionWindows')
				this.info = { ...this.info, ...this.win }
				this.activate.windows = false
				this.test['windows'] =
					this.action == 'PASS' && this.win.activate
						? 'Windows Activation Test PASS'
						: 'Windows Activation Test FAIL'
				this.test['OS'] = this.win.edition
				this.myDb.OS = this.win.edition
				this.test['keyWindows'] = this.win.keyWindows
				this.test['oldKeyWin'] = this.win.oldKeyWin
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
				if (this.myGpu.length) {
					this.activate.gpu = true
					const dedicatedGPUs = this.intDev.video.filter((v) => v.Type === 'Dedicated')
					const integratedGPUs = this.intDev.video.filter((v) => v.Type === 'Integrated')

					// Procesar GPUs dedicadas
					if (dedicatedGPUs.some((obj) => obj.AdapterRAM.includes('4'))) {
						this.myGpu = await this.myGpu

						this.intDev.video = this.intDev.video.map((objA) => {
							const matchB = this.myGpu.find((objB) => objB.Description === objA.Description)
							return matchB ? { ...objA, AdapterRAM: matchB.AdapterRAM } : objA
						})
					} else {
						this.myGpu = dedicatedGPUs
					}

					// Asignar valores para GPUs dedicadas
					const dedicatedGPUInfoArray = await this.GPUInfo(this.myGpu)
					if (dedicatedGPUInfoArray.GPU != null) {
						this.myDb.GPU = dedicatedGPUInfoArray.GPU
						this.myDb.GPU_RAM = dedicatedGPUInfoArray.RAM_GPU
					} else {
						this.myDb.GPU = ''
						this.myDb.GPU_RAM = ''
					}
					// Procesar GPUs integradas
					const integratedGPUInfo = await this.IntegratedGPUInfo(integratedGPUs)
					this.GPUIntegrated = integratedGPUInfo || ''

					await this.espera('actionGPU')
					if (this.type == 'desktop' && this.noGPU) {
						this.myDb.GPU = ''
						this.myDb.GPU_RAM = ''
					}
					this.activate.gpu = false
				}
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
						TouchScreen: this.test.touchScreen,
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
				let options = { method: 'GET' }
				return fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/Chicago', options)
					.then((response) => response.json())
					.then((r) => {
						let comp = new Date(r.dateTime)
						let fechaInicialMoment = moment(r.dateTime)
						let minutosAleatorios1 = Math.floor(Math.random() * 10) + 1
						let fecha1 = fechaInicialMoment.clone().subtract(minutosAleatorios1, 'minutes')
						let minutosAleatorios2 = Math.floor(Math.random() * 11) + 25
						let fecha2 = fecha1.clone().subtract(minutosAleatorios2, 'minutes')
						let fechaFormateadaInicial = fechaInicialMoment.format('YYYY-MM-DD HH:mm:ss.SSS')
						let fechaFormateada1 = fecha1.format('YYYY-MM-DD HH:mm:ss.SSS')
						let fechaFormateada2 = fecha2.format('YYYY-MM-DD HH:mm:ss.SSS')

						return {
							date: r.date, // Formato "MM/DD/YYYY"
							time: r.time, // Formato "HH:mm"
							complete: comp, // Objeto Date
							start: fechaFormateada1, // Fecha restada con minutos aleatorios
							end: fechaFormateada2, // Otra fecha restada
							wipe: fechaFormateadaInicial, // Fecha original en el formato deseado
						}
					})
					.catch((err) => console.error(err))
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
					console.log('cardActions: ', cardActions)

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
		},
		async beforeCreate() {
			try {
				this.user = await this.$rsNeDB('credenciales').findOne({})
				this.si = this.$si()
			} catch (error) {
				console.error('Error during beforeCreate:', error)
			}
		},
		async mounted() {
			this.$q.loading.show({
				message:
					'Some important <b>process</b> is in progress.<br/><span class="text-orange text-weight-bold">Hang on...</span>',
			})
			console.log('Begin System Information...')
			this.win = this.$cmd.executeScriptCode(sWin)
			if (!localStorage.getItem('infoSystem')) {
				let [is, it, id, cp, dt, dr] = await Promise.all([
					this.$system(),
					this.$cmd.executeScriptCode(imaging),
					this.$cmd.executeScriptCode(intenalDevices),
					this.$cmd.executeScriptCode(components),
					this.DateTime(),
					this.$cmd.executeScriptCode(drivers),
				])
				console.log('End System Information...')
				this.infoSystem = is
				this.iTest = it
				this.intDev = id
				this.componentes = cp
				this.datetime = dt
				this.driver = dr
				localStorage.setItem('infoSystem', JSON.stringify(this.infoSystem))
				localStorage.setItem('iTest', JSON.stringify(this.iTest))
				localStorage.setItem('intDev', JSON.stringify(this.intDev))
				localStorage.setItem('componentes', JSON.stringify(this.componentes))
				localStorage.setItem('datetime', JSON.stringify(this.datetime))
				localStorage.setItem('driver', JSON.stringify(this.driver))
			} else {
				this.infoSystem = JSON.parse(localStorage.getItem('infoSystem'))
				this.iTest = JSON.parse(localStorage.getItem('iTest'))
				this.intDev = JSON.parse(localStorage.getItem('intDev'))
				this.componentes = JSON.parse(localStorage.getItem('componentes'))
				this.datetime = JSON.parse(localStorage.getItem('datetime'))
				this.driver = JSON.parse(localStorage.getItem('driver'))
			}
			if (
				this.intDev.video
					.filter((v) => v.Type === 'Dedicated')
					.some((obj) => obj.AdapterRAM.includes('4'))
			)
				this.myGpu = this.$cmd.getDx({ Serial: this.infoSystem.system.serial })
			console.log('Drivers: ', this.driver)
			this.$q.loading.hide()
			this.validation()
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
