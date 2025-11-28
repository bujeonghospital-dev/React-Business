import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'screens/facebook_ads_dashboard_new.dart';
import 'services/language_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize easy_localization
  await EasyLocalization.ensureInitialized();

  // Initialize language service
  await LanguageService.instance.initialize();

  // Set portrait orientation only
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set status bar style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(
    EasyLocalization(
      supportedLocales: AppLocales.supportedLocales,
      path: AppLocales.translationsPath,
      fallbackLocale: AppLocales.fallbackLocale,
      startLocale: LanguageService.instance.currentLocale,
      child: const FacebookAdsManagerApp(),
    ),
  );
}

class FacebookAdsManagerApp extends StatelessWidget {
  const FacebookAdsManagerApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Set context for language service to enable easy_localization integration
    LanguageService.instance.setContext(context);

    return MaterialApp(
      title: 'Facebook Ads Manager',
      debugShowCheckedModeBanner: false,

      // Localization configuration
      localizationsDelegates: [
        ...context.localizationDelegates,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: context.supportedLocales,
      locale: context.locale,

      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF1877F2),
        scaffoldBackgroundColor: Colors.grey[50],
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          centerTitle: false,
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.dark,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      home: const FacebookAdsDashboardNew(),
    );
  }
}
