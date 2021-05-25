var ForegroundService = /** @class */ (function(_super) {
  __extends(ForegroundService, _super)
  function ForegroundService() {
    return (_super !== null && _super.apply(this, arguments)) || this
  }
  ForegroundService.prototype.onStartCommand = function(
    intent,
    flags,
    startId
  ) {
    console.log('onStartCommand')
    _super.prototype.onStartCommand.call(this, intent, flags, startId)
    return android.app.Service.START_STICKY
  }
  ForegroundService.prototype.onCreate = function() {
    console.log('onCreate')
    _super.prototype.onCreate.call(this)
    this.startForeground(1, this.getNotification())
  }
  ForegroundService.prototype.onBind = function(intent) {
    return _super.prototype.onBind.call(this, intent)
  }
  ForegroundService.prototype.onUnbind = function(intent) {
    return _super.prototype.onUnbind.call(this, intent)
  }
  ForegroundService.prototype.onDestroy = function() {
    console.log('onDestroy')
    this.stopForeground(true)
  }
  ForegroundService.prototype.getNotification = function() {
    var channel = new android.app.NotificationChannel(
      'channel_01',
      'ForegroundService Channel',
      android.app.NotificationManager.IMPORTANCE_DEFAULT
    )
    var notificationManager = this.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE
    )
    notificationManager.createNotificationChannel(channel)
    var builder = new android.app.Notification.Builder(
      this.getApplicationContext(),
      'channel_01'
    )
    return builder.build()
  }
  ForegroundService = __decorate(
    [JavaProxy('com.tns.ForegroundService')],
    ForegroundService
  )
  return ForegroundService
})(android.app.Service)
