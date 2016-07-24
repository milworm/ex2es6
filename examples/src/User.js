Ext.define('CJ.User', {
	statics: {
		IS_USER: true
	},

	requires: [
		'CJ.view.tool.media.Tool',
		'CJ.view.tool.media.Tool1',
		'CJ.view.tool.media.Tool2'
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