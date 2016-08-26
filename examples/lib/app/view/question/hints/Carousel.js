import 'Ext/Component';

/**
 * Class is used to show question's hints.
 */
Ext.define('CJ.view.question.hints.Carousel', {
    /**
	 * @cfg {String} extend
	 */
    extend: 'Ext.Component',
    /**
	 * @property {String} alias
	 */
    alias: 'widget.view-question-hints-carousel',
    /**
	 * @property {Object} statics
	 */
    statics: {
        /**
		 * @param {String} blockId
		 * @return {Ext.Component}
		 */
        show(blockId) {
            return Ext.factory({
                xtype: this.xtype,
                blockId
            });
        }
    },
    /**
	 * @property {Object} config
	 */
    config: {
        /**
		 * @cfg {String} cls
		 */
        cls: 'd-hints-carousel',
        /**
		 * @cfg {CJ.view.block.Block} block
		 */
        block: null,
        /**
		 * @cfg {Number} index
		 */
        index: null,
        /**
		 * @cfg {Array} items
		 */
        items: null,
        /**
		 * @cfg {String} direction
		 */
        direction: 'none',
        /**
		 * @cfg {Object} data
		 */
        data: null,
        /**
		 * @cfg {Ext.XTemplate} tpl
		 */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-preview"></div>', '<tpl if="hasButtons">', '<div class="d-buttons">', '<div class="d-button d-prev" data-action="prev">{prev}</div>', '<div class="d-button d-next" data-action="next">{next}</div>', '</div>', '</tpl>')
    },
    constructor(config) {
        this.callParent(args);
        this.load(config.blockId);
        this.element.on('tap', this.onButtonTap, this, {
            delegate: [
                '.d-button',
                '.d-preview'
            ]
        });
    },
    /**
	 * @param {String} id
	 * @return {undefined}
	 */
    load(id) {
        CJ.LoadBar.run();
        CJ.Block.load(id, {
            scope: this,
            success: this.onLoadSuccess,
            failure: this.onLoadFailure,
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    onLoadFailure() {
    },
    /**
	 * @param {Object} response
	 * @return {undefined}
	 */
    onLoadSuccess(response) {
        const block = Ext.factory(response.ret);
        let items;
        if (block.isPlaylist)
            items = block.getPlaylist();
        else
            items = [response.ret];
        items = items.map(item => Ext.factory(item));
        this.setItems(items);
        this.setIndex(0);
        this.setData({});
        this.popup();
    },
    updateData() {
        this.innerElement.setHtml(this.getTpl().apply({
            hasButtons: this.getItems().length > 1,
            prev: CJ.t('view-question-hints-carousel-prev'),
            next: CJ.t('view-question-hints-carousel-next')
        }));
    },
    /**
	 * @param {Object} config
	 * @return {CJ.view.block.BaseBlock}
	 */
    updateBlock(config) {
        if (!config)
            return false;
        return config;
    },
    /**
	 * @param {Ext.Event} e
	 * @return {undefined}
	 */
    onButtonTap(e) {
        let target, action;
        target = e.getTarget('.d-preview .d-fake');
        if (target) {
            // event passtrough for activating fake tool
            const block = this.getItems()[this.getIndex()], list = block ? block.getList() : null;
            if (!list)
                return;
            Ext.callback(list.onFakeToolTap, list, arguments);
            return;
        }
        target = e.getTarget('.d-button');
        if (target) {
            action = CJ.Utils.getNodeData(target, 'action');
            this[action]();
        }
    },
    /**
	 * @return {undefined}
	 */
    prev() {
        this.setDirection('prev');
        this.setIndex(this.getIndex() - 1);
    },
    /**
	 * @return {undefined}
	 */
    next() {
        this.setDirection('next');
        this.setIndex(this.getIndex() + 1);
    },
    /**
	 * @param {Number} index
	 * @param {Number} oldIndex
	 * @return {undefined}
	 */
    applyIndex(index) {
        const length = this.getItems().length;
        if (index < 0)
            index = length - 1;
        else if (index == length)
            index = 0;
        return index;
    },
    /**
	 * @param {Number} index
	 * @param {Number} oldIndex
	 * @return {undefined}
	 */
    updateIndex(index, oldIndex) {
        const items = this.getItems(), newItem = items[index] ? items[index].getList() : null, oldItem = items[oldIndex] ? items[oldIndex].getList() : null, me = this;
        Promise.resolve().then(() => {
            if (oldItem)
                return me.hideItem(oldItem);
        }).then(() => me.showItem(newItem));
    },
    /**
	 * @param {Ext.Component} component
	 * @return {Promise}
	 */
    hideItem(component) {
        const cls = `d-hide-${ this.getDirection() }`;
        component.addCls(cls);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Ext.removeNode(component.element.dom);
                component.removeCls(cls);
                resolve();
            }, 250);
        });
    },
    /**
	 * @param {Ext.Component} component
	 * @return {Promise}
	 */
    showItem(component) {
        const node = this.element.dom.querySelector('.d-preview'), cls = `d-show-${ this.getDirection() }`;
        component.renderTo(node);
        component.addCls(cls);
        component.element.dom.offsetTop;
        component.removeCls(cls);
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 250);
        });
    },
    /**
	 * shows a popup.
	 */
    popup() {
        return Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-hints-carousel-popup',
            actionButton: false,
            content: this
        });
    }
});