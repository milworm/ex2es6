import 'Ext/Component';
import 'app/view/block/edit/defaults/Apps';
import 'app/view/popovers/PopoverMenu';
import 'app/view/tool/InlineLinkTool';

/**
 * Class represents and editor-toolbar which is used to show buttons
 * that allow user to make text to be bold, italic, underline, indice, exposant,
 * and to insert the apps to the editor
 */
Ext.define('CJ.view.block.edit.defaults.Toolbar', {
    extend: 'Ext.Component',
    alias: 'widget.view-block-edit-defaults-toolbar',
    /**
     * @property {Object} textSelection User's selection info
     */
    isDragging: false,
    /**
     * @property {Boolean} isEditorToolbar Always true
     */
    isEditorToolbar: true,
    /**
     * @property {Object} appPopover Used to verify if appPopover is on so it could close it
     */
    appPopover: null,
    /**
     * @property {Object} inlineLinkMenu Used to prevent having 2 inline link menus on screen concurently
     */
    inlineLinkMenu: null,
    /**
     * @property {Object} inlineLinkTool Used to prevent having 2 inline link tools on screen concurently
     */
    inlineLinkTool: null,
    config: {
        cls: 'd-editor-toolbar d-hbox d-vcenter',
        /**
         * @cfg {CJ.view.block.edit.defaults.Editor} editor
         */
        editor: null,
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-inline d-dummy\'></div>', '<div class=\'d-alone-wing d-add-media d-inline\'><div class=\'d-inner-text\'>{addMedia}</div></div>', '<div unselectable=\'on\' data-command=\'bold\' class=\'d-left-wing d-inline d-bold {lang}\'></div>', '<div unselectable=\'on\' data-command=\'italic\' class=\'d-middle-wing d-inline d-italic\'></div>', '<div unselectable=\'on\' data-command=\'underline\' class=\'d-right-wing d-inline d-underline {[ CJ.User.getLanguage() ]}\'></div>', '<div unselectable=\'on\' data-command=\'superscript\' class=\'d-left-wing d-inline d-superscript\'></div>', '<div unselectable=\'on\' data-command=\'subscript\' class=\'d-right-wing d-inline d-subscript\'></div>', '<div unselectable=\'on\' data-command=\'insertunorderedlist\' class=\'d-left-wing d-inline d-unorderedlist\'></div>', '<div unselectable=\'on\' data-command=\'insertorderedlist\' class=\'d-right-wing d-inline d-orderedlist\'></div>', '<tpl if=\'CJ.User.hasPremiumTools()\'>', '<div unselectable=\'on\' data-command=\'justifyleft\'  class=\'d-left-wing d-inline d-justifyleft\'></div>', '<div unselectable=\'on\' data-command=\'justifycenter\' class=\'d-middle-wing d-inline d-justifycenter\'></div>', '<div unselectable=\'on\' data-command=\'justifyright\' class=\'d-right-wing d-inline d-justifyright\'></div>', '<div unselectable=\'on\' data-fasttool=\'quote\' class=\'d-alone-wing d-inline d-quote\'></div>', '</tpl>', '<div unselectable=\'on\' data-fasttool=\'createlink\' class=\'d-alone-wing d-inline d-link\'></div>', '<div class=\'d-inline d-dummy\'></div>', { compiled: true }),
        data: {},
        tooltip: {
            text: 'Add images, videos and more...',
            position: {
                x: 'middle',
                y: 'bottom'
            },
            offset: { x: -20 },
            group: 'editor-nav',
            autoShow: false
        }
    },
    constructor() {
        this.callParent(args);    /*
         * in IE11 and Safari on OSX there are bugs with the selection on touchend
         * that's why there's touchend for mobile only.
         */
        /*
         * in IE11 and Safari on OSX there are bugs with the selection on touchend
         * that's why there's touchend for mobile only.
         */
        let eventType = 'touchstart';
        if (!Ext.os.is.Desktop) {
            eventType = 'touchend';
            this.element.on('touchmove', this.onTouchMoveHandler, this);
        }
        this.element.on(eventType, this.onTouchHandler, this, { delegate: '[unselectable]' });
        this.element.on(eventType, this.onAppsButtonTap, this, { delegate: '.d-add-media' });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        Ext.apply(data, {
            lang: CJ.User.getLanguage(),
            addMedia: !Ext.os.is.Phone ? CJ.t('view-block-edit-defaults-toolbar-add-media') : ''
        });
        this.element.setHtml(this.getTpl().apply(data));
    },
    onTouchMoveHandler(e) {
        this.isDragging = true;
    },
    /**
     * method stops event in order to prevent focusing button on click
     * @param {Event} e
     */
    onTouchHandler(e) {
        if (!this.isDragging) {
            e.stopEvent();
            const target = e.target, command = CJ.Utils.getNodeData(target, 'command'), fastTool = CJ.Utils.getNodeData(target, 'fasttool');
            if (fastTool) {
                this.getEditor().saveSelection();
                this.executeTool(fastTool, e.target);
            }
            if (command) {
                this.getEditor().saveSelection();
                this.executeCommand(command);
                if (this.queryCommandValue(command))
                    this.makeButtonActive(target);
                else
                    this.makeButtonInactive(target);
                this.updateButtons(true);
            }
        }
        this.isDragging = false;
    },
    /**
     * @param {String} toolName
     *
     */
    executeTool(toolName, element) {
        switch (toolName) {
        case 'quote':
            this.executeQuoteTool();
            break;
        case 'createlink':
            if (CJ.core.Utils.selectionCommonAncestorIs('A', true)) {
                return this.editLink(true);
            }
            if (this.getEditor().getTextSelection().range == null)
                return;
            this.executeInlineLinkTool(element, true, element);
            break;
        default:
            break;
        }
    },
    /**
     * performs required actions to execute passed as argument command
     * @param {String} command
     * @param {String} extraParam
     */
    executeCommand(command, extraParam) {
        const isSubscript = command == 'subscript', isSupscript = command == 'superscript';
        extraParam = extraParam || null;
        if (isSubscript && this.queryCommandValue('superscript'))
            document.execCommand('superscript', false, null);
        else if (isSupscript && this.queryCommandValue('subscript'))
            document.execCommand('subscript', false, null);
        document.execCommand(command, false, extraParam);
        if (!(Ext.browser.is.IE && (command == 'insertunorderedlist' || command == 'insertorderedlist')))
            return;    // https://redmine.iqria.com/issues/8632
                       // IE browser clones next node after container where you want to add
                       // ul/ol tag and inserts it (with first child from original node) right
                       // before that original node.
        // https://redmine.iqria.com/issues/8632
        // IE browser clones next node after container where you want to add
        // ul/ol tag and inserts it (with first child from original node) right
        // before that original node.
        Ext.defer(function () {
            const editor = this.getEditor();
            const editorNode = editor.element.dom;
            const question = editor.getQuestion();
            const questionNodes = editorNode.querySelectorAll('.d-question');
            let node;
            if (questionNodes.length == 1)
                return;
            node = questionNodes[1];
            node.insertBefore(questionNodes[0].firstChild, node.firstChild);
            node.id = question.element.getId();
            question.element.dom = node;
            questionNodes[0].parentNode.removeChild(questionNodes[0]);
        }, 50, this);
    },
    /**
     * @param {String} command
     * @return {Boolean}
     */
    queryCommandValue(command) {
        return document.queryCommandState(command);
    },
    /**
     * renders apps menu
     */
    onAppsButtonTap(e) {
        if (this.isDragging)
            return;    // https://redmine.iqria.com/issues/10353
        // https://redmine.iqria.com/issues/10353
        e.stopEvent();
        const editor = this.getEditor();
        editor.saveSelection();
        if (this.appsPopover && !this.appsPopover.isDestroyed) {
            this.appsPopover.close();
            return;
        }
        const appsCls = CJ.view.block.edit.defaults.Apps;
        if (!Ext.os.is.Desktop) {
            appsCls.popup({ editor });
        } else {
            this.appsPopover = appsCls.popover({
                target: e.target,
                innerComponent: { editor }
            });
        }
    },
    /**
     * activates or deactivates toolbar buttons according to their browser's
     * state
     */
    updateButtons(toolbarButtonsTapped) {
        const buttons = this.element.query('.d-inline');
        for (let i = 0, button; button = buttons[i]; i++) {
            const command = CJ.Utils.getNodeData(button, 'command');
            if (!command)
                continue;
            if (this.queryCommandValue(command))
                this.makeButtonActive(button, true);
            else
                this.makeButtonInactive(button);
        }
        if (!toolbarButtonsTapped && window.getSelection().rangeCount > 0)
            this.editLink();
    },
    /**
     * @param {HTMLElement} button
     * @return {Boolean} true if button is subscript or superscript button
     */
    isSubSupButton(button) {
        return [
            'subscript',
            'superscript'
        ].indexOf(CJ.getNodeData(button, 'command')) > -1;
    },
    /**
     * activates button
     * @param {HTMLElement} button
     */
    makeButtonInactive(button) {
        const el = CJ.fly(button);
        el.removeCls('d-active');
        CJ.unFly(el);
    },
    /**
     * @param {HTMLElement} button
     * @param {Boolean} disableToggle Should be true to toggle button's active
     *                                state.
     */
    makeButtonActive(button, disableToggle) {
        if (this.isSubSupButton(button))
            return this.makeSupSubButtonActive(button, disableToggle);    // if (this.isJustifyButton(button)) {
                                                                          //   return this.makeJustifyButtonActive(button, disableToggle);
                                                                          // }
        // if (this.isJustifyButton(button)) {
        //   return this.makeJustifyButtonActive(button, disableToggle);
        // }
        const el = CJ.fly(button);
        if (disableToggle) {
            el.addCls('d-active');
        } else {
            if (el.hasCls('d-active'))
                el.removeCls('d-active');
            else
                el.addCls('d-active');
        }
        CJ.unFly(el);
    },
    /**
     * @param {HTMLElement} button
     * @param {Boolean} disableToggle Should be true to toggle button's active
     *                                state.
     */
    makeSupSubButtonActive(button, disableToggle) {
        let el = CJ.fly(button);
        const isSupscript = el.hasCls('d-superscript');
        if (disableToggle) {
            el.addCls('d-active');
        } else {
            if (el.hasCls('d-active'))
                el.removeCls('d-active');
            else
                el.addCls('d-active');
        }
        CJ.unFly(el);
        const selector = isSupscript ? '.d-subscript' : '.d-superscript', node = this.element.dom.querySelector(selector);
        el = CJ.fly(node);
        el.removeCls('active');
        CJ.unFly(el);
    },
    /*
     * @param {Boolean} directlyEdit
     */
    editLink(directlyEdit) {
        const editor = this.getEditor();
        let commonAncestorContainer;
        editor.saveSelection();
        this.destroyInlineLinkTool();
        this.destroyInlineLinkMenu();
        if (!CJ.core.Utils.selectionCommonAncestorIs('A', true))
            return;
        commonAncestorContainer = CJ.core.Utils.getCommonAncestorContainer(editor.getTextSelection().range);
        if (directlyEdit)
            this.executeInlineLinkTool(commonAncestorContainer, false, this.element.dom.querySelector('.d-link'));
        else
            this.executeInlineLinkMenu(commonAncestorContainer);
    },
    /*
     * @param {String} command
     */
    inlineLinkMenuCommand(command) {
        const commonAncestorParent = CJ.core.Utils.getCommonAncestorContainer(this.getEditor().getTextSelection().range);
        switch (command) {
        case 'modifyLink':
            this.executeInlineLinkTool(commonAncestorParent, false);
            break;
        case 'deleteLink':
            this.deleteLink(commonAncestorParent, commonAncestorParent.innerHTML);
            break;
        }
    },
    /*
     * @param {Element} target
     */
    executeInlineLinkMenu(target) {
        const me = this;
        this.inlineLinkMenu = CJ.view.popovers.PopoverMenu.showTo({
            target,
            innerComponent: {
                data: {
                    choices: [
                        {
                            text: 'view-popovers-inline-link-menu-modify-button-label',
                            value: 'modifyLink'
                        },
                        {
                            text: 'view-popovers-inline-link-menu-delete-button-label',
                            value: 'deleteLink'
                        }
                    ]
                },
                callbackScope: me,
                callbackFn: me.inlineLinkMenuCommand
            }
        });
    },
    destroyInlineLinkTool() {
        if (this.inlineLinkTool) {
            this.inlineLinkTool.destroy();
            this.inlineLinkTool = null;
        }
    },
    destroyInlineLinkMenu() {
        if (this.inlineLinkMenu) {
            this.inlineLinkMenu.destroy();
            this.inlineLinkMenu = null;
        }
    },
    executeInlineLinkTool(target, isNew, visualTarget) {
        let linkVal = null;
        let titleVal = null;
        const selection = this.getEditor().getTextSelection();
        if (isNew) {
            titleVal = selection.innerText;
            if (CJ.core.Utils.validateUrl(selection.innerText))
                linkVal = selection.innerText;
        }    // preventing old inlineLinkTool to be open in order to not conflict with the new one.
        // preventing old inlineLinkTool to be open in order to not conflict with the new one.
        this.destroyInlineLinkTool();
        this.inlineLinkTool = CJ.view.tool.InlineLinkTool.show({
            target: visualTarget ? visualTarget : target,
            titleValue: titleVal,
            linkValue: linkVal,
            callbackFn: this.insertLink,
            callbackScope: this,
            isNew
        }, isNew ? null : target);
    },
    onPopupInsertInlineLinkTap(popup) {
        const content = popup.getContent();    //content.initialConfig.selectedLinkElement was inserted manually before to not loose reference
        //content.initialConfig.selectedLinkElement was inserted manually before to not loose reference
        this.insertLink(content.getValue(), content.initialConfig.selectedLinkElement);
    },
    executeQuoteTool() {
        const me = this;
        const editor = this.getEditor();
        let selectionText;
        editor.saveSelection();
        selectionText = editor.getTextSelection().innerText;
        if (Ext.browser.is.IE) {
            const sel = window.getSelection();
            if (sel.rangeCount) {
                let container = document.createElement('div');
                container.appendChild(sel.getRangeAt(0).cloneContents());
                selectionText = container.innerHTML;
                container = null;
            }
        }
        CJ.view.tool.quote.Tool.showEditing({
            values: { quoteText: selectionText || '' },
            listeners: {
                actionbuttontap(inValue) {
                    const sel = window.getSelection(), editorSel = editor.getTextSelection();
                    if (editorSel) {
                        sel.removeAllRanges();
                        sel.addRange(editorSel.range);
                        if (Ext.browser.is.IE) {
                            const range = sel.getRangeAt(0).cloneRange();
                            range.collapse(true);
                            me.executeCommand('Delete');
                            sel.removeAllRanges();
                            sel.addRange(range);
                        } else {
                            me.executeCommand('insertHTML', '<div><br></div>');
                        }
                    }
                    editor.saveSelection();
                    editor.getList().addListItem({
                        xtype: 'view-tool-quote-tool',
                        editing: true,
                        values: { quoteText: inValue.getContent().getValue() }
                    });
                }
            }
        });
    },
    /*
     * @param {Element} selectElement
     */
    deleteLink(selectElement, linkTitle) {
        if (selectElement) {
            CJ.core.Utils.selectionFromElement(selectElement);
            this.getEditor().saveSelection();
            if (!linkTitle)
                this.executeCommand('Delete');
            else {
                this.executeCommand('Unlink');
            }
        }
    },
    /*
     * @param {String} linkValue
     * @param {Element} selectElement
     */
    insertLink(titleValue, linkValue, selectElement) {
        const linkLabel = Ext.htmlEncode(titleValue);
        let linkURL = Ext.htmlEncode(linkValue);
        if (selectElement) {
            CJ.core.Utils.selectionFromElement(selectElement);
            this.getEditor().saveSelection();
        }
        linkURL = CJ.Utils.toUrl(linkURL);
        htmlCode = `<a target="_blank" href="${ linkURL }">${ linkLabel }</a>`;
        CJ.core.Utils.restoreRange(this.getEditor().getTextSelection().range);    //IE execCommand('insertHTML',.... is broken , so here's the fix
        //IE execCommand('insertHTML',.... is broken , so here's the fix
        if (Ext.browser.is.IE) {
            if (window.getSelection) {
                const sel = window.getSelection();
                let range;
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    const el = document.createElement('div');
                    el.innerHTML = htmlCode;
                    const frag = document.createDocumentFragment();
                    let node;
                    let lastNode;
                    while (node = el.firstChild) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if (document.selection && document.selection.type != 'Control') {
                document.selection.createRange().pasteHTML(html);
            }
            return;
        }
        this.executeCommand('insertHTML', htmlCode);
    },
    /**
     * performs a logic to change text-style using keyboard shortcuts
     * @param {Ext.EventObject} e
     */
    applyShortcuts(e) {
        return false;    // @TODO disable for phase 2
                         // if(!e.ctrlKey && !e.metaKey)
                         //     return false;
                         // var pressedButton;
                         // switch(e.keyCode) {
                         //     case 66: // bold
                         //     case 71: // G means GRAS
                         //         pressedButton = 0;
                         //         break;
                         //     case 73: // italic
                         //         pressedButton = 1;
                         //         break;
                         //     case 85: // underline
                         //         pressedButton = 2;
                         //         break;
                         // }
                         // if(!Ext.isNumber(pressedButton))
                         //     return false;
                         // var styleButtons = this.down("[ref=styleButtons]"),
                         //     pressed = styleButtons.getPressedButtons(),
                         //     indices = [],
                         //     index,
                         //     command;
                         // for(var i=0, l=pressed.length; i<l; i++)
                         //     indices.push(styleButtons.indexOf(pressed[i]));
                         // index = indices.indexOf(pressedButton);
                         // command = styleButtons.getAt(pressedButton).getData();
                         // if(index > -1)
                         //     indices.splice(index, 1);
                         // else
                         //     indices.push(pressedButton);
                         // styleButtons.setPressedButtons(indices);
                         // this.returnFocus();
                         // this.executeCommand(command);
                         // this.insertEmptySymbol();
    }
});