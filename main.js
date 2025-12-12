const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const WebSocket = require('ws')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.timerState = {
			timeRemaining: 0,
			isRunning: false,
			isPaused: false,
			lastSetTime: 0,
			endTime: null,
			pausedTimeRemaining: 0,
			startTime: null,
			initialTimeRemaining: 0,
			serverTime: 0,
		}

		this.settings = {
			showHours: true,
			showMinutes: true,
			showSeconds: true,
			showMilliseconds: false,
			colorNormal: '#44ff44',
			colorWarning: '#ffaa00',
			colorCritical: '#ff4444',
			countUpAfterZero: false,
			showTimeOfDay: true,
		}
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		this.initWebSocket()
		this.pollTimer()
	}

	async destroy() {
		this.log('debug', 'destroy')
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
		}
		if (this.pollInterval) {
			clearInterval(this.pollInterval)
		}
	}

	async configUpdated(config) {
		this.config = config
		if (this.ws) {
			this.ws.close()
		}
		this.initWebSocket()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Capacitimer Host',
				width: 8,
				default: 'localhost',
			},
			{
				type: 'number',
				id: 'httpPort',
				label: 'HTTP Port',
				width: 4,
				default: 80,
				min: 1,
				max: 65535,
			},
			{
				type: 'number',
				id: 'wsPort',
				label: 'WebSocket Port',
				width: 4,
				default: 3001,
				min: 1,
				max: 65535,
			},
		]
	}

	initWebSocket() {
		const host = this.config.host || 'localhost'
		const wsPort = this.config.wsPort || 3001

		try {
			this.ws = new WebSocket(`ws://${host}:${wsPort}`)

			this.ws.on('open', () => {
				this.log('info', 'WebSocket connected')
				this.updateStatus(InstanceStatus.Ok)
			})

			this.ws.on('message', (data) => {
				try {
					const message = JSON.parse(data)

					if (message.type === 'timer-update') {
						this.timerState = message.data
						this.updateVariables()
						this.checkFeedbacks()
					} else if (message.type === 'settings-update') {
						this.settings = message.data
					}
				} catch (err) {
					this.log('error', `Error parsing WebSocket message: ${err.message}`)
				}
			})

			this.ws.on('error', (err) => {
				this.log('error', `WebSocket error: ${err.message}`)
				this.updateStatus(InstanceStatus.ConnectionFailure)
			})

			this.ws.on('close', () => {
				this.log('warn', 'WebSocket closed')
				this.updateStatus(InstanceStatus.Disconnected)
				this.reconnectTimer = setTimeout(() => {
					this.initWebSocket()
				}, 5000)
			})
		} catch (err) {
			this.log('error', `Failed to create WebSocket: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		}
	}

	pollTimer() {
		// Poll timer state every second as a fallback if WebSocket isn't working
		this.pollInterval = setInterval(() => {
			if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
				this.getTimerState()
			}
		}, 1000)
	}

	async getTimerState() {
		const host = this.config.host || 'localhost'
		const httpPort = this.config.httpPort || 80

		try {
			const response = await fetch(`http://${host}:${httpPort}/api/timer`)
			if (response.ok) {
				const data = await response.json()
				this.timerState = data
				this.updateVariables()
				this.checkFeedbacks()
			}
		} catch (err) {
			this.log('debug', `Failed to fetch timer state: ${err.message}`)
		}
	}

	async sendCommand(endpoint, body = null) {
		const host = this.config.host || 'localhost'
		const httpPort = this.config.httpPort || 80

		try {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			}

			if (body) {
				options.body = JSON.stringify(body)
			}

			const response = await fetch(`http://${host}:${httpPort}${endpoint}`, options)
			const data = await response.json()

			if (data.success) {
				this.log('debug', `Command ${endpoint} executed successfully`)
				if (data.state) {
					this.timerState = data.state
					this.updateVariables()
					this.checkFeedbacks()
				}
			} else {
				this.log('error', `Command ${endpoint} failed`)
			}

			return data
		} catch (err) {
			this.log('error', `Failed to send command ${endpoint}: ${err.message}`)
			throw err
		}
	}

	updateVariables() {
		const formatTime = (seconds) => {
			const isNegative = seconds < 0
			const absSeconds = Math.abs(seconds)
			const hours = Math.floor(absSeconds / 3600)
			const minutes = Math.floor((absSeconds % 3600) / 60)
			const secs = Math.floor(absSeconds % 60)

			let formatted = ''
			if (this.settings.showHours) {
				formatted += `${hours.toString().padStart(2, '0')}:`
			}
			if (this.settings.showMinutes) {
				formatted += `${minutes.toString().padStart(2, '0')}:`
			}
			if (this.settings.showSeconds) {
				formatted += secs.toString().padStart(2, '0')
			}

			return isNegative ? `-${formatted}` : formatted
		}

		this.setVariableValues({
			time_remaining: formatTime(this.timerState.timeRemaining),
			time_remaining_seconds: this.timerState.timeRemaining,
			is_running: this.timerState.isRunning ? 'Yes' : 'No',
			is_paused: this.timerState.isPaused ? 'Yes' : 'No',
			last_set_time: formatTime(this.timerState.lastSetTime),
		})
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
