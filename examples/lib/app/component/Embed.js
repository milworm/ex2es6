/**
 * Class is wrapper of Ext.Ajax, that provides ability to sent request to the server.
 */
Ext.define('CJ.component.Embed', {
    alternateClassName: 'CJ.Embed',
    singleton: true,
    requestUrlInfos(blob, success, failure, scope) {
        if (!blob)
            return null;
        success = success || Ext.emptyFn;
        failure = failure || Ext.emptyFn;    //trim blob
        //trim blob
        blob = CJ.Utils.trim(blob);    // using defer here, because in IE
                                       // running xhr.open in "onpaste"-handler raises "Access is defined"
        // using defer here, because in IE
        // running xhr.open in "onpaste"-handler raises "Access is defined"
        Ext.defer(() => {
            CJ.Ajax.request({
                url: CJ.constant.request.embed,
                method: 'GET',
                params: { code: CJ.Utils.base64Encode(blob) },
                scope: scope || CJ.app,
                success,
                failure
            });
        }, 1);
    },
    camelCase(key) {
        const split = key.split('_'), head = split[0], tail = split.splice(1).map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join('');
        return head + tail;
    },
    detectEmbed(text) {
        if (text.indexOf('<iframe ') > -1 || text.indexOf('<object ') > -1)
            return true;
        if (/<script[^>]*>.*<\/script>/.test(text))
            return true;
        return false;
    },
    /*
        Breaks a blob of text into a list of objects containing
        text snippets and/or recognized urls.
    */
    parseText(text) {
        if (!Ext.isString(text) && text.length > 4)
            return null;
        let p;
        const pieces = text.split(' ');
        let s;
        const sets = [];
        substring = '';
        for (p in pieces) {
            const idx = pieces[p].indexOf('.');
            if (idx > 0 && idx < pieces[p].length - 1) {
                if (substring.length > 0) {
                    sets.push({ text: substring });
                    substring = '';
                }
                sets.push({ url: pieces[p] });
            } else {
                substring += `${ pieces[p] } `;
            }
        }
        if (substring.length > 0)
            sets.push({ text: substring });
        return sets;
    }
});