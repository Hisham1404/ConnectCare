// ./utils/tools.ts
import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';

const get_battery_level = async () => {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  if (batteryLevel === -1) {
    return 'Error: Device does not support retrieving the battery level.';
  }
  return batteryLevel;
};

const change_brightness = async ({ brightness }: { brightness: number }) => {
  const { status } = await Brightness.requestPermissionsAsync();
  if (status !== 'granted') {
    return 'Error: Permission to change brightness was not granted.';
  }
  await Brightness.setSystemBrightnessAsync(brightness);
  return `Successfully changed brightness to ${brightness}.`;
};

const flash_screen = async () => {
  const { status } = await Brightness.requestPermissionsAsync();
  if (status !== 'granted') {
    return 'Error: Permission to change brightness was not granted.';
  }
  const originalBrightness = await Brightness.getSystemBrightnessAsync();
  await Brightness.setSystemBrightnessAsync(1);
  setTimeout(async () => {
    await Brightness.setSystemBrightnessAsync(originalBrightness);
  }, 300);
  return 'Successfully flashed the screen.';
};

const tools = {
  get_battery_level,
  change_brightness,
  flash_screen,
};

export default tools;