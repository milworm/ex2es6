Ext.define('CJ.core.Calculations', {
    singleton: true,
    alternateClassName: 'CJ.Calculations',
    oneWeekInMs: 7 * 24 * 60 * 60 * 1000,
    mf(values) {
        const stats = values.studentStats;
        const lm = this.getLastMonday();
        const llm = lm - this.oneWeekInMs;
        const start = Ext.Date.parse(values.startDate, 'Y-m-d h:i:s');
        const end = Ext.Date.parse(values.endDate, 'Y-m-d h:i:s');
        const n0 = stats.totalAnswers;
        const nw = stats.cwAnswers;
        const t = stats.totalQuestions;
        const duration = stats.totalHours;
        const endStartDiff = this.daysBetweenDates(end, start);
        const lmStartDiff = this.daysBetweenDates(lm, start);
        const lmEndDiff = this.daysBetweenDates(lm, end);
        let result;
        if (llm <= start)
            result = Math.round(10 * duration / (endStartDiff / 7) * (7 - lmStartDiff) / 7) / 10;
        else if (lmEndDiff / 7 < 1)
            result = Math.round(10 * duration * ((t - (n0 - nw)) / t)) / 10;
        else
            result = Math.round(10 * duration * ((t - (n0 - nw)) / t) / (lmEndDiff / 7)) / 10;
        return isNaN(result) ? 0 : result;
    },
    me(values) {
        const stats = values.studentStats;
        const lm = this.getLastMonday();
        const nm = lm + this.oneWeekInMs;
        const llm = lm - this.oneWeekInMs;
        const start = Ext.Date.parse(values.startDate, 'Y-m-d h:i:s');
        const end = Ext.Date.parse(values.endDate, 'Y-m-d h:i:s');
        const n0 = stats.totalAnswers;
        const nw = stats.cwAnswers;
        const t = stats.totalQuestions;
        const endStartDiff = this.daysBetweenDates(end, start);
        const lmStartDiff = this.daysBetweenDates(lm, start);
        const lmEndDiff = this.daysBetweenDates(lm, end);
        let total;
        if (nm >= start && lm <= start)
            total = Math.round(t / (endStartDiff / 7) * (7 - lmStartDiff) / 7);
        else if (llm <= start)
            total = null;
        else if (lmEndDiff / 7 < 1)
            total = t - n0 - nw;
        else
            total = Math.round((t - (n0 - nw)) / (lmEndDiff / 7));
        return {
            count: nw,
            total: isNaN(total) ? 0 : total
        };
    },
    getNextMonday() {
        return new Date(this.getLastMonday() + this.oneWeekInMs);
    },
    getLastMonday() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return today.setDate(today.getDate() - today.getDay() + 1);
    },
    daysBetweenDates(end, start) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((end - start) / oneDay));
    }
});