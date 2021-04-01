import { Application, Utils } from '@nativescript/core'
export const restartApp = () => {
  let mStartActivity = new android.content.Intent(
    Application.android.context,
    Application.android.startActivity.getClass()
  )
  let mPendingIntentId = Math.random() * 100000
  let mPendingIntent = android.app.PendingIntent.getActivity(
    Application.android.context,
    mPendingIntentId,
    mStartActivity,
    android.app.PendingIntent.FLAG_CANCEL_CURRENT
  )
  let mgr = Application.android.context.getSystemService(
    android.content.Context.ALARM_SERVICE
  )
  mgr.set(
    android.app.AlarmManager.RTC,
    java.lang.System.currentTimeMillis() + 100,
    mPendingIntent
  )
  android.os.Process.killProcess(android.os.Process.myPid())
}
export const openAppSettingsPage = () => {
  let intent = new android.content.Intent(
    android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS
  )
  intent.addCategory(android.content.Intent.CATEGORY_DEFAULT)
  intent.setData(
    android.net.Uri.parse(
      'package:' + Application.android.context.getPackageName()
    )
  )
  Application.android.foregroundActivity.startActivity(intent)
}
export const hasAccelerometer = () => {
  let context = Utils.ad.getApplicationContext()
  let sensorManager = context.getSystemService(
    android.content.Context.SENSOR_SERVICE
  )
  return sensorManager.getDefaultSensor(
    android.hardware.Sensor.TYPE_ACCELEROMETER
  )
}
export const vibrate = (duration) => {
  let vibratorService = Application.android.context.getSystemService(
    android.content.Context.VIBRATOR_SERVICE
  )
  if (vibratorService.hasVibrator()) vibratorService.vibrate(duration)
}
