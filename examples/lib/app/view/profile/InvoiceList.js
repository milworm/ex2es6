import 'Ext/Component';

//[TODO]
// implement implement button tap on invoice
Ext.define('CJ.view.profile.InvoiceList', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-profile-invoice-list',
    /**
     * @property {Object} clipboardConfig
     */
    clipboardConfig: null,
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @param {Object} config.popup
         * @param {Object} config.content
         */
        popup(config) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                cls: 'd-invoice-list-popup',
                title: 'view-profile-invoice-list-title',
                content: Ext.apply({ xtype: 'view-profile-invoice-list' }, config.content),
                actionButton: false
            }, config.popup));
        }
    },
    config: {
        providedInvoiceId: null,
        printOnInvoiceLoaded: false,
        ownerAddress: null,
        invoices: null,
        temporaryInvoices: null,
        detailedInvoice: null,
        cls: 'd-invoice-list-component',
        tpl: [
            '<div class="d-invoice-list d-vbox">',
            '<label class="d-invoice-search-holder d-hbox d-flex-row d-hcenter">',
            '<input type="text" class="d-input d-invoice-search" placeholder="{searchButton}" />',
            '</label>',
            '<div class="d-list">',
            '</div>',
            '</div>',
            '<div class="d-detailed-invoice d-vbox d-collapsed">',
            '<div class="d-top-bar d-hbox d-flex-row d-vcenter">',
            '<div class="d-back-button">',
            '<span class="d-text">{backButton}</span>',
            '</div>',
            '<div class="d-copy-link">',
            '</div>',
            '</div>',
            '<div class="d-invoice-complete-details-container">',
            '<div class="d-invoice-complete-details d-vbox d-vcenter">',
            '</div>',
            '<div class="d-dummy-block"></div>',
            '</div>',
            '</div>'
        ],
        data: {
            searchButton: 'view-profile-invoices-search-button',
            backButton: 'view-profile-invoices-back-button'
        },
        invoiceTabTpl: Ext.create('Ext.Template', '<div data-invoice="{invoiceId}" class="d-purchase-details d-vbox d-vcenter">', '<div class="d-title">{title}</div>', '<div class="d-details d-hbox d-vcenter">', '<div class="d-icon" style="background-image: url(\'{imageUrl}\')"></div>', '<div class="d-owner">{author}</div>', '<div class="d-expiration">{expires}</div>', '</div>', '</div>', '<div class="d-purchase-amout">{total}</div>', { compiled: true }),
        detailedInvoiceTpl: Ext.create('Ext.XTemplate', '<div data-invoice="{id}" class="d-invoice">', '{invoiceLabel}', '<span class="d-button d-print">{printLabel}</span>', '</div>', '<div class="d-label">', '{title}', '</div>', '<tpl if="bundled">', '<div class="d-duration">', '{durationLabel}', '<span>{hPeriod}</span>', '</div>', '<div class="d-price">', '{bundlePriceLabel}', '<span>{bundlePrice}</span>', '</div>', '<div class="d-bundle-quantity">', '{bundleQuantityLabel}', '<span>{bundleQuantity}</span>', '</div>', '<div class="d-unit-price">', '{unitPriceLabel}', '<span>{unitPrice}</span>', '</div>', '<div class="d-extra-units">', '{extraUnitsLabel}', '<span>{extraUnits}</span>', '</div>', '<tpl else>', '<div class="d-price-duration">', '{priceDurationLabel}', '<span class="d-money">{unitPrice}/{hPeriod}</span>', '</div>', '<div class="d-quantity">', '{quantityLabel}', '<span>{qty}</span>', '</div>', '</tpl>', '<div class="d-subtotal">', '{subtotalLabel}', '<span class="d-money">{subtotal}</span>', '</div>', '<div class="d-taxes">', '{taxesLabel}', '<span class="d-money">{taxes}</span>', '</div>', '<tpl if="voucher">', '<div class="d-promo-code">', '{promoCodeLabel}', '<span class="d-money">{promoCodeText}</span>', '</div>', '<div class="d-discount">', '{discountLabel}', '<span class="d-money">- ${voucher.discount.val}</span>', '</div>', '</tpl>', '<div class="d-total">', '{totalLabel}', '<span class="d-money">{total}</span>', '</div>', '<tpl if="assignButton">', '<div class="d-assign-licenses">{assignButton}</div>', '</tpl>')
    },
    constructor(config) {
        this.callParent(args);
        this.attachListeners();
        this.loadPurchases();
        this.clipboardConfig = {
            cmp: this,
            text: '',
            delegate: '.d-copy-link'
        };
        CJ.Clipboard.copy(this.clipboardConfig);
        if (!this.getOwnerAddress())
            this.loadOwnerAddress();
    },
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    loadOwnerAddress() {
        CJ.User.loadBillingAddress({
            scope: this,
            success: this.onOwnerAddressLoaded
        });
    },
    onOwnerAddressLoaded(response) {
        this.setOwnerAddress(response.ret);
    },
    loadPurchases() {
        CJ.request({
            rpc: {
                model: 'PortalUser',
                method: 'list_purchased_licenses'
            },
            scope: this,
            success: this.onPurchasesLoaded
        });
    },
    onPurchasesLoaded(response) {
        const itemsList = response.ret, providedInvoiceId = this.getProvidedInvoiceId();
        this.setInvoices(itemsList);
        this.fillTemporaryInvoices();
        if (providedInvoiceId)
            this.getInvoiceById(providedInvoiceId);
    },
    applyData(data) {
        for (const item in data) {
            data[item] = CJ.t(data[item], true);
        }
        return data;
    },
    /**
     * @param {String} invoiceDetailsObject when provided shows d-detailed-invoice
     * @return {undefined}
     */
    showListOrInvoice(invoiceDetailsObject) {
        const invoiceList = this.innerElement.dom.querySelector('.d-invoice-list'), invoiceDetails = this.innerElement.dom.querySelector('.d-detailed-invoice');
        if (invoiceDetailsObject) {
            this.onInvoiceDetails(invoiceDetailsObject);
            invoiceDetails.classList.remove('d-collapsed');
            invoiceList.classList.add('d-collapsed');
            return;
        }
        invoiceDetails.classList.add('d-collapsed');
        invoiceList.classList.remove('d-collapsed');
    },
    onInvoiceDetails(invoice) {
        const detailedInvoice = this.innerElement.dom.querySelector('.d-invoice-complete-details');
        const voucher = invoice.voucher;
        let assignButton = false;
        let extraUnits = 0;
        let promoCodeText;
        let tplData;
        if (invoice.left > 0)
            assignButton = CJ.tpl(CJ.t('view-purchase-form-review-assign'), invoice.left);
        if (invoice.bundled && invoice.qty > invoice.bundleQuantity)
            extraUnits = invoice.qty - invoice.bundleQuantity;
        if (voucher) {
            promoCodeText = CJ.t('view-profile-invoice-list-promo-code-text');
            promoCodeText = CJ.tpl(promoCodeText, voucher.code, voucher.discount.pct);
        }
        tplData = Ext.apply(invoice, {
            invoiceLabel: CJ.t('view-purchase-form-review-invoice'),
            purchasedLabel: CJ.t('view-purchase-form-review-purchased'),
            totalLabel: CJ.t('view-purchase-form-review-total'),
            priceDurationLabel: CJ.t('view-purchase-form-review-price-and-duration'),
            subtotalLabel: CJ.t('view-purchase-form-review-subtotal'),
            quantityLabel: CJ.t('view-purchase-form-review-quantity'),
            taxesLabel: CJ.t('view-purchase-form-review-taxes'),
            discountLabel: CJ.t('view-profile-invoice-list-discount'),
            promoCodeLabel: CJ.t('view-profile-invoice-list-promo-code'),
            promoCodeText,
            printLabel: CJ.t('view-profile-invoice-print-label'),
            extraUnits,
            durationLabel: CJ.t('view-purchase-form-details-bundle-expiration-title'),
            extraUnitsLabel: CJ.t('view-purchase-form-details-bundle-additional-quantity'),
            bundlePriceLabel: CJ.t('view-purchase-form-details-bundle-price-quantity'),
            bundleQuantityLabel: CJ.t('view-purchase-form-details-bundle-quantity'),
            unitPriceLabel: CJ.t('view-purchase-form-details-bundle-additional-item-price'),
            assignButton
        });
        detailedInvoice.innerHTML = this.getDetailedInvoiceTpl().apply(tplData);
    },
    fillTemporaryInvoices() {
        const invoices = this.getInvoices();
        const searchValue = this.innerElement.dom.querySelector('.d-invoice-search').value.toLowerCase();
        let tempInvoices = [];
        if (searchValue)
            for (let i = 0, ln = invoices.length; i < ln; i++) {
                if (invoices[i].title.toLowerCase().indexOf(searchValue) != -1)
                    tempInvoices.push(invoices[i]);
            }
        else
            tempInvoices = invoices.slice();
        this.setTemporaryInvoices(tempInvoices);
        this.drawFakeList();
    },
    drawFakeList() {
        const invoices = this.getTemporaryInvoices(), invoicesList = this.innerElement.dom.querySelector('.d-list'), html = [];
        invoicesList.scrollTop = 0;
        for (let i = 0, ln = invoices.length; i < ln; i++) {
            html.push(`<div data-invoice="${ invoices[i].id }" class="d-purchased-item d-hbox d-hcenter"></div>`);
        }
        invoicesList.innerHTML = html.join('');
        this.drawPortion();
    },
    drawPortion() {
        const invoices = this.getTemporaryInvoices(), invoicesList = this.innerElement.dom.querySelector('.d-list'), tpl = this.getInvoiceTabTpl(), firstIndexShown = Math.floor(invoicesList.scrollTop / 67);    //67 from 67px ,the item height.
        //67 from 67px ,the item height.
        for (let i = firstIndexShown - 2, ln = invoicesList.childNodes.length; i < firstIndexShown + 9; i++) {
            if (i < 0 || i > ln - 1)
                continue;
            if (i < firstIndexShown - 1 || i >= firstIndexShown + 8)
                invoicesList.childNodes[i].innerHTML = '';
            if (i >= firstIndexShown - 1 && i < firstIndexShown + 8) {
                invoicesList.childNodes[i].innerHTML = tpl.apply(Ext.apply(invoices[i], { expires: invoices[i].expires }));
            }
        }
    },
    getInvoiceById(id) {
        this.clipboardConfig.text = CJ.Utils.makeUrl(CJ.tpl('!invoice/{0}', id));
        CJ.License.getInfo(id, {
            scope: this,
            success: this.onInvoiceReceived
        });
    },
    onInvoiceReceived(results) {
        this.setDetailedInvoice(results.ret);
        this.showListOrInvoice(results.ret);
        if (this.getPrintOnInvoiceLoaded()) {
            this.setPrintOnInvoiceLoaded(false);
            this.loadLogo();
        }
    },
    onTap(e) {
        let invoiceId;
        if (e.getTarget('.d-purchased-item', 5)) {
            invoiceId = CJ.Utils.getNodeData(e.getTarget('.d-purchased-item', 5), 'invoice');
            this.getInvoiceById(invoiceId);
        }
        if (e.getTarget('.d-back-button', 5)) {
            this.showListOrInvoice();
        }
        if (e.getTarget('.d-assign-licenses', 5)) {
            CJ.License.setData({ license: this.getDetailedInvoice() });
            CJ.view.purchase.assign.Options.popup();
        }
        if (e.getTarget('.d-print', 5)) {
            this.printInvoice();
        }
    },
    printInvoice() {
        CJ.PdfPrinter.print('invoice', {
            invoice: this.getDetailedInvoice(),
            owner: this.getOwnerAddress()
        }, { loadLogo: true });
    },
    onInput(e) {
        this.fillTemporaryInvoices();
    },
    onScroll(e) {
        e.preventDefault();
        this.drawPortion();
        return false;
    },
    attachListeners() {
        this.innerElement.on('tap', this.onTap, this);
        this.innerElement.on('input', this.onInput, this, {
            delegate: '.d-input',
            buffer: 500
        });
        this.innerElement.dom.querySelector('.d-list').addEventListener('scroll', this.onScroll.bind(this));
    },
    detachListeners() {
        this.innerElement.dom.querySelector('.d-list').removeEventListener('scroll', this.onScroll.bind(this));
    },
    destroy() {
        this.clipboardConfig = null;
        CJ.License.setData(null);
        this.detachListeners();
        this.callParent(args);
    }
});