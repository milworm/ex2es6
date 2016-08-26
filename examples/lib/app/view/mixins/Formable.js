/**
 * Class is used to extend container's functionallity to be able to set/get 
 * values.
 */
Ext.define('CJ.view.mixins.Formable', {
    /**
     * @param {Object} values
     */
    applyValues(values undefined {}) {
        if (this.isContainer) {
            let selector, field;
            for (const k in values) {
                selector = Ext.String.format('[name={0}]', k);
                field = this.down(selector);
                if (field)
                    field.setValue(values[k]);
            }
        }
        return values;
    },
    applyChanges() {
        const values = this.getValues();
        if (this.isContainer) {
            const fields = this.query('[name]');
            for (let i = 0, field; field = fields[i]; i++) {
                if (field.getValue)
                    values[field.getName()] = field.getValue();
            }
        }
        this.initialConfig.values = values;
        this._values = values;
        return values;
    },
    resetChanges() {
        this.setValues(this.initialConfig.values);
    },
    /**
     * @return {Object}
     */
    serialize() {
        this.applyChanges();
        return {
            xtype: this.xtype,
            values: this.getValues()
        };
    },
    /**
     * @param {Object} values
     */
    silentSetValues(values) {
        this._values = values;
    }
});