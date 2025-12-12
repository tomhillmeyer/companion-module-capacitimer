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
					type: 'number',
					label: 'Hours',
					default: 0,
					min: 0,
					max: 23,
				},
				{
					id: 'minutes',
					type: 'number',
					label: 'Minutes',
					default: 5,
					min: 0,
					max: 59,
				},
				{
					id: 'seconds',
					type: 'number',
					label: 'Seconds',
					default: 0,
					min: 0,
					max: 59,
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
					const totalSeconds = event.options.hours * 3600 + event.options.minutes * 60 + event.options.seconds

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
					type: 'number',
					label: 'Seconds (positive to add, negative to subtract)',
					default: 30,
					min: -3600,
					max: 3600,
				},
			],
			callback: async (event) => {
				try {
					await self.sendCommand('/api/timer/adjust', {
						seconds: event.options.seconds,
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
				{
					id: 'showTimeOfDay',
					type: 'checkbox',
					label: 'Show Time of Day',
					default: true,
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
						showTimeOfDay: event.options.showTimeOfDay,
					})
				} catch (err) {
					self.log('error', `Update settings failed: ${err.message}`)
				}
			},
		},
	})
}
