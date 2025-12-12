const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const WebSocket = require('ws')
const { Bonjour } = require('bonjour-service')

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

		this.discoveredInstances = []
		this.bonjour = null
		this.bonjourBrowser = null
	}

	async init(config) {
		this.config = config

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		this.startBonjourDiscovery()

		// Only connect if a host is configured
		const host = this.config.host || this.config.discovered
		if (host) {
			this.updateStatus(InstanceStatus.Connecting)
			this.initWebSocket()
			this.pollTimer()
		} else {
			this.updateStatus(InstanceStatus.Disconnected, 'No Capacitimer instance selected')
		}
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
		this.stopBonjourDiscovery()
	}

	async configUpdated(config) {
		this.config = config
		if (this.ws) {
			this.ws.close()
		}

		// Only connect if a host is configured
		const host = this.config.host || this.config.discovered
		if (host) {
			this.updateStatus(InstanceStatus.Connecting)
			this.initWebSocket()
		} else {
			this.updateStatus(InstanceStatus.Disconnected, 'No Capacitimer instance selected')
		}
	}

	getConfigFields() {
		return [
			{
				type: 'dropdown',
				id: 'discovered',
				label: 'Discovered Capacitimers',
				width: 12,
				default: '',
				choices: [
					{ id: '', label: ' ' },
					...this.discoveredInstances.map((instance) => ({
						id: instance.host,
						label: instance.host,
					})),
				],
				tooltip: 'Select a discovered Capacitimer instance from the network',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Manual IP Address (optional)',
				width: 12,
				default: '',
				tooltip: 'Manually enter hostname or IP address',
			},
		]
	}

	startBonjourDiscovery() {
		try {
			this.bonjour = new Bonjour()
			this.bonjourBrowser = this.bonjour.find({ type: 'http' })

			this.bonjourBrowser.on('up', (service) => {
				// Only track Capacitimer services
				if (service.name && service.name.toLowerCase().startsWith('capacitimer')) {
					// Try multiple ways to get the IP address
					let host = null

					// Try to get IP from addresses array first
					if (service.addresses && service.addresses.length > 0) {
						// Prefer IPv4 addresses
						host = service.addresses.find((addr) => addr.includes('.')) || service.addresses[0]
					}

					// Fallback to other properties
					if (!host) {
						host = service.referer?.address || service.host || service.fqdn
					}

					// Extract hostname from FQDN (e.g., "toms-macbook-pro.local" -> "toms-macbook-pro")
					let hostname = null
					if (service.fqdn && service.fqdn !== host) {
						hostname = service.fqdn.replace('.local', '')
					} else if (service.host && service.host !== host) {
						hostname = service.host.replace('.local', '')
					}

					this.log(
						'debug',
						`Bonjour service found: ${service.name}, fqdn: ${service.fqdn}, host: ${service.host}, addresses: ${JSON.stringify(service.addresses)}, resolved: ${host}`
					)

					// Check if we already have this instance
					const existingIndex = this.discoveredInstances.findIndex((i) => i.host === host)

					if (existingIndex === -1 && host) {
						this.discoveredInstances.push({
							name: service.name,
							host: host,
							hostname: hostname,
							port: service.port,
							fqdn: service.fqdn,
						})
						this.log('info', `Discovered Capacitimer instance: ${hostname || service.name} at ${host}`)

						// Refresh config fields to show new instance
						this.saveConfig(this.config)
					}
				}
			})

			this.bonjourBrowser.on('down', (service) => {
				if (service.name && service.name.toLowerCase().startsWith('capacitimer')) {
					// Try multiple ways to get the IP address (same logic as 'up')
					let host = null

					if (service.addresses && service.addresses.length > 0) {
						host = service.addresses.find((addr) => addr.includes('.')) || service.addresses[0]
					}

					if (!host) {
						host = service.referer?.address || service.host || service.fqdn
					}

					const index = this.discoveredInstances.findIndex((i) => i.host === host)

					if (index !== -1) {
						this.log('info', `Capacitimer instance went offline: ${service.name} at ${host}`)
						this.discoveredInstances.splice(index, 1)

						// Refresh config fields to remove offline instance
						this.saveConfig(this.config)
					}
				}
			})

			this.bonjourBrowser.start()
			this.log('debug', 'Started Bonjour service discovery for Capacitimer instances')
		} catch (err) {
			this.log('error', `Failed to start Bonjour discovery: ${err.message}`)
		}
	}

	stopBonjourDiscovery() {
		if (this.bonjourBrowser) {
			this.bonjourBrowser.stop()
			this.bonjourBrowser = null
		}
		if (this.bonjour) {
			this.bonjour.destroy()
			this.bonjour = null
		}
		this.discoveredInstances = []
	}

	initWebSocket() {
		// Use manual host if provided, otherwise use discovered host
		const host = this.config.host || this.config.discovered

		if (!host) {
			this.updateStatus(InstanceStatus.Disconnected, 'No Capacitimer instance configured')
			return
		}

		try {
			this.ws = new WebSocket(`ws://${host}:3001`)

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
		const host = this.config.host || this.config.discovered

		if (!host) {
			return
		}

		try {
			const response = await fetch(`http://${host}/api/timer`)
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
		const host = this.config.host || this.config.discovered

		if (!host) {
			this.log('error', 'No Capacitimer instance configured')
			throw new Error('No Capacitimer instance configured')
		}

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

			const response = await fetch(`http://${host}${endpoint}`, options)
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
