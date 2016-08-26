import 'app/view/tool/embed/Tool';

Ext.define('CJ.view.tool.app.Tool', {
    extend: 'CJ.view.tool.embed.Tool',
    alias: 'widget.view-tool-app-tool',
    customToolsInstances: {},
    config: {
        /**
         * @cfg {Object} popup
         */
        popup: null,
        /**
         * @cfg {Boolean} isEditor
         */
        isEditor: false,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-tool-app d-iframe',
        /**
         * @cfg {Object} values the only data stored on the server from the tool
         */
        values: {
            app: null,
            coverUrl: null,
            data: {}
        },
        /**
         * @cfg {String} instanceIDNotSet
         */
        instanceIDNotSet: 'INSTANCE_NOT_SET',
        /**
         * @cfg {String} requestDataEventName
         */
        requestDataEventName: 'requestData',
        /**
         * @cfg {String} appReadyEventName
         */
        appReadyEventName: 'appReady',
        /**
         * @cfg {String} dataSaveEventName
         */
        dataSaveEventName: 'saveData',
        /**
         * @cfg {String} dataSaveEventName
         */
        dataSaveRequestEventName: 'saveDataRequest',
        /**
         * @cfg {String} closeRequestEventName
         */
        closeRequestEventName: 'closeRequest',
        /**
         * @cfg {String} dataLoadEventName
         */
        dataLoadEventName: 'loadData',
        /**
         * @cfg {String} resizeEventName
         */
        resizeRequestEventName: 'resizeRequest',
        /**
         * @cfg {Object} customEventNames
         */
        customEventNames: {
            'requestColorPicker': 'requestColorPicker',
            'colorPickerDone': 'colorPickerDone',
            'requestColorPickerClose': 'requestColorPickerClose'
        },
        /**
         * @cfg {Boolean} allowResize
         */
        allowResize: false,
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<tpl if="isCovered">', '<div class="d-cover d-hard" id="app_tool_hard_cover" style="background-image: url(\'{coverUrl}\')"></div>', '<tpl else>', '<iframe id="app_tool_iframe" ', 'type="text/html" ', 'frameBorder="0" ', 'scrolling="no" ', 'allowfullscreen>', '</iframe>', '</tpl>', { compiled: true })
    },
    inheritableStatics: {
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.Template', '<div data-tool-index="{toolIndex}" class="d-tool-app">', '<div class="d-cover d-hard" data-tool-index="{toolIndex}" id="app_tool_hard_cover" style="background-image: url(\'{values.coverUrl}\')"></div>', '</div>', { compiled: true }),
        /**
         * @param {Object} config
         * @return {Object} instance of self.
         */
        showEditing(config undefined {}) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                cls: 'd-popup-transparent d-tool-app-popup',
                title: CJ.t('view-tool-app-tool-popup-title'),
                content: Ext.apply({
                    xtype: this.prototype.xtype,
                    isCovered: false,
                    isEditor: true
                }, config.content),
                actionButton: {
                    cls: 'action-button okButton',
                    text: 'view-answer-type-media-popup-submit-button-text'
                },
                listeners: {
                    scope: this,
                    actionbuttontap(popup) {
                        const content = popup.getContent();
                        content.requestAppData();
                        return false;
                    }
                }
            }, config.popup));
        },
        /**
         * @param {Function} callback
         * @param {Object} values
         * @param {Boolean} editInViewMode          this will dicate edit or view mode of the application
         * @param {Boolean} hasOwnSumbitButton      used for answers when application has it's own internal
         *                                          mechanism for submitting values
         * @return {Object} instance of self.
         */
        onAppSelected(callback, values, editInViewMode, hasOwnSubmitButton) {
            const me = this;
            values = values || {}, config = {
                content: {
                    listeners: {
                        datasaved(tool) {
                            callback(tool);    //Close popup
                            //Close popup
                            if (!hasOwnSubmitButton)
                                tool.getParent().hide();
                        },
                        closerequested(tool) {
                            tool.getParent().hide();
                        }
                    },
                    values
                },
                popup: {}
            };
            if (editInViewMode)
                config.content.isEditor = false;
            if (hasOwnSubmitButton)
                config.popup.actionButton = false;
            return this.showEditing(config);
        }
    },
    onMenuEditTap() {
        const values = this.getValues(), me = this;
        if (!me.getIsCovered()) {
            me.cover();
        }
        this.self.onAppSelected(tool => {
            me.setValues(tool.applyChanges());
        }, values);
    },
    requestAppData() {
        this.postMessageToApp({ action: this.getRequestDataEventName() });
    },
    /**
     * @param {Object} dataIn
     */
    onAppReady(dataIn) {
        const data = dataIn.data, values = this.getValues(), popup = this.getPopup(), appSettings = this.grabAppSettings();
        if (appSettings.allowResize && data && data.aspectRatio)
            this.doResizeByAspect(data.aspectRatio);
        if (popup && appSettings.title)
            popup.setTitle(appSettings.title);
        this.postMessageToApp({
            edit: this.getIsEditor(),
            action: this.getDataLoadEventName(),
            data: values.data,
            language: CJ.User.getLanguage(),
            isMobile: !Ext.os.is.Desktop,
            instanceID: this.id
        });
    },
    /**
     * @param {Number} aspect
     */
    doResizeByAspect(aspect) {
        const height = this.innerHtmlElement.getWidth() / aspect;    // prevent NaN setup
        // prevent NaN setup
        if (height > 0)
            this.innerHtmlElement.setHeight(height);
    },
    doResizeBeforeLoad(aspectSettings) {
        // verify if we have both modes in aspectSettings
        if (!(aspectSettings.view && aspectSettings.edit))
            return;
        const element = this.innerHtmlElement;
        let mode = 'view';
        let device = 'desktop';
        if (this.getIsEditor())
            mode = 'edit';
        if (!Ext.os.is.Desktop)
            device = 'mobile';
        if (Ext.os.is.Tablet)
            device = 'tablet';    // verifiy if we have tablet device in the mode
        // verifiy if we have tablet device in the mode
        if (!aspectSettings[mode]['tablet'] && device == 'tablet')
            device = 'mobile';    // lastly verify if we have the settings for the specific device
        // lastly verify if we have the settings for the specific device
        if (!aspectSettings[mode][device])
            return;
        element.setHeight(element.getWidth() * aspectSettings[mode][device]);
    },
    /**
     * @param {Object} dataIn
     */
    onAppOnDataSave(dataIn) {
        this.setValues(Ext.apply(this.getValues(), {
            coverUrl: dataIn.coverUrl || dataIn.data.coverUrl,
            data: dataIn.data
        }));
        this.fireEvent('datasaved', this);
    },
    /**
     * @param {Object} dataIn
     */
    onAppOnCloseRequested() {
        this.fireEvent('closerequested', this);
    },
    /**
     * @return {Object} app settings
     */
    grabAppSettings() {
        const appName = this.getValues().app;
        const
        //[TODO] When backend will hold the external apps this will be changed to match the addres , until then this will be here
        apps = Core.externalApps;
        let appSettings = {
            url: '',
            allowResize: false
        };
        if (apps.hasOwnProperty(appName))
            appSettings = Ext.apply(appSettings, apps[appName]);
        return appSettings;
    },
    /*
     * @param {Object} config
     */
    renderPreviewTpl(config) {
        const me = this, isCovered = this.getIsCovered(), tpl = this.getPreviewTpl(), values = this.getValues(), appSettings = this.grabAppSettings(), appUrl = appSettings.url, appAspectRatios = appSettings.aspectRatios, data = Ext.apply({ isCovered }, values);
        this.setHtml(tpl.apply(data));
        if (isCovered)
            return;
        me.iframe = me.element.query('#app_tool_iframe')[0] || null;
        if (me.iframe) {
            if (appAspectRatios)
                this.doResizeBeforeLoad(appAspectRatios);
            window.addEventListener('message', me.onMessageReceived.bind(me));
            Ext.TaskQueue.requestWrite(function () {
                if (appAspectRatios)
                    this.doResizeBeforeLoad(appAspectRatios);
                this.iframe.src = appUrl;
            }, this);
        }
    },
    destroy() {
        window.removeEventListener('message', this.onMessageReceived.bind(this));
        this.callParent(args);
    },
    /**
     * @param {Event} e
     */
    onMessageReceived(e) {
        const me = this;
        const customEventNames = me.getCustomEventNames();
        let data;
        if (e.data && e.source === me.iframe.contentWindow) {
            data = JSON.parse(e.data);    //@NOTE Filter out other iframes messages.
            //@NOTE Filter out other iframes messages.
            if (data.instanceID != me.id && data.instanceID != me.getInstanceIDNotSet())
                return;
            switch (data.action) {
            case me.getAppReadyEventName():
                me.onAppReady(data);
                break;
            case me.getDataSaveEventName():
                me.onAppOnDataSave(data);
                break;
            case me.getDataSaveRequestEventName():
                me.requestAppData();
                break;
            case me.getCloseRequestEventName():
                me.onAppOnCloseRequested();
                break;
            case customEventNames.requestColorPicker:
                me.onColorPickerRequest(data);
                break;
            case customEventNames.requestColorPickerClose:
                me.onCustomToolCloseRequest('colorPicker');
                break;
            case me.getResizeRequestEventName():
                if (this.grabAppSettings().allowResize && data.aspectRatio)
                    me.doResizeByAspect(data.aspectRatio);
                break;
            }
        }
    },
    onCustomToolCloseRequest(tool) {
        toolsInstances = this.customToolsInstances;
        switch (tool) {
        case 'colorPicker':
            if (toolsInstances.colorPicker && !toolsInstances.colorPicker.isDestroyed) {
                if (toolsInstances.colorPicker['close'])
                    toolsInstances.colorPicker.close();
            }
            break;
        }
    },
    onColorPickerRequest(data) {
        this.onCustomToolCloseRequest('colorPicker');
        this.customToolsInstances.colorPicker = CJ.ColorPicker.showTo({
            value: data.color || '',
            hasOpacity: false,
            determineMobile: true,
            domTarget: this.iframe,
            popover: { position: 'middle middle' },
            listeners: {
                'setcolor': this.onColorPickerChoiceMade,
                scope: this
            }
        });
    },
    onColorPickerChoiceMade(color) {
        this.postMessageToApp({
            action: this.getCustomEventNames().colorPickerDone,
            color
        });
    },
    /**
     * @param {Object} data
     */
    postMessageToApp(data) {
        if (this.iframe && !this.getIsCovered())
            this.iframe.contentWindow.postMessage(JSON.stringify(data), '*');
    }
});    /**
 * CJ.view.tool.app.Tool comunication protocol briefing
 *
 * Initialization:
 * CJ.view.tool.app.Tool creates iframe with url of the external application
 * external application sends event that is ready
 * if we allow resizing we will resize the CJ.view.tool.app.Tool to the required ratio dictated by the external app
 *
 *
 * Saving data with Submit button:
 * CJ.view.tool.app.Tool gets user input (submit button)
 * then it fires an event to the external app to request the data
 * external app will answer the event with another event that's save data
 * CJ.view.tool.app.Tool will then store values and then fire the internal event 'datasaved' with self as parameter
 * so other parts of CJ can listen to event and aquire the parameter settings
 *
 * Saving data with external app mechanism (no submit button):
 * (preferably in view mode) (intended for Boomath2 behaviour)
 * external application will do its logic then fire an event to request data saving
 * CJ.view.tool.app.Tool recieves the event then triggers the same way the saving with submit button works
 */