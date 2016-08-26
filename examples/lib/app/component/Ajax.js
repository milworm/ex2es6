/**
 * Class is wrapper of Ext.Ajax, that provides ability to sent request to the server.
 */
Ext.define('CJ.component.Ajax', {
    alternateClassName: 'CJ.Ajax',
    mixins: ['Ext.mixin.Observable'],
    singleton: true,
    /**
     * Used for testing
     */
    pendingRequestCount: 0,
    config: {
        /**
         * @cfg {Array} batch
         */
        batch: null,
        /**
         * @cfg {Boolean} batchMode
         */
        batchMode: false
    },
    initBatch() {
        this.setBatchMode(true);
        this.setBatch([]);
    },
    /**
     * @param {Function} callback
     * @return {Number}
     */
    runBatch(callback) {
        if (!this.getBatchMode())
            return;
        this.setBatchMode(false);
        const params = [];
        const batch = this.getBatch();
        let request;
        if (!batch.length)
            return null;
        for (let i = 0, batchItem; batchItem = batch[i]; i++)
            params.push(batchItem.params);
        request = this.request({
            disableCaching: false,
            timeout: 60000,
            method: 'POST',
            url: CJ.constant.request.batch,
            params: { requests: Ext.encode(params) },
            stash: {
                batch,
                batchCallback: callback || Ext.emptyFn
            },
            scope: this,
            success: this.onBatchSuccess,
            failure: this.onBatchFailure
        });    // the request could be canceled by session reasons
        // the request could be canceled by session reasons
        return request ? request.id : null;
    },
    onBatchSuccess(result, request) {
        const stash = request.stash, batch = stash.batch, batchCallback = stash.batchCallback;
        Ext.each(result.responses, (response, index) => {
            const request = batch[index];
            if (response.success) {
                response.ret.request = request;
                Ext.callback(request.success, request.scope, [
                    response,
                    request
                ]);
            } else {
                Ext.callback(request.failure, request.scope, [
                    response,
                    request
                ]);
            }
            Ext.callback(request.callback, request.scope, [
                request,
                true,
                response
            ]);
        });
        Ext.callback(batchCallback, this, [result]);
    },
    /**
     * @param {Number} status
     * @param {Object} request
     * @return {undefined}
     */
    onBatchFailure(status, request) {
        const batch = request.stash.batch, response = {};    // just empty object on error.
        // just empty object on error.
        Ext.each(batch, item => {
            item.aborted = request.aborted;
            Ext.callback(item.failure, item.scope, [
                response,
                item
            ]);
            Ext.callback(item.callback, item.scope, [
                item,
                false
            ]);
        });
    },
    /**
     * Patch document xtypes to the new standard
     * This is a temporary measure until the server returns the right xtypes
     * @param {Object} item
     */
    patchDocumentXtype(item) {
        let j;
        let handler;
        const embed = CJ.view.tool.Embed;
        if (item.nodeCls === 'Answer') {
            if ('view-tool-view-media' == item.xtype) {
                handler = item.url;
                if (handler && Ext.isObject(handler)) {
                    handler = embed.determineDisplay(handler);
                    item.name = handler;
                    item.xtype = `view-tool-view-${ handler }`;
                } else {
                }    // noop - ignore invalid links
            }
        } else if ('view-tool-list' == item.xtype) {
            for (j in item.items) {
                if ('view-tool-view-media' == item.items[j].xtype) {
                    handler = item.items[j].url;
                    if (handler && Ext.isObject(handler)) {
                        handler = embed.determineDisplay(handler);
                        item.items[j].name = handler;
                        item.items[j].xtype = `view-tool-view-${ handler }`;
                    } else {
                    }    // noop - ignore invalid links
                }
            }
        } else if ('view-tool-answer-pending' == item.xtype) {
            item.docId = item.userInfo.id;
        } else if (item.xtype == 'view-tool-reuse-deleted') {
            item.xtype = 'view-block-deleted-block';
        } else if (item.xtype == 'view-tool-reuse-private') {
            item.xtype = 'view-block-private-block';
        }
        return item;
    },
    /**
     * @param {Object} config
     * @param {Object} kwargs
     */
    applyDocumentCommentParams(config, kwargs) {
        const params = config.commentParams;
        if (!params)
            return;
        for (const key in params)
            if (params[key])
                kwargs[key] = params[key];
    },
    /**
     * Makes request to the server.
     * @param {Object} config
     */
    request(config) {
        if (CJ.User.isSessionChanged() && !config.ignoreCookieMatch)
            return CJ.User.loadSession();    // can't use Ext.clone here, because we could use some objects in 
                                             // request.
        // can't use Ext.clone here, because we could use some objects in 
        // request.
        const initialConfig = Ext.apply({}, config);
        if (config.rpc)
            config = this.modifyConfigForRpc(config);
        if (CJ.User.isLogged() || config.safe)
            return this.defaultUserRequest(config, initialConfig);
        else
            return this.publicUserRequest(config, initialConfig);
    },
    /**
     * @param {Object} config
     * @param {Object} initialConfig
     */
    publicUserRequest(config, initialConfig) {
        const server = CJ.constant.publicServer, path = config.url.replace(Core.opts.app_prefix, '');
        Ext.apply(config, {
            useDefaultXhrHeader: false,
            url: CJ.tpl('{0}{1}', server, path)
        });
        config.params = config.params || {};
        Ext.apply(config.params, { lang: CJ.User.getLanguage() });
        return this.defaultUserRequest(config, initialConfig);
    },
    /**
     * @param {Object} config
     * @param {Object} initialConfig
     */
    defaultUserRequest(config, initialConfig) {
        const loadMask = config.loadMask, stash = config.stash || {}, params = config.params, jsonData = config.jsonData;
        if (loadMask)
            CJ.showLoadMask(loadMask);
        if (config.affectPendingRequestCount !== false)
            this.pendingRequestCount++;
        if (this.getBatchMode()) {
            this.getBatch().push({
                loadMask,
                params,
                stash,
                jsonData,
                initialConfig,
                scope: this,
                success: this.onBatchItemRequestSuccess,
                failure: this.onBatchItemRequestFailure,
                callback: this.onBatchItemRequestCallback
            });
            return {};
        }
        return Ext.Ajax.request({
            disableCaching: false,
            timeout: 60000,
            url: config.url,
            headers: config.headers,
            method: config.method || 'POST',
            params,
            async: config.async,
            stash,
            jsonData,
            initialConfig,
            useDefaultXhrHeader: config.useDefaultXhrHeader,
            scope: this,
            success: this.onRequestSuccess,
            failure: this.onRequestFailure,
            callback: this.requestCallback
        });
    },
    onRequestSuccess(response, request) {
        const config = request.initialConfig;
        const success = config.success || Ext.emptyFn;
        const failure = config.failure || Ext.emptyFn;
        const scope = config.scope || CJ.app;
        const json = response.responseText;
        let result = null;
        if (config.affectPendingRequestCount !== false)
            this.pendingRequestCount--;
        if (Ext.isString(json)) {
            result = Ext.decode(json, true);
            if (!result)
                return Ext.callback(failure, scope, [
                    json,
                    request,
                    response
                ]);
        } else {
            result = response;
        }
        Ext.callback(result.success ? success : failure, scope, [
            result,
            request
        ]);
    },
    onRequestFailure(response, request) {
        request.aborted = response.aborted;
        const config = request.initialConfig, failure = config.failure, scope = config.scope || CJ.app;
        if (config.affectPendingRequestCount !== false)
            this.pendingRequestCount--;    //handle 401 - Unauthorized
                                           //this handles the cases where the user get's disconnected
                                           //while being in the software and makes a request
        //handle 401 - Unauthorized
        //this handles the cases where the user get's disconnected
        //while being in the software and makes a request
        if (response.status === 401)
            CJ.User.onLogoutSuccess();
        if (Ext.isFunction(failure))
            return Ext.callback(failure, scope, [
                response.status,
                request
            ]);
        if (request.aborted)
            return;
        if (Core.session && Core.session.system.debug)
            Ext.Msg.alert('msg-alert-error-title', `ajax-error-${ status }`);
    },
    requestCallback(options, success, response) {
        const config = options.initialConfig, callback = config.callback, scope = config.scope || CJ.app;
        if (Ext.isFunction(callback))
            Ext.callback(callback, scope, [
                options,
                success,
                response
            ]);
        if (config.loadMask)
            CJ.hideLoadMask();
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onBatchItemRequestSuccess(response, request) {
        const config = request.initialConfig;
        const success = config.success || Ext.emptyFn;
        const failure = config.failure || Ext.emptyFn;
        const scope = config.scope || this;
        const json = response.responseText;
        let result = null;
        if (Ext.isString(json)) {
            result = Ext.decode(json, true);
            if (!result)
                return Ext.callback(failure, scope, [
                    json,
                    request,
                    response
                ]);
        } else {
            result = response;
        }
        Ext.callback(result.success ? success : failure, scope, [
            result,
            request
        ]);
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onBatchItemRequestFailure(response, request) {
        const config = request.initialConfig, failure = config.failure, scope = config.scope || CJ.app;
        Ext.callback(failure, scope, [
            response.status,
            request
        ]);
    },
    /**
     * @param {Object} options
     * @param {Boolean} success
     * @param {Object} response
     */
    onBatchItemRequestCallback(options, success, response) {
        const config = options.initialConfig, callback = config.callback, scope = config.scope || CJ.app;
        Ext.callback(callback, scope, [
            options,
            success,
            response
        ]);
    },
    /**
     * Sets url and modifies params for rpc request.
     * @param {Object} config
     * @returns {Object}
     */
    modifyConfigForRpc(config) {
        let args = config.args || [];
        if (!Ext.isArray(args))
            args = [args];
        return Ext.apply(config, {
            url: CJ.constant.request.rpc,
            method: config.method || 'POST',
            params: Ext.applyIf(config.rpc, {
                args: Ext.encode(args),
                variant: '',
                kwargs: Ext.encode(config.params || {})
            })
        });
    },
    /**
     * aborts request using it's requestId
     * @param {Number} requestId
     */
    abort(requestId) {
        if (!requestId)
            return;
        const request = Ext.Ajax.requests[requestId];
        if (request)
            Ext.Ajax.abort(request);
    },
    /**
     * Return number of pending requests
     * @returns {Number}
     */
    getPendingRequestCount() {
        return this.pendingRequestCount;
    }
});