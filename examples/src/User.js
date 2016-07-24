Ext.define('CJ.User', {
	statics: {
		IS_USER: true
	},

	requires: [
		'CJ.view.tool.media.Tool'
	],

	config: {
		firstName: '',
		lastName: ''
	},

	upateFirstName: function(newName, oldName) {
		console.log('first name is updated');
	},

	sayHello: function() {
		console.log('Hello!');
	}
})