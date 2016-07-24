import CJ.view.tool.media.Tool from 'app/view/tool/media/Tool'

export default class User extends Ext.Base {
    statics: { IS_USER: true }
    config: {
        firstName: '',
        lastName: ''
    }
    upateFirstName(newName, oldName) {
        console.log('first name is updated');
    }
    sayHello() {
        console.log('Hello!');
    }
}