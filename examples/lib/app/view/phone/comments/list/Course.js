import 'app/view/tablet/comments/list/Course';

/**
 * Class is used to display list of comments inside of course's viewer.
 */
Ext.define('CJ.view.phone.comments.list.Course', {
    extend: 'CJ.view.tablet.comments.list.Course',
    alias: 'widget.view-phone-comments-list-course',
    getScrollEl() {
        return this.element;
    }
});