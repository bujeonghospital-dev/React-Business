import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'dart:async';
import '../models/ad_insight.dart';
import '../services/facebook_ads_service.dart';
import '../services/language_service.dart';
import '../widgets/date_range_picker.dart' as custom_picker;
import '../widgets/daily_summary_table.dart';
import '../widgets/top_ads_table.dart';
import '../widgets/top_adset_table.dart';
import '../widgets/ad_preview_modal.dart';
import '../widgets/phone_leads_card.dart';
import '../widgets/inbox_stats_card.dart';
import '../widgets/facebook_spending_card.dart';
import '../widgets/language_switcher.dart';
import '../widgets/video_gallery_widget.dart';

class FacebookAdsDashboardNew extends StatefulWidget {
  const FacebookAdsDashboardNew({Key? key}) : super(key: key);

  @override
  State<FacebookAdsDashboardNew> createState() =>
      _FacebookAdsDashboardNewState();
}

class _FacebookAdsDashboardNewState extends State<FacebookAdsDashboardNew>
    with SingleTickerProviderStateMixin {
  final FacebookAdsService _service = FacebookAdsService();
  final RefreshController _refreshController =
      RefreshController(initialRefresh: false);

  // Data
  List<AdInsight> _insights = [];
  Map<String, AdCreative> _adCreatives = {};
  Map<String, int> _phoneLeads = {};
  List<DailySummary> _dailySummaries = [];
  Map<String, int> _phoneLeadsByDate = {}; // Phone leads by date for table

  // Loading states
  bool _isLoading = true;
  bool _isCreativesLoading = false;
  String? _error;

  // Metrics
  double _facebookBalance = 0;
  int _phoneCount = 0;
  int _googleSheetsData = 0;
  int _googleAdsData = 0;

  // Filters
  String _viewMode = 'ads';
  String _dateRange = 'today';
  DateTime? _customDateStart;
  DateTime? _customDateEnd;
  String _topAdsSortBy = 'leads';
  int _topAdsLimit = 20;

  // Auto-refresh timer
  Timer? _autoRefreshTimer;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _loadAllData();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    _refreshController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _startAutoRefresh() {
    _autoRefreshTimer = Timer.periodic(
      const Duration(minutes: 2),
      (timer) {
        _loadAllData(isBackground: true);
      },
    );
  }

  Future<void> _loadAllData({bool isBackground = false}) async {
    if (!isBackground) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    }

    try {
      String level = _viewMode == 'campaigns'
          ? 'campaign'
          : _viewMode == 'adsets'
              ? 'adset'
              : 'ad';

      final insights = await _service.fetchInsights(
        level: level,
        datePreset: _dateRange == 'custom' ? 'last_30d' : _dateRange,
        timeSince:
            _dateRange == 'custom' ? _formatDate(_customDateStart!) : null,
        timeUntil: _dateRange == 'custom' ? _formatDate(_customDateEnd!) : null,
      );

      print('🚀 Starting to fetch all data...');
      final results = await Future.wait([
        _service.fetchFacebookBalance(),
        _service.fetchPhoneCount(),
        _service.fetchGoogleSheetsData(
          datePreset: _dateRange == 'custom' ? 'last_30d' : _dateRange,
          timeSince:
              _dateRange == 'custom' ? _formatDate(_customDateStart!) : null,
          timeUntil:
              _dateRange == 'custom' ? _formatDate(_customDateEnd!) : null,
        ),
        _service.fetchGoogleAdsData(
          datePreset: _dateRange,
          startDate:
              _dateRange == 'custom' ? _formatDate(_customDateStart!) : null,
          endDate: _dateRange == 'custom' ? _formatDate(_customDateEnd!) : null,
        ),
        _service.fetchDailySummaryData(),
        _service.fetchPhoneLeadsByDate(), // Fetch phone leads by date
      ]);

      print('📦 All data fetched!');
      print('💵 Facebook Balance: ${results[0]}');
      print('📞 Phone Count: ${results[1]}');
      print('📊 Google Sheets: ${results[2]}');
      print('📈 Google Ads: ${results[3]}');
      print('📅 Daily Summaries: ${(results[4] as List).length} items');
      print('📞 Phone Leads by Date: ${(results[5] as Map).length} days');

      setState(() {
        _insights = insights;
        _facebookBalance = results[0] as double;
        _phoneCount = results[1] as int;
        _googleSheetsData = results[2] as int;
        _googleAdsData = results[3] as int;
        _dailySummaries = results[4] as List<DailySummary>;
        _phoneLeadsByDate = results[5] as Map<String, int>;
        _isLoading = false;
      });

      print('✅ State updated with new data');

      if (_viewMode == 'ads' && _insights.isNotEmpty) {
        _fetchAdCreatives();
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }

    if (!isBackground) {
      _refreshController.refreshCompleted();
    }
  }

  Future<void> _fetchAdCreatives() async {
    setState(() {
      _isCreativesLoading = true;
    });

    try {
      final adIds = _insights.map((ad) => ad.adId).toList();
      final creatives = await _service.fetchAdCreatives(adIds);
      final phoneLeads = await _service.fetchPhoneLeads(adIds: adIds);

      setState(() {
        _adCreatives = creatives;
        _phoneLeads = phoneLeads;
        _isCreativesLoading = false;
      });
    } catch (e) {
      setState(() {
        _isCreativesLoading = false;
      });
    }
  }

  void _onRefresh() {
    _loadAllData();
  }

  String _formatDate(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'th_TH').format(value)}';
  }

  String _formatNumber(dynamic value) {
    if (value is String) {
      value = double.tryParse(value) ?? 0;
    }
    return NumberFormat('#,##0', 'th_TH').format(value);
  }

  double _getTotalSpend() {
    return _insights.fold(0, (sum, ad) => sum + ad.spend);
  }

  int _getTotalNewInbox() {
    return _insights.fold(0, (sum, ad) => sum + ad.messagingFirstReply);
  }

  int _getTotalInbox() {
    return _insights.fold(0, (sum, ad) => sum + ad.totalMessagingConnection);
  }

  // Get inbox data as list of maps for InboxStatsCard
  List<Map<String, dynamic>> _getInboxByDateList() {
    Map<String, Map<String, int>> dailyInbox = {};
    for (var summary in _dailySummaries) {
      final date = summary.date;
      dailyInbox[date] ??= {'new': 0, 'total': 0};
      dailyInbox[date]!['new'] =
          (dailyInbox[date]!['new'] ?? 0) + summary.newInbox;
      dailyInbox[date]!['total'] =
          (dailyInbox[date]!['total'] ?? 0) + summary.totalInbox;
    }

    final sortedDates = dailyInbox.keys.toList()
      ..sort((a, b) => b.compareTo(a));

    return sortedDates.skip(1).take(10).map((date) {
      final d = DateTime.tryParse(date);
      final formattedDate = d != null ? '${d.day}/${d.month}' : date;
      return {
        'date': formattedDate,
        'newInbox': dailyInbox[date]!['new'] ?? 0,
        'totalInbox': dailyInbox[date]!['total'] ?? 0,
      };
    }).toList();
  }

  // Get spend data as list of maps for FacebookSpendingCard
  List<Map<String, dynamic>> _getSpendByDateList() {
    Map<String, double> dailySpend = {};
    for (var summary in _dailySummaries) {
      final date = summary.date;
      dailySpend[date] = (dailySpend[date] ?? 0) + summary.totalSpend;
    }

    final sortedDates = dailySpend.keys.toList()
      ..sort((a, b) => b.compareTo(a));

    return sortedDates.skip(1).take(7).map((date) {
      final d = DateTime.tryParse(date);
      final formattedDate = d != null ? '${d.day}/${d.month}' : date;
      return {
        'date': formattedDate,
        'spent': dailySpend[date] ?? 0.0,
      };
    }).toList();
  }

  void _showDatePicker() {
    showDialog(
      context: context,
      builder: (context) => custom_picker.DateRangePickerDialog(
        initialStartDate: _customDateStart,
        initialEndDate: _customDateEnd,
        onDateRangeSelected: (start, end) {
          setState(() {
            _customDateStart = start;
            _customDateEnd = end;
            _dateRange = 'custom';
          });
          _loadAllData();
        },
      ),
    );
  }

  void _showAdPreview(AdInsight ad) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AdPreviewModal(
        ad: ad,
        creative: _adCreatives[ad.adId],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Loading State - Matching page.tsx design
    if (_isLoading) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Colors.grey[50]!, Colors.blue[50]!],
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 64,
                  height: 64,
                  child: CircularProgressIndicator(
                    valueColor:
                        AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
                    strokeWidth: 4,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Loading data...',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please wait',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Error State - Matching page.tsx design
    if (_error != null) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            color: Colors.grey[50],
          ),
          padding: const EdgeInsets.all(16),
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 500),
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    '⚠️',
                    style: TextStyle(fontSize: 48),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'An error occurred',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _loadAllData,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[600],
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Try Again',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Colors.grey[50]!, Colors.blue[50]!],
            ),
          ),
          child: SmartRefresher(
            controller: _refreshController,
            onRefresh: _onRefresh,
            header: WaterDropMaterialHeader(
              backgroundColor: Colors.blue[600],
              color: Colors.white,
            ),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Back Button Header - Matching page.tsx
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    child: Row(
                      children: [
                        Flexible(
                          flex: 0,
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () => Navigator.of(context).pop(),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.blue[500]!,
                                      Colors.blue[600]!
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.blue.withOpacity(0.3),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.arrow_back,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                        const Spacer(),
                        // Language Switcher
                        const LanguageSwitcher(
                          size: 'small',
                          showLabels: true,
                          enableParticles: true,
                        ),
                      ],
                    ),
                  ),

                  // Date Filter Bar - Matching page.tsx
                  _buildDateFilterBar(),

                  // Performance Cards Section
                  const SizedBox(height: 12),
                  _buildPerformanceCardsSection(),

                  // Daily Summary Section
                  const SizedBox(height: 16),
                  _buildDailySummarySection(),

                  // TOP 20 Ads Table
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: TopAdsTable(
                      insights: _insights,
                      adCreatives: _adCreatives,
                      phoneLeads: _phoneLeads,
                      isCreativesLoading: _isCreativesLoading,
                      onAdTap: _showAdPreview,
                    ),
                  ),

                  // TOP 20 Ad Set Table
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: TopAdSetTable(
                      insights: _insights,
                      phoneLeads: _phoneLeads,
                    ),
                  ),

                  // Video Gallery Section
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: VideoGalleryWidget(
                      insights: _insights,
                      adCreatives: _adCreatives,
                      isLoading: _isCreativesLoading,
                      title: 'Video Ads',
                      maxItems: 10,
                    ),
                  ),

                  // Report Section
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: _buildReportSection(),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDateFilterBar() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 12 : 16,
        vertical: 12,
      ),
      child: isMobile
          ? _buildMobileDateDropdown()
          : SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildDateRangeChip('Today', 'today'),
                  _buildDateRangeChip('Yesterday', 'yesterday'),
                  _buildDateRangeChip('7 Days', 'last_7d'),
                  _buildDateRangeChip('14 Days', 'last_14d'),
                  _buildDateRangeChip('30 Days', 'last_30d'),
                  _buildDateRangeChip('This Month', 'this_month'),
                  _buildCustomDateChip(),
                  if (_dateRange == 'custom' &&
                      _customDateStart != null &&
                      _customDateEnd != null)
                    Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Text(
                        '${_formatDate(_customDateStart!)} - ${_formatDate(_customDateEnd!)}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildMobileDateDropdown() {
    return Row(
      children: [
        Text(
          '📅',
          style: TextStyle(fontSize: 16),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!, width: 2),
              borderRadius: BorderRadius.circular(8),
              color: Colors.white,
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _dateRange,
                isExpanded: true,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[700],
                ),
                items: [
                  DropdownMenuItem(value: 'today', child: Text('Today')),
                  DropdownMenuItem(
                      value: 'yesterday', child: Text('Yesterday')),
                  DropdownMenuItem(
                      value: 'last_7d', child: Text('Last 7 Days')),
                  DropdownMenuItem(
                      value: 'last_14d', child: Text('Last 14 Days')),
                  DropdownMenuItem(
                      value: 'last_30d', child: Text('Last 30 Days')),
                  DropdownMenuItem(
                      value: 'this_month', child: Text('This Month')),
                  DropdownMenuItem(value: 'custom', child: Text('🗓️ Custom')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    if (value == 'custom') {
                      _showDatePicker();
                    } else {
                      setState(() {
                        _dateRange = value;
                      });
                      _loadAllData();
                    }
                  }
                },
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceCardsSection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;
    final isTablet = screenWidth >= 600 && screenWidth < 900;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 8 : 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 3-Column Layout like page.tsx
          if (isMobile)
            // Mobile: Stack vertically
            Column(
              children: [
                // Facebook Spending Card
                FacebookSpendingCard(
                  facebookBalance: _facebookBalance,
                  totalSpend: _getTotalSpend(),
                  spendByDate: _getSpendByDateList(),
                ),
                const SizedBox(height: 12),
                // New Inbox Stats Card
                InboxStatsCard(
                  newInbox: _getTotalNewInbox(),
                  totalInbox: _getTotalInbox(),
                  inboxByDate: _getInboxByDateList(),
                ),
                const SizedBox(height: 12),
                // New Phone Leads Card
                PhoneLeadsCard(
                  phoneCount: _phoneCount,
                  phoneLeadsByDate: _phoneLeadsByDate,
                ),
              ],
            )
          else
            // Tablet/Desktop: 3 columns
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Facebook Spending Card
                Expanded(
                  child: FacebookSpendingCard(
                    facebookBalance: _facebookBalance,
                    totalSpend: _getTotalSpend(),
                    spendByDate: _getSpendByDateList(),
                  ),
                ),
                const SizedBox(width: 12),
                // New Inbox Stats Card
                Expanded(
                  child: InboxStatsCard(
                    newInbox: _getTotalNewInbox(),
                    totalInbox: _getTotalInbox(),
                    inboxByDate: _getInboxByDateList(),
                  ),
                ),
                const SizedBox(width: 12),
                // New Phone Leads Card
                Expanded(
                  child: PhoneLeadsCard(
                    phoneCount: _phoneCount,
                    phoneLeadsByDate: _phoneLeadsByDate,
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildMetricCardWithTable({
    required String title1,
    required String value1,
    String? title2,
    String? value2,
    required Gradient gradient,
    required List<List<String>> tableData,
    required List<String> tableHeaders,
    required Color tableColor,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isMobile ? 16 : 24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Gradient Card
          Container(
            padding: EdgeInsets.all(isMobile ? 16 : 24),
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(isMobile ? 16 : 24),
                topRight: Radius.circular(isMobile ? 16 : 24),
              ),
            ),
            child: title2 != null
                ? Row(
                    children: [
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              title1,
                              style: TextStyle(
                                fontSize: isMobile ? 11 : 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                            const SizedBox(height: 4),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                value1,
                                style: TextStyle(
                                  fontSize: isMobile ? 18 : 26,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              title2,
                              style: TextStyle(
                                fontSize: isMobile ? 11 : 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                            const SizedBox(height: 4),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                value2!,
                                style: TextStyle(
                                  fontSize: isMobile ? 18 : 26,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      Text(
                        title1,
                        style: TextStyle(
                          fontSize: isMobile ? 14 : 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        value1,
                        style: TextStyle(
                          fontSize: isMobile ? 28 : 36,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
          ),
          // Table
          Container(
            constraints: BoxConstraints(maxHeight: isMobile ? 100 : 120),
            decoration: BoxDecoration(
              color: tableColor.withOpacity(0.05),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(isMobile ? 16 : 24),
                bottomRight: Radius.circular(isMobile ? 16 : 24),
              ),
            ),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: isMobile ? 8 : 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: tableColor.withOpacity(0.1),
                    ),
                    child: Row(
                      children: tableHeaders
                          .map((h) => Expanded(
                                child: Text(
                                  h,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: isMobile ? 10 : 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[700],
                                  ),
                                ),
                              ))
                          .toList(),
                    ),
                  ),
                  // Data Rows
                  ...tableData.take(5).map((row) => Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: isMobile ? 8 : 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(color: Colors.grey[200]!),
                          ),
                        ),
                        child: Row(
                          children: row
                              .asMap()
                              .entries
                              .map((entry) => Expanded(
                                    child: Text(
                                      entry.value,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: isMobile ? 10 : 12,
                                        fontWeight: entry.key == 0
                                            ? FontWeight.normal
                                            : FontWeight.w600,
                                        color: entry.key == 0
                                            ? Colors.grey[700]
                                            : tableColor.withOpacity(0.85),
                                      ),
                                    ),
                                  ))
                              .toList(),
                        ),
                      )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<List<String>> _buildSpendTableData() {
    Map<String, double> dailySpend = {};
    for (var summary in _dailySummaries) {
      final date = summary.date;
      dailySpend[date] = (dailySpend[date] ?? 0) + summary.totalSpend;
    }

    final sortedDates = dailySpend.keys.toList()
      ..sort((a, b) => b.compareTo(a));

    return sortedDates.skip(1).take(10).map((date) {
      final d = DateTime.tryParse(date);
      final formattedDate = d != null ? '${d.day}/${d.month}' : date;
      return [formattedDate, _formatCurrency(dailySpend[date]!)];
    }).toList();
  }

  List<List<String>> _buildInboxTableData() {
    Map<String, Map<String, int>> dailyInbox = {};
    for (var summary in _dailySummaries) {
      final date = summary.date;
      dailyInbox[date] ??= {'new': 0, 'total': 0};
      dailyInbox[date]!['new'] =
          (dailyInbox[date]!['new'] ?? 0) + summary.newInbox;
      dailyInbox[date]!['total'] =
          (dailyInbox[date]!['total'] ?? 0) + summary.totalInbox;
    }

    final sortedDates = dailyInbox.keys.toList()
      ..sort((a, b) => b.compareTo(a));

    return sortedDates.skip(1).take(10).map((date) {
      final d = DateTime.tryParse(date);
      final formattedDate = d != null ? '${d.day}/${d.month}' : date;
      return [
        formattedDate,
        '${dailyInbox[date]!['new']}',
        '${dailyInbox[date]!['total']}',
      ];
    }).toList();
  }

  List<List<String>> _buildPhoneTableData() {
    if (_phoneLeadsByDate.isEmpty) {
      return [
        ['Today', '$_phoneCount'],
      ];
    }

    // Sort dates descending
    final sortedDates = _phoneLeadsByDate.keys.toList()
      ..sort((a, b) => b.compareTo(a));

    return sortedDates.take(10).map((date) {
      final d = DateTime.tryParse(date);
      final formattedDate = d != null ? '${d.day}/${d.month}' : date;
      return [formattedDate, '${_phoneLeadsByDate[date]}'];
    }).toList();
  }

  Widget _buildDailySummarySection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 16),
      child: DailySummaryTable(
        summaries: _dailySummaries,
        phoneLeadsByDate: _phoneLeadsByDate,
      ),
    );
  }

  Widget _buildReportSection() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isMobile ? 16 : 24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // View Mode Tabs - Matching page.tsx
          Container(
            padding: EdgeInsets.all(isMobile ? 12 : 16),
            color: Colors.grey[50],
            child: Row(
              children: [
                Expanded(
                    child:
                        _buildViewModeTab('Campaigns', 'campaigns', isMobile)),
                SizedBox(width: isMobile ? 6 : 8),
                Expanded(
                    child: _buildViewModeTab('Ad Sets', 'adsets', isMobile)),
                SizedBox(width: isMobile ? 6 : 8),
                Expanded(child: _buildViewModeTab('Ads', 'ads', isMobile)),
              ],
            ),
          ),

          // Empty State
          if (_insights.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.inbox,
                        size: isMobile ? 48 : 64, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No data available',
                      style: TextStyle(
                        fontSize: isMobile ? 16 : 18,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            // Table Header
            Column(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 8 : 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    border:
                        Border(bottom: BorderSide(color: Colors.grey[200]!)),
                  ),
                  child: Row(
                    children: [
                      if (_viewMode == 'ads')
                        SizedBox(
                            width: isMobile ? 56 : 72,
                            child: Center(
                                child: Text('Image',
                                    style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 2,
                          child: Text('Ad Name',
                              style: _tableHeaderStyle(isMobile))),
                      Expanded(
                          flex: 2,
                          child: Center(
                              child: Text('Campaign',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('Spent',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('New',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('Inbox',
                                  style: _tableHeaderStyle(isMobile)))),
                      Expanded(
                          flex: 1,
                          child: Center(
                              child: Text('Cost/Lead',
                                  style: _tableHeaderStyle(isMobile)))),
                    ],
                  ),
                ),
                // Data Rows
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: EdgeInsets.zero,
                  itemCount: _insights.length,
                  separatorBuilder: (context, index) =>
                      Divider(height: 1, color: Colors.grey[200]),
                  itemBuilder: (context, index) {
                    final ad = _insights[index];
                    final creative = _adCreatives[ad.adId];
                    final thumbnailUrl =
                        creative?.thumbnailUrl ?? creative?.imageUrl;
                    final costPerConnection = ad.getCostPerAction(
                      'onsite_conversion.total_messaging_connection',
                    );

                    return Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => _showAdPreview(ad),
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 8 : 16,
                            vertical: isMobile ? 10 : 12,
                          ),
                          child: Row(
                            children: [
                              // Thumbnail
                              if (_viewMode == 'ads')
                                SizedBox(
                                  width: isMobile ? 56 : 72,
                                  child: Center(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: thumbnailUrl != null
                                          ? Image.network(
                                              thumbnailUrl,
                                              width: isMobile ? 48 : 56,
                                              height: isMobile ? 48 : 56,
                                              fit: BoxFit.cover,
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                return Container(
                                                  width: isMobile ? 48 : 56,
                                                  height: isMobile ? 48 : 56,
                                                  color: Colors.grey[200],
                                                  child: Icon(Icons.image,
                                                      color: Colors.grey[400],
                                                      size: 24),
                                                );
                                              },
                                            )
                                          : Container(
                                              width: isMobile ? 48 : 56,
                                              height: isMobile ? 48 : 56,
                                              color: Colors.grey[100],
                                              child: Icon(Icons.image_outlined,
                                                  color: Colors.grey[400],
                                                  size: 24),
                                            ),
                                    ),
                                  ),
                                ),
                              // Ad Name
                              Expanded(
                                flex: 2,
                                child: Text(
                                  ad.adName,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: isMobile ? 12 : 14,
                                    color: Colors.grey[800],
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              // Campaign Name
                              Expanded(
                                flex: 2,
                                child: Center(
                                  child: Text(
                                    ad.campaignName,
                                    style: TextStyle(
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.grey[600],
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                              // Spent
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    _formatCurrency(ad.spend),
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.blue[700],
                                    ),
                                  ),
                                ),
                              ),
                              // New Inbox
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    '${ad.messagingFirstReply}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.green[700],
                                    ),
                                  ),
                                ),
                              ),
                              // Total Inbox
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    '${ad.totalMessagingConnection}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.teal[700],
                                    ),
                                  ),
                                ),
                              ),
                              // Cost per Lead
                              Expanded(
                                flex: 1,
                                child: Center(
                                  child: Text(
                                    costPerConnection > 0
                                        ? _formatCurrency(costPerConnection)
                                        : '—',
                                    style: TextStyle(
                                      fontSize: isMobile ? 11 : 13,
                                      color: Colors.grey[700],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
        ],
      ),
    );
  }

  TextStyle _tableHeaderStyle(bool isMobile) {
    return TextStyle(
      fontWeight: FontWeight.w600,
      fontSize: isMobile ? 11 : 13,
      color: Colors.grey[700],
    );
  }

  Widget _buildDateRangeChip(String label, String value) {
    final isSelected = _dateRange == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 13,
          ),
        ),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _dateRange = value;
          });
          _loadAllData();
        },
        selectedColor: Colors.blue[600],
        backgroundColor: Colors.grey[200],
        elevation: isSelected ? 2 : 0,
        pressElevation: 4,
      ),
    );
  }

  Widget _buildCustomDateChip() {
    final isSelected = _dateRange == 'custom';
    return FilterChip(
      label: Text(
        '🗓️ กำหนดเอง',
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.grey[700],
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 13,
        ),
      ),
      selected: isSelected,
      onSelected: (selected) {
        _showDatePicker();
      },
      selectedColor: Colors.blue[600],
      backgroundColor: Colors.grey[200],
      elevation: isSelected ? 2 : 0,
      pressElevation: 4,
    );
  }

  Widget _buildViewModeTab(String label, String mode, bool isMobile) {
    final isSelected = _viewMode == mode;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          setState(() {
            _viewMode = mode;
          });
          _loadAllData();
        },
        borderRadius: BorderRadius.circular(isMobile ? 8 : 12),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: isMobile ? 10 : 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.blue[100] : Colors.white,
            borderRadius: BorderRadius.circular(isMobile ? 8 : 12),
            border: Border.all(
              color: isSelected ? Colors.blue[300]! : Colors.grey[300]!,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: isMobile ? 12 : 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? Colors.blue[700] : Colors.grey[700],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
