import 'Ext/Component';

//[TODO] Strange bug on iOS8.1 Safari, input field not focusing if contenteditable was not focused and blured.
Ext.define('CJ.view.activity.Title', {
    extend: 'Ext.Component',
    alias: 'widget.view-activity-title',
    config: {
        /*
         * @cfg {String} cls
         */
        cls: 'd-activity-title-editing d-hbox',
        /*
         * @cfg {String} titleText
         */
        titleText: null,
        /*
         * @cfg {String} foregroundColor
         */
        foregroundColor: '#fff',
        /*
         * @cfg {String} backgroundColor
         */
        backgroundColor: false,
        /*
         * @cfg {String} titleInputPlaceholder
         */
        titleInputPlaceholder: null,
        /*
         * @cfg {Boolean} editing
         */
        editing: null,
        /*
         * @cfg {Template} editTpl
         */
        editTpl: Ext.create('Ext.Template', '<input type="text" name="title-input" maxlength="50" value="{titleText}" placeholder="{titleInputPlaceholder}" class="d-input d-title-input"/>', '<div class="d-button d-background"></div>', { compiled: true })
    },
    statics: {
        /*
         * @statics {Template} viewTpl
         */
        viewTpl: Ext.create('Ext.Template', '<div class="d-activity-title-view" style="background-color:{backgroundColor};color:{foregroundColor}">{titleText}</div>', { compiled: true })
    },
    /**
     * @param {Event} e
     * @returns {undefined}
     */
    onColorTap(e) {
        if (e.target.classList.contains('d-background'))
            CJ.ColorPicker.showTo({
                value: this.getBackgroundColor() || '',
                determineMobile: true,
                target: e.target,
                listeners: {
                    'setcolor': this.setBackgroundColor,
                    scope: this
                }
            });
    },
    /**
     * @returns {undefined}
     */
    onAllUpdate() {
        if (this.initialized)
            this.fireEvent('change', this);
    },
    /**
     * @returns {undefined}
     */
    renderEditor() {
        let html;
        const me = this;
        const config = this.config;
        config.titleInputPlaceholder = CJ.t('view-activity-title-placeholder', true);
        html = this.getEditTpl().apply(config);
        this.element.dom.innerHTML = html;
        this.element.on('tap', this.onColorTap, this);
        this.element.on('input', this.onAllUpdate, this, {
            delegate: '.d-input',
            buffer: 200
        });    // setting color on buttons
        // setting color on buttons
        this.setBackgroundColor(config.backgroundColor);
    },
    /**
     * @param {Boolean} newState
     * @param {Boolean} oldState
     * @returns {String}
     */
    updateEditing(newState, oldState) {
        if (newState)
            this.renderEditor();
    },
    /**
     * @param {String} config
     * @returns {String}
     */
    applyBackgroundColor(config) {
        const htmlElem = this.element.dom.querySelector('.d-background');
        if (!config) {
            this.setForegroundColor('#000');
        } else {
            this.setForegroundColor('#fff');
        }
        if (htmlElem)
            htmlElem.style.color = config ? config : '#000';
        return config;
    },
    /**
     * @returns {undefined}
     */
    updateBackgroundColor() {
        this.onAllUpdate();
    },
    /**
     * @returns {Boolean}
     */
    isEmpty() {
        return this.getTitleText() ? false : true;
    },
    /**
     * @returns {undefined}
     */
    getValue() {
        const titleInput = this.element.down('[name=title-input]');
        if (titleInput)
            this.setTitleText(titleInput.getValue());
    },
    /**
     * @returns {Object}
     */
    serialize() {
        this.getValue();
        if (this.isEmpty())
            return false;
        return {
            titleText: this.getTitleText(),
            foregroundColor: this.getForegroundColor(),
            backgroundColor: this.getBackgroundColor()
        };
    }
});