import {
  Application,
  AndroidApplication,
  Utils,
  Device,
  Color,
  path,
  knownFolders,
} from '@nativescript/core'
let timerOne
declare const global, android, androidx, com, java, Array: any

export const restartApp = () => {
  const ctx = Utils.ad.getApplicationContext()
  let mStartActivity = new android.content.Intent(
    ctx,
    Application.android.startActivity.getClass()
  )
  let mPendingIntentId = Math.random() * 100000
  let mPendingIntent = android.app.PendingIntent.getActivity(
    ctx,
    mPendingIntentId,
    mStartActivity,
    android.app.PendingIntent.FLAG_CANCEL_CURRENT
  )
  let mgr = ctx.getSystemService(android.content.Context.ALARM_SERVICE)
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
  let ctx = Utils.ad.getApplicationContext()
  let sensorManager = ctx.getSystemService(
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
export const timer = (dur, callback) => {
  clearInterval(timerOne)
  callback(true)
  timerOne = setInterval(() => {
    dur--
    callback(true)
    if (dur == 0) {
      callback(false)
      clearInterval(timerOne)
    }
  }, 1000)
}

function callIntent(ctx, intent, msg, pickerType) {
  return new Promise((resolve) => {
    const onEvent = function(e) {
      if (e.requestCode === pickerType) {
        resolve(e)
        Application.android.off(AndroidApplication.activityResultEvent, onEvent)
      }
    }
    Application.android.once(AndroidApplication.activityResultEvent, onEvent)
    ctx.startActivityForResult(
      android.content.Intent.createChooser(intent, msg),
      pickerType
    )
  })
}
// IMAGE PICKER
export const getRecipePhoto = () => {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_GET_CONTENT
  )
  intent.setType('image/*')
  return callIntent(ctx, intent, 'Select photo', DIR_CODE).then(
    ({ resultCode, intent }: any) => {
      if (resultCode === android.app.Activity.RESULT_OK)
        if (intent != null && intent.getData()) return intent.getData()
    }
  )
}
export const copyPhotoToCache = (uri, filepath) => {
  const ContentResolver = Application.android.nativeApp.getContentResolver()
  return new Promise((resolve) => {
    const inputStream = ContentResolver.openInputStream(uri)
    const input = new java.io.BufferedInputStream(inputStream)
    let size = input.available()
    let buffer = Array.create('byte', size)
    const output = new java.io.BufferedOutputStream(
      new java.io.FileOutputStream(filepath)
    )
    input.read(buffer)
    do {
      output.write(buffer)
    } while (input.read(buffer) != -1)
    input.close()
    output.close()
    resolve(filepath)
  })
}

// COPY DB FILE
export const copyDBToExport = () => {
  const src = path.join(knownFolders.documents().path, 'EnRecipes.db')
  const dst = path.join(
    knownFolders.documents().getFolder('EnRecipes').path,
    'EnRecipes.db'
  )
  const input = new java.io.FileInputStream(src)
  try {
    const output = new java.io.FileOutputStream(dst)
    let len: number
    let buffer = Array.create('byte', 1024)
    while ((len = input.read(buffer)) > 0) output.write(buffer, 0, len)
  } catch (error) {
    console.log(error)
  } finally {
    input.close()
  }
}

// BACKUP FOLDER PICKER
export const getBackupFolder = () => {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_OPEN_DOCUMENT_TREE
  )
  return callIntent(ctx, intent, 'Select folder', DIR_CODE).then(
    ({ resultCode, intent }: any) => {
      if (resultCode === android.app.Activity.RESULT_OK)
        if (intent != null && intent.getData()) return intent.getData()
    }
  )
}

// BACKUP FILE PICKER
export const getBackupFile = () => {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_GET_CONTENT
  )
  intent.addCategory(android.content.Intent.CATEGORY_OPENABLE)
  intent.setType('application/zip')
  return callIntent(ctx, intent, 'Select file to import', DIR_CODE).then(
    ({ resultCode, intent }: any) => {
      if (resultCode === android.app.Activity.RESULT_OK) {
        if (intent != null && intent.getData()) return intent.getData()
      }
    }
  )
}

// ZIP OPERATIONS
export class Zip {
  static getSubFiles(src: string, isRootFolder?: boolean) {
    const fileList = new java.util.ArrayList()
    const sourceFile = new java.io.File(src)
    let tempList = sourceFile.listFiles()
    for (let i = 0; i < tempList.length; i++) {
      if (tempList[i].isFile()) {
        fileList.add(tempList[i])
      }
      if (tempList[i].isDirectory()) {
        if (isRootFolder) {
          fileList.add(tempList[i])
        }
        fileList.addAll(Zip.getSubFiles(tempList[i].getAbsolutePath()))
      }
    }
    return fileList
  }
  static zip(src, destUri, filename) {
    const ContentResolver = Application.android.nativeApp.getContentResolver()
    const parsedUri = new android.net.Uri.parse(destUri)
    const uri = new androidx.documentfile.provider.DocumentFile.fromTreeUri(
      Application.android.context,
      parsedUri
    )
    return new Promise((resolve, reject) => {
      if (uri.exists()) {
        let destFile = uri.createFile('application/zip', filename).getUri()
        const outputStream = ContentResolver.openOutputStream(destFile)
        const zipOutputStream = new java.util.zip.ZipOutputStream(outputStream)
        const sourceFiles = Zip.getSubFiles(src, true)
        for (let i = 0; i < sourceFiles.size(); i++) {
          let len
          let buffer = Array.create('byte', 4096)
          let file = sourceFiles.get(i)
          let entry = new java.util.zip.ZipEntry(
            'EnRecipes/' +
              new java.io.File(src)
                .toURI()
                .relativize(file.toURI())
                .getPath()
          )
          zipOutputStream.putNextEntry(entry)
          if (!file.isDirectory()) {
            let inputStream = new java.io.FileInputStream(file)
            while ((len = inputStream.read(buffer)) != -1) {
              zipOutputStream.write(buffer, 0, len)
            }
            inputStream.close()
          }
          zipOutputStream.closeEntry()
        }
        zipOutputStream.close()
        resolve(destFile)
      } else {
        reject('Destination file cannot be created: Path does not exist')
      }
    })
  }
  static unzip(uri, dest) {
    const ContentResolver = Application.android.nativeApp.getContentResolver()
    return new Promise((resolve) => {
      const inputStream = ContentResolver.openInputStream(uri)
      const zipInputStream = new java.util.zip.ZipInputStream(inputStream)
      let len, filepath, entry
      while ((entry = zipInputStream.getNextEntry()) != null) {
        filepath = dest + '/' + entry.getName()
        let output = new java.io.File(filepath)
        if (entry.isDirectory()) {
          output.mkdirs()
          continue
        }
        if (!output.getParentFile().exists()) output.getParentFile().mkdirs()
        const outputStream = new java.io.BufferedOutputStream(
          new java.io.FileOutputStream(output)
        )
        let buffer = Array.create('byte', 4096)
        while ((len = zipInputStream.read(buffer)) != -1)
          outputStream.write(buffer, 0, len)
        outputStream.close()
        zipInputStream.closeEntry()
      }
      zipInputStream.close()
      resolve(dest)
    })
  }
}

// SHARE OPERATIONS

function share(intent, subject) {
  const ctx = Application.android.context
  const shareIntent = android.content.Intent.createChooser(intent, subject)
  shareIntent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
  ctx.startActivity(shareIntent)
}
function getSendIntent(type) {
  const intent = new android.content.Intent(android.content.Intent.ACTION_SEND)
  intent.setType(type)
  return intent
}
export const shareText = (text, subject) => {
  const intent = getSendIntent('text/plain')
  intent.putExtra(android.content.Intent.EXTRA_TEXT, text)
  share(intent, subject)
}
export const shareImage = (image, subject) => {
  let ctx = Application.android.context
  const intent = getSendIntent('image/jpeg')
  const baos = new java.io.ByteArrayOutputStream()
  image.android.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, baos)
  const tmpFile = new java.io.File(ctx.getExternalCacheDir(), 'EnRecipes.jpg')
  const fos = new java.io.FileOutputStream(tmpFile)
  fos.write(baos.toByteArray())
  fos.flush()
  fos.close()
  let shareUri = global.androidx.core.content.FileProvider.getUriForFile(
    ctx,
    Application.android.nativeApp.getPackageName() + '.provider',
    tmpFile
  )
  intent.putExtra(android.content.Intent.EXTRA_STREAM, shareUri)
  share(intent, subject)
}

// TIMER NOTIFICATION
export class TimerNotif {
  static getIcon(ctx, icon) {
    const packageName = ctx.getApplicationInfo().packageName
    let resources = ctx.getResources()
    return (
      resources.getIdentifier(icon, 'drawable', packageName) ||
      ctx.getApplicationInfo().icon
    )
  }
  static clear(nID) {
    let ctx = Utils.ad.getApplicationContext()
    const NotifySrv = ctx.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE
    )
    NotifySrv.cancel(nID)
  }
  static show({
    actions,
    bID,
    cID,
    cName,
    description,
    nID,
    priority,
    sound,
    title,
    vibrate,
  }: {
    actions?: boolean
    bID: string
    cID: string
    cName: string
    description: string
    nID: number
    priority: number
    sound: string
    title: string
    vibrate?: number
  }) {
    let sdkv: number = parseInt(Device.sdkVersion)
    let soundUri: any
    if (sound) soundUri = new android.net.Uri.parse(sound)
    const NotifyMgr = android.app.NotificationManager
    let ctx = Utils.ad.getApplicationContext()
    const NotifySrv = ctx.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE
    )
    if (sdkv >= 26) {
      const importance =
        priority > 0 ? NotifyMgr.IMPORTANCE_HIGH : NotifyMgr.IMPORTANCE_MIN
      console.log(priority, importance)
      const AudioAttributes = android.media.AudioAttributes
      const audioAttributes = new AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_ALARM)
        .build()
      const Channel = new android.app.NotificationChannel(
        cID,
        cName,
        importance
      )
      if (description) Channel.setDescription(description)
      Channel.enableVibration(vibrate)
      Channel.enableLights(false)
      if (sound) Channel.setSound(soundUri, audioAttributes)
      else Channel.setSound(null, null)
      Channel.setShowBadge(true)
      NotifySrv.createNotificationChannel(Channel)
    }

    const Intent = android.content.Intent
    const PendingIntent = android.app.PendingIntent

    const mainInt = new Intent(ctx, com.tns.NativeScriptActivity.class)
    mainInt.putExtra('action', 'open_timer')
    const mainPInt = PendingIntent.getActivity(
      ctx,
      1,
      mainInt,
      PendingIntent.FLAG_UPDATE_CURRENT
    )

    // Action intent
    let actionInt1, actionInt2, actionPInt1, actionPInt2
    if (actions) {
      actionInt1 = new Intent(bID)
      actionInt1.putExtra('action', 'delay')
      actionPInt1 = PendingIntent.getBroadcast(
        ctx,
        2,
        actionInt1,
        PendingIntent.FLAG_UPDATE_CURRENT
      )
      actionInt2 = new Intent(bID)
      actionInt2.putExtra('action', 'stop')
      actionPInt2 = PendingIntent.getBroadcast(
        ctx,
        3,
        actionInt2,
        PendingIntent.FLAG_UPDATE_CURRENT
      )
    }

    // CREATE NOTIFICATION
    const NotificationCompat = androidx.core.app.NotificationCompat
    const AudioManager = android.media.AudioManager
    let icon = TimerNotif.getIcon(ctx, 'ic_stat_notify_silhouette')
    let builder = new NotificationCompat.Builder(ctx, cID)
      .setColor(new Color('#ff5200').android)
      .setContentIntent(mainPInt)
      .setContentTitle(title)
      .setOngoing(true)
      .setPriority(priority)
      .setShowWhen(actions)
      .setSmallIcon(icon)
      .setTicker(title)
      .setAutoCancel(false)
    if (sound) builder.setSound(soundUri, AudioManager.STREAM_ALARM)
    else builder.setSound(null)
    if (description) builder.setContentText(description)
    if (vibrate) builder.setVibrate([500, 1000])
    if (actions) {
      builder.setDeleteIntent(actionPInt2)
      builder.setFullScreenIntent(mainPInt, true)
      builder.addAction(null, 'Delay', actionPInt1)
      builder.addAction(null, 'Stop', actionPInt2)
    }
    let notification = builder.build()
    notification.flags =
      NotificationCompat.FLAG_INSISTENT | NotificationCompat.FLAG_ONGOING_EVENT
    NotifySrv.notify(nID, notification)
  }
}

// GET RINGTONES LIST
export const getTones = () => {
  const RingtoneManager = android.media.RingtoneManager
  let ctx = Utils.ad.getApplicationContext()
  const ringtonesMgr = new RingtoneManager(ctx)
  ringtonesMgr.setType(RingtoneManager.TYPE_ALARM)
  const cursor = ringtonesMgr.getCursor()
  let tones = []
  while (cursor.moveToNext()) {
    tones.push({
      title: cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX),
      uri:
        cursor.getString(RingtoneManager.URI_COLUMN_INDEX) +
        '/' +
        cursor.getString(RingtoneManager.ID_COLUMN_INDEX),
    })
  }

  let defaultToneUri = RingtoneManager.getActualDefaultRingtoneUri(
    ctx,
    RingtoneManager.TYPE_ALARM
  )
  let defaultTone
  if (defaultToneUri) {
    let uriString = defaultToneUri.toString()
    let tonesAvailable = tones.filter((e) => e.uri == uriString)
    let toneExist = tonesAvailable.length
    defaultTone = {
      title: toneExist ? tonesAvailable[0].title : tones[0].title,
      uri: toneExist ? uriString : tones[0].uri,
    }
  }

  return { tones, defaultTone: defaultToneUri ? defaultTone : tones[0] }
}
