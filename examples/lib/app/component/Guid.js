/**
 * Provides the only way to generate guid
 */
Ext.define('CJ.component.Guid', {
    /**
     * @inheritdoc
     */
    alternateClassName: 'CJ.Guid',
    /**
     * @inheritdoc
     */
    singleton: true,
    /**
     * @return {String} unique temporary id.
     */
    generatePhantomId() {
        this.lastPhantomId = this.lastPhantomId || 1;
        return `temp_${ this.lastPhantomId++ }`;
    }
});