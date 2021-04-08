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

// FOLDER PICKER
function callIntent(context, intent, pickerType) {
  return new Promise((resolve, reject) => {
    const onEvent = function(e) {
      if (e.requestCode === pickerType) {
        resolve(e)
        Application.android.off(AndroidApplication.activityResultEvent, onEvent)
      }
    }
    Application.android.once(AndroidApplication.activityResultEvent, onEvent)
    context.startActivityForResult(intent, pickerType)
  })
}

//SOURCE: https://github.com/NativeScript/nativescript-imagepicker/blob/bc9209dd7d773eb437ff812f07873c72c789d572/src/imagepicker.android.ts

function getDataColumn(uri, selection, selectionArgs, isDownload) {
  const ContentResolver = Application.android.nativeApp.getContentResolver()
  let cursor = null
  let filePath
  if (isDownload) {
    let columns = ['_display_name']
    try {
      cursor = ContentResolver.query(
        uri,
        columns,
        selection,
        selectionArgs,
        null
      )
      if (cursor != null && cursor.moveToFirst()) {
        let column_index = cursor.getColumnIndexOrThrow(columns[0])
        filePath = cursor.getString(column_index)
        if (filePath) {
          const dl = android.os.Environment.getExternalStoragePublicDirectory(
            android.os.Environment.DIRECTORY_DOWNLOADS
          )
          filePath = `${dl}/${filePath}`
          return filePath
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      if (cursor) {
        cursor.close()
      }
    }
  } else {
    let columns = [android.provider.MediaStore.MediaColumns.DATA]
    let filePath

    try {
      cursor = ContentResolver.query(
        uri,
        columns,
        selection,
        selectionArgs,
        null
      )
      if (cursor != null && cursor.moveToFirst()) {
        let column_index = cursor.getColumnIndexOrThrow(columns[0])
        filePath = cursor.getString(column_index)
        if (filePath) {
          return filePath
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      if (cursor) {
        cursor.close()
      }
    }
  }
  return undefined
}
function getTreeUri(uri) {
  const DocumentsContract = android.provider.DocumentsContract
  const ContentResolver = Application.android.nativeApp.getContentResolver()
  if (DocumentsContract.isTreeUri(uri)) {
    let docId, id, type
    let contentUri = null
    if ('com.android.externalstorage.documents' === uri.getAuthority()) {
      docId = DocumentsContract.getTreeDocumentId(uri).split(':')
      type = docId[0]
      id = docId[1]

      if ('primary' === type.toLowerCase())
        return android.os.Environment.getExternalStorageDirectory() + '/' + id
      else {
        ContentResolver.takePersistableUriPermission(
          uri,
          android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION |
            android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        )
        const externalMediaDirs = Application.android.context.getExternalMediaDirs()
        if (externalMediaDirs.length > 1) {
          let filePath = externalMediaDirs[1].getAbsolutePath()
          filePath = filePath.substring(0, filePath.indexOf('Android')) + id
          return filePath
        }
      }
    }
    // DownloadsProvider
    else if (
      'com.android.providers.downloads.documents' === uri.getAuthority()
    ) {
      return getDataColumn(uri, null, null, true)
    }
    // MediaProvider
    else if ('com.android.providers.media.documents' === uri.getAuthority()) {
      docId = DocumentsContract.getTreeDocumentId(uri).split(':')
      type = docId[0]
      id = docId[1]

      if ('image' === type)
        contentUri =
          android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI
      else if ('video' === type)
        contentUri =
          android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI
      else if ('audio' === type)
        contentUri =
          android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

      let selection = '_id=?'
      let selectionArgs = [id]

      return getDataColumn(contentUri, selection, selectionArgs, false)
    }
  }
  return undefined
}
function getFileUri(uri) {
  const DocumentsContract = android.provider.DocumentsContract
  const ContentResolver = Application.android.nativeApp.getContentResolver()
  if (DocumentsContract.isDocumentUri(Application.android.context, uri)) {
    let docId, id, type
    let contentUri = null
    if ('com.android.externalstorage.documents' === uri.getAuthority()) {
      docId = DocumentsContract.getDocumentId(uri).split(':')
      type = docId[0]
      id = docId[1]

      if ('primary' === type.toLowerCase())
        return android.os.Environment.getExternalStorageDirectory() + '/' + id
      else {
        ContentResolver.takePersistableUriPermission(
          uri,
          android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION |
            android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        )
        const externalMediaDirs = Application.android.context.getExternalMediaDirs()
        if (externalMediaDirs.length > 1) {
          let filePath = externalMediaDirs[1].getAbsolutePath()
          filePath = filePath.substring(0, filePath.indexOf('Android')) + id
          return filePath
        }
      }
    }
    // DownloadsProvider
    else if (
      'com.android.providers.downloads.documents' === uri.getAuthority()
    ) {
      return getDataColumn(uri, null, null, true)
    }
    // MediaProvider
    else if ('com.android.providers.media.documents' === uri.getAuthority()) {
      docId = DocumentsContract.getDocumentId(uri).split(':')
      type = docId[0]
      id = docId[1]

      if ('image' === type)
        contentUri =
          android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI
      else if ('video' === type)
        contentUri =
          android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI
      else if ('audio' === type)
        contentUri =
          android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

      let selection = '_id=?'
      let selectionArgs = [id]

      return getDataColumn(contentUri, selection, selectionArgs, false)
    }
  }
  return undefined
}

export const pickFolder = () => {
  const context =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_OPEN_DOCUMENT_TREE
  )
  intent.addCategory(android.content.Intent.CATEGORY_DEFAULT)
  return callIntent(context, intent, DIR_CODE).then((res) => {
    if (res.resultCode === android.app.Activity.RESULT_OK)
      if (res.intent != null && res.intent.getData())
        return getTreeUri(res.intent.getData())
  })
}

function callBackupIntent(context, intent, pickerType) {
  return new Promise((resolve, reject) => {
    const onEvent = function(e) {
      if (e.requestCode === pickerType) {
        resolve(e)
        Application.android.off(AndroidApplication.activityResultEvent, onEvent)
      }
    }
    Application.android.once(AndroidApplication.activityResultEvent, onEvent)
    context.startActivityForResult(intent, pickerType)
  })
}
export const getBackupFile = () => {
  const context =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_GET_CONTENT
  )
  intent.addCategory(android.content.Intent.CATEGORY_OPENABLE)
  intent.setType('application/zip')
  // intent.setFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
  return callBackupIntent(context, intent, DIR_CODE).then((res) => {
    if (res.resultCode === android.app.Activity.RESULT_OK) {
      if (res.intent != null && res.intent.getData()) {
        // return getFileUri(res.intent.getData())
        return res.intent.getData()
      }
    }
  })
}
