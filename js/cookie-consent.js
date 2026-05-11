/**
 * Cookie Consent Manager for Juwelier Glamour
 * Handles consent for Google Tag Manager and Google Maps
 */

(function() {
    'use strict';

    const CONFIG = {
        storageKey: 'jg_cookie_consent',
        gtmId: 'GTM-53ZKWWFK'
    };

    let consentState = {
        necessary: true,
        analytics: false,
        marketing: false,
        maps: false
    };

    function init() {
        loadConsentFromStorage();
        ensureConsentDefaults();

        if (!hasConsentStored()) {
            showBanner();
        } else {
            applyConsentSettings();
        }
    }

    function hasConsentStored() {
        return localStorage.getItem(CONFIG.storageKey) !== null;
    }

    function loadConsentFromStorage() {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (!stored) return;

        try {
            const parsed = JSON.parse(stored);
            consentState = { ...consentState, ...parsed, necessary: true };
        } catch (error) {
            console.error('Invalid consent data', error);
        }
    }

    function saveConsentToStorage() {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(consentState));
    }

    function ensureConsentDefaults() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

        window.gtag('consent', 'default', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
        });
    }

    function applyConsentSettings() {
        const analyticsGranted = consentState.analytics ? 'granted' : 'denied';
        const marketingGranted = consentState.marketing ? 'granted' : 'denied';

        window.gtag('consent', 'update', {
            ad_storage: marketingGranted,
            analytics_storage: analyticsGranted,
            ad_user_data: marketingGranted,
            ad_personalization: marketingGranted,
            functionality_storage: 'granted',
            security_storage: 'granted'
        });

        if (consentState.analytics || consentState.marketing) {
            loadGoogleTagManager();
            loadGoogleTagManagerNoscript();
        } else {
            disableGoogleTagManagerNoscript();
        }

        if (consentState.maps) {
            loadGoogleMaps();
        } else {
            disableGoogleMaps();
        }

        window.dataLayer.push({
            event: 'consent_update',
            consent_analytics: analyticsGranted,
            consent_marketing: marketingGranted,
            consent_maps: consentState.maps ? 'granted' : 'denied'
        });
    }

    function loadGoogleTagManager() {
        if (document.querySelector(`script[data-gtm-loader="${CONFIG.gtmId}"]`)) return;

        const script = document.createElement('script');
        script.async = true;
        script.dataset.gtmLoader = CONFIG.gtmId;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${CONFIG.gtmId}`;
        document.head.appendChild(script);

        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });
    }

    function loadGoogleTagManagerNoscript() {
        const container = document.getElementById('gtm-noscript-container');
        if (!container || container.dataset.loaded === 'true') return;

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${CONFIG.gtmId}`;
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        iframe.setAttribute('aria-hidden', 'true');

        container.innerHTML = '';
        container.appendChild(iframe);
        container.dataset.loaded = 'true';
    }

    function disableGoogleTagManagerNoscript() {
        const container = document.getElementById('gtm-noscript-container');
        if (!container) return;

        container.innerHTML = '';
        container.dataset.loaded = 'false';
    }

    function loadGoogleMaps() {
        const mapPlaceholders = document.querySelectorAll('.maps-placeholder');
        mapPlaceholders.forEach(placeholder => {
            const iframe = document.createElement('iframe');
            iframe.src = placeholder.dataset.src;
            iframe.width = '100%';
            iframe.height = '400';
            iframe.style.border = '0';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            placeholder.replaceWith(iframe);
        });
    }

    function disableGoogleMaps() {
        // Maps stay blocked by placeholders until consent is granted.
    }

    function showBanner() {
        if (document.getElementById('cookie-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h3>🍪 Datenschutzeinstellungen</h3>
                    <p>Wir verwenden notwendige Technologien sowie optionale Dienste für Statistik, Marketing und Karten. Google Tag Manager wird erst nach Ihrer ausdrücklichen Einwilligung geladen. <a href="datenschutz.html" style="color: var(--gold); text-decoration: underline;">Mehr erfahren</a></p>
                </div>
                <div class="cookie-banner-buttons">
                    <button class="cookie-btn cookie-btn-settings" onclick="window.CookieConsent.showSettings()">Einstellungen</button>
                    <button class="cookie-btn cookie-btn-necessary" onclick="window.CookieConsent.acceptNecessary()">Nur notwendige</button>
                    <button class="cookie-btn cookie-btn-accept" onclick="window.CookieConsent.acceptAll()">Alle akzeptieren</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
    }

    function hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
        hideSettingsModal();
    }

    function showSettings() {
        if (document.getElementById('cookie-settings-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="cookie-modal-backdrop" onclick="window.CookieConsent.hideSettingsModal()"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <h3>Cookie-Einstellungen</h3>
                    <button class="cookie-modal-close" onclick="window.CookieConsent.hideSettingsModal()">&times;</button>
                </div>
                <div class="cookie-modal-body">
                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <div>
                                <strong>Notwendige Cookies</strong>
                                <span class="cookie-badge-required">Erforderlich</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p>Diese Technologien sind für die grundlegende Funktionalität der Website erforderlich und können nicht deaktiviert werden.</p>
                    </div>

                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <div>
                                <strong>Statistik</strong>
                                <span class="cookie-badge-optional">Optional</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookie-analytics" ${consentState.analytics ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p>Erlaubt die Auswertung anonymisierter Nutzungsdaten über den Google Tag Manager.</p>
                    </div>

                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <div>
                                <strong>Marketing</strong>
                                <span class="cookie-badge-optional">Optional</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookie-marketing" ${consentState.marketing ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p>Erlaubt Marketing-Tags und vergleichbare Funktionen über den Google Tag Manager.</p>
                    </div>

                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <div>
                                <strong>Google Maps</strong>
                                <span class="cookie-badge-optional">Optional</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookie-maps" ${consentState.maps ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p>Ermöglicht die Darstellung interaktiver Karten zur Anzeige unserer Standorte.</p>
                    </div>
                </div>
                <div class="cookie-modal-footer">
                    <button class="cookie-btn cookie-btn-necessary" onclick="window.CookieConsent.acceptNecessary()">Nur notwendige</button>
                    <button class="cookie-btn cookie-btn-accept" onclick="window.CookieConsent.saveSettings()">Einstellungen speichern</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function hideSettingsModal() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    function acceptAll() {
        consentState.analytics = true;
        consentState.marketing = true;
        consentState.maps = true;
        saveConsentToStorage();
        applyConsentSettings();
        hideBanner();
    }

    function acceptNecessary() {
        consentState.analytics = false;
        consentState.marketing = false;
        consentState.maps = false;
        saveConsentToStorage();
        applyConsentSettings();
        hideBanner();
    }

    function saveSettings() {
        const analyticsCheckbox = document.getElementById('cookie-analytics');
        const marketingCheckbox = document.getElementById('cookie-marketing');
        const mapsCheckbox = document.getElementById('cookie-maps');

        consentState.analytics = analyticsCheckbox ? analyticsCheckbox.checked : false;
        consentState.marketing = marketingCheckbox ? marketingCheckbox.checked : false;
        consentState.maps = mapsCheckbox ? mapsCheckbox.checked : false;

        saveConsentToStorage();
        applyConsentSettings();
        hideBanner();
    }

    function resetConsent() {
        localStorage.removeItem(CONFIG.storageKey);
        location.reload();
    }

    window.CookieConsent = {
        init,
        showBanner,
        hideBanner,
        showSettings,
        hideSettingsModal,
        acceptAll,
        acceptNecessary,
        saveSettings,
        resetConsent,
        getState: () => ({ ...consentState })
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
