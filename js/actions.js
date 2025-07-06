

const SETTINGS_VERSION = '1.1';

function applySettings() {
    if (!document.body || document.readyState !== 'complete') {
        console.warn('document.body or DOM not ready, retrying settings application in 100ms');
        setTimeout(applySettings, 100);
        return;
    }
    console.log('Applying all settings');
    applyBackground();
    applyTabCloaking();
    applyTeacherPrevention();
    applyClosePrevention();
    
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'carbon-settings-updated',
            settings: {
                panicKey: localStorage.getItem('carbon-panic-key') || null,
                panicUrl: document.getElementById('panic-url')?.value || '',
                background: localStorage.getItem('carbon-background') || 'default',
                cloaking: {
                    enabled: document.getElementById('tab-cloaking-enabled')?.checked || false,
                    title: document.getElementById('cloak-title')?.value || '',
                    favicon: document.getElementById('cloak-favicon')?.value || ''
                }
            }
        }, '*');
    }
}

function applyBackground() {
    if (!document.body) {
        console.warn('Cannot apply background: document.body is null');
        return;
    }
    const customBg = localStorage.getItem('carbon-custom-bg');
    const currentBackground = localStorage.getItem('carbon-background') || 'default';
    const body = document.body;
    
    console.log('Applying background:', { customBg: !!customBg, currentBackground });
    
    // Reset existing styles
    body.style.background = '';
    body.style.color = '#e0def4';
    
    if (customBg) {
        console.log('Applying custom background:', customBg.substring(0, 50) + '...');
        body.style.background = `url(${customBg}) center/cover no-repeat`;
    } else {
        console.log('Applying built-in background:', currentBackground);
        switch (currentBackground) {
            case 'black':
                body.style.background = '#000000';
                break;
            case 'white':
                body.style.background = '#ffffff';
                body.style.color = '#000000';
                break;
            case 'mocha':
                body.style.background = 'linear-gradient(135deg, #1e1e2e 0%, #313244 50%, #45475a 100%)';
                break;
            default:
                body.style.background = 'linear-gradient(135deg, #191724 0%, #1f1d2e 50%, #26233a 100%)';
                break;
        }
    }
}

function applyTabCloaking() {
    const enabled = document.getElementById('tab-cloaking-enabled')?.checked || false;
    const title = document.getElementById('cloak-title')?.value || '';
    const favicon = document.getElementById('cloak-favicon')?.value || '';
    
    if (enabled && title) {
        document.title = title;
        
        if (favicon) {
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    } else {
        document.title = 'Settings - Carbon';
    }
}

function applyTeacherPrevention() {
    if (!document.body) {
        console.warn('Cannot apply teacher prevention: document.body is null');
        return;
    }
    if (document.getElementById('disable-right-click')?.checked) {
        document.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    if (document.getElementById('disable-select')?.checked) {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
    }
    
    if (document.getElementById('hide-cursor')?.checked) {
        let cursorTimer;
        document.addEventListener('mousemove', () => {
            document.body.style.cursor = 'default';
            clearTimeout(cursorTimer);
            cursorTimer = setTimeout(() => {
                document.body.style.cursor = 'none';
            }, 3000);
        });
    }
    
    if (document.getElementById('blur-on-unfocus')?.checked) {
        window.addEventListener('blur', () => {
            document.body.style.filter = 'blur(10px)';
        });
        window.addEventListener('focus', () => {
            document.body.style.filter = 'none';
        });
    }
}

function applyClosePrevention() {
    const enabled = document.getElementById('close-prevention-enabled')?.checked || false;
    const confirm = document.getElementById('confirm-close')?.checked || false;
    const message = document.getElementById('close-message')?.value || 'Are you sure you want to close Carbon?';
    
    if (enabled) {
        window.addEventListener('beforeunload', (e) => {
            if (confirm) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        });
    }
}

function initializeSettings() {
    // Check settings version for migration
    const savedVersion = localStorage.getItem('carbon-settings-version') || '1.0';
    if (savedVersion !== SETTINGS_VERSION) {
        localStorage.clear();
        localStorage.setItem('carbon-settings-version', SETTINGS_VERSION);
    }
  
            // Load panic key
            const savedPanicKey = localStorage.getItem('carbon-panic-key');
            if (savedPanicKey) {
                panicKey = savedPanicKey;
                document.getElementById('panic-key-display').textContent = panicKey.toUpperCase();
            }
            
            // Load panic URL
            const savedPanicUrl = localStorage.getItem('carbon-panic-url');
            if (savedPanicUrl) {
                document.getElementById('panic-url').value = savedPanicUrl;
            }
            
            // Load background
            const savedBg = localStorage.getItem('carbon-background');
            if (savedBg) {
                currentBackground = savedBg;
                console.log('Loaded background from storage:', savedBg);
                document.querySelectorAll('.bg-preview').forEach(el => el.classList.remove('active'));
                const selectedPreview = document.querySelector(`[data-bg="${savedBg}"]`);
                if (selectedPreview) {
                    selectedPreview.classList.add('active');
                } else {
                    console.warn('No preview found for background:', savedBg);
                    currentBackground = 'default';
                    document.querySelector('[data-bg="default"]').classList.add('active');
                }
            }
            
            // Load custom background
            const savedCustomBg = localStorage.getItem('carbon-custom-bg');
            if (savedCustomBg) {
                console.log('Loaded custom background from storage');
                showCustomBgPreview(savedCustomBg);
                currentBackground = 'custom';
            }
            
            // Load tab cloaking
            const cloakingEnabled = localStorage.getItem('carbon-cloak-enabled') === 'true';
            document.getElementById('tab-cloaking-enabled').checked = cloakingEnabled;
            document.getElementById('cloak-title').value = localStorage.getItem('carbon-cloak-title') || '';
            document.getElementById('cloak-favicon').value = localStorage.getItem('carbon-cloak-favicon') || '';
            toggleCloakingOptions();
            
            // Load fullscreen
            const fullscreenEnabled = localStorage.getItem('carbon-fullscreen-enabled') === 'true';
            document.getElementById('fullscreen-enabled').checked = fullscreenEnabled;
            
            // Load close prevention
            document.getElementById('close-prevention-enabled').checked = localStorage.getItem('carbon-close-prevention') === 'true';
            document.getElementById('confirm-close').checked = localStorage.getItem('carbon-confirm-close') === 'true';
            document.getElementById('close-message').value = localStorage.getItem('carbon-close-message') || '';
            
            // Load teacher prevention
            document.getElementById('disable-right-click').checked = localStorage.getItem('carbon-disable-right-click') === 'true';
            document.getElementById('disable-devtools').checked = localStorage.getItem('carbon-disable-devtools') === 'true';
            document.getElementById('disable-select').checked = localStorage.getItem('carbon-disable-select') === 'true';
            document.getElementById('hide-cursor').checked = localStorage.getItem('carbon-hide-cursor') === 'true';
            document.getElementById('blur-on-unfocus').checked = localStorage.getItem('carbon-blur-unfocus') === 'true';
            
            // Update status indicators
            updateStatusIndicators();

    applySettings();
}



        document.addEventListener('DOMContentLoaded', function() {
            initializeSettings();
            window.addEventListener('load', () => applySettings());
        });
