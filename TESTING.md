# Testing the Capacitimer Companion Module

## Prerequisites

1. **Capacitimer Application Running**
   - Make sure Capacitimer is running on your machine
   - Note the HTTP port (default: 80) and WebSocket port (default: 3001)
   - You can access Capacitimer at `http://localhost:80` (or whatever port it's running on)

2. **Companion Installation**
   - Download and install Bitfocus Companion from https://bitfocus.io/companion
   - Launch Companion

## Installation Steps

### Step 1: Install Dependencies

```bash
cd /Users/tomhillmeyer/Documents/dev/companion-module-capacitimer
yarn install
```

### Step 2: Build the Module

```bash
yarn run package
```

This will create a `.tgz` file in the current directory.

### Step 3: Install in Companion

#### Option A: Developer Mode (Recommended for Testing)

1. In Companion, go to the Connections tab
2. Click "Add Connection"
3. In the search box, type "capacitimer"
4. If it doesn't appear, you'll need to manually install it:
   - Copy the entire module folder to Companion's module directory:
     - **macOS**: `~/Library/Application Support/companion-nodejs/modules/`
     - **Windows**: `%APPDATA%\companion-nodejs\modules\`
     - **Linux**: `~/.local/share/companion-nodejs/modules/`
   - Restart Companion
   - The module should now appear in the list

#### Option B: Install from Package

1. In Companion, go to Settings
2. Look for "Developer Mode" or module installation options
3. Upload the `.tgz` file created in Step 2
4. Restart Companion if necessary

### Step 4: Configure the Module

1. Once added, configure the connection:
   - **Capacitimer Host**: `localhost` (or IP address if running on another machine)
   - **HTTP Port**: `80` (or whatever port Capacitimer is using)
   - **WebSocket Port**: `3001` (Capacitimer's WebSocket port)

2. Save the configuration

3. The connection status should show as "OK" if Capacitimer is running

## Testing the Module

### Test 1: Basic Timer Controls

1. **Create a Button for Start Timer**
   - Go to the Buttons tab
   - Click on an empty button
   - Add Action: "Capacitimer: Start Timer"
   - Press the button - timer should start in Capacitimer

2. **Create a Button for Pause Timer**
   - Add Action: "Capacitimer: Pause Timer"
   - Press the button - timer should pause

3. **Create a Button for Reset Timer**
   - Add Action: "Capacitimer: Reset Timer"
   - Press the button - timer should reset to last set time

### Test 2: Set Timer

1. **Create a Button to Set 5 Minutes**
   - Add Action: "Capacitimer: Set Timer"
   - Configure:
     - Hours: 0
     - Minutes: 5
     - Seconds: 0
     - Keep Running: unchecked
   - Press the button - timer should be set to 5:00

2. **Create a Button to Set and Start**
   - Add Action: "Capacitimer: Set Timer"
   - Configure:
     - Hours: 0
     - Minutes: 2
     - Seconds: 30
     - Keep Running: checked
   - Press the button - timer should be set to 2:30 and start running

### Test 3: Adjust Timer

1. **Create a Button to Add 30 Seconds**
   - Add Action: "Capacitimer: Adjust Timer"
   - Configure:
     - Seconds: 30
   - Press the button - timer should add 30 seconds

2. **Create a Button to Subtract 1 Minute**
   - Add Action: "Capacitimer: Adjust Timer"
   - Configure:
     - Seconds: -60
   - Press the button - timer should subtract 60 seconds

### Test 4: Toggle Button

1. **Create a Toggle Button**
   - Add Action: "Capacitimer: Toggle Timer (Start/Pause)"
   - Press once - timer starts
   - Press again - timer pauses
   - Press again - timer resumes

### Test 5: Feedbacks (Button Colors)

1. **Timer Running Feedback**
   - Select a button
   - Add Feedback: "Capacitimer: Timer Running"
   - Button should be green when timer is running

2. **Timer Paused Feedback**
   - Add Feedback: "Capacitimer: Timer Paused"
   - Button should be orange when timer is paused

3. **Time Remaining Less Than Feedback**
   - Add Feedback: "Capacitimer: Time Remaining Less Than"
   - Configure: Seconds: 60
   - Button should turn red when less than 60 seconds remain

### Test 6: Variables

1. **Display Time Remaining**
   - Edit button text to include: `$(capacitimer:time_remaining)`
   - Button should display the formatted time remaining

2. **Display Running Status**
   - Edit button text to include: `$(capacitimer:is_running)`
   - Button should show "Yes" or "No"

3. **Available Variables:**
   - `$(capacitimer:time_remaining)` - Formatted time (HH:MM:SS)
   - `$(capacitimer:time_remaining_seconds)` - Raw seconds
   - `$(capacitimer:is_running)` - Yes/No
   - `$(capacitimer:is_paused)` - Yes/No
   - `$(capacitimer:last_set_time)` - Last set time formatted

### Test 7: Update Settings

1. **Create a Settings Button**
   - Add Action: "Capacitimer: Update Settings"
   - Configure display preferences:
     - Show Hours
     - Show Minutes
     - Show Seconds
     - Show Milliseconds
     - Count Up After Zero
     - Show Time of Day
   - Press button - Capacitimer display should update accordingly

## Troubleshooting

### Module Won't Connect

1. **Check Capacitimer is Running**
   - Open `http://localhost:80` in a browser
   - You should see the Capacitimer interface

2. **Check Ports**
   - Capacitimer may use a different HTTP port (81, 82, etc.)
   - Check the Capacitimer console output for the actual port
   - Update the Companion module configuration accordingly

3. **Check Logs**
   - In Companion, go to the Log tab
   - Look for connection errors or WebSocket issues
   - Errors will show details about what's failing

### WebSocket Not Connecting

1. **Verify WebSocket Port**
   - WebSocket should be on port 3001
   - Check Capacitimer console output

2. **Test Manually**
   ```bash
   # Test HTTP API
   curl http://localhost:80/api/timer

   # Should return JSON with timer state
   ```

### Variables Not Updating

1. **Check Connection Status**
   - Ensure the module shows "OK" status in Companion

2. **Test WebSocket**
   - WebSocket sends updates every 100ms when timer is running
   - If WebSocket fails, module falls back to polling every second

### Actions Not Working

1. **Check HTTP Port**
   - All actions use the HTTP REST API
   - Verify the HTTP port is correct in module config

2. **Test with cURL**
   ```bash
   # Test start command
   curl -X POST http://localhost:80/api/timer/start

   # Test set command
   curl -X POST http://localhost:80/api/timer/set \
     -H "Content-Type: application/json" \
     -d '{"seconds": 300}'
   ```

## Example Button Layouts

### Simple Control Panel

```
[5:00 Set] [Start] [Pause] [Reset]
[+30s]    [+1m]   [-30s]  [-1m]
```

### Advanced Panel with Feedback

```
[START/PAUSE]  (Green when running, Orange when paused)
[RESET]
[Time: $(capacitimer:time_remaining)]
[Warning] (Red when < 60 seconds)
```

### Preset Times

```
[1 min]  [2 min]  [3 min]  [5 min]
[10 min] [15 min] [20 min] [30 min]
```

Each button configured with "Set Timer" action and different times.

## API Commands Reference

All available actions in the module:

- **start_timer** - Start or resume the timer
- **pause_timer** - Pause the timer
- **reset_timer** - Reset to last set time
- **set_timer** - Set timer to specific time
- **adjust_timer** - Add or subtract seconds
- **toggle_timer** - Toggle between start and pause
- **update_settings** - Update Capacitimer display settings

All available feedbacks:

- **timer_running** - Timer is actively running
- **timer_paused** - Timer is paused
- **timer_stopped** - Timer is stopped
- **time_remaining_less_than** - Time below threshold
- **time_remaining_greater_than** - Time above threshold
- **timer_negative** - Timer counting up past zero

## Next Steps

1. Test all actions to ensure they work
2. Test feedbacks by watching button colors change
3. Test variables by displaying them on buttons
4. Create a useful button layout for your use case
5. Save your configuration in Companion

## Support

If you encounter issues:
- Check the Companion logs
- Check the Capacitimer console output
- Verify network connectivity between Companion and Capacitimer
- Ensure both applications are on the same network (if running on different machines)
