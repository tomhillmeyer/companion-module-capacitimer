const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		timer_running: {
			name: 'Timer Running',
			type: 'boolean',
			label: 'Change button color when timer is running',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.timerState.isRunning && !self.timerState.isPaused
			},
		},
		timer_paused: {
			name: 'Timer Paused',
			type: 'boolean',
			label: 'Change button color when timer is paused',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return self.timerState.isPaused
			},
		},
		timer_stopped: {
			name: 'Timer Stopped',
			type: 'boolean',
			label: 'Change button color when timer is stopped',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return !self.timerState.isRunning && !self.timerState.isPaused
			},
		},
		time_remaining_less_than: {
			name: 'Time Remaining Less Than',
			type: 'boolean',
			label: 'Change button color when time remaining is less than threshold',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'seconds',
					type: 'number',
					label: 'Seconds',
					default: 60,
					min: 0,
					max: 86400,
				},
			],
			callback: (feedback) => {
				return self.timerState.timeRemaining < feedback.options.seconds && self.timerState.timeRemaining > 0
			},
		},
		time_remaining_greater_than: {
			name: 'Time Remaining Greater Than',
			type: 'boolean',
			label: 'Change button color when time remaining is greater than threshold',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'seconds',
					type: 'number',
					label: 'Seconds',
					default: 300,
					min: 0,
					max: 86400,
				},
			],
			callback: (feedback) => {
				return self.timerState.timeRemaining > feedback.options.seconds
			},
		},
		timer_negative: {
			name: 'Timer Negative (Count Up)',
			type: 'boolean',
			label: 'Change button color when timer is counting up past zero',
			defaultStyle: {
				bgcolor: combineRgb(204, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.timerState.timeRemaining < 0
			},
		},
	})
}
