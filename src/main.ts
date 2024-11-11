import { app, Menu, Tray, Notification, nativeImage } from 'electron';
import { exec } from 'child_process';

let tray: Tray | null = null;

const BATTERY_LOW_THRESHOLD = 60;

function checkBatteryStatus() {
  console.info('Checking battery status...');
  exec(
    "ioreg -c AppleDeviceManagementHIDEventService -r -l | grep -E 'BatteryPercent|Product'",
    (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      try {
        const lines = stdout.split('\n');
        let currentDevice = '';
        let batteryPercent = 100;

        lines.forEach((line) => {
          if (line.includes('"Product"')) {
            currentDevice = line.split('=')[1].trim().replace(/"/g, '');
          } else if (line.includes('"BatteryPercent"')) {
            batteryPercent = parseInt(line.split('=')[1].trim(), 10);
            if (batteryPercent < BATTERY_LOW_THRESHOLD) {
              new Notification({
                title: '电池电量低',
                body: `${currentDevice} 电量仅有 ${batteryPercent}%，请即时充电。`,
              }).show();
            }
          }
          console.info(`${currentDevice} battery level is ${batteryPercent}%`);
        });
      } catch (e) {
        console.error(e);
      }
    }
  );
}

app.on('ready', () => {
  // 每隔一段时间检查电池状态
  checkBatteryStatus();
  setInterval(checkBatteryStatus, 4 * 60 * 60 * 1000);
});
