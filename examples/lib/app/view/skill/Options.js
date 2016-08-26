import 'Ext/Component';

Ext.define('CJ.view.skill.Options', {
    extend: 'Ext.Component',
    alias: 'widget.view-skill-options',
    config: {
        badge: null,
        data: null,
        isOwner: false,
        stream: null,
        popup: null,
        logo: null,
        cls: 'd-view-skill-options d-vbox',
        tpl: Ext.create('Ext.XTemplate', '<div class="d-description-sector">', '<tpl if="grantedBy">', '<div class="d-granted-by d-hbox d-flex-row">', '<div class="d-icon" style="background-image: url(\'{grantedByIcon}\')"></div>', '<div class="d-text d-vbox">{grantedByText}</div>', '</div>', '</tpl>', '<div class="d-description-text">{description}</div>', '</div>', '<tpl if="isOwner">', '<div class="d-bottom-bar d-hbox d-flex-row">', '<div class="d-display-hide-badge {displayHideLabel}"></div>', //'<div class="d-delete-badge"></div>',
        // @NOTE to be activated when certificate gets updated and ready to specs
        '<div class="d-print-badge"></div>', '</div>', '<tpl elseif="isPortalAdmin">', '<div class="d-bottom-bar d-hbox d-flex-row">', '<div class="d-print-badge"></div>', '</div>', '</tpl>')
    },
    constructor(config) {
        const badge = config.badge, displayHideLabel = badge.display ? 'd-hide-badge' : 'd-display-badge', grantedBy = badge.grantedBy ? badge.grantedBy : false, data = {
                description: badge.description,
                displayHideLabel: CJ.t(displayHideLabel),
                isOwner: config.isOwner,
                isPortalAdmin: CJ.StreamHelper.isPortalAdminOfStream(),
                grantedBy: false
            };
        if (grantedBy) {
            Ext.apply(data, {
                grantedByIcon: grantedBy.portal.icon,
                grantedByText: CJ.tpl('{0} <span>{1} {2}</span>', CJ.t('view-skill-options-granted-by'), grantedBy.portal.name, grantedBy.portal.tag),
                grantedBy: true
            });
        }
        config = Ext.apply(config, { data });
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    onElementTap(evt) {
        const badge = this.getBadge();
        if (evt.getTarget('.d-display-hide-badge')) {
            if (badge.display)
                CJ.Badge.unPin(badge.examId, {
                    success: this.onBadgeUpdateSuccess,
                    scope: this
                });
            else
                CJ.Badge.pin(badge.examId, {
                    success: this.onBadgeUpdateSuccess,
                    scope: this
                });
        }
        if (evt.getTarget('.d-display-delete')) {
            CJ.Badge.deleteBadge(badge.examId, {
                success: this.onBadgeUpdateSuccess,
                scope: this
            });
        }
        if (evt.getTarget('.d-print-badge')) {
            this.loadPortalLogo();
        }
        this.close();
    },
    loadPortalLogo() {
        if (!Ext.os.is.desktop) {
            return this.onBadgeIconLoaded();
        }
        CJ.LoadBar.run();
        CJ.Utils.imageToDataURL({
            url: this.getBadge().grantedBy.portal.printIcon,
            square: true,
            circle: true,
            sizeMultiplier: 1,
            format: 'image/png',
            callback: this.loadBadgeIcon,
            scope: this
        });
    },
    /**
     * @NOTE IMPORTANT!
     * @NOTE the url for the badge icon has header Access-Control-Allow-Origin with (*.challengeu.com)
     * port routing won't work e.g. (xyz.challengeu.com:3000)
     * (localhost) won't work either.
     * the only one way that works is (*.challengeu.com)
     * e.g. (xyz.challengeu.com)
     */
    loadBadgeIcon(portalLogo) {
        CJ.Utils.imageToDataURL({
            square: true,
            circle: true,
            sizeMultiplier: 1,
            url: this.getBadge().printIcon,
            format: 'image/png',
            callback: this.onBadgeIconLoaded,
            scope: this,
            stash: { portalLogo }
        });
    },
    onBadgeIconLoaded(imgData, data) {
        const header = CJ.StreamHelper.getHeader();
        CJ.LoadBar.finish();
        CJ.PdfPrinter.print('badgeCertificate', {
            badge: this.getBadge(),
            ownerName: header ? header.getName() : '',
            badgeImage: imgData,
            portalLogo: data.portalLogo
        }, {
            orientation: 'landscape',
            loadLogo: true
        });
    },
    onBadgeUpdateSuccess() {
        const popup = this.getPopup();
        CJ.feedback();
        this.getStream().loadSkillList(Ext.Viewport.getSearchBar().getTags());
        this.close();
    },
    close() {
        const popup = this.getPopup();
        if (popup)
            return popup.hide();
        this.fireEvent('hide', [
            false,
            true
        ]);
    }
});