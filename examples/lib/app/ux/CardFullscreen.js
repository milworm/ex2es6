import 'Ext/Container';

/*
* class which create FullScreen with toolbar and iframe 
*/
Ext.define('Ux.CardFullscreen', {
    extend: 'Ext.Container',
    xtype: 'ux-cardFullscreen',
    config: {
        toolbar: true,
        frame: true,
        link: '',
        showAnimation: 'fadeIn',
        hideAnimation: 'fadeOut',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        style: 'background-color: black;',
        cls: 'embedCard'
    },
    show() {
        this.callParent(args);
        CJ.PopupManager.onShow(this);
    },
    /**
     * also unbinds extenal attached events
     */
    hide() {
        this.callParent(args);
        CJ.PopupManager.onHide(this);
        this.on('hide', function () {
            this.destroy();
        }, this);
    },
    applyToolbar(config) {
        const me = this;
        let link;
        let cmp;
        if (config === false)
            return false;
        if (config === true)
            config = {};
        link = me.getLink().split('/')[2];
        Ext.applyIf(config, {
            xtype: 'container',
            layout: 'hbox',
            height: 50,
            items: [
                {
                    xtype: 'button',
                    flex: 1,
                    cls: 'toolbarBtn',
                    text: link,
                    listeners: {
                        tap(cmp, e) {
                            window.open(me.getLink());
                        }
                    }
                },
                {
                    xtype: 'button',
                    cls: 'toolbarBtn',
                    flex: 0,
                    text: 'button-close-text',
                    listeners: {
                        tap(cmp, e) {
                            me.hide();
                        }
                    }
                }
            ]
        });
        return Ext.factory(config);
    },
    updateToolbar(newToolbar, oldToolbar) {
        if (newToolbar)
            this.add(newToolbar);
        if (oldToolbar)
            this.remove(oldToolbar);
    },
    applyFrame(config) {
        const me = this;
        if (config === false)
            return false;
        if (config === true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'component',
            width: '100%',
            height: '90%',
            html: me.wrap(me.getLink())
        });
        return Ext.factory(config);
    },
    updateFrame(newFrame, oldFrame) {
        if (newFrame)
            this.add(newFrame);
        if (oldFrame)
            this.remove(oldFrame);
    },
    wrap(code) {
        const result = [
            '<iframe ',
            'id="{0}-iframe" ',
            'type="text/html" ',
            'width="100%" ',
            'height="100%" ',
            'style="background-color: white;position: absolute; left: 0;"',
            'src="{1}" ',
            'frameBorder="0" ',
            'allowfullscreen></iframe>'
        ].join('');
        return Ext.String.format(result, 'CardFullscreen', code);
    }
});