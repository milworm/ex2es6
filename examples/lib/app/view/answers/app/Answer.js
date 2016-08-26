import 'app/view/answers/media/Answer';

Ext.define('CJ.view.answers.app.Answer', {
    extend: 'CJ.view.answers.media.Answer',
    alias: 'widget.view-answers-app-answer',
    config: { app: null },
    statics: { answerType: 'app' },
    onSubmitButtonTap() {
        const me = this, appSettings = me.grabAppSettings();
        if (appSettings.hasSettings) {
            const settings = Ext.clone(me.getSettings());
            settings.data = Ext.apply(settings.data, { isAnswering: true });
            for (let i = 0, validableValues = appSettings.validableValues, ln = validableValues.length; i < ln; i++) {
                delete settings.data[validableValues[i]];
            }
            return CJ.view.tool.app.Tool.onAppSelected(tool => {
                me.save(tool.serialize());
            }, settings, appSettings.hasSettings, appSettings.hasOwnSubmitButton);
        }
        return CJ.view.tool.app.Tool.onAppSelected(tool => {
            me.save(tool.serialize());
        }, { app: me.getApp() }, appSettings.hasSettings, appSettings.hasOwnSubmitButton);
    },
    editSettings() {
        if (!this.grabAppSettings().hasSettings)
            return;
        const me = this;
        CJ.view.tool.app.Tool.onAppSelected(tool => {
            me.editSubmitted(tool);
        }, this.getSettings());
    },
    editSubmitted(tool) {
        this.setSettings(tool.getValues());
    },
    applyDisplayComponent(config) {
        if (!config)
            return false;
        const values = this.getValue(), editMode = !this.isAnswered();
        config = Ext.apply({
            xtype: 'view-tool-app-tool',
            values: values.values,
            isEditor: editMode
        }, config);
        return Ext.factory(config);
    },
    isAutoCheckable() {
        return this.grabAppSettings().selfValidable;
    },
    grabAppSettings() {
        let app = this.getApp();
        const
        //[TODO] When backend will hold the external apps this will be changed to match the addres , until then this will be here
        apps = Core.externalApps;
        let settings = {
            hasSettings: false,
            selfValidable: false,
            hasOwnSubmitButton: false
        };
        if (!app) {
            const value = this.getValue();
            if (value.values)
                app = value.values.app;
        }
        if (apps.hasOwnProperty(app) && apps[app].answer)
            settings = Ext.apply(settings, apps[app].answer);
        return settings;
    },
    getValidState() {
        if (!this.grabAppSettings().selfValidable)
            return 'done';
        if (this.grabValueCorrect())
            return 'correct';
        else
            return 'wrong';
    },
    grabValueCorrect() {
        const value = this.getValue();
        if (value.values && value.values.data && value.values.data.appIsCorrect)
            return true;
        else
            return false;
    },
    applyChanges() {
        this.setIsCorrect(this.grabValueCorrect);
    },
    serialize() {
        this.applyChanges();
        return {
            settings: this.getSettings(),
            isCorrect: this.getIsCorrect(),
            xtype: this.xtype,
            app: this.getApp(),
            value: this.getValue(),
            docId: this.getDocId(),
            appVer: CJ.constant.appVer
        };
    }
});