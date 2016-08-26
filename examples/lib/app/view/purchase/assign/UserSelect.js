import 'app/core/view/Component';
import 'app/view/group/Select';
import 'app/view/group/UserSelect';

/**
 * Class defines a component to give licensee a way to assign licenses to users using group-select.
 */
Ext.define('CJ.view.purchase.assign.UserSelect', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-assign-user-select',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-purchase-assign-user-select-popup',
                title: '',
                content: { xtype: this.xtype }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Array} selectedUsers
         */
        selectedUsers: [],
        /**
         * @cfg {String} cls
         */
        cls: 'd-purchase-assign-user-select d-vbox',
        /**
         * @cfg {Ext.Component} searchField
         */
        searchField: {},
        /**
         * @cfg {Ext.Component} content
         * Defines a visible component.
         */
        content: {},
        /**
         * @cfg {Object} selectedGroup
         */
        selectedGroup: null,
        /**
         * @cfg {Ext.XTemplate} selectedGroupTpl
         */
        selectedGroupTpl: Ext.create('Ext.XTemplate', '<div class="d-back-icon"></div>', '<div class="d-content">', '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.smallIcon) ]}"></div>', '<div class="d-title">{name}</div>', '</div>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.onUsedChange();
        this.element.on('tap', this.onElementTap, this);
    },
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                { classList: ['d-header-element'] },
                {
                    reference: 'selectedGroupEl',
                    classList: ['d-selected-group']
                },
                {
                    reference: 'contentElement',
                    classList: [
                        'd-content-element',
                        'd-scroll',
                        'd-vbox'
                    ]
                },
                {
                    classList: [
                        'd-footer-element',
                        'd-button'
                    ],
                    html: [
                        '<span class=\'d-license-counter\'></span>',
                        '<span class=\'d-bull\'>&bull;</span>',
                        CJ.t('view-purchase-assign-user-select-button')
                    ].join('')
                }
            ]
        };
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-button.d-active', 1))
            this.onButtonTap(e);
        else if (e.getTarget('.d-group-select .d-item', 5))
            this.onGroupSelectItemTap(e);
        else if (e.getTarget('.d-selected-group', 5))
            this.showGroups();
    },
    /**
     * @param {Object} config
     * @param {Ext.Component} oldField
     * @return {Ext.Component}
     */
    applySearchField(config, oldField) {
        if (oldField)
            oldField.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-search-field',
            listeners: {
                scope: this,
                input: this.onSearchFieldInput
            },
            renderTo: this.element.dom.querySelector('.d-header-element')
        }, config));
    },
    /**
     * @param {Object} config
     * @param {Ext.Component} oldComponent
     * @return {Ext.Component}
     */
    applyContent(config, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-group-select',
            renderTo: this.contentElement
        }, config));
    },
    /**
     * @return {undefined}
     */
    onUsedChange() {
        const used = this.getUsed(), total = this.getTotal();
        this.element.dom.querySelector('.d-license-counter').innerHTML = CJ.tpl('{0}/{1}', used, total);
        this.activateButton(used > 0);
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    activateButton(state) {
        this.element.dom.querySelector('.d-button').classList[state ? 'add' : 'remove']('d-active');
    },
    /**
     * @param {CJ.core.view.SearchField} field
     * @param {String} value
     */
    onSearchFieldInput(field, value) {
        const content = this.getContent();
        if (!content.isGroupSelect)
            return this.showGroups();
        content.abort();
        content.load({ filter: value });
    },
    /**
     * @return {undefined}
     */
    onButtonTap() {
        const users = this.getSelectedUsers();
        if (!users.length)
            return;
        this.setLoading(true);
        CJ.License.assignPins(users, {
            scope: this,
            success: this.onAssignPinsSuccess,
            failure: this.onAssignPinsFailure
        });
    },
    /**
     * @return {undefined}
     */
    onAssignPinsSuccess() {
        CJ.PopupManager.hideAll();
    },
    /**
     * @return {undefined}
     */
    onAssignPinsFailure() {
        this.setLoading(false);
    },
    showGroups() {
        if (this.getContent().isGroupSelect)
            return;
        this.replaceCls('d-show-users', 'd-show-groups');
        Ext.defer(this.onGroupsShown, 500, this);
    },
    onGroupsShown() {
        this.setSelectedUsers(this.getContent().getSelected());
        this.removeCls('d-show-groups');
        this.selectedGroupEl.setHtml('');
        this.setContent({ loadParams: { filter: this.getSearchField().getValue() } });
    },
    /**
     * @param {Ext.Evented} e
     */
    onGroupSelectItemTap(e) {
        const target = e.getTarget('.d-item'), index = CJ.getNodeData(target, 'index') - 1, group = this.getContent().getData()[index];
        this.selectGroup(group, index, target);
    },
    /**
     * @param {Object} group
     * @param {Number} index
     * @param {HTMLElement} target
     * @return {undefined}
     */
    selectGroup(group, index, node) {
        this.setSelectedGroup(group);
        this.selectedGroupEl.setHtml(this.getSelectedGroupTpl().apply(group));
        this.selectedGroupEl.translate(0, this.getListItemTopOffset(node));
        this.addCls('d-hide-groups');
        Ext.defer(this.onSelectGroupAnimationEnd, 500, this);
        node.classList.add('invisible');
    },
    /**
     * loads and renders list of sections.
     * @return {undefined}
     */
    onSelectGroupAnimationEnd() {
        this.setContent({
            xtype: 'view-group-user-select',
            groupId: this.getSelectedGroup().docId,
            selected: this.getSelectedUsers(),
            listeners: {
                scope: this,
                selectionchange: this.onUsedChange
            }
        });
        this.replaceCls('d-hide-groups', 'd-show-users');
    },
    /**
     * @param {HTMLElement} itemNode
     * @return {Number}
     */
    getListItemTopOffset(itemNode) {
        return CJ.Utils.flyPageBox(itemNode).top - this.contentElement.getY();
    },
    /**
     * @return {Number} Numer of bought licenses.
     */
    getTotal() {
        return CJ.License.getLicense().qty;
    },
    /**
     * @return {Number} how many licenses are available.
     */
    getAvailable() {
        return CJ.License.getLicense().left;
    },
    /**
     * @return {Number} how many licenses are used.
     */
    getUsed() {
        return this.getTotal() - this.getAvailable() + this.getSelectedUsers().length;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setSearchField(null);
        this.setContent(null);
    }
});