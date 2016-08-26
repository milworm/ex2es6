import 'app/core/view/list/Base';
import 'app/view/tool/text/Tool';
import 'app/core/view/list/Draggable';

/**
 * Defines a component that is used to display list of different apps/tools
 * (images, text, formulas, video etc) and allow user to edit them and change
 * their order using drag and drop.
 */
Ext.define('CJ.core.view.list.Editor', {
    extend: 'CJ.core.view.list.Base',
    alias: 'widget.core-view-list-editor',
    mixins: { editable: 'CJ.view.mixins.Editable' },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-editor-list unitTest',
        /**
         * @cfg {String} dragGroup
         */
        dragGroup: 'tools',
        /**
         * @cfg {Boolean} editing
         */
        editing: null,
        /**
         * @cfg {Object} scrollable
         */
        scrollable: null,
        /**
         * @cfg {CJ.core.view.list.Draggable} draggable
         */
        draggable: null
    },
    /**
     * @param {Object} config
     * @return {CJ.core.view.list.Draggable}
     */
    applyDraggable(config) {
        if (!config)
            return false;
        return Ext.create('CJ.core.view.list.Draggable', Ext.apply({
            component: this,
            element: this.element,
            listeners: {
                scope: this,
                drop: this.onItemDrop
            }
        }, config));
    },
    /**
     * @param {Ext.Base} newInstance
     * @param {Ext.Base} oldInstance
     * @return {undefined}
     */
    updateDraggable(newInstance, oldInstance) {
        if (oldInstance)
            oldInstance.destroy();
    },
    /**
     * @param {Array} items
     * @return {Array}
     */
    applyItems(items) {
        items = Ext.isArray(items) ? items : [items];
        const editing = this.initialConfig.editing;
        for (let i = 0, item; item = items[i]; i++)
            item.editing = editing;
        return this.callParent(args);
    },
    /**
     * adds empty tools if needed in order to maintain list integrity
     * @return {undefined}
     */
    addEmptyTextTools() {
        const tools = this.query('[isTool]'), items = this.getItems();
        if (tools.length == 0)
            return this.add(this.getEmptyTextToolConfig());
        if (!tools[0].isText)
            this.insert(0, this.getEmptyTextToolConfig());
        for (let i = 0, tool; tool = tools[i]; i++) {
            const index = items.indexOf(tool), nextTool = items.getAt(index + 1);
            if (tool.isText)
                continue;
            if (!nextTool)
                break;
            if (!nextTool.isText)
                this.insert(index + 1, this.getEmptyTextToolConfig());
        }    // end of list
        // end of list
        if (!tools[tools.length - 1].isText)
            this.add(this.getEmptyTextToolConfig());
    },
    /**
     * removes empty tools if needed in order to skip saving empty-text tools.
     * @return {undefined}
     */
    removeEmptyTextTools() {
        this.getItems().each(tool => {
            if (tool.isText && tool.isEmpty())
                tool.destroy();
        });
    },
    /**
     * @param {Boolean} state
     */
    updateEditing(state) {
        if (state)
            this.addEmptyTextTools();
        else
            this.removeEmptyTextTools();
        this.setDraggable(state);
        this[state ? 'on' : 'un']({
            afterremovelistitem: this.updateHasMedia,
            afteraddlistitem: this.updateHasMedia,
            scope: this
        });
        if (!state)
            return;
        this.updateHasMedia();
    },
    /**
     * Find the index where to insert new item, given cursor position
     * If there is no cursor, returns index at end of list.
     * @param {Object} selection
     * @return {Number} index
    */
    determineIndex(selection) {
        var selection = this.getTextSelection();
        if (selection) {
            const node = selection.focusNode;
            const offset = selection.focusOffset;
            const type = selection.type;
            const types = [
                'Caret',
                'Range'
            ];
            let cursorInText = !!node;
            if (cursorInText && !Ext.browser.is.IE && !Ext.browser.is.Firefox)
                cursorInText = types.indexOf(type) > -1;
            if (cursorInText)
                return this.indexOf(selection.tool);
        }
        return this.getItems().getCount();
    },
    /**
     * @return {Object} configuration for empty text tool
     */
    getEmptyTextToolConfig() {
        return {
            xtype: 'view-tool-text',
            docId: CJ.Guid.generatePhantomId(),
            editing: true,
            content: '',
            parent: this
        };
    },
    /**
     * Optionally insert a text tool when adding another tool,
     * to maintain list integrity.
     *
     * @param {Number} index
     * @return {Number} index New index after changing a list.
     */
    insertTextTool(index) {
        const selection = this.getTextSelection(), textConfig = this.getEmptyTextToolConfig();    /**
         * https://redmine.iqria.com/issues/9937
         * Issue: #9937
         * In IE10/IE11, when adding an ordered list or an unordered list,
         * content editable replaces the dom element with another one without
         * without the ID , therefore tool won't be existent.
         */
        /**
         * https://redmine.iqria.com/issues/9937
         * Issue: #9937
         * In IE10/IE11, when adding an ordered list or an unordered list,
         * content editable replaces the dom element with another one without
         * without the ID , therefore tool won't be existent.
         */
        if (!(selection && selection.tool)) {
            this.add(textConfig);
            return this.getItems().getCount() - 1;
        }
        const tool = selection.tool;
        const root = tool.element.dom.querySelector('.editor_mode');
        let first = root;
        let last = root;
        const position = selection.focusOffset;
        const node = selection.focusNode;
        if (first.firstChild)
            first = first.firstChild;
        if (last.lastChild)
            last = last.lastChild;    // insert at the beginning
        // insert at the beginning
        if (first == node && position == 0) {
            this.insert(index++, textConfig);
            return index;
        }    // insert at the end
        // insert at the end
        if (last == node && node.textContent.length == position) {
            this.insert(++index, textConfig);
            return index;
        }    // otherwise, split text tool at cursor into two text tools
        // otherwise, split text tool at cursor into two text tools
        const segment = this.splitDomTree(root, node, position);
        for (let i = 0, child; child = segment.childNodes[i]; i++)
            if (child.nodeType == document.TEXT_NODE)
                textConfig.content += child.textContent;
            else
                textConfig.content += child.outerHTML;
        this.insert(++index, textConfig);
        return index;
    },
    /**
     * Split up the dom tree of a text tool so that it can be
     * broken into two separate text tools
     * @param {HTMLElement} root
     * @param {HTMLElement} node
     * @param {Number} position
     */
    splitDomTree(root, node, position) {
        let sub, next;
        if (root.nodeType == document.TEXT_NODE) {
            if (node.textContent.length == position)
                return null;
            return node.splitText(position);
        }
        const result = document.createElement(root.tagName);
        let pivot = node;
        while (pivot && pivot.parentNode != root)
            pivot = pivot.parentNode;
        if (pivot) {
            next = pivot.nextSibling;
            while (next) {
                result.appendChild(next);
                next = pivot.nextSibling;
            }
            sub = this.splitDomTree(pivot, node, position);
            if (sub)
                result.insertBefore(sub, result.firstChild);
        }
        return result;
    },
    /**
     * @return {Object}
     */
    getTextSelection() {
        if (!this.getEditing())
            return null;
        return this.getEditor().getTextSelection();
    },
    resetChanges() {
        const config = this.initialConfig, editing = config.editing;
        Ext.Base.prototype.initConfig.call(this, config);
        if (!Ext.isDefined(editing))
            this.updateEditing(this.getEditing());
    },
    applyChanges() {
        const changes = {};
        this.getItems().each(item => {
            changes[item.getId()] = item.applyChanges();
        });
        return changes;
    },
    /**
     * @param {Boolean} includeEmptyTools
     * @return {Object}
     */
    serialize(includeEmptyTools) {
        const items = [];
        this.getItems().each(item => {
            if (!includeEmptyTools && item.isText && item.isEmpty())
                return;
            items.push(item.serialize());
        }, this);
        return {
            xtype: this.xtype,
            // @TODO remove this line when server is ready.
            items
        };
    },
    /**
     * @param {Ext.Component} item
     */
    addListItem(item, skipText) {
        let index = this.determineIndex();
        if (!skipText)
            index = this.insertTextTool(index);
        item.parent = this;
        this.insert(index, item);
        this.fireEvent('afteraddlistitem', this);
    },
    /**
     * @param {Number} index
     * @param {Object} item
     */
    insert(index, item) {
        // @TODO this is needed in order to be able to access parent during
        // component's initialization.
        item.parent = this;
        item.editing = this.getEditing();
        return this.callParent(args);
    },
    /**
     * Removes specified item, maintaining list integrity
     * @param {CJ.view.tool.Base} item
     */
    removeListItem(item) {
        const index = this.indexOf(item);
        this.remove(item, true);
        const prevTool = this.getAt(index - 1), nextTool = this.getAt(index);
        this.merge(prevTool, nextTool);
        this.fireEvent('afterremovelistitem', this);
    },
    /**
     * will be called after user adds or removes some list item,
     * adds/removes d-has-media css-class.
     * @return {undefined}
     */
    updateHasMedia() {
        const node = this.element.dom;
        if (this.getItems().getCount() == 1)
            node.classList.remove('d-has-media');
        else
            node.classList.add('d-has-media');
        const editor = this.getEditor();
        editor && editor.onChange();
    },
    /**
     * Merge two neighbouring text tools into one
     * @param {CJ.view.tool.text.Tool} prevTool
     * @param {CJ.view.tool.text.Tool} nextTool
     */
    merge(prevTool, nextTool) {
        if (!prevTool.isText || !nextTool.isText)
            return;
        prevTool.applyChanges();
        nextTool.applyChanges();
        const prevContent = prevTool.getContent(), nextContent = nextTool.getContent();
        if (nextTool.isEmpty())
            return this.remove(nextTool);
        if (prevTool.isEmpty())
            return this.remove(prevTool);
        this.remove(nextTool);
        prevTool.setContent(prevContent + nextContent);
    },
    /**
     * simply replaces tool1 with tool
     * @param {CJ.view.tool.Base} tool1
     * @param {CJ.view.tool.Base} tool
     * @return {undefined}
     */
    replace(tool1, tool) {
        const index = this.indexOf(tool1);
        this.remove(tool1);
        this.insert(index, tool);
    },
    /**
     * @param {CJ.view.tool.base.Tool} droppableTool
     * @param {CJ.view.tool.base.Tool} draggableTool
     * @param {String} position
     */
    onItemDrop(droppableTool, draggableTool, position) {
        const originIndex = this.indexOf(draggableTool);
        let index = this.indexOf(droppableTool);
        if (originIndex < index && position == 'before')
            index--;
        if (originIndex == index)
            return false;
        const originPrevItem = this.getAt(originIndex - 1), originNextItem = this.getAt(originIndex + 1);
        droppableTool = this.insertListItem(index, draggableTool);
        let insertIndex = this.indexOf(draggableTool);
        const prevItem = this.getAt(insertIndex - 1);
        let nextItem;    // if prev item isn't a text, we have to add empty tool
        // if prev item isn't a text, we have to add empty tool
        if (!prevItem || !prevItem.isText) {
            this.insert(insertIndex, this.getEmptyTextToolConfig());
            insertIndex += 1;
        }
        nextItem = this.getAt(insertIndex + 1);    // if next item isn't a text, we have to add empty tool
        // if next item isn't a text, we have to add empty tool
        if (!nextItem || !nextItem.isText)
            this.insert(insertIndex + 1, this.getEmptyTextToolConfig());    // mantain integrity for old sibling text-tools
        // mantain integrity for old sibling text-tools
        this.merge(originPrevItem, originNextItem);
    },
    /**
     * @inheritdoc
     */
    getScrollEl() {
        if (this.getEditing())
            return this.getEditor().getScrollEl();
        return this.callParent(args);
    },
    /**
     * @return {CJ.view.block.defaults.Editor}
     */
    getEditor() {
        return this.up('[isEditor]');
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setDraggable(false);
    }
});