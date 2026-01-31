'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        nav_home: 'Home',
        nav_history: 'History',
        nav_settings: 'Settings',
        // Header
        greeting_hello: 'Hello',
        greeting_welcome: 'Welcome',
        guest: 'Guest',
        streak_day: 'Day Streak',
        // Home
        apply_spf: 'APPLY SPF',
        applying: 'Applying...',
        login_to_apply: 'LOGIN TO APPLY',
        wait_s: 'Wait {{s}}s',
        just_now: 'Just now',
        protection: 'Protection',
        daily_goal: 'Daily Goal',
        last_applied: 'Last Applied',
        never: 'Never',
        // History
        daily_history: 'Daily History',
        no_history: 'No history yet. Start applying SPF!',
        no_more_history: 'No more history to show',
        today: 'Today',
        count_singular: 'time',
        count_plural: 'times',
        count_label: 'applications',
        // Settings
        settings: 'Settings',
        site_views: 'Total Site Views',
        share_website: 'Share Website',
        share_invite: 'Invite friends to track Tuval\'s SPF',
        copy_link: 'Copy Link',
        language: 'Language',
        hebrew: 'עברית',
        english: 'English',
        more_coming: 'More settings coming soon'
    },
    he: {
        // נתיבים ותפריטים
        nav_home: 'בית',
        nav_history: 'היסטוריה',
        nav_settings: 'הגדרות',
        // כותרת
        greeting_hello: 'שלום',
        greeting_welcome: 'ברוכים הבאים',
        guest: 'אורח',
        streak_day: 'יום רצף',
        // דף הבית
        apply_spf: 'מריחת קרם הגנה',
        applying: 'מורח...',
        login_to_apply: 'התחבר בשביל למרוח',
        wait_s: 'המתן {{s}} שנ׳',
        just_now: 'ממש עכשיו',
        protection: 'הגנה',
        daily_goal: 'יעד יומי',
        last_applied: 'מריחה אחרונה',
        never: 'אף פעם',
        // היסטוריה
        daily_history: 'היסטוריה יומית',
        no_history: 'אין היסטוריה עדיין. התחילו למרוח!',
        no_more_history: 'אין עוד היסטוריה להצגה',
        today: 'היום',
        count_singular: 'פעם',
        count_plural: 'פעמים',
        count_label: 'מריחות',
        // הגדרות
        settings: 'הגדרות',
        site_views: 'סה"כ צפיות באתר',
        share_website: 'שיתוף האתר',
        share_invite: 'הזמינו חברים לעקוב אחרי מריחות קרם ההגנה של תובל',
        copy_link: 'העתק קישור',
        language: 'שפה',
        hebrew: 'עברית',
        english: 'English',
        more_coming: 'הגדרות נוספות בקרוב'
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('tuval_lang') as Language;
        if (saved && (saved === 'en' || saved === 'he')) {
            setLanguage(saved);
        }
    }, []);

    const direction: Direction = language === 'he' ? 'rtl' : 'ltr';

    const toggleLanguage = () => {
        const next = language === 'en' ? 'he' : 'en';
        setLanguage(next);
        localStorage.setItem('tuval_lang', next);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, direction, toggleLanguage, t }}>
            <div
                dir={mounted ? direction : 'ltr'}
                className={mounted && language === 'he' ? 'font-hebrew' : ''}
            >
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
