import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:easy_localization/easy_localization.dart';

/// Supported languages in the app
enum AppLanguage {
  thai('th', 'ไทย', '🇹🇭'),
  english('en', 'English', '🇬🇧');

  final String code;
  final String name;
  final String flag;

  const AppLanguage(this.code, this.name, this.flag);

  Locale get locale => Locale(code);

  static AppLanguage fromCode(String code) {
    return AppLanguage.values.firstWhere(
      (lang) => lang.code == code,
      orElse: () => AppLanguage.thai,
    );
  }

  static AppLanguage fromLocale(Locale locale) {
    return AppLanguage.values.firstWhere(
      (lang) => lang.code == locale.languageCode,
      orElse: () => AppLanguage.thai,
    );
  }
}

/// Language service to manage app-wide language state
/// Integrates with easy_localization for full i18n support
class LanguageService extends ChangeNotifier {
  static const String _languageKey = 'app_language';
  static LanguageService? _instance;

  AppLanguage _currentLanguage = AppLanguage.thai;
  bool _isInitialized = false;
  BuildContext? _context;

  AppLanguage get currentLanguage => _currentLanguage;
  bool get isInitialized => _isInitialized;
  bool get isThai => _currentLanguage == AppLanguage.thai;
  bool get isEnglish => _currentLanguage == AppLanguage.english;
  Locale get currentLocale => _currentLanguage.locale;

  /// Singleton instance
  static LanguageService get instance {
    _instance ??= LanguageService._();
    return _instance!;
  }

  LanguageService._();

  /// Set context for easy_localization integration
  void setContext(BuildContext context) {
    _context = context;
    // Sync with easy_localization's current locale
    final currentLocale = context.locale;
    _currentLanguage = AppLanguage.fromLocale(currentLocale);
  }

  /// Initialize language from stored preference
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final storedCode = prefs.getString(_languageKey);
      if (storedCode != null) {
        _currentLanguage = AppLanguage.fromCode(storedCode);
      }
    } catch (e) {
      debugPrint('Error loading language preference: $e');
    }

    _isInitialized = true;
    notifyListeners();
  }

  /// Change the current language
  Future<void> setLanguage(AppLanguage language) async {
    if (_currentLanguage == language) return;

    _currentLanguage = language;

    // Update easy_localization if context is available
    if (_context != null) {
      await _context!.setLocale(language.locale);
    }

    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_languageKey, language.code);
    } catch (e) {
      debugPrint('Error saving language preference: $e');
    }
  }

  /// Toggle between Thai and English
  Future<void> toggleLanguage() async {
    final newLanguage = _currentLanguage == AppLanguage.thai
        ? AppLanguage.english
        : AppLanguage.thai;
    await setLanguage(newLanguage);
  }

  /// Get translated text using easy_localization
  /// Falls back to basic translations if context is not available
  String translate(String key) {
    if (_context != null) {
      try {
        return key.tr();
      } catch (e) {
        // Fall back to basic translations
        return _translations[_currentLanguage.code]?[key] ?? key;
      }
    }
    return _translations[_currentLanguage.code]?[key] ?? key;
  }

  /// Basic translations map (fallback)
  static final Map<String, Map<String, String>> _translations = {
    'th': {
      'navigation.back_to_home': 'กลับหน้าหลัก',
      'common.loading': 'กำลังโหลด...',
      'common.error': 'เกิดข้อผิดพลาด',
      'common.try_again': 'ลองอีกครั้ง',
      'date.today': 'วันนี้',
      'date.yesterday': 'เมื่อวาน',
      'date.last_7_days': '7 วันที่ผ่านมา',
      'date.last_14_days': '14 วันที่ผ่านมา',
      'date.last_30_days': '30 วันที่ผ่านมา',
      'date.this_month': 'เดือนนี้',
      'date.custom': 'กำหนดเอง',
      'top_performers.top_ads': 'โฆษณายอดเยี่ยม',
      'top_performers.top_adsets': 'กลุ่มโฆษณายอดเยี่ยม',
      'metrics.spent': 'จ่ายเงิน',
      'metrics.new_inbox': 'ข้อความใหม่',
      'metrics.total_inbox': 'ข้อความทั้งหมด',
      'metrics.phone_leads': 'ชื่อ-เบอร์',
      'metrics.cost_per_lead': 'เงินหมุน',
      'ads.campaigns': 'แคมเปญ',
      'ads.ad_sets': 'กลุ่มโฆษณา',
      'ads.ads': 'โฆษณา',
      'common.no_data': 'ไม่มีข้อมูล',
      'facebook.balance': 'ยอดคงเหลือ Facebook',
      'metrics.total_spent': 'ยอดใช้จ่าย',
      'language.title': 'ภาษา',
      'navigation.settings': 'ตั้งค่า',
    },
    'en': {
      'navigation.back_to_home': 'Back to Home',
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.try_again': 'Try Again',
      'date.today': 'Today',
      'date.yesterday': 'Yesterday',
      'date.last_7_days': 'Last 7 Days',
      'date.last_14_days': 'Last 14 Days',
      'date.last_30_days': 'Last 30 Days',
      'date.this_month': 'This Month',
      'date.custom': 'Custom',
      'top_performers.top_ads': 'Top Ads',
      'top_performers.top_adsets': 'Top Ad Sets',
      'metrics.spent': 'Spent',
      'metrics.new_inbox': 'New Inbox',
      'metrics.total_inbox': 'Total Inbox',
      'metrics.phone_leads': 'Phone Leads',
      'metrics.cost_per_lead': 'Cost/Lead',
      'ads.campaigns': 'Campaigns',
      'ads.ad_sets': 'Ad Sets',
      'ads.ads': 'Ads',
      'common.no_data': 'No data available',
      'facebook.balance': 'Facebook Balance',
      'metrics.total_spent': 'Total Spent',
      'language.title': 'Language',
      'navigation.settings': 'Settings',
    },
  };
}

/// Supported locales for easy_localization
class AppLocales {
  static const Locale thai = Locale('th');
  static const Locale english = Locale('en');

  static const List<Locale> supportedLocales = [thai, english];
  static const Locale fallbackLocale = thai;
  static const String translationsPath = 'assets/translations';
}

/// Extension for easy translation access with dot notation
extension TranslateExtension on String {
  /// Translate using easy_localization's tr() method
  String get t {
    try {
      return this.tr();
    } catch (e) {
      return LanguageService.instance.translate(this);
    }
  }
}
