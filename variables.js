module.exports = function (self) {
	self.setVariableDefinitions([
		{ variableId: 'time_remaining', name: 'Time Remaining (Formatted)' },
		{ variableId: 'time_remaining_seconds', name: 'Time Remaining (Seconds)' },
		{ variableId: 'is_running', name: 'Is Running' },
		{ variableId: 'is_paused', name: 'Is Paused' },
		{ variableId: 'last_set_time', name: 'Last Set Time (Formatted)' },
	])
}
