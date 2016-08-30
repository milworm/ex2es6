Ext.define('a', {
	method1(config, ...args) {
		if(true) {
			this.callParent(args)
		};

		var a = 2,
			b = 3,
			c = 5;
		
		return 2
	}
})