// Library doc at: http://mrrio.github.io/jsPDF/doc/symbols/jsPDF.html
/**
 * This class allows us to print information in pdf-file.
 *
 * example:
 * CJ.PdfPrinter.print(templateName, dataForTemplate);
 */
Ext.define('CJ.component.PdfPrinter', {
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.PdfPrinter',
    /**
     * @property {Object} templates
     */
    templates: {
        invoice(doc, data) {
            const owner = data.owner, invoice = data.invoice, logo = data.logo, promoCode = invoice.voucher, position = { totalsY: 6.75 };    //lines
            //lines
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.01);
            doc.line(0.7, 4, 7.8, 4);
            doc.line(0.7, 6.2, 7.8, 6.2);    //title
            //title
            doc.setFontSize(25);
            doc.setFont('helvetica', 'normal');
            doc.text(CJ.t('pdf-template-invoice-invoice', true), 1, 1);    // all labels
            // all labels
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(CJ.t('pdf-template-invoice-invoice-number', true), 1, 1.7);
            doc.text(CJ.t('pdf-template-invoice-date', true), 1, 2);
            doc.text(CJ.t('pdf-template-invoice-to', true), 3.6, 2.5);
            doc.text(CJ.t('pdf-template-invoice-from', true), 1, 2.5);
            doc.text(CJ.t('pdf-template-invoice-total', true), 6.75, 4.5);
            doc.text(CJ.t('pdf-template-invoice-unit-price', true), 4.4, 4.5);
            doc.text(CJ.t('pdf-template-invoice-subtotal', true), 4.4, 6.75);
            doc.text(CJ.t('pdf-template-invoice-product-description', true), 1, 4.5);
            doc.text(CJ.t('pdf-template-invoice-quantity', true), 5.6, 4.5);    //@TODO refactor this in a more beautiful way.
            //@TODO refactor this in a more beautiful way.
            if (Ext.typeOf(invoice.taxDetails) === 'array') {
                if (invoice.taxDetails[0])
                    doc.text(CJ.t(`TAX_${ invoice.taxDetails[0].name }`, true), 4.4, 7);
                if (invoice.taxDetails[1])
                    doc.text(CJ.t(`TAX_${ invoice.taxDetails[1].name }`, true), 4.4, 7.25);
            }
            if (promoCode) {
                let promoCodeText = CJ.t('pdf-template-invoice-promo-code-text', true);
                const discount = promoCode.discount;
                promoCodeText = CJ.tpl(promoCodeText, promoCode.code, discount.pct, discount.val);
                doc.text(promoCodeText, 4.4, 7.5);
            }
            doc.text(CJ.t('pdf-template-invoice-telephone-label', true), 1, 10.4);
            doc.text(CJ.t('pdf-template-invoice-email-label', true), 2.5, 10.4);
            doc.text(CJ.t('pdf-template-invoice-website-label', true), 4.4, 10.4);    //doc.text('pin', x, y);
            //doc.text('pin', x, y);
            doc.setFontSize(20);
            doc.text(CJ.t('pdf-template-invoice-total', true), 4.4, promoCode ? 8 : 7.75);    // all info
            // all info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(CJ.t('pdf-template-invoice-our-address', true), 1, 2.7);    // address string generation
            // address string generation
            doc.text([
                owner.name,
                '\n',
                owner.line1,
                owner.line2,
                '\n',
                owner.city,
                ', ',
                owner.province,
                ', ',
                owner.country,
                '\n',
                owner.zip
            ].join(''), 3.6, 2.7);
            if (!invoice.bundled) {
                // single license details
                doc.text(`${ invoice.qty }`, 5.6, 5);
                doc.text(`$${ invoice.unitPrice }`, 4.4, 5);
                doc.text(`$${ invoice.subtotal }`, 6.75, 5);
                doc.text(`${ invoice.title }`, 1, 5);
            } else {
                // bundle details
                doc.text([
                    invoice.title,
                    '\n(',
                    CJ.t('pdf-template-invoice-included-licences', true),
                    ' ',
                    invoice.bundleQuantity,
                    ' ',
                    CJ.t('pdf-template-invoice-duration', true),
                    ' ',
                    invoice.hPeriod,
                    ')'
                ].join(''), 1, 5);
                doc.text('1', 5.6, 5);
                doc.text(`$${ invoice.bundlePrice }`, 4.4, 5);
                doc.text(`$${ invoice.bundlePrice }`, 6.75, 5);    // extra units details
                // extra units details
                doc.text([CJ.t('pdf-template-invoice-additional-licences', true)].join(''), 1, 5.5);
                doc.text(`${ invoice.extraUnits }`, 5.6, 5.5);
                doc.text(`$${ invoice.unitPrice }`, 4.4, 5.5);
                doc.text(`$${ invoice.unitPrice * invoice.extraUnits }`, 6.75, 5.5);
            }
            doc.text(`$${ invoice.subtotal }`, 6.75, 6.75);
            doc.text(CJ.t('pdf-template-invoice-telephone-value', true), 1.2, 10.4);
            doc.text(CJ.t('pdf-template-invoice-email-value', true), 2.7, 10.4);
            doc.text(CJ.t('pdf-template-invoice-website-value', true), 4.6, 10.4);    //@TODO refactor this in a more beautiful way.
            //@TODO refactor this in a more beautiful way.
            if (Ext.typeOf(invoice.taxDetails) === 'array') {
                if (invoice.taxDetails[0])
                    doc.text(`$${ invoice.taxDetails[0].value }`, 6.75, 7);
                if (invoice.taxDetails[1])
                    doc.text(`$${ invoice.taxDetails[1].value }`, 6.75, 7.25);
            }
            doc.text(`${ invoice.id }`, 2, 1.7);
            doc.text(`${ invoice.purchased }`, 2, 2);
            doc.text(`${ invoice.title }`, 1, 5);    //total price
            //total price
            doc.setFontSize(20);
            doc.text(`$${ invoice.total }`, 6.75, promoCode ? 8 : 7.75);    //draw logo
                                                                            // condition is present because of issue #10360
            //draw logo
            // condition is present because of issue #10360
            if (logo)
                doc.addImage(logo, 'JPEG', 5.7, 0.7, 2, 0.4);
        },
        /*
         * @param {jsPDF} doc
         * @param {Object} data
         */
        pins(doc, data) {
            const pins = data.pins;
            const
            //even number
            numberOfPinsPerPage = 6;
            const pinBlockHeight = 2.5;
            const halfPinBlockHeight = pinBlockHeight / 2;
            const pages = Math.ceil(pins.length / numberOfPinsPerPage);
            const title = data.title;
            const url = data.url;
            const purchased = Ext.Date.parse(data.purchased, 'Y-m-d h:i:s');
            const expires = Ext.Date.parse(data.expires, 'Y-m-d h:i:s');
            let subTitle;
            let directionInfo;
            let extraInfo;
            subTitle = CJ.tpl('{0} {1} \u2022 {2} {3}', CJ.t('pdf-template-pins-purchased', true), Ext.Date.format(purchased, 'Y/m/d'), CJ.t('pdf-template-pins-expires', true), Ext.Date.format(expires, 'Y/m/d'));
            directionInfo = CJ.t('pdf-template-pins-usage-directions', true);
            extraInfo = CJ.t('pdf-template-pins-extra-info', true);    // draw all pages
            // draw all pages
            for (let p = 0, x, y; p < pages; p++) {
                if (p > 0)
                    doc.addPage();    // head title:
                // head title:
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(27);
                doc.text(title, 1, 1);    // head link:
                // head link:
                doc.setFontSize(10);
                doc.text(url.toLowerCase(), 1, 1.2);    //head expiration date
                //head expiration date
                doc.setFont('helvetica', 'bold');
                doc.text(subTitle, 1, 1.7);    //draw pincode blocks and horizontal bars(lines):
                //draw pincode blocks and horizontal bars(lines):
                for (let items = p * numberOfPinsPerPage + numberOfPinsPerPage, i = items - numberOfPinsPerPage, counter = 0; i < items; i++) {
                    // jumping if overflowing (always less than 10 times)
                    if (i >= pins.length)
                        continue;
                    const pin = pins[i].pin, pinInfo = pins[i].licensee || {
                            name: '',
                            username: ''
                        };    //pincode block relative positioning
                    //pincode block relative positioning
                    x = counter % 2 == 0 ? 1 : 5;
                    y = 2.5 + halfPinBlockHeight + pinBlockHeight * Math.floor(counter / 2);
                    counter++;    // counter for each pincode position (restarts after each 10 drawn)
                                  //draw lines
                    // counter for each pincode position (restarts after each 10 drawn)
                    //draw lines
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.01);
                    if (i + 1 == numberOfPinsPerPage || i + 1 >= pins.length)
                        doc.line(0.5, y + halfPinBlockHeight, 8, y + halfPinBlockHeight);
                    if (i % 2 == 0) {
                        doc.line(0.5, y - halfPinBlockHeight, 8, y - halfPinBlockHeight);
                        doc.line(4.25, y - halfPinBlockHeight, 4.25, y + halfPinBlockHeight);
                    }    /* COMPLETE FAILURE (FOR THE MOMENT)
                    // dashing lines
                    doc.setDrawColor(255, 255, 255);
                    doc.setLineWidth(0.05);
                    // horizontal coverings
                    for (var hln = 2, hlnMax = pinBlockHeight * 20, calcHLN, xPos; hln < hlnMax; hln += 2) {
                        calcHLN = y - halfPinBlockHeight + ((pinBlockHeight + 0.2) * hln/hlnMax);
                        xPos = x == 1 ? 0.4 : 4.24;
                        doc.line(xPos, calcHLN, xPos + 3.77, calcHLN);
                    }
                    // vertical coverings
                    for (var vln = 2, vlnMax = 80, calcVLN; vln < vlnMax; vln += 2) {
                        calcVLN = (x == 1 ? 0.4: 4.24) +  (3.77 * vln / vlnMax);
                        doc.line(calcVLN, y - halfPinBlockHeight, calcVLN, y + halfPinBlockHeight);
                    }
                    */
                         // code
                    /* COMPLETE FAILURE (FOR THE MOMENT)
                    // dashing lines
                    doc.setDrawColor(255, 255, 255);
                    doc.setLineWidth(0.05);
                    // horizontal coverings
                    for (var hln = 2, hlnMax = pinBlockHeight * 20, calcHLN, xPos; hln < hlnMax; hln += 2) {
                        calcHLN = y - halfPinBlockHeight + ((pinBlockHeight + 0.2) * hln/hlnMax);
                        xPos = x == 1 ? 0.4 : 4.24;
                        doc.line(xPos, calcHLN, xPos + 3.77, calcHLN);
                    }
                    // vertical coverings
                    for (var vln = 2, vlnMax = 80, calcVLN; vln < vlnMax; vln += 2) {
                        calcVLN = (x == 1 ? 0.4: 4.24) +  (3.77 * vln / vlnMax);
                        doc.line(calcVLN, y - halfPinBlockHeight, calcVLN, y + halfPinBlockHeight);
                    }
                    */
                    // code
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text(pin, x, y + halfPinBlockHeight * 0.4);    // user
                    // user
                    doc.text(pinInfo.username, x, y - halfPinBlockHeight * 0.3);    // name
                    // name
                    doc.setFont('helvetica', 'normal');
                    doc.text(pinInfo.name, x, y - halfPinBlockHeight * 0.6);    // directionInfo text
                    // directionInfo text
                    doc.text(directionInfo, x, y);    // extraInfo text
                    // extraInfo text
                    doc.setFontSize(8);
                    doc.text(extraInfo, x, y + halfPinBlockHeight * 0.7);
                }
            }
        },
        badgeCertificate(doc, data) {
            const logo = data.logo;
            const badgeImage = data.badgeImage;
            const portalLogo = data.portalLogo;
            const badge = data.badge;
            let earnedOn = Ext.Date.parse(badge.earned, 'Y-m-d h:i:s');
            const grantedTo = CJ.t('pdf-template-badge-certificate-granted-to', true);
            const grantedBy = CJ.t('pdf-template-badge-certificate-granted-by', true);
            const achievedOn = CJ.t('pdf-template-badge-certificate-achievement-date', true);
            const reason = CJ.t('pdf-template-badge-certificate-reason', true);
            const title = CJ.t('pdf-template-badge-certificate-title', true);
            const letterAverageWidth = 0.1;
            const badgeName = CJ.Utils.decodeHtml(badge.name);
            const ownerName = CJ.Utils.decodeHtml(data.ownerName);
            const portalName = CJ.Utils.decodeHtml(badge.grantedBy.portal.name);
            doc.setTextColor(85, 85, 85);    // #555
                                             /*
             * hacky centering since there's no center (where you see)
             * "
             *      - ((string.length * 0.1) / 2)
             * "
             * is the length of the string multiplied by letter average width (0.1 inches) divided by 2
             * and this is substracted from average position
             */
            // #555
            /*
             * hacky centering since there's no center (where you see)
             * "
             *      - ((string.length * 0.1) / 2)
             * "
             * is the length of the string multiplied by letter average width (0.1 inches) divided by 2
             * and this is substracted from average position
             */
            doc.setFillColor(233, 234, 235);    // #E9EAEB
            // #E9EAEB
            doc.rect(0, 0, 11, 1, 'F');
            if (logo)
                doc.addImage(logo, 'JPEG', 8.2, 7.755, 2, 0.4);
            if (badgeImage)
                doc.addImage(badgeImage, 'JPEG', 4, 2.5, 3, 3);
            if (portalLogo)
                doc.addImage(portalLogo, 'JPEG', 1.96, 7.67, 0.5, 0.5);
            earnedOn = Ext.Date.format(earnedOn, 'Y/m/d');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.text(title, 5.5 - title.length * 0.16 / 2, 2);
            doc.setFontSize(16);
            doc.text(ownerName, 5.4 - ownerName.length * letterAverageWidth / 2, 6.5);
            doc.text(badgeName, reason.length * letterAverageWidth + 0.7, 0.55);
            doc.text(earnedOn, 9.4, 0.55);
            doc.text(portalName, 2.6, 8);
            doc.setFont('helvetica', 'normal');
            doc.text(grantedTo, 5.5 - grantedTo.length * letterAverageWidth / 2, 6);
            doc.text(reason, 0.6, 0.55);
            doc.text(achievedOn, 8, 0.55);
            doc.text(grantedBy, 0.6, 8);
        }
    },
    /**
     * @param {Object} config
     * @return {jsPDF}
     */
    createDocument(config) {
        return new jsPDF(config.orientation, config.units, config.pageFormat);
    },
    /**
     * @param {String} name Template name, e.g: pinCodes, invoice  etc ...
     * @param {Object} data Data for template.
     * @param {Object} pdfConfig
     * @param {String} pdfConfig.fileName
     * @param {String} pdfConfig.orientation
     * @param {String} pdfConfig.units
     * @param {String} pdfConfig.pageFormat
     * @param {Boolean} pdfConfig.openFile
     */
    print(name, data, pdfConfig) {
        pdfConfig = Ext.apply({
            orientation: 'portrait',
            units: 'in',
            pageFormat: 'letter'
        }, pdfConfig);
        if (pdfConfig.loadLogo)
            return this.loadLogo(name, data, pdfConfig);
        CJ.DeferredScriptLoader.loadScript({
            scriptName: 'jsPDF',
            success: this.onReadyToPrint,
            args: [
                name,
                data,
                pdfConfig
            ],
            scope: this
        });
    },
    loadLogo(name, data, pdfConfig) {
        // https://redmine.iqria.com/issues/10360
        // issue #10360
        // apparently there's no error prompted in console, tested the code , all executes , but it won't work, no exceptions prompted either
        // for mobile we will bypass the logo (that means no logo on the invoice on mobile),
        // it has something to do with img.onload.
        if (!Ext.os.is.desktop) {
            return CJ.DeferredScriptLoader.loadScript({
                scriptName: 'jsPDF',
                success: this.onReadyToPrint,
                args: [
                    name,
                    data,
                    pdfConfig
                ],
                scope: this
            });
        }
        CJ.LoadBar.run();
        CJ.Utils.imageToDataURL({
            url: `${ Core.opts.resources_root }/resources/images/logos/logo-challengeu.jpg`,
            format: 'image/jpeg',
            callback: this.onLogoLoaded,
            scope: this,
            stash: {
                name,
                data,
                pdfConfig
            }
        });
    },
    onLogoLoaded(logoData, stash) {
        let configData = stash.data;
        configData = Ext.apply(configData, { logo: logoData });
        CJ.LoadBar.finish();
        CJ.DeferredScriptLoader.loadScript({
            scriptName: 'jsPDF',
            success: this.onReadyToPrint,
            args: [
                stash.name,
                configData,
                stash.pdfConfig
            ],
            scope: this
        });
    },
    onReadyToPrint(name, data, pdfConfig) {
        const doc = this.createDocument(pdfConfig), template = this.templates[name];
        template(doc, data);
        if (pdfConfig.openFile) {
            doc.output(pdfConfig.openFile);
            return;
        }
        doc.save(pdfConfig.fileName || name);
    }
});