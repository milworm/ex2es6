import 'app/view/tool/Base';
import 'app/view/tool/media/Editing';

/**
 * Defines base class for all tools that should use media-editor to be created
 * or edited.
 */
Ext.define('CJ.view.tool.media.Tool', {
    extend: 'CJ.view.tool.Base',
    inheritableStatics: {
        /**
         * @param {Object} config
         */
        showEditing(config undefined {}) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                cls: 'd-popup-transparent d-answer-media-popup',
                title: CJ.tpl('view-tool-media-tool-{0}-popup-title', this.toolType),
                content: Ext.apply({ xtype: 'view-tool-media-editing' }, config.content),
                actionButton: { text: 'view-answer-type-media-popup-submit-button-text' }
            }, config.popup));
        }
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onEdited(popup) {
        this.getParent().replace(this, popup.getContent().getPreview().serialize());
    },
    /**
     * shows a popup to edit a tool.
     */
    onMenuEditTap() {
        const values = this.getValues();
        this.self.showEditing({
            popup: {
                listeners: {
                    scope: this,
                    actionbuttontap: this.onEdited
                }
            },
            content: {
                urlField: { value: values.cfg.url },
                preview: {
                    xtype: this.xtype,
                    values
                }
            }
        });
    }
});