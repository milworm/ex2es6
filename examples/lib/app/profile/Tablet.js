import 'app/profile/Base';
import 'app/view/tablet/nav/SideMenu';
import 'app/view/tablet/comments/list/Modal';
import 'app/view/tablet/comments/list/Course';
import 'app/view/tablet/block/fullscreen/AnswerPopup';
import 'app/view/tablet/block/fullscreen/Popup';
import 'app/view/tablet/course/edit/section/list/List';
import 'app/view/tablet/course/edit/Editor';
import 'app/view/tablet/course/view/Editor';
import 'app/view/tablet/viewport/TopBar';

/**
 */
Ext.define('CJ.profile.Tablet', {
    extend: 'CJ.profile.Base',
    config: { name: 'tablet' },
    isActive() {
        return Ext.os.is.Tablet;
    }
});