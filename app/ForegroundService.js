import { TimerNotif } from './shared/utils'
const superProto = android.app.Service.prototype
android.app.Service.extend('com.tns.ForegroundService', {
  onStartCommand: function(intent, flags, startId) {
    console.log('onStartCommand')
    superProto.onStartCommand.call(this, intent, flags, startId)
    return android.app.Service.START_STICKY
  },
  onCreate: function() {
    console.log('onCreate')
    superProto.onCreate.call(this)
    this.startForeground(777, this.getNotification())
  },
  onBind: function(intent) {
    return superProto.onBind.call(this, intent)
  },
  onUnbind: function(intent) {
    return superProto.onUnbind.call(this, intent)
  },
  onDestroy: function() {
    console.log('onDestroy')
    this.stopForeground(true)
  },
  getNotification: function() {
    return TimerNotif.getNotification(
      {
        bID: 'bringToFront',
        cID: 'cti',
        cName: 'Cooking Timer info',
        description: `0 ongoing, 0 paused`,
        nID: 777,
        priority: -2,
        sound: null,
        title: 'EnRecipes is running',
      },
      this.getApplicationContext()
    )
  },
})
