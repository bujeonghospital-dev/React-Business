import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class FacebookAdsWebView extends StatefulWidget {
  const FacebookAdsWebView({super.key});

  @override
  State<FacebookAdsWebView> createState() => _FacebookAdsWebViewState();
}

class _FacebookAdsWebViewState extends State<FacebookAdsWebView> {
  final GlobalKey webViewKey = GlobalKey();
  InAppWebViewController? webViewController;
  InAppWebViewSettings settings = InAppWebViewSettings(
    isInspectable: true,
    mediaPlaybackRequiresUserGesture: false,
    allowsInlineMediaPlayback: true,
    iframeAllow: "camera; microphone",
    iframeAllowFullscreen: true,
    useShouldOverrideUrlLoading: true,
    useOnLoadResource: true,
    javaScriptEnabled: true,
    javaScriptCanOpenWindowsAutomatically: true,
    supportMultipleWindows: true,
    domStorageEnabled: true,
    databaseEnabled: true,
    cacheEnabled: true,
    clearCache: false,
    thirdPartyCookiesEnabled: true,
    mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
    // Performance optimizations
    cacheMode: CacheMode.LOAD_CACHE_ELSE_NETWORK,
    disableDefaultErrorPage: true,
    minimumFontSize: 10,
    useHybridComposition: true,
    // User Agent to appear as normal browser
    userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  );

  PullToRefreshController? pullToRefreshController;
  String url = "";
  final String initialUrl = "https://tpp-thanakon.store";
  double progress = 0;
  bool isLoading = true;
  bool hasError = false;
  String? errorMessage;

  @override
  void initState() {
    super.initState();

    // Only enable pull to refresh on mobile platforms
    if (defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS) {
      pullToRefreshController = PullToRefreshController(
        settings: PullToRefreshSettings(
          color: const Color(0xFF1877F2),
        ),
        onRefresh: () async {
          await webViewController?.reload();
        },
      );
    }

    // Set timeout for loading (45 seconds - allow time for API retry)
    Future.delayed(const Duration(seconds: 45), () {
      if (mounted && isLoading) {
        setState(() {
          isLoading = false;
          hasError = true;
          errorMessage =
              'การโหลดใช้เวลานานเกินไป\n\nกรุณา:\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\n• ลองกดปุ่ม "ลองอีกครั้ง"\n• หรือรีเฟรชหน้าเว็บ';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Facebook Ads Manager',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              webViewController?.reload();
            },
            tooltip: 'Refresh',
          ),
          PopupMenuButton<String>(
            onSelected: (value) async {
              switch (value) {
                case 'home':
                  await webViewController?.loadUrl(
                    urlRequest: URLRequest(url: WebUri(initialUrl)),
                  );
                  break;
                case 'forward':
                  if (await webViewController?.canGoForward() ?? false) {
                    await webViewController?.goForward();
                  }
                  break;
                case 'back':
                  if (await webViewController?.canGoBack() ?? false) {
                    await webViewController?.goBack();
                  }
                  break;
                case 'clear':
                  await webViewController?.clearCache();
                  await webViewController?.reload();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Cache cleared'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  }
                  break;
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                value: 'home',
                child: Row(
                  children: [
                    Icon(Icons.home, size: 20),
                    SizedBox(width: 12),
                    Text('Home'),
                  ],
                ),
              ),
              const PopupMenuItem<String>(
                value: 'back',
                child: Row(
                  children: [
                    Icon(Icons.arrow_back, size: 20),
                    SizedBox(width: 12),
                    Text('Back'),
                  ],
                ),
              ),
              const PopupMenuItem<String>(
                value: 'forward',
                child: Row(
                  children: [
                    Icon(Icons.arrow_forward, size: 20),
                    SizedBox(width: 12),
                    Text('Forward'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'clear',
                child: Row(
                  children: [
                    Icon(Icons.clear_all, size: 20),
                    SizedBox(width: 12),
                    Text('Clear Cache'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress bar
            if (isLoading)
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation<Color>(
                  Color(0xFF1877F2),
                ),
              ),

            // WebView
            Expanded(
              child: Stack(
                children: [
                  InAppWebView(
                    key: webViewKey,
                    initialUrlRequest: URLRequest(
                      url: WebUri(initialUrl),
                    ),
                    initialSettings: settings,
                    pullToRefreshController: pullToRefreshController,
                    onWebViewCreated: (controller) {
                      webViewController = controller;
                    },
                    onLoadStart: (controller, url) {
                      setState(() {
                        this.url = url.toString();
                        isLoading = true;
                        hasError = false;
                        errorMessage = null;
                      });
                    },
                    onLoadStop: (controller, url) async {
                      pullToRefreshController?.endRefreshing();

                      setState(() {
                        this.url = url.toString();
                        isLoading = false;
                        hasError = false;
                      });

                      // Auto-click retry button if error page is shown
                      Future.delayed(const Duration(milliseconds: 1000),
                          () async {
                        try {
                          final result =
                              await controller.evaluateJavascript(source: """
                            (function() {
                              const retryBtn = document.querySelector('button');
                              if (retryBtn && retryBtn.textContent.includes('ลองอีกครั้ง')) {
                                retryBtn.click();
                                return true;
                              }
                              return false;
                            })();
                          """);

                          // If retry button was clicked, reload after delay
                          if (result == true) {
                            await Future.delayed(const Duration(seconds: 2));
                            await controller.reload();
                          }
                        } catch (e) {
                          print('Auto-retry error: $e');
                        }
                      });
                    },
                    onProgressChanged: (controller, progress) {
                      if (progress == 100) {
                        pullToRefreshController?.endRefreshing();
                      }
                      setState(() {
                        this.progress = progress / 100;
                        isLoading = progress < 100;
                        if (progress == 100) {
                          hasError = false;
                        }
                      });
                    },
                    onReceivedError: (controller, request, error) {
                      pullToRefreshController?.endRefreshing();
                      // Only show error for main page, not for resources
                      if (request.url == WebUri(initialUrl)) {
                        setState(() {
                          isLoading = false;
                          hasError = true;
                          errorMessage =
                              'ไม่สามารถโหลดหน้าเว็บได้: ${error.description}';
                        });
                      }
                    },
                    onReceivedHttpError: (controller, request, errorResponse) {
                      // Don't show error for non-critical HTTP errors (like 404 on resources)
                      if (request.url == WebUri(initialUrl) &&
                          (errorResponse.statusCode ?? 0) >= 500) {
                        setState(() {
                          isLoading = false;
                          hasError = true;
                          errorMessage =
                              'HTTP Error: ${errorResponse.statusCode}';
                        });
                      }
                    },
                    onConsoleMessage: (controller, consoleMessage) {
                      print("Console: ${consoleMessage.message}");
                    },
                    shouldOverrideUrlLoading:
                        (controller, navigationAction) async {
                      return NavigationActionPolicy.ALLOW;
                    },
                  ),

                  // Loading indicator
                  if (isLoading && progress < 0.3 && !hasError)
                    Container(
                      color: Colors.white,
                      child: const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Color(0xFF1877F2),
                              ),
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Loading Facebook Ads Manager...',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Error display
                  if (hasError)
                    Container(
                      color: Colors.white,
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.error_outline,
                                size: 64,
                                color: Colors.red,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                errorMessage ?? 'เกิดข้อผิดพลาด',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                ),
                              ),
                              const SizedBox(height: 24),
                              ElevatedButton.icon(
                                onPressed: () {
                                  setState(() {
                                    hasError = false;
                                    errorMessage = null;
                                  });
                                  webViewController?.reload();
                                },
                                icon: const Icon(Icons.refresh),
                                label: const Text('ลองอีกครั้ง'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1877F2),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),

      // Bottom navigation for quick actions
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios),
                  onPressed: () async {
                    if (await webViewController?.canGoBack() ?? false) {
                      await webViewController?.goBack();
                    }
                  },
                  tooltip: 'Back',
                  color: const Color(0xFF1877F2),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_forward_ios),
                  onPressed: () async {
                    if (await webViewController?.canGoForward() ?? false) {
                      await webViewController?.goForward();
                    }
                  },
                  tooltip: 'Forward',
                  color: const Color(0xFF1877F2),
                ),
                IconButton(
                  icon: const Icon(Icons.home),
                  onPressed: () {
                    webViewController?.loadUrl(
                      urlRequest: URLRequest(url: WebUri(initialUrl)),
                    );
                  },
                  tooltip: 'Home',
                  color: const Color(0xFF1877F2),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () {
                    webViewController?.reload();
                  },
                  tooltip: 'Refresh',
                  color: const Color(0xFF1877F2),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
