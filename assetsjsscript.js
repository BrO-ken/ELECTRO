/**
 * ElectroCalc Fès - Main JavaScript Application
 * Author: ElectroCalc Team
 * Version: 1.0.0
 * Last Updated: January 2025
 * 
 * Calculates electricity bills for Fès, Morocco using official RADEEF and ONEE tariffs
 * Supports bilingual interface (Arabic/French)
 * Implements progressive TPPAN calculation based on 2025 official rates
 */

// ===== CONFIGURATION AND CONSTANTS =====

// Language management
let currentLanguage = 'ar';

// Complete translation object for bilingual support
const translations = {
    fr: {
        'nav-subtitle': 'Fès - Calculateur d\'Électricité',
        'nav-home': 'Accueil',
        'nav-calculator': 'Calculateur',
        'nav-guide': 'Guide',
        'nav-dashboard': 'Tableau de bord',
        'nav-about': 'À propos',
        'hero-badge': 'Tarifs officiels RADEEF & ONEE 2025',
        'hero-title': 'Calculez votre facture d\'électricité à Fès',
        'hero-description': 'Obtenez une estimation précise de votre consommation électrique avec les tarifs officiels RADEEF et ONEE. Comparez, optimisez et économisez sur vos factures.',
        'hero-calc-btn': 'Calculer maintenant',
        'hero-guide-btn': 'Guide des tarifs',
        'quick-calc-title': 'Calculateur rapide',
        'quick-consumption-label': 'Consommation mensuelle (kWh)',
        'quick-calc-btn': 'Calculer',
        'quick-result-label': 'Estimation RADEEF:',
        'features-title': 'Pourquoi choisir ElectroCalc ?',
        'features-description': 'Des outils précis et fiables pour maîtriser votre consommation électrique',
        'feature1-title': 'Calculs Précis',
        'feature1-desc': 'Tarifs officiels RADEEF et ONEE avec décomposition détaillée par tranche',
        'feature2-title': 'Suivi Historique',
        'feature2-desc': 'Visualisez vos consommations mensuelles et identifiez les tendances',
        'feature3-title': 'Conseils d\'Économie',
        'feature3-desc': 'Astuces pratiques pour réduire votre facture de 20 à 30%',
        'current-year': 'Tarifs 2025',
        'users-label': 'utilisateurs',
        'calculations-label': 'calculs',
        'savings-label': 'économies'
    },
    ar: {
        'nav-subtitle': 'فاس - حاسبة الكهرباء',
        'nav-home': 'الرئيسية',
        'nav-calculator': 'الحاسبة',
        'nav-guide': 'الدليل',
        'nav-dashboard': 'لوحة القيادة',
        'nav-about': 'حول',
        'hero-badge': 'التعريفات الرسمية RADEEF & ONEE 2025',
        'hero-title': 'احسب فاتورة الكهرباء في فاس',
        'hero-description': 'احصل على تقدير دقيق لاستهلاكك للكهرباء بالتعريفات الرسمية لـ RADEEF و ONEE. قارن واستهلك بذكاء واقتصد في فواتيرك.',
        'hero-calc-btn': 'احسب الآن',
        'hero-guide-btn': 'دليل التعريفات',
        'quick-calc-title': 'حاسبة سريعة',
        'quick-consumption-label': 'الاستهلاك الشهري (كيلوواط/ساعة)',
        'quick-calc-btn': 'احسب',
        'quick-result-label': 'تقدير RADEEF:',
        'features-title': 'لماذا تختار ElectroCalc؟',
        'features-description': 'أدوات دقيقة وموثوقة للتحكم في استهلاكك للكهرباء',
        'feature1-title': 'حسابات دقيقة',
        'feature1-desc': 'تعريفات رسمية من RADEEF و ONEE مع تفصيل مفصل حسب الشرائح',
        'feature2-title': 'متابعة تاريخية',
        'feature2-desc': 'تصور استهلاكك الشهري وحدد الاتجاهات',
        'feature3-title': 'نصائح التوفير',
        'feature3-desc': 'نصائح عملية لتقليل فاتورتك بنسبة 20 إلى 30%',
        'current-year': 'تعريفات 2025',
        'users-label': 'مستخدم',
        'calculations-label': 'حساب',
        'savings-label': 'توفير'
    }
};

/**
 * RADEEF tariff structure with official 2025 rates
 * Based on official RADEEF tariff document
 */
const RADEEF_TARIFFS = {
    progressive: [
        { min: 0, max: 100, priceHT: 0.7636, system: 'تدريجي' },
        { min: 101, max: 150, priceHT: 0.9095, system: 'تدريجي' }
    ],
    selective: [
        { min: 151, max: 210, priceHT: 0.9095, system: 'انتقائي' },
        { min: 211, max: 310, priceHT: 0.9895, system: 'انتقائي' },
        { min: 311, max: 510, priceHT: 1.1709, system: 'انتقائي' },
        { min: 511, max: Infinity, priceHT: 1.3524, system: 'انتقائي' }
    ],
    vatRate: 0.18, // 18% VAT for RADEEF
    fixedFeeHT: 20.74, // Monthly fixed fee for domestic users
    tppan: {
        exemptionThreshold: 200, // No TPPAN if consumption <= 200 kWh
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        tiers: [
            { min: 0, max: 100, priceHT: 0.0847, name: 'الشريحة 1' },
            { min: 101, max: 200, priceHT: 0.1271, name: 'الشريحة 2' },
            { min: 201, max: Infinity, priceHT: 0.1695, name: 'الشريحة 3' }
        ]
    }
};

/**
 * ONEE tariff structure with official 2025 rates
 */
const ONEE_TARIFFS = {
    progressive: [
        { min: 0, max: 100, priceHT: 0.7636, system: 'تدريجي' },
        { min: 101, max: 150, priceHT: 0.9095, system: 'تدريجي' }
    ],
    selective: [
        { min: 151, max: 210, priceHT: 0.9095, system: 'انتقائي' },
        { min: 211, max: 310, priceHT: 0.9895, system: 'انتقائي' },
        { min: 311, max: 510, priceHT: 1.1709, system: 'انتقائي' },
        { min: 511, max: Infinity, priceHT: 1.3524, system: 'انتقائي' }
    ],
    vatRate: 0.20, // 20% VAT for ONEE
    fixedFeeHT: 20.74,
    tppan: {
        exemptionThreshold: 200,
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        tiers: [
            { min: 0, max: 100, priceHT: 0.0847, name: 'الشريحة 1' },
            { min: 101, max: 200, priceHT: 0.1271, name: 'الشريحة 2' },
            { min: 201, max: Infinity, priceHT: 0.1695, name: 'الشريحة 3' }
        ]
    }
};

// Global variables
let currentSection = 'hero';
let calculationHistory = JSON.parse(localStorage.getItem('electricityHistory') || '[]');
let costBreakdownChart = null;
let consumptionChart = null;
let costChart = null;

// ===== UTILITY FUNCTIONS =====

/**
 * Format currency based on current language
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (currentLanguage === 'ar') {
        return new Intl.NumberFormat('ar-MA', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' درهم';
    } else {
        return new Intl.NumberFormat('fr-MA', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' DH';
    }
}

/**
 * Show notification to user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 */
function showNotification(title, message, type = 'info') {
    const notification = document.getElementById('notification');
    const titleEl = document.getElementById('notification-title');
    const messageEl = document.getElementById('notification-message');
    
    if (!notification || !titleEl || !messageEl) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    notification.className = `notification bg-white shadow-lg rounded-lg p-4 border-l-4 ${
        type === 'success' ? 'border-green-500' : 
        type === 'warning' ? 'border-yellow-500' : 
        type === 'error' ? 'border-red-500' : 'border-blue-500'
    }`;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// ===== LANGUAGE MANAGEMENT =====

/**
 * Toggle between Arabic and French languages
 */
function toggleLanguage() {
    currentLanguage = currentLanguage === 'fr' ? 'ar' : 'fr';
    updateLanguage();
    document.getElementById('lang-toggle').textContent = currentLanguage === 'fr' ? 'عربي' : 'Français';
    
    if (currentLanguage === 'ar') {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl', 'arabic-font');
        document.body.classList.remove('ltr');
    } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl', 'arabic-font');
    }
    
    // Track language change
    trackEvent('language_changed', { language: currentLanguage });
}

/**
 * Update all text elements based on current language
 */
function updateLanguage() {
    const elements = translations[currentLanguage];
    if (elements) {
        Object.keys(elements).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'number')) {
                    if (key.includes('placeholder') || key.includes('consumption')) {
                        element.placeholder = elements[key];
                    }
                } else {
                    element.textContent = elements[key];
                }
            }
        });
    }
    
    // Update input placeholders specifically
    const consumptionInput = document.getElementById('consumption');
    if (consumptionInput) {
        consumptionInput.placeholder = currentLanguage === 'ar' ? 'أدخل استهلاكك بالكيلوواط/ساعة' : 'Entrez votre consommation en kWh';
    }
    
    const quickConsumptionInput = document.getElementById('quickConsumption');
    if (quickConsumptionInput) {
        quickConsumptionInput.placeholder = currentLanguage === 'ar' ? 'مثال: 250' : 'Ex: 250';
    }
    
    // Update select options
    const providerSelect = document.getElementById('provider');
    if (providerSelect) {
        providerSelect.innerHTML = currentLanguage === 'ar' ? 
            '<option value="radeef">RADEEF (فاس)</option><option value="onee">ONEE</option>' :
            '<option value="radeef">RADEEF (Fès)</option><option value="onee">ONEE</option>';
    }
    
    const tariffTypeSelect = document.getElementById('tariffType');
    if (tariffTypeSelect) {
        tariffTypeSelect.innerHTML = currentLanguage === 'ar' ? 
            '<option value="domestic">منزلي</option><option value="professional">مهني</option>' :
            '<option value="domestic">Domestique</option><option value="professional">Professionnel</option>';
    }
}

// ===== NAVIGATION FUNCTIONS =====

/**
 * Show specific section and hide others
 * @param {string} sectionName - Name of section to show
 */
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const section = document.getElementById(sectionName);
    if (section) {
        section.style.display = 'block';
        currentSection = sectionName;
        
        // Initialize charts if showing dashboard
        if (sectionName === 'dashboard') {
            setTimeout(initializeDashboard, 100);
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Track section view
        trackEvent('section_viewed', { section: sectionName });
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// ===== TPPAN CALCULATION =====

/**
 * Calculate TPPAN (Taxe Parafiscale) based on 2025 official rates
 * Progressive calculation: Tier 1 (0-100) + Tier 2 (101-200) + Tier 3 (>200)
 * Exemption: No TPPAN if consumption <= 200 kWh
 * 
 * @param {number} consumption - Monthly consumption in kWh
 * @param {object} tariffs - Tariff structure (RADEEF or ONEE)
 * @returns {object} TPPAN calculation result
 */
function calculateTPPAN(consumption, tariffs) {
    // If consumption <= exemption threshold, no TPPAN
    if (consumption <= tariffs.tppan.exemptionThreshold) {
        return {
            tppanHT: 0,
            tppanVAT: 0,
            tppanTTC: 0,
            breakdown: [],
            isExempted: true
        };
    }

    let tppanHT = 0;
    let breakdown = [];

    // Progressive calculation by tiers according to 2025 TPPAN table
    // Tranche 1: 0-100 kWh = 100 kWh × 0.0847 DH/kWh
    const tier1Consumption = 100;
    const tier1Cost = tier1Consumption * tariffs.tppan.tiers[0].priceHT;
    tppanHT += tier1Cost;
    breakdown.push({
        name: tariffs.tppan.tiers[0].name + ' (0-100 كيلوواط ساعة)',
        consumption: tier1Consumption,
        priceHT: tariffs.tppan.tiers[0].priceHT,
        cost: tier1Cost
    });

    // Tranche 2: 101-200 kWh = 100 kWh × 0.1271 DH/kWh
    const tier2Consumption = 100;
    const tier2Cost = tier2Consumption * tariffs.tppan.tiers[1].priceHT;
    tppanHT += tier2Cost;
    breakdown.push({
        name: tariffs.tppan.tiers[1].name + ' (101-200 كيلوواط ساعة)',
        consumption: tier2Consumption,
        priceHT: tariffs.tppan.tiers[1].priceHT,
        cost: tier2Cost
    });

    // Tranche 3: >200 kWh = (consumption - 200) × 0.1695 DH/kWh
    if (consumption > 200) {
        const tier3Consumption = consumption - 200;
        const tier3Cost = tier3Consumption * tariffs.tppan.tiers[2].priceHT;
        tppanHT += tier3Cost;
        breakdown.push({
            name: tariffs.tppan.tiers[2].name + ' (>200 كيلوواط ساعة)',
            consumption: tier3Consumption,
            priceHT: tariffs.tppan.tiers[2].priceHT,
            cost: tier3Cost
        });
    }

    const tppanVAT = tppanHT * tariffs.vatRate;
    const tppanTTC = tppanHT + tppanVAT;

    return {
        tppanHT,
        tppanVAT,
        tppanTTC,
        breakdown,
        isExempted: false
    };
}

// ===== TARIFF INFORMATION =====

/**
 * Update tariff information display when consumption changes
 */
function updateTariffInfo() {
    const consumption = parseFloat(document.getElementById('consumption').value);
    const provider = document.getElementById('provider').value;
    
    if (!consumption || consumption <= 0) {
        document.getElementById('tariffInfo').style.display = 'none';
        return;
    }
    
    const tariffs = provider === 'radeef' ? RADEEF_TARIFFS : ONEE_TARIFFS;
    const tariffInfo = getTariffForConsumption(consumption, tariffs);
    
    if (tariffInfo) {
        document.getElementById('tariffSystem').textContent = tariffInfo.system;
        document.getElementById('tariffTier').textContent = `${tariffInfo.min} - ${tariffInfo.max === Infinity ? '∞' : tariffInfo.max} كيلوواط ساعة`;
        document.getElementById('tariffPrice').textContent = `${tariffInfo.priceHT.toFixed(4)} درهم/كيلوواط ساعة`;
        document.getElementById('tariffVAT').textContent = `${(tariffs.vatRate * 100).toFixed(0)}%`;
        document.getElementById('tariffPriceTTC').textContent = `${(tariffInfo.priceHT * (1 + tariffs.vatRate)).toFixed(4)} درهم/كيلوواط ساعة`;
        
        // TPPAN status
        const tppanStatus = consumption <= tariffs.tppan.exemptionThreshold ? 
            'معفاة (≤ 200 كيلوواط ساعة)' : 'قابلة للتطبيق (> 200 كيلوواط ساعة)';
        document.getElementById('tppanStatus').textContent = tppanStatus;
        
        document.getElementById('tariffInfo').style.display = 'block';
    }
}

/**
 * Get tariff information for specific consumption
 * @param {number} consumption - Consumption in kWh
 * @param {object} tariffs - Tariff structure
 * @returns {object|null} Tariff information
 */
function getTariffForConsumption(consumption, tariffs) {
    if (consumption <= 150) {
        // Progressive system
        for (const tier of tariffs.progressive) {
            if (consumption >= tier.min && consumption <= tier.max) {
                return tier;
            }
        }
    } else {
        // Selective system
        for (const tier of tariffs.selective) {
            if (consumption >= tier.min && consumption <= tier.max) {
                return tier;
            }
        }
    }
    return null;
}

// ===== CALCULATION FUNCTIONS =====

/**
 * Calculate electricity bill for RADEEF
 * @param {number} consumption - Monthly consumption in kWh
 * @returns {object} Complete bill breakdown
 */
function calculateRADEEFBill(consumption) {
    const tariffs = RADEEF_TARIFFS;
    let consumptionHT = 0;
    let tierBreakdown = [];
    
    if (consumption <= 150) {
        // Progressive system - calculate by tiers
        let remainingConsumption = consumption;
        
        for (const tier of tariffs.progressive) {
            if (remainingConsumption <= 0) break;
            
            const tierConsumption = Math.min(remainingConsumption, tier.max - tier.min + 1);
            const tierCost = tierConsumption * tier.priceHT;
            
            consumptionHT += tierCost;
            tierBreakdown.push({
                tier: `${tier.min} - ${tier.max} كيلوواط ساعة (${tier.system})`,
                consumption: tierConsumption,
                priceHT: tier.priceHT,
                cost: tierCost
            });
            
            remainingConsumption -= tierConsumption;
        }
    } else {
        // Selective system - all consumption at tier rate
        const tier = getTariffForConsumption(consumption, tariffs);
        if (tier) {
            consumptionHT = consumption * tier.priceHT;
            tierBreakdown.push({
                tier: `${tier.min} - ${tier.max === Infinity ? '∞' : tier.max} كيلوواط ساعة (${tier.system})`,
                consumption: consumption,
                priceHT: tier.priceHT,
                cost: consumptionHT
            });
        }
    }
    
    // Fixed fee calculation
    const fixedFeeHT = tariffs.fixedFeeHT;
    const fixedFeeVAT = fixedFeeHT * tariffs.vatRate;
    const fixedFeeTTC = fixedFeeHT + fixedFeeVAT;
    
    // TPPAN calculation with progressive structure
    const tppanResult = calculateTPPAN(consumption, tariffs);
    
    // VAT on consumption
    const consumptionVAT = consumptionHT * tariffs.vatRate;
    const consumptionTTC = consumptionHT + consumptionVAT;
    
    // Total calculation
    const totalTTC = consumptionTTC + fixedFeeTTC + tppanResult.tppanTTC;
    
    return {
        consumption,
        consumptionHT,
        consumptionVAT,
        consumptionTTC,
        fixedFeeHT,
        fixedFeeVAT,
        fixedFeeTTC,
        tppanHT: tppanResult.tppanHT,
        tppanVAT: tppanResult.tppanVAT,
        tppanTTC: tppanResult.tppanTTC,
        tppanBreakdown: tppanResult.breakdown,
        tppanExempted: tppanResult.isExempted,
        totalHT: consumptionHT + fixedFeeHT + tppanResult.tppanHT,
        totalVAT: consumptionVAT + fixedFeeVAT + tppanResult.tppanVAT,
        totalTTC,
        tierBreakdown,
        provider: 'RADEEF'
    };
}

/**
 * Calculate electricity bill for ONEE
 * @param {number} consumption - Monthly consumption in kWh
 * @returns {object} Complete bill breakdown
 */
function calculateONEEBill(consumption) {
    const tariffs = ONEE_TARIFFS;
    let consumptionHT = 0;
    let tierBreakdown = [];
    
    if (consumption <= 150) {
        // Progressive system
        let remainingConsumption = consumption;
        
        for (const tier of tariffs.progressive) {
            if (remainingConsumption <= 0) break;
            
            const tierConsumption = Math.min(remainingConsumption, tier.max - tier.min + 1);
            const tierCost = tierConsumption * tier.priceHT;
            
            consumptionHT += tierCost;
            tierBreakdown.push({
                tier: `${tier.min} - ${tier.max} كيلوواط ساعة (${tier.system})`,
                consumption: tierConsumption,
                priceHT: tier.priceHT,
                cost: tierCost
            });
            
            remainingConsumption -= tierConsumption;
        }
    } else {
        // Selective system
        const tier = getTariffForConsumption(consumption, tariffs);
        if (tier) {
            consumptionHT = consumption * tier.priceHT;
            tierBreakdown.push({
                tier: `${tier.min} - ${tier.max === Infinity ? '∞' : tier.max} كيلوواط ساعة (${tier.system})`,
                consumption: consumption,
                priceHT: tier.priceHT,
                cost: consumptionHT
            });
        }
    }
    
    // Fixed fee
    const fixedFeeHT = tariffs.fixedFeeHT;
    const fixedFeeVAT = fixedFeeHT * tariffs.vatRate;
    const fixedFeeTTC = fixedFeeHT + fixedFeeVAT;
    
    // TPPAN calculation
    const tppanResult = calculateTPPAN(consumption, tariffs);
    
    // VAT on consumption
    const consumptionVAT = consumptionHT * tariffs.vatRate;
    const consumptionTTC = consumptionHT + consumptionVAT;
    
    // Total
    const totalTTC = consumptionTTC + fixedFeeTTC + tppanResult.tppanTTC;
    
    return {
        consumption,
        consumptionHT,
        consumptionVAT,
        consumptionTTC,
        fixedFeeHT,
        fixedFeeVAT,
        fixedFeeTTC,
        tppanHT: tppanResult.tppanHT,
        tppanVAT: tppanResult.tppanVAT,
        tppanTTC: tppanResult.tppanTTC,
        tppanBreakdown: tppanResult.breakdown,
        tppanExempted: tppanResult.isExempted,
        totalHT: consumptionHT + fixedFeeHT + tppanResult.tppanHT,
        totalVAT: consumptionVAT + fixedFeeVAT + tppanResult.tppanVAT,
        totalTTC,
        tierBreakdown,
        provider: 'ONEE'
    };
}

// ===== CALCULATOR INTERFACE =====

/**
 * Quick calculation from hero section
 */
function quickCalculate() {
    const consumption = parseFloat(document.getElementById('quickConsumption').value);
    
    if (!consumption || consumption <= 0) {
        showNotification(
            currentLanguage === 'ar' ? 'خطأ' : 'Erreur', 
            currentLanguage === 'ar' ? 'يرجى إدخال استهلاك صحيح' : 'Veuillez entrer une consommation valide', 
            'error'
        );
        return;
    }
    
    const result = calculateRADEEFBill(consumption);
    document.getElementById('quickResultAmount').textContent = formatCurrency(result.totalTTC);
    document.getElementById('quickResult').classList.remove('hidden');
    
    // Track quick calculation
    trackEvent('quick_calculation', { consumption });
}

/**
 * Perform detailed calculation
 */
function performCalculation() {
    const consumption = parseFloat(document.getElementById('consumption').value);
    const provider = document.getElementById('provider').value;
    
    if (!consumption || consumption <= 0) {
        showNotification(
            currentLanguage === 'ar' ? 'خطأ' : 'Erreur', 
            currentLanguage === 'ar' ? 'يرجى إدخال استهلاك صحيح' : 'Veuillez entrer une consommation valide', 
            'error'
        );
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        try {
            const result = provider === 'radeef' ? 
                calculateRADEEFBill(consumption) : 
                calculateONEEBill(consumption);
            
            displayResults(result);
            updateWhatIfSection(result);
            
            // Save to history
            saveToHistory(result);
            
            hideLoading();
            
            showNotification(
                currentLanguage === 'ar' ? 'نجح' : 'Succès', 
                currentLanguage === 'ar' ? 'تم الحساب بنجاح' : 'Calcul effectué avec succès', 
                'success'
            );
            
            // Track calculation
            trackEvent('full_calculation', { 
                consumption, 
                provider,
                total_cost: result.totalTTC 
            });
            
        } catch (error) {
            hideLoading();
            handleError(error, 'performCalculation');
        }
    }, 500);
}

/**
 * Display calculation results with detailed breakdown
 * @param {object} result - Calculation result object
 */
function displayResults(result) {
    // Show results section
    const resultsSection = document.getElementById('calculationResults');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
    
    // Update basic info
    document.getElementById('consumptionResult').textContent = `${result.consumption} ${currentLanguage === 'ar' ? 'كيلوواط/ساعة' : 'kWh'}`;
    document.getElementById('resultsProvider').textContent = result.provider;
    
    // Update amounts
    document.getElementById('htAmount').textContent = formatCurrency(result.consumptionHT);
    document.getElementById('vatAmount').textContent = formatCurrency(result.consumptionVAT);
    document.getElementById('fixedFee').textContent = formatCurrency(result.fixedFeeTTC);
    document.getElementById('tppanAmount').textContent = formatCurrency(result.tppanTTC);
    document.getElementById('totalAmount').textContent = formatCurrency(result.totalTTC);
    
    // Update tier breakdown for electricity
    const tierBreakdownEl = document.getElementById('tierBreakdown');
    if (tierBreakdownEl) {
        tierBreakdownEl.innerHTML = result.tierBreakdown.map(tier => `
            <div class="flex justify-between items-center py-1">
                <span>${tier.tier}: ${tier.consumption.toFixed(1)} ${currentLanguage === 'ar' ? 'كيلوواط/ساعة' : 'kWh'} × ${tier.priceHT.toFixed(4)} ${currentLanguage === 'ar' ? 'درهم' : 'DH'}</span>
                <span class="font-medium">${formatCurrency(tier.cost)}</span>
            </div>
        `).join('');
    }
    
    // Update TPPAN breakdown
    const tppanBreakdownSection = document.getElementById('tppanBreakdownSection');
    const tppanBreakdownEl = document.getElementById('tppanBreakdown');
    
    if (result.tppanExempted) {
        if (tppanBreakdownSection) tppanBreakdownSection.style.display = 'block';
        if (tppanBreakdownEl) {
            tppanBreakdownEl.innerHTML = `
                <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <i class="fas fa-check-circle text-green-600 text-xl mb-2"></i>
                    <p class="font-medium text-green-800">${currentLanguage === 'ar' ? 'إعفاء TPPAN' : 'Exonération TPPAN'}</p>
                    <p class="text-sm text-green-700">${currentLanguage === 'ar' ? 'الاستهلاك ≤ 200 كيلوواط/ساعة : TPPAN = 0 درهم' : 'Consommation ≤ 200 kWh : TPPAN = 0 DH'}</p>
                </div>
            `;
        }
    } else if (result.tppanBreakdown && result.tppanBreakdown.length > 0) {
        if (tppanBreakdownSection) tppanBreakdownSection.style.display = 'block';
        if (tppanBreakdownEl) {
            let tppanHTML = '';
            
            result.tppanBreakdown.forEach(tier => {
                tppanHTML += `
                    <div class="flex justify-between items-center py-1">
                        <span>${tier.name}: ${tier.consumption.toFixed(1)} ${currentLanguage === 'ar' ? 'كيلوواط/ساعة' : 'kWh'} × ${tier.priceHT.toFixed(4)} ${currentLanguage === 'ar' ? 'درهم' : 'DH'}</span>
                        <span class="font-medium">${formatCurrency(tier.cost)}</span>
                    </div>
                `;
            });
            
            tppanHTML += `
                <div class="border-t border-orange-200 mt-2 pt-2">
                    <div class="flex justify-between items-center py-1 font-semibold">
                        <span>${currentLanguage === 'ar' ? 'المجموع الفرعي TPPAN (بدون ضريبة):' : 'Sous-total TPPAN HT:'}</span>
                        <span>${formatCurrency(result.tppanHT)}</span>
                    </div>
                    <div class="flex justify-between items-center py-1">
                        <span>${currentLanguage === 'ar' ? 'ضريبة القيمة المضافة (18%):' : 'TVA (18%):'}</span>
                        <span>${formatCurrency(result.tppanVAT)}</span>
                    </div>
                    <div class="flex justify-between items-center py-1 font-bold text-orange-900 bg-orange-100 px-2 rounded">
                        <span>${currentLanguage === 'ar' ? 'مجموع TPPAN (مع الضريبة):' : 'Total TPPAN TTC:'}</span>
                        <span>${formatCurrency(result.tppanTTC)}</span>
                    </div>
                </div>
            `;
            
            tppanBreakdownEl.innerHTML = tppanHTML;
        }
    } else {
        if (tppanBreakdownSection) tppanBreakdownSection.style.display = 'none';
    }
    
    // Update cost breakdown chart
    updateCostBreakdownChart(result);
}

// ===== CHART FUNCTIONS =====

/**
 * Update cost breakdown pie chart
 * @param {object} result - Calculation result
 */
function updateCostBreakdownChart(result) {
    const ctx = document.getElementById('costBreakdownChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (costBreakdownChart) {
        costBreakdownChart.destroy();
    }
    
    const data = [
        result.consumptionHT,
        result.fixedFeeHT,
        result.tppanHT,
        result.totalVAT
    ];
    
    const labels = currentLanguage === 'ar' ? 
        ['الاستهلاك', 'الرسوم الثابتة', 'TPPAN', 'ضريبة القيمة المضافة'] :
        ['Consommation', 'Redevance fixe', 'TPPAN', 'TVA'];
    
    costBreakdownChart = new Chart(context, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3b82f6',
                    '#f59e0b',
                    '#10b981',
                    '#ef4444'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ===== WHAT-IF SIMULATION =====

/**
 * Update "What If" simulation section
 * @param {object} baseResult - Base calculation result
 */
function updateWhatIfSection(baseResult) {
    const slider = document.getElementById('reductionSlider');
    const reductionValue = document.getElementById('reductionValue');
    const newConsumption = document.getElementById('newConsumption');
    const monthlySavings = document.getElementById('monthlySavings');
    const yearlySavings = document.getElementById('yearly-savings');
    
    function updateWhatIf() {
        const reduction = parseInt(slider.value);
        const newConsumptionValue = baseResult.consumption * (1 - reduction / 100);
        
        const newResult = baseResult.provider === 'RADEEF' ? 
            calculateRADEEFBill(newConsumptionValue) :
            calculateONEEBill(newConsumptionValue);
        
        const savings = baseResult.totalTTC - newResult.totalTTC;
        
        reductionValue.textContent = `${reduction}%`;
        newConsumption.textContent = `${newConsumptionValue.toFixed(1)} ${currentLanguage === 'ar' ? 'كيلوواط/ساعة' : 'kWh'}`;
        monthlySavings.textContent = formatCurrency(savings);
        yearlySavings.textContent = `${formatCurrency(savings * 12)}${currentLanguage === 'ar' ? '/سنة' : '/an'}`;
        
        // Track what-if simulation
        trackEvent('whatif_simulation', { 
            reduction_percent: reduction,
            monthly_savings: savings 
        });
    }
    
    if (slider) {
        slider.oninput = updateWhatIf;
        updateWhatIf();
    }
}

// ===== DATA PERSISTENCE =====

/**
 * Save calculation to local history
 * @param {object} result - Calculation result
 */
function saveToHistory(result) {
    const historyItem = {
        ...result,
        date: new Date().toISOString(),
        id: Date.now()
    };
    
    calculationHistory.unshift(historyItem);
    
    // Keep only last 12 months
    if (calculationHistory.length > 12) {
        calculationHistory = calculationHistory.slice(0, 12);
    }
    
    localStorage.setItem('electricityHistory', JSON.stringify(calculationHistory));
}

/**
 * Save current calculation
 */
function saveCalculation() {
    showNotification(
        currentLanguage === 'ar' ? 'حفظ' : 'Sauvegarde', 
        currentLanguage === 'ar' ? 'تم حفظ الحساب في سجلك' : 'Calcul sauvegardé dans votre historique', 
        'success'
    );
    
    trackEvent('calculation_saved');
}

/**
 * Share calculation results
 */
function shareCalculation() {
    if (navigator.share) {
        navigator.share({
            title: 'ElectroCalc - حساب فاتورتي',
            text: currentLanguage === 'ar' ? 'اكتشف كم تكلف الكهرباء في فاس' : 'Découvrez combien coûte votre électricité à Fès',
            url: window.location.href
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification(
                currentLanguage === 'ar' ? 'مشاركة' : 'Partage', 
                currentLanguage === 'ar' ? 'تم نسخ الرابط إلى الحافظة' : 'Lien copié dans le presse-papiers', 
                'success'
            );
        });
    }
    
    trackEvent('calculation_shared');
}

// ===== DASHBOARD FUNCTIONS =====

/**
 * Initialize dashboard with charts and statistics
 */
function initializeDashboard() {
    updateDashboardStats();
    initializeConsumptionChart();
    initializeCostChart();
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    const currentMonth = calculationHistory[0];
    const lastMonth = calculationHistory[1];
    
    if (currentMonth) {
        const currentConsumptionEl = document.getElementById('currentConsumption');
        const estimatedBillEl = document.getElementById('estimatedBill');
        
        if (currentConsumptionEl) {
            currentConsumptionEl.textContent = `${currentMonth.consumption} ${currentLanguage === 'ar' ? 'كيلوواط ساعة' : 'kWh'}`;
        }
        if (estimatedBillEl) {
            estimatedBillEl.textContent = formatCurrency(currentMonth.totalTTC);
        }
        
        if (lastMonth) {
            const change = ((currentMonth.consumption - lastMonth.consumption) / lastMonth.consumption * 100);
            const changeEl = document.getElementById('monthlyChange');
            if (changeEl) {
                changeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
                changeEl.className = `ml-2 text-sm font-medium ${change > 0 ? 'text-red-600' : 'text-green-600'}`;
            }
        }
    }
    
    // Yearly stats
    const yearlyTotal = calculationHistory.reduce((sum, item) => sum + item.consumption, 0);
    const yearlyCost = calculationHistory.reduce((sum, item) => sum + item.totalTTC, 0);
    
    const yearlyConsumptionEl = document.getElementById('yearlyConsumption');
    const yearlyCostEl = document.getElementById('yearlyCost');
    const averageMonthlyEl = document.getElementById('averageMonthly');
    
    if (yearlyConsumptionEl) {
        yearlyConsumptionEl.textContent = `${yearlyTotal.toFixed(0)} ${currentLanguage === 'ar' ? 'كيلوواط ساعة' : 'kWh'}`;
    }
    if (yearlyCostEl) {
        yearlyCostEl.textContent = formatCurrency(yearlyCost);
    }
    if (averageMonthlyEl) {
        averageMonthlyEl.textContent = formatCurrency(yearlyCost / Math.max(calculationHistory.length, 1));
    }
    
    // Savings potential
    const avgConsumption = yearlyTotal / Math.max(calculationHistory.length, 1);
    const optimizedConsumption = avgConsumption * 0.8; // 20% reduction
    const currentResult = calculateRADEEFBill(avgConsumption);
    const optimizedResult = calculateRADEEFBill(optimizedConsumption);
    const potentialSavings = currentResult.totalTTC - optimizedResult.totalTTC;
    
    const possibleSavingsEl = document.getElementById('possibleSavings');
    if (possibleSavingsEl) {
        possibleSavingsEl.textContent = formatCurrency(potentialSavings) + (currentLanguage === 'ar' ? '/شهر' : '/mois');
    }
}

/**
 * Initialize consumption trend chart
 */
function initializeConsumptionChart() {
    const ctx = document.getElementById('consumptionChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (consumptionChart) {
        consumptionChart.destroy();
    }
    
    const last6Months = calculationHistory.slice(0, 6).reverse();
    
    consumptionChart = new Chart(context, {
        type: 'line',
        data: {
            labels: last6Months.map((item, index) => {
                const date = new Date(item.date);
                return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR', { month: 'short' });
            }),
            datasets: [{
                label: currentLanguage === 'ar' ? 'الاستهلاك (كيلوواط ساعة)' : 'Consommation (kWh)',
                data: last6Months.map(item => item.consumption),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Initialize cost analysis chart
 */
function initializeCostChart() {
    const ctx = document.getElementById('costChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (costChart) {
        costChart.destroy();
    }
    
    const last6Months = calculationHistory.slice(0, 6).reverse();
    
    costChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: last6Months.map((item, index) => {
                const date = new Date(item.date);
                return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-MA' : 'fr-FR', { month: 'short' });
            }),
            datasets: [{
                label: currentLanguage === 'ar' ? 'التكلفة (درهم)' : 'Coût (DH)',
                data: last6Months.map(item => item.totalTTC),
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ===== ANALYTICS AND TRACKING =====

/**
 * Track events for analytics
 * @param {string} eventName - Name of the event
 * @param {object} parameters - Event parameters
 */
function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4 event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            ...parameters,
            language: currentLanguage,
            timestamp: new Date().toISOString()
        });
    }
    
    // Console logging for development
    console.log('Event tracked:', eventName, parameters);
}

/**
 * Handle application errors
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleError(error, context = '') {
    console.error('ElectroCalc Error:', error, context);
    
    showNotification(
        currentLanguage === 'ar' ? 'خطأ' : 'Erreur',
        currentLanguage === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
        'error'
    );
    
    // Track error
    trackEvent('error_occurred', {
        error_message: error.message,
        context: context
    });
}

// ===== PWA FUNCTIONALITY =====

/**
 * Initialize Progressive Web App features
 */
function initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Install app prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install banner
        const installBanner = document.createElement('div');
        installBanner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between z-50 no-print';
        installBanner.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-mobile-alt mr-3"></i>
                <span>${currentLanguage === 'ar' ? 'قم بتثبيت التطبيق لتجربة أفضل' : 'Installez l\'app pour une meilleure expérience'}</span>
            </div>
            <div>
                <button id="installBtn" class="bg-white text-blue-600 px-4 py-2 rounded mr-2">${currentLanguage === 'ar' ? 'تثبيت' : 'Installer'}</button>
                <button id="dismissBtn" class="text-white opacity-75">&times;</button>
            </div>
        `;
        document.body.appendChild(installBanner);
        
        document.getElementById('installBtn').addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                trackEvent('pwa_install_prompt', { result: choiceResult.outcome });
                deferredPrompt = null;
                installBanner.remove();
            });
        });
        
        document.getElementById('dismissBtn').addEventListener('click', () => {
            trackEvent('pwa_install_dismissed');
            installBanner.remove();
        });
    });
}

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced version of updateTariffInfo
const debouncedUpdateTariffInfo = debounce(updateTariffInfo, 300);

/**
 * Enhance accessibility features
 */
function enhanceAccessibility() {
    // Add ARIA labels
    const calculator = document.getElementById('calculatorForm');
    if (calculator) {
        calculator.setAttribute('aria-label', currentLanguage === 'ar' ? 'نموذج حاسبة الكهرباء' : 'Formulaire calculateur électricité');
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        }
    });
    
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = currentLanguage === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Passer au contenu principal';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Calculator form submission
        const calculatorForm = document.getElementById('calculatorForm');
        if (calculatorForm) {
            calculatorForm.addEventListener('submit', function(e) {
                e.preventDefault();
                performCalculation();
            });
        }
        
        // Quick calculator
        const quickConsumptionInput = document.getElementById('quickConsumption');
        if (quickConsumptionInput) {
            quickConsumptionInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    quickCalculate();
                }
            });
        }
        
        // Initialize with sample data if history is empty
        if (calculationHistory.length === 0) {
            const sampleData = [
                { consumption: 250, date: '2024-12-01', provider: 'RADEEF' },
                { consumption: 180, date: '2024-11-01', provider: 'RADEEF' },
                { consumption: 220, date: '2024-10-01', provider: 'RADEEF' },
                { consumption: 190, date: '2024-09-01', provider: 'RADEEF' },
                { consumption: 240, date: '2024-08-01', provider: 'RADEEF' },
                { consumption: 310, date: '2024-07-01', provider: 'RADEEF' }
            ];
            
            calculationHistory = sampleData.map((item, index) => ({
                ...calculateRADEEFBill(item.consumption),
                date: item.date,
                id: Date.now() + index
            }));
            
            localStorage.setItem('electricityHistory', JSON.stringify(calculationHistory));
        }
        
        // Initialize PWA features
        initializePWA();
        
        // Enhance accessibility
        enhanceAccessibility();
        
        // Set default language and update interface
        updateLanguage();
        
        // Track page load
        trackEvent('page_loaded', {
            page: 'home',
            language: currentLanguage,
            user_agent: navigator.userAgent
        });
        
    } catch (error) {
        handleError(error, 'DOMContentLoaded');
    }
});

// ===== GLOBAL FUNCTION EXPORTS =====

// Make functions available globally for onclick handlers
window.showSection = showSection;
window.toggleLanguage = toggleLanguage;
window.toggleMobileMenu = toggleMobileMenu;
window.quickCalculate = quickCalculate;
window.saveCalculation = saveCalculation;
window.shareCalculation = shareCalculation;
window.updateTariffInfo = debouncedUpdateTariffInfo;
window.updateWhatIf = function() {
    // This will be overridden when a calculation is performed
};

// ===== MODULE EXPORTS (for testing) =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateRADEEFBill,
        calculateONEEBill,
        calculateTPPAN,
        formatCurrency,
        RADEEF_TARIFFS,
        ONEE_TARIFFS,
        translations
    };
}

