
Ext.define('CJ.constant', {
    singleton: true,
    request: {
        login: CJ.app.url + '/auth/submit',
        logout: CJ.app.url + '/auth/logout',
        authCheck: CJ.app.url + '/auth/check',
        sessionData: CJ.app.url + '/auth/get_session_data',
        resetPasswordReq: CJ.app.url + '/auth/pw_reset_req',
        resetPassword: CJ.app.url + '/auth/pw_reset',
        merge: CJ.app.url + '/portal/portal_user_merge',
        rpc: CJ.app.url + '/base/remote_call',
        batch: CJ.app.url + '/base/remote_batch',
        embed: CJ.app.url + '/embed',
        embedSupport: CJ.app.url + '/embed/support',
        flagComment: CJ.app.url + '/document/flag_comment',
        terms: '/resources/project/terms_of_use.html',
        send_performance_result: CJ.app.url + '/dev/save_performance_result',
        build_performance_report: CJ.app.url + '/dev/build_performance_report',
        playlist_csv_report: CJ.app.url + '/document/reports/amt_completed',
        log: CJ.app.url + '/log'
    },
    webpush: {
        subscribe: '/webapp/webpush_subscribe',
        unsubscribe: '/webapp/webpush_unsubscribe'
    },
    resourceUrl: '/fs/resource/',
    tagsDelimiter: ' ',
    appVer: 4,
    JAVA_LATEST_VER: '1.8',
    publicServer: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + CJ.app.url,
    STRIPE_KEY: 'pk_zc2njAkiNoHzwSpdeJB02YauNYhOs'
});

