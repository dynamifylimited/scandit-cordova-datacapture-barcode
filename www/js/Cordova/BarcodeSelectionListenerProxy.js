"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeSelectionListenerProxy = void 0;
const BarcodeSelection_Related_1 = require("scandit-cordova-datacapture-barcode.BarcodeSelection+Related");
const CameraProxy_1 = require("scandit-cordova-datacapture-core.CameraProxy");
const Cordova_1 = require("scandit-cordova-datacapture-barcode.Cordova");
var BarcodeSelectionListenerEvent;
(function (BarcodeSelectionListenerEvent) {
    BarcodeSelectionListenerEvent["DidUpdateSelection"] = "BarcodeSelectionListener.didUpdateSelection";
    BarcodeSelectionListenerEvent["DidUpdateSession"] = "BarcodeSelectionListener.didUpdateSession";
})(BarcodeSelectionListenerEvent || (BarcodeSelectionListenerEvent = {}));
class BarcodeSelectionListenerProxy {
    static forBarcodeSelection(barcodeSelection) {
        const proxy = new BarcodeSelectionListenerProxy();
        proxy.barcodeSelection = barcodeSelection;
        proxy.initialize();
        return proxy;
    }
    getCount(barcode) {
        return new Promise((resolve, reject) => {
            BarcodeSelectionListenerProxy.cordovaExec(resolve, reject, Cordova_1.CordovaFunction.GetCountForBarcodeInBarcodeSelectionSession, [barcode.selectionIdentifier]);
        });
    }
    reset() {
        return new Promise((resolve, reject) => {
            BarcodeSelectionListenerProxy.cordovaExec(resolve, reject, Cordova_1.CordovaFunction.ResetBarcodeSelectionSession, null);
        });
    }
    initialize() {
        this.subscribeListener();
    }
    subscribeListener() {
        BarcodeSelectionListenerProxy.cordovaExec(this.notifyListeners.bind(this), null, Cordova_1.CordovaFunction.SubscribeBarcodeSelectionListener, null);
    }
    notifyListeners(event) {
        const done = () => {
            return { enabled: this.barcodeSelection.isEnabled };
        };
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        this.barcodeSelection.listeners.forEach((listener) => {
            switch (event.name) {
                case BarcodeSelectionListenerEvent.DidUpdateSelection:
                    if (listener.didUpdateSelection) {
                        const session = BarcodeSelection_Related_1.BarcodeSelectionSession
                            .fromJSON(JSON.parse(event.argument.session));
                        session.listenerProxy = this;
                        listener.didUpdateSelection(this.barcodeSelection, session, CameraProxy_1.CameraProxy.getLastFrame);
                    }
                    // TODO: Remove this check when iOS migrated to use the shared module. It should always call FinishBarcodeSelectionDidUpdateSelection
                    if (!event.shouldNotifyWhenFinished) {
                        BarcodeSelectionListenerProxy.cordovaExec(null, null, Cordova_1.CordovaFunction.FinishBarcodeSelectionDidUpdateSelection, [{ 'enabled': this.barcodeSelection.isEnabled }]);
                    }
                    break;
                case BarcodeSelectionListenerEvent.DidUpdateSession:
                    if (listener.didUpdateSession) {
                        const session = BarcodeSelection_Related_1.BarcodeSelectionSession
                            .fromJSON(JSON.parse(event.argument.session));
                        session.listenerProxy = this;
                        listener.didUpdateSession(this.barcodeSelection, session, CameraProxy_1.CameraProxy.getLastFrame);
                    }
                    // TODO: Remove this check when iOS migrated to use the shared module. It should always call FinishBarcodeSelectionDidUpdateSession
                    if (!event.shouldNotifyWhenFinished) {
                        BarcodeSelectionListenerProxy.cordovaExec(null, null, Cordova_1.CordovaFunction.FinishBarcodeSelectionDidUpdateSession, [{ 'enabled': this.barcodeSelection.isEnabled }]);
                    }
                    break;
            }
        });
        return done();
    }
}
exports.BarcodeSelectionListenerProxy = BarcodeSelectionListenerProxy;
BarcodeSelectionListenerProxy.cordovaExec = Cordova_1.Cordova.exec;
