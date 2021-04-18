import { Application, AndroidApplication, Utils } from '@nativescript/core'
let timerOne
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
  return callIntent(ctx, intent, 'Select photo', DIR_CODE).then((res) => {
    if (res.resultCode === android.app.Activity.RESULT_OK)
      if (res.intent != null && res.intent.getData())
        return res.intent.getData()
  })
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

// BACKUP FOLDER PICKER
export const getBackupFolder = () => {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_OPEN_DOCUMENT_TREE
  )
  return callIntent(ctx, intent, 'Select folder', DIR_CODE).then((res) => {
    if (res.resultCode === android.app.Activity.RESULT_OK)
      if (res.intent != null && res.intent.getData())
        return res.intent.getData()
  })
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
    (res) => {
      if (res.resultCode === android.app.Activity.RESULT_OK) {
        if (res.intent != null && res.intent.getData())
          return res.intent.getData()
      }
    }
  )
}

// ZIP OPERATIONS
export class Zip {
  static getSubFiles(src, isRootFolder) {
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
  intent.putExtra(
    android.content.Intent.EXTRA_STREAM,
    android.net.Uri.fromFile(tmpFile)
  )
  share(intent, subject)
}
