Ext.define('CJ.component.Db', {
    singleton: true,
    alternateClassName: 'CJ.Db',
    /**
	 * @property {String} STORE
	 */
    STORE: 'configs',
    config: {
        /**
		 * @cfg {Object} connection
		 */
        connection: null
    },
    /**
	 * @param {String} key
	 * @param {String} value
	 * @return {Promise}
	 */
    save(key, value) {
        return Promise.resolve().then(this.initConnection.bind(this)).then(() => {
            this.addToObjectStore(key, value);
        }).catch(function () {
            console.log(arguments);
        });
    },
    initConnection() {
        const me = this;
        return new Promise((resolve, reject) => {
            if (me.getConnection())
                return resolve(me._connection);
            const request = indexedDB.open('main', 1);
            request.onerror = reject;
            request.onupgradeneeded = e => {
                const db = e.target.result, store = db.createObjectStore(me.STORE, {
                        keyPath: 'key',
                        autoIncrement: true
                    });
                store.transaction.oncomplete = () => {
                    resolve(db);
                };
            };
            request.onsuccess = e => {
                resolve(e.target.result);
            };
        }).then(connection => {
            me.setConnection(connection);
        });
    },
    /**
	 * @param {String} key
	 * @param {String} value
	 * @return {Promise}
	 */
    addToObjectStore(key, value) {
        const me = this, connection = this.getConnection();
        return new Promise((resolve, reject) => {
            const transaction = connection.transaction([me.STORE], 'readwrite'), store = transaction.objectStore(me.STORE);
            request = store.put({
                key,
                value
            });
            request.onerror = reject;
            request.onsuccess = resolve;
        });
    }
});