import 'Ext/app/Controller';

Ext.define('CJ.controller.Locale', {
    extend: 'Ext.app.Controller',
    dict: {},
    init() {
        this.setDict(CJ.User.getLanguage());
        CJ.on('language.change', this.changeLanguage, this);
    },
    setDict(name) {
        if (!Ext.isObject(window.translations[name]))
            return;
        this.dict = window.translations[name];
        if (name === 'en')
            Ext.MessageBox.YESNO = [
                {
                    text: 'No',
                    itemId: 'no'
                },
                {
                    text: 'Yes',
                    itemId: 'yes',
                    ui: 'action'
                }
            ];
        if (name === 'fr')
            Ext.MessageBox.YESNO = [
                {
                    text: 'Non',
                    itemId: 'no'
                },
                {
                    text: 'Oui',
                    itemId: 'yes',
                    ui: 'action'
                }
            ];
    },
    updateDocumentTitle() {
        // Translate document title
        document.title = this.translate('document-title', true);
    },
    changeLanguage(lang) {
        const me = this;
        me.setDict(lang);
        me.updateDocumentTitle();
        me.translateAllNodes(document);    //Check all input fields with label or placeholder config
        //Check all input fields with label or placeholder config
        const inputs = Ext.ComponentQuery.query('[label], [placeHolder]');
        Ext.each(inputs, input => {
            const c = input.config;
            if (c.localeLabel && me.dict[c.localeLabel]) {
                if (Ext.isFunction(input.setLabel)) {
                    input.setLabel(me.dict[c.localeLabel]);
                }
            }
            if (c.localePlaceHolder && me.dict[c.localePlaceHolder]) {
                if (Ext.isFunction(input.setPlaceHolder)) {
                    input.setPlaceHolder(me.dict[c.localePlaceHolder]);
                }
            }
        });    //Check all selectfields, we have to travers their options
               //for a localeText initial config
        //Check all selectfields, we have to travers their options
        //for a localeText initial config
        const selectfields = Ext.ComponentQuery.query('selectfield');
        Ext.each(selectfields, field => {
            const data = field.getStore().getData();
            if (data.length > 0) {
                Ext.each(data.items, rec => {
                    const locale = rec.get('locale');
                    if (locale && rec.get('text') && me.dict[locale]) {
                        rec.set('text', me.dict[locale]);
                    }
                });
            }
        });    //Update all classes than have a cached renderTemplate
               //this could get optimized to only target those that need it
        //Update all classes than have a cached renderTemplate
        //this could get optimized to only target those that need it
        for (const className in Ext.ClassManager.classes) {
            const classProto = Ext.ClassManager.classes[className].prototype;
            if (classProto && className.match('^CJ.') && classProto.getElementConfig && classProto.hasOwnProperty('renderTemplate')) {
                this.translateAllNodes(classProto.renderTemplate);
            }
        }
    },
    translateAllNodes(d) {
        let data = [], string;
        if (!d)
            return;
        if (d.nodeType == 8) {
            if (d.data.length > 0 && d.data[0] === 't') {
                data = d.data.split(' ');
                if (data.length > 1) {
                    string = data[1];
                    d.parentNode.innerHTML = this.translate(string);
                }
            }
        }
        if (!d.childNodes) {
            return;
        }
        for (let i = 0; i < d.childNodes.length; i++)
            this.translateAllNodes(d.childNodes[i]);
    },
    translate(string, nocomment) {
        const me = this;
        let matches;
        let result;
        if (!Ext.isString(string))
            return;
        if (string.indexOf('<!--') > -1) {
            matches = /<!--t ([a-z0-9\-]+) \/\/-->/.exec(string);
            if (matches[1]) {
                string = matches[1];
            }
        }
        if (this.dict[string]) {
            result = this.dict[string];
            if (!nocomment) {
                result = `<!--t ${ string } //-->${ result }`;
            }
        } else {
            result = string;
        }
        return result;
    }
});