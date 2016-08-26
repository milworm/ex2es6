import 'app/profile/Base';
import 'app/view/phone/nav/SideMenu';
import 'app/view/phone/block/fullscreen/Popup';
import 'app/view/phone/block/fullscreen/AnswerPopup';
import 'app/view/phone/stream/header/User';
import 'app/view/phone/stream/header/Group';
import 'app/view/phone/stream/header/Category';
import 'app/view/phone/course/view/Editor';
import 'app/view/phone/course/view/menu/Menu';
import 'app/view/phone/viewport/TopBar';
import 'app/view/phone/map/view/Map';
import 'app/view/phone/comments/list/Course';

/**
 */
Ext.define('CJ.profile.Phone', {
    extend: 'CJ.profile.Base',
    config: { name: 'phone' },
    isActive() {
        return Ext.os.is.Phone;
    }
});