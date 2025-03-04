"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeTrackingListenerProxy = void 0;
/// <amd-module name="scandit-cordova-datacapture-barcode.BarcodeTrackingListenerProxy"/>
// ^ needed because Cordova can't resolve "../xx" style dependencies
const BarcodeTracking_Related_1 = require("scandit-cordova-datacapture-barcode.BarcodeTracking+Related");
const CameraProxy_1 = require("scandit-cordova-datacapture-core.CameraProxy");
const Cordova_1 = require("scandit-cordova-datacapture-barcode.Cordova");
var BarcodeTrackingListenerEvent;
(function (BarcodeTrackingListenerEvent) {
    BarcodeTrackingListenerEvent["DidUpdateSession"] = "BarcodeTrackingListener.didUpdateSession";
})(BarcodeTrackingListenerEvent || (BarcodeTrackingListenerEvent = {}));
class BarcodeTrackingListenerProxy {
    static forBarcodeTracking(barcodeTracking) {
        const proxy = new BarcodeTrackingListenerProxy();
        proxy.barcodeTracking = barcodeTracking;
        proxy.initialize();
        return proxy;
    }
    initialize() {
        this.subscribeListener();
    }
    reset() {
        return new Promise((resolve, reject) => {
            BarcodeTrackingListenerProxy.cordovaExec(resolve, reject, Cordova_1.CordovaFunction.ResetBarcodeTrackingSession, null);
        });
    }
    subscribeListener() {
        BarcodeTrackingListenerProxy.cordovaExec(this.notifyListeners.bind(this), null, Cordova_1.CordovaFunction.SubscribeBarcodeTrackingListener, null);
    }
    notifyListeners(event) {
        const done = () => {
            return { enabled: this.barcodeTracking.isEnabled };
        };
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        this.barcodeTracking.listeners.forEach((listener) => {
            switch (event.name) {
                case BarcodeTrackingListenerEvent.DidUpdateSession:
                    if (listener.didUpdateSession) {
                        listener.didUpdateSession(this.barcodeTracking, BarcodeTracking_Related_1.BarcodeTrackingSession
                            .fromJSON(JSON.parse(event.argument.session)), CameraProxy_1.CameraProxy.getLastFrame);
                    }
                    // TODO: Remove when iOS migrated to use the shared module
                    if (!event.shouldNotifyWhenFinished) {
                        BarcodeTrackingListenerProxy.cordovaExec(null, null, Cordova_1.CordovaFunction.FinishBarcodeTrackingDidUpdateSession, [{ 'enabled': this.barcodeTracking.isEnabled }]);
                    }
                    break;
            }
        });
        return done();
    }
}
exports.BarcodeTrackingListenerProxy = BarcodeTrackingListenerProxy;
BarcodeTrackingListenerProxy.cordovaExec = Cordova_1.Cordova.exec;
