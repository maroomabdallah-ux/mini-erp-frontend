import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translateArabicText } from './arabic-ui'

const messages = {
  en: {
    nav: { overview: 'Overview', users: 'Users', roles: 'Roles & permissions', audit: 'Audit logs', products: 'Products', suppliers: 'Suppliers', purchases: 'Purchase orders', customers: 'Customers', quotations: 'Quotations', warehouses: 'Warehouses', inventory: 'Inventory', settings: 'Settings' },
    shell: { workspace: 'Business workspace', version: 'Version 1.0', primary: 'Primary workspace', profile: 'Profile', signOut: 'Sign out' },
    settings: { title: 'Settings', subtitle: 'Manage your personal details, security, language, and appearance.', profile: 'Profile', profileHint: 'Your personal information shown across the workspace.', firstName: 'First name', lastName: 'Last name', email: 'Email address', username: 'Username', role: 'Assigned role', saveProfile: 'Save profile', profileSaved: 'Profile updated successfully', appearance: 'Appearance', appearanceHint: 'Choose how Mini ERP looks on this device.', light: 'Light', dark: 'Dark', system: 'System', language: 'Language', languageHint: 'Choose the interface language and reading direction.', english: 'English', arabic: 'العربية', security: 'Security', securityHint: 'Use a strong password that you do not reuse elsewhere.', currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', changePassword: 'Change password', passwordChanged: 'Password changed. Sign in again with your new password.', passwordMismatch: 'New passwords do not match.', personal: 'Personal', preferences: 'Preferences', account: 'Account & security' },
    common: { saving: 'Saving...' },
    actions: { title: 'Action Center', subtitle: 'Live tasks and alerts', approvals: 'Pending approvals', procurement: 'Purchase orders', orderApproval: 'Purchase order needs approval', orderReceipt: 'Approved order ready to receive', stockAlerts: 'Stock alerts', recentActivity: 'Recent activity', countPending: 'Physical count needs approval', shortage: 'Shortage', clear: 'You are all caught up', noActions: 'There are no actions requiring your attention.' },
  },
  ar: {
    nav: { overview: 'نظرة عامة', users: 'المستخدمون', roles: 'الأدوار والصلاحيات', audit: 'سجل التدقيق', products: 'المنتجات', suppliers: 'الموردون', purchases: 'طلبات الشراء', customers: 'العملاء', quotations: 'عروض الأسعار', warehouses: 'المستودعات', inventory: 'المخزون', settings: 'الإعدادات' },
    shell: { workspace: 'مساحة إدارة الأعمال', version: 'الإصدار 1.0', primary: 'مساحة العمل الرئيسية', profile: 'الملف الشخصي', signOut: 'تسجيل الخروج' },
    settings: { title: 'الإعدادات', subtitle: 'إدارة بياناتك الشخصية والأمان واللغة والمظهر.', profile: 'الملف الشخصي', profileHint: 'معلوماتك الشخصية الظاهرة في مساحة العمل.', firstName: 'الاسم الأول', lastName: 'اسم العائلة', email: 'البريد الإلكتروني', username: 'اسم المستخدم', role: 'الدور المعيّن', saveProfile: 'حفظ البيانات', profileSaved: 'تم تحديث الملف الشخصي بنجاح', appearance: 'المظهر', appearanceHint: 'اختر مظهر نظام Mini ERP على هذا الجهاز.', light: 'فاتح', dark: 'داكن', system: 'حسب الجهاز', language: 'اللغة', languageHint: 'اختر لغة الواجهة واتجاه القراءة.', english: 'English', arabic: 'العربية', security: 'الأمان', securityHint: 'استخدم كلمة مرور قوية لا تستعملها في مكان آخر.', currentPassword: 'كلمة المرور الحالية', newPassword: 'كلمة المرور الجديدة', confirmPassword: 'تأكيد كلمة المرور الجديدة', changePassword: 'تغيير كلمة المرور', passwordChanged: 'تم تغيير كلمة المرور. سجل الدخول مجدداً باستخدام كلمة المرور الجديدة.', passwordMismatch: 'كلمتا المرور الجديدتان غير متطابقتين.', personal: 'البيانات الشخصية', preferences: 'التفضيلات', account: 'الحساب والأمان' },
    common: { saving: 'جارٍ الحفظ...' },
    actions: { title: 'مركز الإجراءات', subtitle: 'المهام والتنبيهات المباشرة', approvals: 'اعتمادات معلّقة', procurement: 'طلبات الشراء', orderApproval: 'طلب شراء يحتاج اعتماداً', orderReceipt: 'طلب معتمد جاهز للاستلام', stockAlerts: 'تنبيهات المخزون', recentActivity: 'النشاط الأخير', countPending: 'جرد فعلي يحتاج اعتماداً', shortage: 'النقص', clear: 'لا توجد مهام معلّقة', noActions: 'لا توجد إجراءات تحتاج إلى انتباهك حالياً.' },
  },
}

const PreferencesContext = createContext(null)
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export function PreferencesProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('erp_language') || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('erp_theme') || 'system')
  useEffect(() => { localStorage.setItem('erp_language', language); document.documentElement.lang = language; document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr' }, [language])
  useEffect(() => {
    const attributes = ['placeholder', 'title', 'aria-label']
    const localize = (root) => {
      const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll('*')] : []
      elements.forEach((element) => {
        element.childNodes.forEach((node) => {
          if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return
          if (!node.__erpEnglishText) node.__erpEnglishText = node.textContent
          else if (node.textContent !== node.__erpEnglishText && node.textContent !== translateArabicText(node.__erpEnglishText)) node.__erpEnglishText = node.textContent
          const next = language === 'ar' ? translateArabicText(node.__erpEnglishText) : node.__erpEnglishText
          if (node.textContent !== next) node.textContent = next
        })
        attributes.forEach((attribute) => {
          if (!element.hasAttribute(attribute)) return
          const storage = `data-erp-${attribute.replace('aria-', '')}`
          if (!element.hasAttribute(storage)) element.setAttribute(storage, element.getAttribute(attribute))
          const original = element.getAttribute(storage)
          element.setAttribute(attribute, language === 'ar' ? translateArabicText(original) : original)
        })
      })
    }
    const app = document.body
    localize(app)
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') localize(mutation.target.parentElement)
      mutation.addedNodes.forEach((node) => { if (node.nodeType === Node.ELEMENT_NODE) localize(node) })
    }))
    observer.observe(app, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [language])
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { const dark = theme === 'dark' || (theme === 'system' && systemDark()); document.documentElement.classList.toggle('dark', dark); document.documentElement.dataset.theme = dark ? 'dark' : 'light' }
    localStorage.setItem('erp_theme', theme); apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply)
  }, [theme])
  const value = useMemo(() => ({ language, setLanguage, theme, setTheme, t: (key) => key.split('.').reduce((value, part) => value?.[part], messages[language]) || key }), [language, theme])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
export function usePreferences() { const value = useContext(PreferencesContext); if (!value) throw new Error('usePreferences must be used inside PreferencesProvider'); return value }
