import 'app/view/tool/Base';

Ext.define('CJ.view.tool.quote.Tool', {
    extend: 'CJ.view.tool.Base',
    alias: 'widget.view-tool-quote-tool',
    config: {
        cls: 'd-tool d-quote-editing',
        values: { quoteText: null },
        previewTpl: Ext.create('Ext.XTemplate', '<blockquote class="d-tool d-quote">{[this.getText(values.quoteText)]}</blockquote>', {
            getText(text) {
                return text.replace(new RegExp('\r?\n', 'g'), '<br>');
            }
        })
    },
    statics: {
        showEditing(config undefined {}) {
            if (config.values.quoteText)
                config.values.quoteText = CJ.core.Utils.decodeHtml(config.values.quoteText);
            return Ext.factory(Ext.apply(config, {
                xtype: 'core-view-popup',
                title: CJ.t('view-tool-quote-tool-editing-title'),
                content: {
                    xtype: 'core-view-form-growfield',
                    placeHolder: CJ.t('view-tool-quote-tool-editing-input-placeholder'),
                    maxFieldHeight: 400,
                    modern: false,
                    value: config.values.quoteText
                },
                actionButton: {
                    cls: 'action-button okButton',
                    text: CJ.t('view-tool-quote-tool-editing-submit')
                }
            }));
        },
        previewTpl() {
            const text = this.values.quoteText.replace(new RegExp('\r?\n', 'g'), '<br>');
            return `<blockquote class="d-tool d-quote">${ text }</blockquote>`;
        }
    },
    onMenuEditTap() {
        this.self.showEditing({
            listeners: { actionbuttontap: Ext.bind(this.onEdited, this) },
            values: this.getValues()
        });
    },
    onEdited(config) {
        this.setValues({ quoteText: config.getContent().getValue() });
    },
    applyValues(config) {
        config.quoteText = Ext.htmlEncode(config.quoteText);
        return config;
    }
});