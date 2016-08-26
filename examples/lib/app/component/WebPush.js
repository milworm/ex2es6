Ext.define('CJ.component.WebPush', {
    singleton: true,
    /**
	 * @property {String} alternateClassName
	 */
    alternateClassName: 'CJ.WebPush',
    /**
	 * resets #swPromise property
	 */
    reset() {
        this.swPromise = null;
    },
    /**
	 * @return {Object} an object that contains required part of a request params.
	 */
    getRequestData() {
        return {
            user_id: CJ.User.get('id'),
            os: {
                type: Ext.os.deviceType.toLowerCase(),
                name: Ext.os.name.toLowerCase()
            },
            browser: { name: Ext.browser.name.toLowerCase() }
        };
    },
    /**
	 * registers user to receive webpush notifications.
	 * @return {Promise}
	 */
    subscribe() {
        this.reset();
        return this.ready().then(this.subscribeRequest.bind(this)).then(this.shareTranslations.bind(this));
    },
    /**
	 * performs subscribe without throwing an error when an operation can't be executed.
	 * @return {Promise}
	 */
    safeSubscribe() {
        return Promise.resolve().then(this.subscribe.bind(this)).catch(Ext.emptyFn);
    },
    /**
	 * @param {String} subscription
	 * @return {Promise}
	 */
    subscribeRequest(subscription) {
        const data = this.getRequestData();
        return new Promise((resolve, reject) => {
            CJ.request({
                url: CJ.constant.webpush.subscribe,
                jsonData: Ext.apply({ subscription }, data),
                success: resolve,
                failure: reject
            });
        });
    },
    /**
	 * unregisters user from webpush notifications. Used when user performs log out operation.
	 * @return {Promise}
	 */
    unsubscribe() {
        return this.ready().then(this.unsubscribeRequest.bind(this)).then(this.reset.bind(this));
    },
    /**
	 * performs unsubscribe without throwing an error when an operation can't be executed.
	 * @return {Promise}
	 */
    safeUnsubscribe() {
        return Promise.resolve().then(this.unsubscribe.bind(this)).catch(Ext.emptyFn);
    },
    /**
	 * performs ajax request to unsubscribe user from webpush.
	 * @return {Promise}
	 */
    unsubscribeRequest() {
        const data = this.getRequestData();
        return new Promise(function (resolve, reject) {
            CJ.request({
                url: CJ.constant.webpush.unsubscribe,
                jsonData: data,
                scope: this,
                success: resolve,
                failure: reject
            });
        });
    },
    /**
	 * @return {Promise}
	 */
    shareTranslations() {
        const json = JSON.stringify(window.translations);
        return CJ.Db.save('translations', json);
    },
    /**
	 * @return {Promise} will be resolved when service worker is registered and webpush subscription id is obtained.
	 */
    ready() {
        const browser = Ext.browser.is.Chrome || Ext.browser.is.ChromeMobile;
        if (!browser)
            return Promise.reject();
        return this.swPromise || (this.swPromise = this.registerServiceWorker());
    },
    /**
	 * @return {Promise} will be resolved with JSON representation of a subscription.
	 */
    registerServiceWorker() {
        return new Promise((resolve, reject) => {
            navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then(registration => {
                if (!CJ.User.isFGA())
                    throw { webPushDisabled: true };
                return registration.pushManager.subscribe({ userVisibleOnly: true });
            }).then(subscription => {
                resolve(subscription.toJSON());
            }).catch(e => {
                reject(e);
            });
        });
    }
});