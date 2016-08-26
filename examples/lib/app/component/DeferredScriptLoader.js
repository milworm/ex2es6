Ext.define('CJ.component.DeferredScriptLoader', {
    alternateClassName: 'CJ.DeferredScriptLoader',
    singleton: true,
    scripts: {
        vis: `${ Core.opts.resources_root }/resources/vendors/vis/dist/vis.min.js`,
        jsPDF: `${ Core.opts.resources_root }/resources/vendors/jspdf.min.js`
    },
    loadScript(config) {
        if (window[config.scriptName])
            return Ext.callback(config.success, config.scope, config.args);
        Ext.Loader.loadScriptFile(this.scripts[config.scriptName], () => {
            Ext.callback(config.success, config.scope, config.args);
        }, () => {
            Ext.callback(config.failure, config.scope, config.args);
        }, this);
    }
});