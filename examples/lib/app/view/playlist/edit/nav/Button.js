import 'Ext/Button';

Ext.define('CJ.view.playlist.edit.nav.Button', {
    extend: 'Ext.Button',
    config: {
        popup: null,
        activeItemIndex: null,
        action: null,
        locked: false,
        force: false,
        tooltip: null
    },
    initialize() {
        this.callParent(args);
        this.onBefore('tap', this.onBeforeTap, this);
    },
    applyAction(action, currentAction) {
        if (action == currentAction)
            return action;
        const tooltipGetter = this[CJ.tpl('get{0}Tooltip', CJ.capitalize(action))], tooltipConfig = tooltipGetter && tooltipGetter.call(this);
        if (tooltipConfig) {
            if (currentAction)
                Ext.apply(tooltipConfig, { autoShow: true });
            this.setTooltip(tooltipConfig);
        }
        return action;
    },
    updateLocked(state) {
        this.setDisabled(state);
    },
    setDisabled(state) {
        if (!state && this.getLocked())
            return;
        this.callParent(args);
    },
    onBeforeTap() {
        const index = this.getActiveItemIndex(), config = this.getStateConfig(index);
        if (!config.isPhantom && config.isEmpty) {
            if (this.getForce())
                return this.setForce(false);
            CJ.confirm('block-popup-options-confirm-title', 'playlist-editor-delete-confirmtext', this.onChangeConfirm, this);
            return false;
        }
    },
    onChangeConfirm(result) {
        if (result != 'yes')
            return;
        this.setForce(true);
        this.fireAction('tap', [this], 'doTap');
    },
    configureState(index) {
        const config = this.getStateConfig(index), stateType = CJ.capitalize(this.getStateType(config)), handlerName = CJ.tpl('configure{0}State', stateType);
        Ext.callback(this[handlerName], this, [config]);
        this.setActiveItemIndex(index);
    },
    getStateConfig(index) {
        const popup = this.getPopup(), block = popup.getBlock(), editor = popup.getContent(), config = {
                block,
                isEmpty: editor.isEmpty(),
                isPhantom: block.isComponent ? block.isPhantom() : true,
                isDirty: editor.getIsDirty()
            };
        if (block.isPlaylist) {
            const data = block.getItemData(index), isNumber = Ext.isNumber(index);
            Ext.apply(config, {
                isNew: !isNumber,
                isFirst: isNumber && index == 0,
                isLast: isNumber && index == block.getLength() - 1,
                isPhantom: data ? !Ext.isNumber(data.docId) : true,
                isReused: data && data.reuseInfo && data.reuseInfo.reusesContent,
                isReusing: data && data.reusedCount
            });
        }
        return config;
    },
    getStateType(config) {
        let state;
        switch (true) {
        case !config.block.isComponent:
            state = 'initial';
            break;
        case config.block.isDefaultBlock:
            state = 'defaultBlock';
            break;
        case config.isNew:
            state = 'playlistNewBlock';
            break;
        case config.isReused:
            state = 'playlistReusedBlock';
            break;
        default:
            state = 'playlistSimpleBlock';
        }
        return state;
    }
});