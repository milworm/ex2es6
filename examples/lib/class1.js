Ext.define('a', {
  method1(config, ...args) {
    if (true) {
      this.callParent([config, ...args])
    }
    
    const a = 2;
    const b = 3;
    const c = 5;
    return 2
  }
})