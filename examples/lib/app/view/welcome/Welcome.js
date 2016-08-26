import 'app/core/view/Component';

Ext.define('CJ.view.welcome.Welcome', {
    /**
     * @property {Boolean} isWelcomePage
     */
    isWelcomePage: true,
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: [
        'widget.view-welcome',
        'widget.view-welcome-welcome'
    ],
    /**
     * @property {Object} 
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-vbox d-hcenter d-vcenter d-welcome-welcome',
        /**
         * @cfg {String} type
         */
        type: 'light',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<h3 class=\'d-title\'>{title}</h3>', '<span class=\'d-hint\'>{hint}</span>', '<div class=\'d-button\'>{button}</div>', '<div class=\'d-contact-info\'>info@challengeu.com - 514-377-9547</div>', { compiled: true }),
        /**
         * @cfg {Ext.Template} videoTpl
         */
        videoTpl: [
            '<div class="d-vbox d-vcenter d-hcenter d-video-popup" id="welcome-video-popup">',
            '<div class="d-video-popup-inner">',
            '<div class="d-close">close</div>',
            '<iframe src="https://www.youtube.com/embed/mXjHy8eg95o" frameborder="0" width="{0}" height="{1}"></iframe>',
            '</div>',
            '</div>'
        ].join('')
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-close', 5))
            return this.hideVideo();
        if (e.getTarget('.d-button', 5))
            return this.showVideo();
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        return Ext.apply({
            title: CJ.t('view-welcome-title'),
            hint: CJ.t('view-welcome-hint'),
            button: CJ.t('view-welcome-button')
        }, data);
    },
    /**
     * shows youtube popup
     */
    showVideo() {
        let w = 560, h = 315;
        if (Ext.os.is.Phone) {
            w = 320;
            h = 180;
        }
        this.element.dom.innerHTML += CJ.tpl(this.getVideoTpl(), w, h);
    },
    /**
     * closes youtube popup
     */
    hideVideo() {
        Ext.removeNode(this.element.dom.querySelector('#welcome-video-popup'));
    }
});