Ext.define('CJ.view.tool.ToolOverlay', {
    alias: 'widget.view-tool-tooloverlay',
    element: null,
    dragging: false,
    mixins: ['Ext.mixin.Observable'],
    config: {
        cls: 'd-tool-overlay',
        tpl: null,
        menuChoices: [{
                text: 'button',
                value: 'button'
            }]
    },
    constructor(config) {
        this.callParent(args);
        config = Ext.applyIf(config, this.config);
        this.initConfig(config);
        this.initElement(config);
        this.attachEvents();
    },
    initElement(config) {
        const element = document.createElement('div');
        element.className = config.cls;
        element.innerHTML = this.renderTpl(config);
        return this.element = Ext.get(element);
    },
    renderTo(element) {
        element.appendChild(this.element);
    },
    renderTpl(config) {
        const template = this.getTpl();
        if (!template)
            return '';
        return template.apply(config);
    },
    onOverlayTap(e) {
        if (!this.dragging)
            CJ.view.popovers.PopoverMenu.showTo({
                target: this.element.dom,
                choices: this.getMenuChoices(),
                callbackScope: this,
                callbackFn: this.onChoiceMade,
                skipFirstTouchend: true
            });
        else
            this.dragging = false;
    },
    onOverlayTouchMove(e) {
        this.dragging = true;
    },
    onChoiceMade(choice) {
        this.fireEvent('onChoiceMade', choice);
    },
    attachEvents() {
        this.element.on('touchmove', this.onOverlayTouchMove, this);
        this.element.on('touchend', this.onOverlayTap, this);
    },
    detachEvents() {
        this.element.un('touchmove', this.onOverlayTouchMove, this);
        this.element.un('touchend', this.onOverlayTap, this);
    },
    addChoice(text, value) {
        const choices = this.getMenuChoices();
        for (let i = choices.length - 1; i >= 0; i--) {
            if (choices[i].value === value)
                return;
        }
        choices.push({
            text,
            value
        });
        this.setMenuChoices(choices);
    },
    removeChoice(value) {
        const choices = this.getMenuChoices();
        let indexToRemove;
        for (let i = choices.length - 1; i >= 0; i--) {
            if (choices[i].value === value) {
                indexToRemove = i;
                break;
            }
        }
        choices.splice(indexToRemove, 1);
        this.setMenuChoices(choices);
    },
    destroy() {
        this.detachEvents();
        this.element.destroy();
        delete this.parent;
        this.callParent(args);
    }
});