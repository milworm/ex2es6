import 'Ext/Component';

/**
 * The class provides component for displaying images in full size.
 */
Ext.define('CJ.core.view.FullImage', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @inheritdoc
     */
    xtype: 'core-view-full-image',
    lastTouchData: null,
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-full-image',
        /**
         * @cfg {CJ.core.view.Popup}
         */
        popup: null,
        /**
         * @cfg {String} image
         */
        image: null,
        /**
         * @cfg {Boolean} controls
         */
        controls: false,
        /**
         * @cfg {Boolean} controls
         */
        canPan: true,
        /**
         * @cfg {Object} imageInitialSize
         */
        imageInitialSize: null,
        /**
         * @cfg {Number} maxZoom
         * @NOTE 3.05 is (1 + 0.25) ^ 5
         */
        maxZoom: 3.05,
        /**
         * @cfg {Number} maxPanMultiplier
         */
        maxPanMultiplier: 0.7,
        /**
         * @cfg {CJ.core.view.Popover} contextMenu
         */
        contextMenu: null,
        /**
         * @cfg {Object} tapHoldData
         */
        tapHoldData: null
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            html: [
                '<div class="d-image"></div>',
                '<div class="d-close">',
                CJ.t('close'),
                '</div>',
                '<div class="d-button d-zoom-in d-hidden">',
                CJ.t('core-view-fullimage-zoom-in'),
                '</div>',
                '<div class="d-button d-zoom-out d-hidden">',
                CJ.t('core-view-fullimage-zoom-out'),
                '</div>'
            ].join('')
        };
    },
    constructor() {
        this.callParent(args);
        if (this.getControls()) {
            this.element.on({
                touchstart: this.onTouchStart,
                touchmove: this.onTouchMove,
                touchend: this.onTouchEnd,
                contextmenu: this.onContextMenu,
                longpress: this.onContextMenu,
                scope: this
            });
            if (Ext.os.is.Desktop) {
                const buttons = this.element.dom.querySelectorAll('.d-hidden');
                for (let i = 0, ln = buttons.length; i < ln; i++)
                    buttons[i].classList.remove('d-hidden');
            }
        }
    },
    onTouchStart(e) {
        if (this.getControls()) {
            const imgEl = this.getImageElement();
            if (e.getTarget('.d-zoom-in'))
                return this.zoom({ percent: 25 });
            if (e.getTarget('.d-zoom-out'))
                return this.zoom({ percent: -25 });
        }
        if (!e.getTarget('.d-image'))
            this.getPopup().hide();
        e.preventDefault();
    },
    /**
     * @param {Object} e
     * @NOTE Sencha's touchmove has deltaX and deltaY but they are internal and not accessible here
     * so here's the solution
     */
    onTouchMove(e) {
        const currentTouchData = { points: [] };
        let distanceDifference;
        let pan;
        for (let i = 0, touches = e.touches, ln = touches.length; i < ln; i++) {
            currentTouchData.points.push({
                x: touches[i].point.x,
                y: touches[i].point.y
            });
        }
        if (this.lastTouchData && this.lastTouchData.points.length == currentTouchData.points.length) {
            pan = {
                x: currentTouchData.points[0].x - this.lastTouchData.points[0].x,
                y: currentTouchData.points[0].y - this.lastTouchData.points[0].y
            };
            if (currentTouchData.points.length > 1) {
                currentTouchData.distance = Math.sqrt(Math.pow(currentTouchData.points[1].x - currentTouchData.points[0].x, 2) + Math.pow(currentTouchData.points[1].y - currentTouchData.points[0].y, 2));
                if (this.lastTouchData.distance) {
                    distanceDifference = currentTouchData.distance - this.lastTouchData.distance;
                    this.zoom({
                        pixels: distanceDifference,
                        pan
                    });
                }
            } else {
                this.pan(pan);
            }
        }
        this.lastTouchData = currentTouchData;
        return false;
    },
    onTouchEnd() {
        this.lastTouchData = null;
    },
    onGesture(gestureData) {
        if (this.getCanPan() && gestureData.gesture == 'panning')
            this.pan(gestureData.velocity.x, gestureData.velocity.y);
    },
    /**
     * Loads an image before showing.
     * @param {String} image
     */
    updateImage(image) {
        const img = new Image();
        img.src = image;
        img.onload = Ext.bind(this.showImage, this);
    },
    /**
     * Shows an image.
     * @param {Event} e
     */
    showImage(e) {
        const el = this.element;
        const img = e.target;
        const imageEl = this.getImageElement(true);
        const imageWidth = img.width;
        const imageHeight = img.height;
        const imageFactor = imageWidth / imageHeight;
        const containerWidth = el.getWidth();
        const containerHeight = el.getHeight();
        const containerFactor = containerWidth / containerHeight;
        let width;
        let height;
        let maxWidth;
        let maxHeight;
        let computed;
        let x;
        let y;
        if (imageFactor > containerFactor) {
            maxWidth = containerWidth * 0.85;
            width = imageWidth > maxWidth ? maxWidth : imageWidth;
            height = width / imageFactor;
        } else {
            maxHeight = containerHeight * 0.85;
            height = imageHeight > maxHeight ? maxHeight : imageHeight;
            width = height * imageFactor;
        }
        x = (containerWidth - width) / 2;
        y = (containerHeight - height) / 2;
        imageEl.style.backgroundImage = CJ.tpl('url("{0}")', img.src);
        imageEl.style.backgroundSize = `${ width }px ${ height }px`;
        imageEl.style.backgroundPosition = `${ x }px ${ y }px`;
        imageEl.classList.add('shown');
        img.onload = null;
        computed = window.getComputedStyle(el.dom);
        this.setImageInitialSize({
            width,
            height,
            elementWidth: Number(computed.width.replace('px', '')),
            elementHeight: Number(computed.height.replace('px', ''))
        });
    },
    getImageElement(onlyTheElement) {
        const imgEl = this.element.dom.querySelector('.d-image');
        let size;
        let position;
        let width;
        let height;
        let left;
        let top;
        if (onlyTheElement)
            return imgEl;
        size = imgEl.style.backgroundSize.replace(/px/g, '').split(' ');
        position = imgEl.style.backgroundPosition.replace(/px/g, '').split(' ');
        width = Number(size[0]) || 0;
        height = Number(size[1]) || 0;
        left = Number(position[0]) || 0;
        top = Number(position[1]) || 0;    /*
         * iOS decides that if width and height are the same it should return only one value regardless
         * if you have set width and height to be the same ex: "240px 240px" will return "240px"
         */
        /*
         * iOS decides that if width and height are the same it should return only one value regardless
         * if you have set width and height to be the same ex: "240px 240px" will return "240px"
         */
        if (!height)
            height = width;
        if (!top)
            top = left;
        return {
            element: imgEl,
            ratio: width / height,
            width,
            height,
            left,
            top
        };
    },
    zoom(config) {
        const image = this.getImageElement();
        const imageInitialSize = this.getImageInitialSize();
        const maxZoom = this.getMaxZoom();
        let width;
        let height;
        let recenter;
        if (config.percent) {
            width = image.width * (1 + config.percent / 100);
        } else {
            width = image.width + config.pixels;
        }
        if (width < 50)
            width = 50;    /*
         * 1.25 ^ 5 = 3.05.....
         * specifications said the analog button zooms 5 times every single incrementation of 25%
         */
        /*
         * 1.25 ^ 5 = 3.05.....
         * specifications said the analog button zooms 5 times every single incrementation of 25%
         */
        if (width > imageInitialSize.width * maxZoom)
            width = imageInitialSize.width * maxZoom;
        height = width / image.ratio;
        image.element.style.backgroundSize = `${ width }px ${ height }px`;
        recenter = {
            x: (image.width - width) / 2,
            y: (image.height - height) / 2
        };
        if (config.pan) {
            recenter.x += config.pan.x;
            recenter.y += config.pan.y;
        }    // update panning (for image centering)
        // update panning (for image centering)
        this.pan(recenter);
    },
    pan(config) {
        const image = this.getImageElement();
        let left;
        let top;
        left = image.left + config.x;
        top = image.top + config.y;
        image.element.style.backgroundPosition = `${ left }px ${ top }px`;
    },
    onContextMenu(e) {
        Ext.TaskQueue.requestWrite(function () {
            CJ.view.popovers.PopoverMenu.showTo({
                target: Ext.Viewport.element.dom,
                position: {
                    x: 'middle',
                    y: 'middle'
                },
                offset: {
                    x: e.pageX - this.element.getWidth() / 2,
                    y: e.pageY - this.element.getHeight() / 2 - 40
                },
                innerComponent: {
                    data: {
                        choices: [{
                                text: 'core-view-fullimage-open-in-tab',
                                value: 'open-in-tab'
                            }]
                    },
                    callbackScope: this,
                    callbackFn: this.onContextMenuChoice,
                    handleContextMenuEvent: true
                }
            });
        }, this);    // needed for preventing the menu of the browser
        // needed for preventing the menu of the browser
        e.preventDefault();
        return false;
    },
    onContextMenuChoice(action) {
        const imageUrl = this.getImage();
        switch (action) {
        case 'open-in-tab':
            window.open(imageUrl, '_blank');
            break;
        }
    }
});