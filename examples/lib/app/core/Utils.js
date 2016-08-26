/**
 * didacti.Utils represents a single place with all required
 * helper methods that are used in different places in the app
 */
Ext.define('CJ.core.Utils', {
    alternateClassName: 'CJ.Utils',
    singleton: true,
    /**
     * @property {Boolean} isNativeScrolling Will be true if native scroll is
     *                     used in the app.
     */
    isNativeScrolling: false,
    templates: {
        /**
         * @param {String} property
         * @return {String}
         */
        blur: (() => {
            if (Ext.browser.is.IE)
                return Ext.create('Ext.Template', '<svg width="{svgWidth}" height="{svgHeight}">', '<defs>', '<filter id="blur">', '<feGaussianBlur stdDeviation="18"></feColorMatrix>', '</filter>', '</defs>', '<image xlink:href="{url}" width="{svgWidth}" height="{svgHeight}" filter="url(#blur)"></image>', '</svg>', { compiled: true });
            return Ext.create('Ext.Template', '<div class="blur-inner" style="background-image: url({url})"></div>');
        })(),
        completeness: Ext.create('Ext.XTemplate', '<div class=\'d-completion {[values.correct == values.total ? "d-excellent" : ""]}\'>{correct} / {total}</div>'),
        noAccess: '<div class="d-no-access"></div>'
    },
    constructor() {
        CJ.DOC_ID_RE = '[\\w\\d]+';
        this.isNativeScrolling = !this.getScrollable();
        this.callParent(args);
    },
    /**
     * @param {String}
     * @return {String}
     */
    urlify(str) {
        return encodeURIComponent(str);
    },
    /**
     * @param {String}
     * @return {String}
     */
    unurlify(str) {
        return decodeURIComponent(str);
    },
    /**
     * @param {String}
     * @return {String}
     */
    htmlEscape(html) {
        return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    /**
     * @param {String}
     * @return {String}
     */
    decodeHtml(string) {
        if (!string)
            return string;
        const map = {
            'gt': '>',
            'lt': '<',
            'amp': '&'
        };
        return string.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, ($0, $1) => {
            if ($1[0] === '#') {
                return String.fromCharCode($1[1].toLowerCase() === 'x' ? parseInt($1.substr(2), 16) : parseInt($1.substr(1), 10));
            } else {
                return map.hasOwnProperty($1) ? map[$1] : $0;
            }
        });
    },
    /**
     * @param {String} email (potentially email)
     * @return {Boolean}
     */
    validateEmail(email) {
        const regEx = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
        return regEx.test(email);
    },
    /**
     * @param {String} str (potentially url)
     * @return {Boolean}
     */
    validateUrl(str) {
        const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i');    // fragment locator
        // fragment locator
        if (!pattern.test(str)) {
            return false;
        } else {
            return true;
        }
    },
    /**
     * @param {String} hex
     * @return {Boolean}
     */
    validateHex(hex) {
        return /^#?([0-9a-fA-F]{3}){1,2}$/.test(hex);
    },
    /**
     * @param {String} userName
     * @return {String}
     */
    userNameToTag(userName) {
        if (userName.indexOf('@') == -1)
            userName = Ext.String.format('@{0}', userName);
        return userName;
    },
    linkify(text) {
        // http://, https://, ftp://
        const urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;    // www. sans http:// or https://
        // www. sans http:// or https://
        const pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;    // Email addresses *** here I've changed the expression ***
        // Email addresses *** here I've changed the expression ***
        const emailAddressPattern = /(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim;
        return text.replace(urlPattern, '<a target="_blank" href="$&" onclick="return false;">$&</a>').replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2" onclick="return false;">$2</a>').replace(emailAddressPattern, '<a href="mailto:$1" onclick="return false;">$1</a>');
    },
    /**
     * @param {Object} fileInfo
     * @param {Number} fileInfo.id
     * @param {String} fileInfo.originalFilename
     * @return {String}
     */
    fileInfoToUrl(fileInfo) {
        if (!fileInfo)
            return null;
        return fileInfo.url;
    },
    /**
     * @param {String} url
     * @param {String} fileName Should be provided in case when you don't want
     *                          go get fileName by parsing url.
     * @return {Object} file information
     */
    urlToFileInfo(url, fileName) {
        if (!url)
            return null;
        const parts = this.unurlify(url).split('/').reverse();
        if (!fileName)
            fileName = parts[0];
        return {
            fileName,
            filetype: fileName.split('.').reverse()[0],
            url,
            uuid: parts[1]
        };
    },
    camelCase(string) {
        return string.replace(/-([a-z])/gi, (all, letter) => letter.toUpperCase());
    },
    /**
     * takes a string like "word word" and turns it into "Word Word"
     * @param {String} string
     * @return {String}
     */
    capitalizeWords(string) {
        return string.replace(/(?:^|\s|-)\S/g, a => a.toUpperCase());
    },
    /**
     * @param {HTMLElement} dom
     * @return {Ext.Element.Fly}
     */
    createFly(dom) {
        if (dom.isElement)
            return dom;
        const fly = new Ext.Element.Fly();
        fly.dom = dom;
        fly.isFly = true;
        return fly;
    },
    /**
     * destroyes the Ext.Element.Fly, but keeps dom node
     * @param {HTMLElement} dom
     */
    destroyFly(fly) {
        if (!fly.isFly)
            return;
        delete fly.dom;
        fly.destroy();
    },
    /**
     * defines which scroll to use depending on device,
     * so for iOS we are using sencha's one, but for others it's native
     * @return {Boolean|Object} true to use sencha's scroll
     */
    getScrollable(config) {
        if (!config)
            config = {};    // currently we are using native scroll everywhere
        // currently we are using native scroll everywhere
        return null;
        return Ext.os.is.iOS ? Ext.applyIf(config, {
            direction: 'vertical',
            directionLock: true,
            momentumEasing: {
                momentum: {
                    acceleration: 5,
                    friction: 0.8
                },
                bounce: {
                    acceleration: 5,
                    springTension: 0.1
                },
                minVelocity: 1
            }
        }) : null;
    },
    /* @param {String|Date} date
     * @param {String} outputFormat
     * @return {String} formmated date
     */
    formatUTCDate(date, outputFormat) {
        let localTime;
        const date = date || new Date();
        if (Ext.isString(date)) {
            // @TODO uncomment when UTC on server is done
            // var utcDate = Ext.Date.parse(date, "Y-m-d H:i:s"),
            //     localTime = new Date(),
            //     timeZoneOffset = localTime.getTimezoneOffset() * 60 * 1000;
            // localTime.setTime(utcDate.getTime() + timeZoneOffset);
            localTime = Ext.Date.parse(date, 'Y-m-d H:i:s');
        } else {
            localTime = date;
        }
        return Ext.Date.format(localTime, outputFormat);
    },
    /**
     * @param {HTMLElement} node
     * @param {String} key
     * @return {String}
     */
    getNodeData(node, key) {
        const dataset = node.dataset;
        let value;
        let numericValue;
        if (dataset)
            value = dataset[key];
        else
            value = node.getAttribute(`data-${ this.camelCaseToDash(key) }`);
        numericValue = value - 0;
        if (!isNaN(numericValue))
            value = numericValue;
        return value;
    },
    /**
     * @param {HTMLElement} node
     * @param {String} key
     * @param {String|Number} value
     * @return {String}
     */
    setNodeData(node, key, value) {
        const dataset = node.dataset;
        if (dataset)
            return dataset[key] = value;
        node.setAttribute(`data-${ this.camelCaseToDash(key) }`, value);
    },
    /**
     * convers any string like "docId" into it's dashed equivalent "doc-id"
     * @param {String} str
     * @return {String}
     */
    camelCaseToDash(str) {
        return str.replace(/([A-Z])/g, (f, m) => `-${ m.toLowerCase() }`);
    },
    /**
     * @param {HTMLElement} node
     * @return {HTMLElement}
     */
    getScrollableElement(node) {
        const fly = this.createFly(node), isScrollable = fly.hasCls('d-scroll');
        if (!isScrollable)
            node = fly.up('.d-scroll').dom;
        this.destroyFly(fly);
        return node;
    },
    /**
     * @param {String} text
     * @return {Number} words-count
     */
    wordsCount(text) {
        text = Ext.String.trim(text).replace(/\n+|\s+/g, ' ');
        if (!text)
            return 0;
        return text.split(' ').length;
    },
    /**
     * @param {String} text
     * @return {String} trimmed text
     */
    //http://blog.stevenlevithan.com/archives/faster-trim-javascript
    trim(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
    // private property
    _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    // public method for encoding
    base64Encode(input) {
        let output = '';
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    // public method for decoding
    base64Decode(input) {
        let output = '';
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (enc2 & 15) << 4 | enc3 >> 2;
            chr3 = (enc3 & 3) << 6 | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = this._utf8_decode(output);
        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode(string) {
        string = string.replace(/\r\n/g, '\n');
        let utftext = '';
        for (let n = 0; n < string.length; n++) {
            const c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode(c >> 6 | 192);
                utftext += String.fromCharCode(c & 63 | 128);
            } else {
                utftext += String.fromCharCode(c >> 12 | 224);
                utftext += String.fromCharCode(c >> 6 & 63 | 128);
                utftext += String.fromCharCode(c & 63 | 128);
            }
        }
        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode(utftext) {
        let string = '';
        let i = 0;
        let c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if (c > 191 && c < 224) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode((c & 31) << 6 | c2 & 63);
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                i += 3;
            }
        }
        return string;
    },
    /**
     * @param {HTMLEement} node
     * @return {Object} pageBox
     */
    flyPageBox(node) {
        const el = this.createFly(node), pageBox = el.getPageBox();
        this.destroyFly(el);
        return pageBox;
    },
    /**
     * method acts like a common method for all updaters where we need to
     * remove old-component and add the new one if present.
     *
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateComponent(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (newComponent)
            this.add(newComponent);
    },
    getBrowserCssPrefix() {
        if (Ext.browser.is.WebKit) {
            return '-webkit-';
        } else if (Ext.browser.is.IE) {
            return '-ms-';
        } else if (Ext.browser.is.Firefox) {
            return '-moz-';
        } else
            return '';
    },
    /**
     * @param {Number/String} icon HSL number or url
     * @return {String} correctly formatted background css-property
     */
    makeIcon(icon, options) {
        if (Ext.isEmpty(icon))
            return '';    // @TODO need to update how icons work on client-side when new
                          // icon-system is ready on the server
        // @TODO need to update how icons work on client-side when new
        // icon-system is ready on the server
        if (Ext.isObject(icon))
            icon = icon.preview || icon.original;
        let tpl;
        const options = options || {};
        let saturation = options.saturation;
        let lightness = options.lightness;
        const alpha = options.alpha || 1;
        if (!Ext.isNumber(saturation))
            saturation = 50;
        if (!Ext.isNumber(lightness))
            lightness = 50;
        if (Ext.isNumber(+icon))
            tpl = `background-color: hsla({0}, ${ saturation }%, ${ lightness }%, ${ alpha });`;
        else
            tpl = options.imageTpl || 'background-image: url(\'{0}\');';
        return Ext.String.format(tpl, icon);
    },
    /**
     * @return {Number}
     */
    randomHsl() {
        return parseInt(Math.random() * 360);
    },
    /**
     * @param {String} rgba
     * example : rgba( 127, 127, 127, 0); rgb( 127, 100, 100);
     *
     * @return {Array} rgb at indexes 1,2,3, alpha at 4, rgbastring at 0
     */
    rgbaToArray(rgbaString) {
        return rgbaString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    },
    /**
     * @param {Array} color (r,g,b on 1,2,3)
     * @param {Float} magnitude (- to decrease ,+ to increase)
     * @return {Array} color (r,g,b on 1,2,3)
     */
    calcRGBShadeShift(color, magnitude) {
        const magnifiedColor = [];
        let magnifier;    // calculate magnitude in integers
        // calculate magnitude in integers
        magnifier = Math.floor(128 * magnitude);    // apply magnitude
        // apply magnitude
        magnifiedColor[1] = parseInt(color[1]) + magnifier;
        magnifiedColor[2] = parseInt(color[2]) + magnifier;
        magnifiedColor[3] = parseInt(color[3]) + magnifier;    // clean underflows
        // clean underflows
        if (magnifiedColor[1] < 0)
            magnifiedColor[1] = 0;
        if (magnifiedColor[2] < 0)
            magnifiedColor[2] = 0;
        if (magnifiedColor[3] < 0)
            magnifiedColor[3] = 0;    // clean overflows
        // clean overflows
        if (magnifiedColor[1] > 255)
            magnifiedColor[1] = 255;
        if (magnifiedColor[2] > 255)
            magnifiedColor[2] = 255;
        if (magnifiedColor[3] > 255)
            magnifiedColor[3] = 255;
        return magnifiedColor;
    },
    /**
     * @param {Array} color (r,g,b on 1,2,3)
     * @param {Float} opacity
     * @param {Array} [optional] color (r,g,b on 1,2,3)
     */
    calcRGBOpacity(color, opacity, bgColor) {
        const resultColor = [];    // background color if not provided will be white
        // background color if not provided will be white
        bgColor = bgColor || [
            0,
            255,
            255,
            255
        ];    // converting data to apropriate type
        // converting data to apropriate type
        bgColor[1] = parseInt(bgColor[1]);
        bgColor[2] = parseInt(bgColor[2]);
        bgColor[3] = parseInt(bgColor[3]);
        color[1] = parseInt(color[1]);
        color[2] = parseInt(color[2]);
        color[3] = parseInt(color[3]);    // calculate opacity
        // calculate opacity
        resultColor[1] = bgColor[1] * (1 - opacity) + color[1] * opacity;
        resultColor[2] = bgColor[2] * (1 - opacity) + color[2] * opacity;
        resultColor[3] = bgColor[3] * (1 - opacity) + color[3] * opacity;    // clean underflows
        // clean underflows
        if (resultColor[1] < 0)
            resultColor[1] = 0;
        if (resultColor[2] < 0)
            resultColor[2] = 0;
        if (resultColor[3] < 0)
            resultColor[3] = 0;    // clean overflows
        // clean overflows
        if (resultColor[1] > 255)
            resultColor[1] = 255;
        if (resultColor[2] > 255)
            resultColor[2] = 255;
        if (resultColor[3] > 255)
            resultColor[3] = 255;
        return resultColor;
    },
    /**
     * @param {Array} rgb (r,g,b on 1,2,3)
     * @return {String} hexadecimal color
     */
    rgbToHex(rgb) {
        return `#${ this.valToHexVal(rgb[1]) }${ this.valToHexVal(rgb[2]) }${ this.valToHexVal(rgb[3]) }`;
    },
    /**
     * @param {int} val (between 0 and 255)
     * @return {String} hexadecimal value
     */
    valToHexVal(val) {
        return `0${ parseInt(val).toString(16) }`.slice(-2);
    },
    /**
     * @param {String} tag
     * @return {String}
     */
    getTagType(tag) {
        tag = Ext.isArray(tag) ? tag.join(' ') : tag || '';
        if (tag == '%explore')
            return 'explore';
        if (tag == '%feed')
            return 'feed';
        if (tag == '%profile')
            return 'profile';
        if (tag == '%purchased')
            return 'purchased';
        if (tag[0] == '%')
            return 'id';
        if (tag[0] == '$')
            return 'category';
        if (tag[0] == '+')
            return 'group';
        if (tag.split(' ')[0].slice(-1) == '@')
            return 'portal';
        if (tag.indexOf('@') > -1)
            return 'user';
        return 'tag';
    },
    /**
     * @param {Array|String} tags
     * @return {Array}
     */
    getTagCategories(tags) {
        const categories = [];
        if (Ext.isString(tags))
            tags = tags.split(' ');
        for (let i = 0, l = tags.length; i < l; i++)
            if (tags[i][0] == '$')
                categories.push(tags[i].slice(1));
        return categories;
    },
    /**
     * Generate random number from range if it's set.
     * @param {Number} [min]
     * @param {Number} [max]
     * @returns {Number}
     */
    getRandomNumber(min undefined 0, max undefined 1000000) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getTpl(tpl, values) {
        tpl = this.templates[tpl];
        if (!tpl)
            return '';
        return tpl.apply(values);
    },
    /**
     * @param {Event} e
     * @Return {CJ.view.block.DefaultBlock}
     */
    getBlockFromEvent(e) {
        const block = e.getTarget('.d-block');
        return block ? Ext.getCmp(e.getTarget('.d-block').id) : null;
    },
    /**
     * finds the index of an object with a property #key, with value #value
     * inside of items-array.
     * @param {Array} items
     * @param {String} key
     * @param {String|Number} value
     * @return {Number}
     */
    indexOfByKey(items, key, value) {
        for (let i = 0, item; item = items[i]; i++) {
            if (item[key] == value)
                return i;
        }
        return -1;
    },
    /**
     * @param {Number} count
     * @return {Number}
     */
    getShortCount(count) {
        if (count >= 1000)
            count = CJ.tpl('{0}k', (count / 1000).toFixed(1));
        return count;
    },
    pluralizeQuantity(localeKey, count) {
        const lang = CJ.User.get('language');
        if (count > 1 || count == 0 && lang == 'en')
            localeKey += 's';
        return localeKey;
    },
    /**
     * @param {Object} values
     * @return {String}
     */
    getBackgroundCls(values) {
        if (!values.icon)
            return CJ.tpl('mocksy-bg-{0}', values.backgroundMocksyNumber);
        else
            return 'd-user-cover';
    },
    /**
     * @param {Object} values
     * @param {Object} config
     * @return {String}
     */
    getBackground(values, config undefined {}) {
        const icon = values.icon || values.backgroundHsl, disabled = config.disabled;
        if (disabled) {
            return CJ.Utils.makeIcon(icon, {
                saturation: 0,
                lightness: 33,
                alpha: 0.25,
                imageTpl: 'background-image: url("{0}");'
            });
        } else {
            return CJ.Utils.makeIcon(icon, {
                saturation: 35,
                lightness: 50,
                alpha: 0.7,
                imageTpl: 'background-image: url("{0}");'
            });
        }
    },
    /**
     * @return {Boolean}
     */
    supportsTemplate() {
        return 'content' in document.createElement('template');
    },
    /**
     * clears current browser's selection.
     * @return {undefined}
     */
    clearSelection() {
        if (window.getSelection)
            window.getSelection().removeAllRanges();
        else if (document.selection)
            document.selection.empty();
    },
    /**
     * @param {String|Array} tags
     * @return {String} path
     */
    tagsToPath(tags) {
        if (Ext.isArray(tags))
            tags = tags.join(' ');
        tags = Ext.String.trim(tags);
        const type = this.getTagType(tags);
        let path;
        switch (type) {
        case 'id':
            path = `!${ tags.substring(1) }`;
            break;
        case 'explore':
            path = '!explore';
            break;
        case 'feed':
            path = '!feed';
            break;
        case 'category':
            path = `!e/${ tags.replace(/\s/g, ',') }`;
            break;
        case 'group':
            path = `!g/${ tags.replace(/\s/g, ',') }`;
            break;
        case 'tag':
            path = `!t/${ tags.replace(/\s/g, ',') }`;
            break;
        case 'user':
            path = this.userTagsToPath(tags);
            break;
        case 'portal':
            path = this.portalTagsToPath(tags);
            break;
        }
        return this.urlify(path.replace(/#/g, ''));
    },
    /**
     * @param {String} tags
     * @return {String} path
     */
    userTagsToPath(tags) {
        let path = 'u/';
        const tags = tags.split(' ');
        let tabKey = 'c';
        if (tags[0][0] == '@')
            path += tags[0].substring(1);
        else
            path += tags[0];
        const tabIndex = CJ.app.getActiveRoute().getMeta('tabIndex'), action = CJ.History.getActiveAction();
        if (Ext.isNumber(tabIndex))
            tabKey = action.getArgs()[tabIndex];
        if (tabKey == 'f')
            tabKey = null;
        tabKey = tabKey || 'c';
        path += `/${ tabKey }`;    //convert remaining tags to csv
        //convert remaining tags to csv
        if (tags.length > 1)
            path += `/${ tags.slice(1).join() }`;
        return `!${ path }`;
    },
    /**
     * @param {String} tags
     * @param {String} tab
     * @return {String}
     */
    portalTagsToPath(tags, tab) {
        const items = tags.split(' ');
        const portal = items.shift();
        const tags = items.join(',');
        let tabKey = 'f';
        if (!Ext.isEmpty(tags))
            tags = `/${ tags }`;
        const tabIndex = CJ.app.getActiveRoute().getMeta('tabIndex'), action = CJ.History.getActiveAction();
        if (Ext.isNumber(tabIndex))
            tabKey = action.getArgs()[tabIndex] || 'f';
        if (tabKey == 'f' && !Ext.isEmpty(tags))
            tabKey = 'a';
        return CJ.tpl('!pu/{0}/{1}{2}', portal, tab || tabKey, tags);
    },
    /**
     * discovers the position of a cursor inside of input-element
     * @param {HTMLElement} input
     * @return {undefined}
     */
    cursorPosition(input) {
        const selectionStart = input.selectionStart;
        const selectionEnd = input.selectionEnd;
        let value;
        if (selectionStart == selectionEnd) {
            value = input.value;
            if (selectionStart == value.length)
                return 'end';
            if (selectionStart == 0)
                return 'start';
        }
        return null;
    },
    /**
     * @param {HTMLElement} node
     * @return {undefined}
     */
    scrollIntoViewIfNeeded(node) {
        if (!node)
            return;
        if (node.scrollIntoViewIfNeeded)
            node.scrollIntoViewIfNeeded();
        else
            node.scrollIntoView();
    },
    /*
     * @param {String} tagName
     * @param {Boolean} collapsed
     * @return {Boolean}
     */
    selectionCommonAncestorIs(tagName, collapsed) {
        const sel = window.getSelection();
        let range;
        if (sel.rangeCount === 0)
            return false;
        if (collapsed && !sel.isCollapsed)
            return false;
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.nodeName === '#text')
            return sel.getRangeAt(0).commonAncestorContainer.parentNode.nodeName === tagName;
        else
            return sel.getRangeAt(0).commonAncestorContainer.nodeName === tagName;
    },
    /*
     * @param {Object} range
     * @return {Element} commonAncestorContainer or it's parent if commonAncestorContainer is '#text'
     */
    getCommonAncestorContainer(range) {
        if (range.commonAncestorContainer.nodeName === '#text')
            return range.commonAncestorContainer.parentNode;
        else
            return range.commonAncestorContainer;
    },
    /*
     * @param {String} theTag
     * @param {Boolean} getTheCommonAncestorContainerAlso
     * @return {Object} when selection is found or not provided any params
     * @return {Boolean} false when no selection
     */
    selectionIs(theTag, getTheCommonAncestorContainerAlso) {
        if (window.getSelection().rangeCount === 0)
            return false;
        const selection = window.getSelection().getRangeAt(0);
        if (theTag)
            if (selection) {
                if (selection.startContainer.parentNode.tagName === theTag || selection.endContainer.parentNode.tagName === theTag || getTheCommonAncestorContainerAlso && selection.commonAncestorContainer.tagName === theTag) {
                    return selection;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        else
            return selection;
    },
    /*
     * @param {Element} element
     */
    selectionFromElement(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        this.restoreRange(range);
    },
    /*
     * @param {Object} range
     */
    restoreRange(range) {
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    },
    /**
     * @param {String} url
     * @return {String}
     */
    toUrl(url) {
        if (/^http/.test(url))
            return url;
        if (/^\/\//.test(url))
            return `http:${ url }`;
        return `http://${ url }`;
    },
    getBaseUrl() {
        const protocol = location.protocol, host = location.hostname, port = location.port;
        return CJ.tpl('{0}//{1}{2}/', protocol, host, port ? `:${ port }` : port);
    },
    makeUrl() {
        return `${ this.getBaseUrl() }#${ CJ.tpl.apply(null, arguments) }`;
    },
    /**
     * @param {String} tags list of tags with "#"-symbol missing
     * @return {String} tags with "#"-symbol for simple tags.
     */
    fixTags(tags) {
        if (!tags)
            return '';
        tags = tags.replace(/,/g, ' ').split(' ');
        for (let i = 0, tag; tag = tags[i]; i++) {
            const type = CJ.Utils.getTagType(tag);
            if (type == 'tag' && tag[0] != '#')
                tags[i] = `#${ tag }`;
        }
        return tags.join(' ');
    },
    /**
     * @param {Ext.Evented} e
     * @return {String} Text that user is going to paste.
     */
    getClipboardDataFromEvent(e) {
        const clipboardData = e.clipboardData || window.clipboardData;
        return clipboardData.getData(Ext.browser.is.IE ? 'text' : 'text/plain');
    },
    /**
     * @param {String} tags
     * @return {undefined}
     */
    getUserFromTags(tags) {
        if (tags.indexOf('@') == -1)
            return null;
        if (this.getTagType(tags) == 'user')
            return tags.split(' ')[0];    // it's category or group, so we need to take the second tag.
        // it's category or group, so we need to take the second tag.
        return tags.split(' ')[1];
    },
    /**
     * @param {Date} date
     * @return {String}
     */
    expires(date) {
        const now = new Date();
        let monthDiff;
        let dayDiff;
        monthDiff = Ext.Date.diff(now, date, Ext.Date.MONTH);
        if (monthDiff > 0) {
            var key = 'expires-in-month';
            if (monthDiff > 1)
                key += '-many';
            return CJ.t(key).replace('{0}', monthDiff);
        }
        dayDiff = monthDiff = Ext.Date.diff(now, date, Ext.Date.DAY);
        if (dayDiff > 0) {
            var key = 'expires-in-day';
            if (dayDiff > 1)
                key += '-many';
            return CJ.t(key).replace('{0}', dayDiff);
        }
        return CJ.t('expires-tomorrow');
    },
    /**
     * @param {String} url
     * @return {String}
     */
    getBackgroundUrl(url) {
        return CJ.tpl('url(\'{0}\')', Ext.String.escape(url));
    },
    /**
     * @param {String|Number} value
     * @return {String} Formatted string, e.g 2 -> 2.00, 0.4 -> 0.40 etc...
     */
    formatPrice(value) {
        value += '';    // to String.
        // to String.
        value = value.replace(/[^\d\.]+/g, '');
        if (!value.length)
            return value;
        const items = value.split('.');
        items[0] = `${ +items[0] || 0 }`;
        items[1] = `${ +items[1] || 0 }`;
        if (items[1].length == 1)
            items[1] += '0';
        items[1] = items[1].slice(0, 2);
        return items.slice(0, 2).join('.');
    },
    /**
     * calculates user's mark in percentage.
     *
     * @param {Object} config
     * @param {Object} config.complete
     * @param {Object} config.incorrect
     * @param {Object} config.total
     * @param {Number} fixed
     * @return {undefined}
     */
    score(config, fixed) {
        if (config.total == 0)
            return 0;
        return (config.complete / config.total * 100).toFixed(fixed || 0);
    },
    /**
     * @param {String} hex
     * @param {Number} opacity [0..1]
     */
    hexToRgba(hex, opacity) {
        const color = hex.split(' ');
        hex = color[0];
        if (color[1])
            opacity = color[1] / 100;
        if (hex.length < 5)
            hex = hex.replace(/([\da-f])/gi, (a, b) => b + b);
        hex = hex.replace('#', '');
        hex = hex.replace(/([\da-f]{2})/gi, (a, b) => `${ parseInt(b, 16) }, `);
        return CJ.tpl('rgba({0} {1})', hex, Ext.isDefined(opacity) ? opacity : 1);
    },
    getIdFromUrl(url) {
        const regex = /\/#!\w\/|\/#!/;
        let splits;
        let trimIndex;
        if (!regex.test(url))
            return url;
        splits = url.split(regex);
        splits.shift();
        splits = splits.join('');
        trimIndex = splits.indexOf('/');
        if (trimIndex > -1)
            splits = splits.substring(0, trimIndex);
        return splits;
    },
    completeness(completeness) {
        if (!completeness)
            return '';
        return this.getTpl('completeness', {
            total: completeness.total,
            correct: completeness.correct + (completeness.notvalidatable || 0)
        });
    },
    /**
     * @param {String} config.url           Image URL
     * @param {String} config.format        Image format
     * @param {Function} config.callback    Callback function
     * @param {Object} config.scope         Callback scope
     * @param {Object} config.stash         Stash for extra data that we want to keep
     */
    imageToDataURL(config) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            let canvas = document.createElement('CANVAS');
            const ctx = canvas.getContext('2d');
            let size = this.height >= this.width ? this.width : this.height;
            let x = 0;
            let y = 0;
            if (config.background) {
                ctx.fillStyle = config.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            if (config.square) {
                canvas.width = size;
                canvas.height = size;
                x = -(this.width - size) / 2;
                y = -(this.height - size) / 2;
            } else {
                canvas.height = this.height;
                canvas.width = this.width;
            }
            if (config.sizeMultiplier) {
                const sizeMultiplier = config.sizeMultiplier;
                canvas.height = sizeMultiplier * canvas.height;
                canvas.width = sizeMultiplier * canvas.width;
                size = sizeMultiplier * size;
                ctx.drawImage(this, x, y, this.width * sizeMultiplier, this.height * sizeMultiplier);
            } else {
                ctx.drawImage(this, x, y);
            }
            if (config.circle) {
                ctx.globalCompositeOperation = 'destination-in';
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            Ext.callback(config.callback, config.scope, [
                canvas.toDataURL(config.format),
                config.stash
            ]);
            canvas = null;
            img.onload = null;
        };
        img.src = config.url;
    },
    /**
     * downloads a file from url.
     * @param {String} url
     * @return {undefined}
     */
    download(url) {
        const beforeUnloadFn = window.onbeforeunload;
        window.onbeforeunload = null;
        window.location.href = url;
        setTimeout(() => {
            window.onbeforeunload = beforeUnloadFn;
        }, 1);
    },
    /**
     * a bugless method to show an element within parent container with "d-scroll" className.
     * fixes a problem on iOS: calling #scrollIntoView on iOS doesn't use scroll of parent container.
     * http://stackoverflow.com/questions/11039885/scrollintoview-causing-the-whole-page-to-move
     * @param {HTMLElement} el
     * @return {undefined}
     */
    scrollIntoViewWithinParent(el) {
        if (!Ext.os.is.iOS)
            return el.scrollIntoView();
        const parent = Ext.fly(el).findParentNode('.d-scroll');
        parent.scrollTop = el.offsetTop - parent.offsetTop;
    },
    /**
     * wraps a function insode of a scope object into a promise, that will be resolved with a value from response.ret.
     * Example:
     * CJ.Utils.promise(this, 'getUsers', arg1, arg2).then(function(users) {})
     * @param {Object} scope
     * @param {String} callback
     * @param {Object} all params after callback will be considered as params for callback functions.
     * @return {Promise} will be resolved with values from "response.ret"-key
     */
    promise(scope, callback) {
        const args = Ext.toArray(arguments).slice(2);
        return Promise.resolve().then(() => new Promise((resolve, reject) => {
            args.push({
                success: resolve,
                failure: reject
            });
            scope[callback](...args);
        })).then(response => response.ret);
    },
    /**
     * @param {Object} response
     * @param {String} type e.g: preview
     * @return {String}
     */
    getImageUrl(response, type) {
        let cdnUrl = response.cdnUrl;
        if (Core.opts.uploadcare.replace_cdn_netloc)
            cdnUrl = Core.opts.uploadcare.cdn_netloc;
        if (type === 'preview') {
            return [
                'https:/',
                cdnUrl,
                response.uuid,
                '-/preview',
                '140x140',
                'preview'
            ].join('/');
        }
        return [
            'https:/',
            cdnUrl,
            response.uuid,
            encodeURIComponent(response.name)
        ].join('/');
    }
});