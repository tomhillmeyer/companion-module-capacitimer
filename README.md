# companion-module-capacitimer

Bitfocus Companion module for controlling [Capacitimer](https://github.com/tomhillmeyer/capacitimer)

## Features

### Timer Control
- Start, pause, reset, and toggle timer
- Set timer to specific hours, minutes, seconds (with variable support)
- Adjust timer up/down by seconds (with variable support)
- Real-time updates via WebSocket

### Display Control
- Toggle timer visibility
- Toggle time of day display
- Choose from 5 monospace fonts (Roboto Mono, Kode Mono, PT Mono, Share Tech Mono, Courier Prime)
- Adjust timer and time of day font sizes independently (0-100%)
- All display controls support variables

### Colors & Appearance
- Configure colors for normal, warning, and critical states
- Set custom thresholds for color state transitions
- Customize time of day color
- Dynamic color feedbacks that sync with app settings
- All color and threshold controls support variables

### Feedbacks
- **Timer State**: Running, paused, stopped, counting up
- **Time-Based**: Less than/greater than thresholds
- **Display State**: Timer visible, time of day visible
- **Dynamic Colors**: Automatically sync with app's color settings and thresholds

### Variables (17 total)
- Timer state: time remaining (formatted & seconds), running, paused, reset time
- Display settings: visibility, fonts, font sizes
- Colors: normal, warning, critical, time of day
- Thresholds: normal, warning, critical

### Presets
- **Timer Control**: Start, pause, reset, toggle buttons
- **Quick Set**: 1min, 5min, 10min, 30min, 45min, 1hr, 1.5hr, 2hr presets
- **Adjustments**: +/- 1min and 5min buttons
- **Display**: Toggle visibility buttons
- **Status**: Live timer display with dynamic color coding

## Actions

### Timer Control (6 actions)
- Start Timer
- Pause Timer
- Reset Timer
- Toggle Timer (Start/Pause)
- Set Timer (hours, minutes, seconds with keepRunning option)
- Adjust Timer (add/subtract seconds)

### Display Control (5 actions)
- Toggle Timer Visibility
- Toggle Time of Day
- Set Timer Font (dropdown: 5 monospace fonts)
- Set Timer Font Size (0-100%)
- Set Time of Day Font Size (0-100%)

### Color & Appearance (3 actions)
- Set Timer Colors (normal, warning, critical)
- Set Color Thresholds (normal, warning, critical in seconds)
- Set Time of Day Color

### Settings (1 action)
- Update Settings (batch update display format options)

## Feedbacks

### Timer State (4 feedbacks)
- Timer Running
- Timer Paused
- Timer Stopped
- Timer Negative (Count Up)

### Time-Based (2 feedbacks)
- Time Remaining Less Than
- Time Remaining Greater Than

### Display State (2 feedbacks)
- Timer Visible
- Time of Day Visible

### Dynamic Color Feedbacks (3 advanced feedbacks)
- Timer Color: Normal
- Timer Color: Warning
- Timer Color: Critical

*These sync automatically with the colors and thresholds set in the Capacitimer app!*

## Setup

1. Install and run the Capacitimer application
2. Add this module in Companion
3. Configure connection:
   - Select from **Discovered Capacitimers** (auto-discovery via mDNS/Bonjour)
   - Or manually enter IP address
4. Module connects automatically via:
   - REST API: `http://[host]` (port 80+)
   - WebSocket: `ws://[host]:3001`

## Variable Support

Most actions support Companion variables for dynamic control:
- Timer values (hours, minutes, seconds, adjust amount)
- Font sizes
- Color hex codes
- Threshold values

Example: `$(capacitimer:time_remaining_seconds)` can be used in any numeric field.

## Network Discovery

The module uses mDNS/Bonjour for automatic network discovery. Capacitimer instances broadcast as `_http._tcp` services and appear in the configuration dropdown.

## License

MIT - See [LICENSE](./LICENSE)
