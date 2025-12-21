module.exports = function (self) {
	self.setActionDefinitions({
		start_timer: {
			name: 'Start Timer',
			options: [],
			callback: async () => {
				try {
					await self.sendCommand('/api/timer/start')
				} catch (err) {
					self.log('error', `Start timer failed: ${err.message}`)
				}
			},
		},
		pause_timer: {
			name: 'Pause Timer',
			options: [],
			callback: async () => {
				try {
					await self.sendCommand('/api/timer/pause')
				} catch (err) {
					self.log('error', `Pause timer failed: ${err.message}`)
				}
			},
		},
		reset_timer: {
			name: 'Reset Timer',
			options: [],
			callback: async () => {
				try {
					await self.sendCommand('/api/timer/reset')
				} catch (err) {
					self.log('error', `Reset timer failed: ${err.message}`)
				}
			},
		},
		set_timer: {
			name: 'Set Timer',
			options: [
				{
					id: 'hours',
					type: 'textinput',
					label: 'Hours',
					default: '0',
					useVariables: true,
				},
				{
					id: 'minutes',
					type: 'textinput',
					label: 'Minutes',
					default: '5',
					useVariables: true,
				},
				{
					id: 'seconds',
					type: 'textinput',
					label: 'Seconds',
					default: '0',
					useVariables: true,
				},
				{
					id: 'keepRunning',
					type: 'checkbox',
					label: 'Keep Running',
					default: false,
				},
			],
			callback: async (event) => {
				try {
					const hours = parseInt(await self.parseVariablesInString(String(event.options.hours))) || 0
					const minutes = parseInt(await self.parseVariablesInString(String(event.options.minutes))) || 0
					const seconds = parseInt(await self.parseVariablesInString(String(event.options.seconds))) || 0

					const totalSeconds = hours * 3600 + minutes * 60 + seconds

					await self.sendCommand('/api/timer/set', {
						seconds: totalSeconds,
						keepRunning: event.options.keepRunning,
					})
				} catch (err) {
					self.log('error', `Set timer failed: ${err.message}`)
				}
			},
		},
		adjust_timer: {
			name: 'Adjust Timer',
			options: [
				{
					id: 'seconds',
					type: 'textinput',
					label: 'Seconds (positive to add, negative to subtract)',
					default: '30',
					useVariables: true,
				},
			],
			callback: async (event) => {
				try {
					const seconds = parseInt(await self.parseVariablesInString(String(event.options.seconds))) || 0

					await self.sendCommand('/api/timer/adjust', {
						seconds: seconds,
					})
				} catch (err) {
					self.log('error', `Adjust timer failed: ${err.message}`)
				}
			},
		},
		toggle_timer: {
			name: 'Toggle Timer (Start/Pause)',
			options: [],
			callback: async () => {
				try {
					if (self.timerState.isRunning && !self.timerState.isPaused) {
						await self.sendCommand('/api/timer/pause')
					} else {
						await self.sendCommand('/api/timer/start')
					}
				} catch (err) {
					self.log('error', `Toggle timer failed: ${err.message}`)
				}
			},
		},
		update_settings: {
			name: 'Update Settings',
			options: [
				{
					id: 'showHours',
					type: 'checkbox',
					label: 'Show Hours',
					default: true,
				},
				{
					id: 'showMinutes',
					type: 'checkbox',
					label: 'Show Minutes',
					default: true,
				},
				{
					id: 'showSeconds',
					type: 'checkbox',
					label: 'Show Seconds',
					default: true,
				},
				{
					id: 'showMilliseconds',
					type: 'checkbox',
					label: 'Show Milliseconds',
					default: false,
				},
				{
					id: 'countUpAfterZero',
					type: 'checkbox',
					label: 'Count Up After Zero',
					default: false,
				},
			],
			callback: async (event) => {
				try {
					await self.sendCommand('/api/settings', {
						showHours: event.options.showHours,
						showMinutes: event.options.showMinutes,
						showSeconds: event.options.showSeconds,
						showMilliseconds: event.options.showMilliseconds,
						countUpAfterZero: event.options.countUpAfterZero,
					})
				} catch (err) {
					self.log('error', `Update settings failed: ${err.message}`)
				}
			},
		},
		toggle_timer_visibility: {
			name: 'Toggle Timer Visibility',
			options: [],
			callback: async () => {
				try {
					await self.sendCommand('/api/settings', {
						showTimer: !self.settings.showTimer,
					})
				} catch (err) {
					self.log('error', `Toggle timer visibility failed: ${err.message}`)
				}
			},
		},
		toggle_time_of_day: {
			name: 'Toggle Time of Day',
			options: [],
			callback: async () => {
				try {
					await self.sendCommand('/api/settings', {
						showTimeOfDay: !self.settings.showTimeOfDay,
					})
				} catch (err) {
					self.log('error', `Toggle time of day failed: ${err.message}`)
				}
			},
		},
		set_timer_font_size: {
			name: 'Set Timer Font Size',
			options: [
				{
					id: 'fontSize',
					type: 'textinput',
					label: 'Font Size (%)',
					default: '100',
					useVariables: true,
				},
			],
			callback: async (event) => {
				try {
					const fontSize = parseInt(await self.parseVariablesInString(String(event.options.fontSize))) || 100

					await self.sendCommand('/api/settings', {
						timerFontSize: fontSize,
					})
				} catch (err) {
					self.log('error', `Set timer font size failed: ${err.message}`)
				}
			},
		},
		set_time_of_day_font_size: {
			name: 'Set Time of Day Font Size',
			options: [
				{
					id: 'fontSize',
					type: 'textinput',
					label: 'Font Size (%)',
					default: '100',
					useVariables: true,
				},
			],
			callback: async (event) => {
				try {
					const fontSize = parseInt(await self.parseVariablesInString(String(event.options.fontSize))) || 100

					await self.sendCommand('/api/settings', {
						timeOfDayFontSize: fontSize,
					})
				} catch (err) {
					self.log('error', `Set time of day font size failed: ${err.message}`)
				}
			},
		},
		set_timer_font: {
			name: 'Set Timer Font',
			options: [
				{
					id: 'font',
					type: 'dropdown',
					label: 'Font Family',
					default: 'Roboto Mono',
					choices: [
						{ id: 'Roboto Mono', label: 'Roboto Mono' },
						{ id: 'Kode Mono', label: 'Kode Mono' },
						{ id: 'PT Mono', label: 'PT Mono' },
						{ id: 'Share Tech Mono', label: 'Share Tech Mono' },
						{ id: 'Courier Prime', label: 'Courier Prime' },
					],
				},
			],
			callback: async (event) => {
				try {
					await self.sendCommand('/api/settings', {
						timerFont: event.options.font,
					})
				} catch (err) {
					self.log('error', `Set timer font failed: ${err.message}`)
				}
			},
		},
		set_timer_colors: {
			name: 'Set Timer Colors',
			options: [
				{
					id: 'colorNormal',
					type: 'textinput',
					label: 'Normal Color (hex)',
					default: '#44ff44',
					useVariables: true,
				},
				{
					id: 'colorWarning',
					type: 'textinput',
					label: 'Warning Color (hex)',
					default: '#ffaa00',
					useVariables: true,
				},
				{
					id: 'colorCritical',
					type: 'textinput',
					label: 'Critical Color (hex)',
					default: '#ff4444',
					useVariables: true,
				},
			],
			callback: async (event) => {
				try {
					const colorNormal = await self.parseVariablesInString(event.options.colorNormal)
					const colorWarning = await self.parseVariablesInString(event.options.colorWarning)
					const colorCritical = await self.parseVariablesInString(event.options.colorCritical)

					await self.sendCommand('/api/settings', {
						colorNormal: colorNormal,
						colorWarning: colorWarning,
						colorCritical: colorCritical,
					})
				} catch (err) {
					self.log('error', `Set timer colors failed: ${err.message}`)
				}
			},
		},
		set_color_thresholds: {
			name: 'Set Color Thresholds',
			options: [
				{
					id: 'thresholdNormal',
					type: 'textinput',
					label: 'Normal Threshold (seconds)',
					default: '300',
					useVariables: true,
				},
				{
					id: 'thresholdWarning',
					type: 'textinput',
					label: 'Warning Threshold (seconds)',
					default: '60',
					useVariables: true,
				},
				{
					id: 'thresholdCritical',
					type: 'textinput',
					label: 'Critical Threshold (seconds)',
					default: '0',
					useVariables: true,
				},
			],
			callback: async (event) => {
				try {
					const thresholdNormal = parseInt(await self.parseVariablesInString(String(event.options.thresholdNormal))) || 300
					const thresholdWarning = parseInt(await self.parseVariablesInString(String(event.options.thresholdWarning))) || 60
					const thresholdCritical = parseInt(await self.parseVariablesInString(String(event.options.thresholdCritical))) || 0

					await self.sendCommand('/api/settings', {
						thresholdNormal: thresholdNormal,
						thresholdWarning: thresholdWarning,
						thresholdCritical: thresholdCritical,
					})
				} catch (err) {
					self.log('error', `Set color thresholds failed: ${err.message}`)
				}
			},
		},
		set_time_of_day_color: {
			name: 'Set Time of Day Color',
			options: [
				{
					id: 'color',
					type: 'textinput',
					label: 'Color (hex)',
					default: '#ffffff',
					useVariables: true,
				},
			],
			callback: async (event) => {
				try {
					const color = await self.parseVariablesInString(event.options.color)

					await self.sendCommand('/api/settings', {
						timeOfDayColor: color,
					})
				} catch (err) {
					self.log('error', `Set time of day color failed: ${err.message}`)
				}
			},
		},
	})
}
