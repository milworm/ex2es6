/**
 * The class provide access to the clipboard.
 */
Ext.define('CJ.component.Clipboard', {
    alternateClassName: 'CJ.Clipboard',
    singleton: true,
    /**
     * Copy text to clipboard.
     * @param {Object} config
     *                 config.cmp
     *                 config.text
     *                 config.success
     *                 config.failure
     *                 config.scope
     *                 config.delegate
     */
    copy(config) {
        // requestWrite is needed here, in order to be sure that component
        // is rendered and we have all dom-nodes.
        Ext.TaskQueue.requestWrite(function () {
            if (window.clipboardData)
                this.initIECopy(config);
            else
                this.initModernCopy(config);
        }, this);
    },
    /**
     * handles copy-opration for IE
     * @param {Object} config see #constructor
     * @return {undefined}
     */
    initIECopy(config) {
        config.cmp.element.on('tap', function () {
            const accessed = window.clipboardData.setData('Text', config.text);
            this.onAfterCopy(accessed, config);
        }, this, { delegate: config.delegate });
    },
    /**
     * handles copy-opration for top notch browsers: Chrome, Firefox.
     * @param {Object} config see #constructor
     * @return {undefined}
     */
    initModernCopy(config) {
        config.cmp.element.on('tap', function () {
            const range = document.createRange();
            const node = document.createElement('div');
            let result;
            node.innerHTML = config.text;
            node.classList.add('d-selectable');
            document.body.appendChild(node);
            range.selectNode(node);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            try {
                result = document.execCommand('copy');
            } catch (e) {
            } finally {
                Ext.removeNode(node);
            }
            this.onAfterCopy(result, config);
        }, this, { delegate: config.delegate });
    },
    /**
     * is called after each time we tries to perform copy operation.
     * @param {Boolean} result Was copying successful or not.
     * @param {Object} config
     */
    onAfterCopy(result, config) {
        this[result ? 'onSuccess' : 'onFallback'](config);
    },
    /**
     * when copy-operation was successful.
     * @param {Object} config @see #constructor
     * @return {undefined}
     */
    onSuccess(config) {
        CJ.feedback(CJ.t('clipboard-copied'));
        Ext.callback(config.success, config.scope);
    },
    /**
     * method will be called if we can't automatically perform copy-operation.
     * @param {Object} config @see #constructor
     * @return {undefined}
     */
    onFallback(config) {
        if (config.failure)
            Ext.callback(config.failure, config.scope, [], 1);
        else
            Ext.callback(this.showLinkPopup, this, [config.text], 1);
    },
    /**
     * Renders a popup so user can select and copy a link.
     * @return {undefined}
     */
    showLinkPopup(link) {
        CJ.core.view.SelectableText.popup({
            title: 'block-link-popup-title',
            text: link
        });
    }
});