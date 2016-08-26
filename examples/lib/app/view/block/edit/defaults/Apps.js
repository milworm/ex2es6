import 'Ext/Component';
import 'app/view/tool/Loader';
import 'app/view/tool/media/Tool';
import 'app/view/tool/audio/Tool';
import 'app/view/tool/image/Tool';
import 'app/view/tool/file/Tool';
import 'app/view/tool/link/Tool';
import 'app/view/tool/video/Tool';
import 'app/view/tool/formula/Tool';
import 'app/view/tool/embed/Tool';
import 'app/view/tool/app/Tool';
import 'app/view/tool/custom/Tool';
import 'app/view/tool/card/Tool';
import 'app/view/tool/quote/Tool';

/**
 *
 *
 */
Ext.define('CJ.view.block.edit.defaults.Apps', {
    extend: 'Ext.Component',
    alias: 'widget.view-block-edit-defaults-apps',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-menu-popup',
                title: 'view-block-edit-defaults-apps-title',
                layout: 'light',
                content: {
                    xtype: this.xtype,
                    editor: config.editor
                }
            });
        },
        popover(config) {
            return Ext.factory(Ext.applyIf({
                xtype: 'core-view-popover',
                innerComponent: Ext.apply({ xtype: this.xtype }, config.innerComponent),
                cls: 'd-no-padding',
                position: {
                    x: 'middle',
                    y: 'bottom'
                }
            }, config));
        }
    },
    config: {
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-button d-icon-image\' data-app-type=\'media\' data-media-type=\'image\'>{image}</div>', '<div class=\'d-button d-icon-video\' data-app-type=\'media\' data-media-type=\'video\'>{video}</div>', '<div class=\'d-button d-icon-audio\' data-app-type=\'media\' data-media-type=\'audio\'>{audio}</div>', '<tpl if=\'enableFile\'>', '<div class=\'d-button d-icon-file\' data-app-type=\'media\' data-media-type=\'file\'>{file}</div>', '</tpl>', '<div class=\'d-button d-icon-formula\' data-app-type=\'formula\'>{formula}</div>', '<div class=\'d-button d-icon-embed\' data-app-type=\'media\' data-media-type=\'link\'>{embed}</div>', //"<div class='d-button d-icon-embed' data-app-type='app' data-app='graphu'>{graphu}</div>"
        { compiled: true }),
        /**
         * @param {String} cls
         */
        cls: 'd-scroll d-menu-items d-apps-menu',
        /**
         * @cfg {Ext.Component} popup
         */
        popup: null,
        /**
         * @cfg {Ext.Component} editor
         */
        editor: null
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onButtonTap, this, { delegate: '.d-button' });
        this.setData({
            image: CJ.t('view-block-edit-defaults-apps-image'),
            video: CJ.t('view-block-edit-defaults-apps-video'),
            audio: CJ.t('view-block-edit-defaults-apps-audio'),
            file: CJ.t('view-block-edit-defaults-apps-file'),
            formula: CJ.t('view-block-edit-defaults-apps-formula'),
            embed: CJ.t('view-block-edit-defaults-apps-embed'),
            graphu: CJ.t('view-block-edit-defaults-apps-graphu'),
            boomath2: CJ.t('view-block-edit-defaults-apps-boomath2'),
            enableFile: !Ext.os.is.iOS || Ext.browser.version.major > 8
        });
    },
    /**
     * @param {Ext.Evented} e
     */
    onButtonTap(e) {
        const target = e.getTarget('.d-button', 5), type = CJ.Utils.getNodeData(target, 'appType');
        if (target.classList.contains('x-item-disabled'))
            return;
        const method = Ext.String.format('on{0}Selected', CJ.capitalize(type));
        Ext.callback(this[method], this, [target]);
    },
    /**
     * method will be called when user taps on formula menu-item
     * shows formula's settings popup.
     */
    onFormulaSelected() {
        this.hideParentContainer();
        CJ.view.tool.formula.Tool.showEditing({ listeners: { actionbuttontap: Ext.bind(this.onFormulaEditSubmit, this) } });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onFormulaEditSubmit(popup) {
        if (popup.down('[isLoading=true]'))
            return false;
        this.getEditor().getList().addListItem({
            xtype: 'view-tool-formula-tool',
            editing: true,
            values: popup.getContent().getValues()
        });
    },
    /**
     * method will be called when user taps on formula menu-item
     * shows formula's settings popup.
     */
    onAppSelected(target) {
        const application = CJ.Utils.getNodeData(target, 'app'), editor = this.getEditor();
        this.hideParentContainer();
        CJ.view.tool.app.Tool.onAppSelected(tool => {
            editor.getList().addListItem(tool.serialize());
        }, { app: application });
    },
    /**
     * @param {HTMLElement} target
     */
    onMediaSelected(target) {
        this.hideParentContainer();
        const type = CJ.Utils.getNodeData(target, 'mediaType'), editor = this.getEditor();
        CJ.view.tool[type].Tool.showEditing({
            popup: {
                listeners: {
                    actionbuttontap(popup) {
                        const tool = popup.getContent().getPreview(), config = tool.serialize();
                        config.editing = true;
                        editor.getList().addListItem(config);
                    }
                }
            }
        });
    },
    hideParentContainer() {
        if (this.getPopup())
            return this.getPopup().hide();
        this.fireEvent('hide', [
            false,
            true
        ]);
    }
});