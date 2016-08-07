import 'app/view/tool/media/Tool';
import 'app/view/tool/media/Tool1';
import 'app/view/tool/media/Tool2';

Ext.define('CJ.User', {
    statics: { IS_USER: true },
    config: {
        firstName: '',
        lastName: ''
    },
    upateFirstName(newName, oldName) {
        console.log('first name is updated');
    },
    sayHello() {
        console.log('Hello!');
    }
});