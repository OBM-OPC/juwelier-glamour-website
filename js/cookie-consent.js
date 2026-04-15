/**
 * Cookie Consent Manager for Juwelier Glamour
 * Handles consent for Google Tag and Google Maps
 */

(function() {
    'use strict';

    // Cookie Consent Configuration
    const CONFIG = {
        cookieName: 'jg_cookie_consent',
        cookieExpiry: 365, // days
        googleTagId: 'GT-PJ4PFHKK'
    };

    // Consent State
    let consentState = {
        necessary: true, // Always true
        analytics: false,
        marketing: false,
        maps: false
    };

    // Initialize
    function init() {
        loadConsentFromStorage();
        
        // Check if consent already given
        if (!hasConsentStored()) {
            showBanner();
        } else {
            applyConsentSettings();
        }
    }

    // Check if consent is stored
    function hasConsentStored() {
        return localStorage.getItem(CONFIG.cookieName) !== null;
    }

    // Load consent from localStorage
    function loadConsentFromStorage() {
        const stored = localStorage.getItem(CONFIG.cookieName);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                consentState = { ...consentState, ...parsed };
            } catch (e) {
                console.error('Invalid consent data');
            }
        }
    }

    // Save consent to localStorage
    function saveConsentToStorage() {
        localStorage.setItem(CONFIG.cookieName, JSON.stringify(consentState));
    }

    // Apply consent settings (load/unload scripts)
    function applyConsentSettings() {
        // Handle Google Tag
        if (consentState.analytics || consentState.marketing) {
            loadGoogleTag();
        } else {
            disableGoogleTag();
        }

        // Handle Google Maps
        if (consentState.maps) {
            loadGoogleMaps();
        } else {
            disableGoogleMaps();
        }

        // Update dataLayer for GTM if exists
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
                'event': 'consent_update',
                'consent_analytics': consentState.analytics ? 'granted' : 'denied',
                'consent_marketing': consentState.marketing ? 'granted' : 'denied',
                'consent_maps': consentState.maps ? 'granted' : 'denied'
            });
        }
    }

    // Load Google Tag with consent
    function loadGoogleTag() {
        if (window.gtagLoaded) return;
        
        // Update consent in dataLayer
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        
        gtag('consent', 'update', {
            'ad_storage': consentState.marketing ? 'granted' : 'denied',
            'analytics_storage': consentState.analytics ? 'granted' : 'denied',
            'ad_user_data': consentState.marketing ? 'granted' : 'denied',
            'ad_personalization': consentState.marketing ? 'granted' : 'denied'
        });
        
        window.gtagLoaded = true;
    }

    // Disable Google Tag
    function disableGoogleTag() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
        });
    }

    // Load Google Maps
    function loadGoogleMaps() {
        // Find placeholder and replace with actual map
        const mapPlaceholders = document.querySelectorAll('.maps-placeholder');
        mapPlaceholders.forEach(placeholder => {
            const mapContainer = placeholder.parentElement;
            const iframe = document.createElement('iframe');
            iframe.src = placeholder.dataset.src;
            iframe.width = "100%";
            iframe.height = "400";
            iframe.style.border = "0";
            iframe.allowFullscreen = true;
            iframe.loading = "lazy";
            iframe.referrerPolicy = "no-referrer-when-downgrade";
            
            placeholder.replaceWith(iframe);
        });
    }

    // Disable Google Maps (show placeholder)
    function disableGoogleMaps() {
        // Maps are already blocked by placeholder, nothing to do
    }

    // Show Cookie Banner
    function showBanner() {
        if (document.getElementById('cookie-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h3>🍪 Datenschutzeinstellungen</h3>
                    <p>Wir verwenden Cookies und ähnliche Technologien, um Ihnen die beste Erfahrung auf unserer Website zu bieten. 
                    Dazu gehören notwendige Cookies sowie optionale Cookies für Google Analytics und Google Maps. 
                    <a href="datenschutz.html" style="color: var(--gold); text-decoration: underline;">Mehr erfahren</a></p>
                </div>
                <div class="cookie-banner-buttons">
                    <button class="cookie-btn cookie-btn-settings" onclick="window.CookieConsent.showSettings()">
                        Einstellungen
                    </button>
                    <button class="cookie-btn cookie-btn-necessary" onclick="window.CookieConsent.acceptNecessary()">
                        Nur notwendige
                    </button>
                    <button class="cookie-btn cookie-btn-accept" onclick="window.CookieConsent.acceptAll()">
                        Alle akzeptieren
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    // Hide Banner
    function hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
        hideSettingsModal();
    }

    // Show Settings Modal
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
                        <p>Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich und können nicht deaktiviert werden.</p>
                    </div>
                    
                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <div>
                                <strong>Google Analytics & Tag</strong>
                                <span class="cookie-badge-optional">Optional</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookie-analytics" ${consentState.analytics ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p>Hilft uns zu verstehen, wie Besucher mit unserer Website interagieren, indem anonyme Daten gesammelt werden.</p>
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
                        <p>Ermöglicht die Darstellung von interaktiven Karten zur Anzeige unserer Standorte.</p>
                    </div>
                </div>
                <div class="cookie-modal-footer">
                    <button class="cookie-btn cookie-btn-necessary" onclick="window.CookieConsent.acceptNecessary()">
                        Nur notwendige
                    </button>
                    <button class="cookie-btn cookie-btn-accept" onclick="window.CookieConsent.saveSettings()">
                        Einstellungen speichern
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // Hide Settings Modal
    function hideSettingsModal() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // Accept All Cookies
    function acceptAll() {
        consentState.analytics = true;
        consentState.marketing = true;
        consentState.maps = true;
        saveConsentToStorage();
        applyConsentSettings();
        hideBanner();
    }

    // Accept Only Necessary
    function acceptNecessary() {
        consentState.analytics = false;
        consentState.marketing = false;
        consentState.maps = false;
        saveConsentToStorage();
        applyConsentSettings();
        hideBanner();
    }

    // Save Custom Settings
    function saveSettings() {
        const analyticsCheckbox = document.getElementById('cookie-analytics');
        const mapsCheckbox = document.getElementById('cookie-maps');
        
        consentState.analytics = analyticsCheckbox ? analyticsCheckbox.checked : false;
        consentState.maps = mapsCheckbox ? mapsCheckbox.checked : false;
        
        saveConsentToStorage();
        applyConsentSettings();
        hideBanner();
    }

    // Reset Consent (for testing)
    function resetConsent() {
        localStorage.removeItem(CONFIG.cookieName);
        location.reload();
    }

    // Expose public API
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

    // Auto-init if DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
