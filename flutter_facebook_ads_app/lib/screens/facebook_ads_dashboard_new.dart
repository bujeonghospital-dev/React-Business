import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'dart:async';
import '../models/ad_insight.dart';
import '../services/facebook_ads_service.dart';
import '../widgets/performance_card.dart';
import '../widgets/date_range_picker.dart' as custom_picker;
import '../widgets/daily_summary_table.dart';
import '../widgets/top_ads_section.dart';
import '../widgets/ad_preview_modal.dart';

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
      ]);

      print('📦 All data fetched!');
      print('💵 Facebook Balance: ${results[0]}');
      print('📞 Phone Count: ${results[1]}');
      print('📊 Google Sheets: ${results[2]}');
      print('📈 Google Ads: ${results[3]}');
      print('📅 Daily Summaries: ${(results[4] as List).length} items');

      setState(() {
        _insights = insights;
        _facebookBalance = results[0] as double;
        _phoneCount = results[1] as int;
        _googleSheetsData = results[2] as int;
        _googleAdsData = results[3] as int;
        _dailySummaries = results[4] as List<DailySummary>;
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
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
                  strokeWidth: 4,
                ),
                const SizedBox(height: 24),
                Text(
                  'กำลังโหลดข้อมูล...',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'โปรดรอสักครู่',
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

    if (_error != null) {
      return Scaffold(
        body: Container(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  '⚠️',
                  style: TextStyle(fontSize: 64),
                ),
                const SizedBox(height: 16),
                Text(
                  'เกิดข้อผิดพลาด',
                  style: TextStyle(
                    fontSize: 24,
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
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _loadAllData,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[600],
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'ลองอีกครั้ง',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.grey[800],
        title: const Text(
          'Facebook Ads Manager',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
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
              child: Padding(
                padding: const EdgeInsets.only(bottom: 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildDateFilterBar(),
                    const SizedBox(height: 16),
                    _buildPerformanceCardsSection(),
                    const SizedBox(height: 16),
                    _buildDailySummarySection(),
                    const SizedBox(height: 16),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: TopAdsSection(
                        insights: _insights,
                        adCreatives: _adCreatives,
                        phoneLeads: _phoneLeads,
                        sortBy: _topAdsSortBy,
                        isCreativesLoading: _isCreativesLoading,
                        onSortChanged: (sortBy) {
                          setState(() {
                            _topAdsSortBy = sortBy;
                          });
                        },
                        onAdTap: _showAdPreview,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: _buildReportSection(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDateFilterBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildDateRangeChip('วันนี้', 'today'),
            _buildDateRangeChip('เมื่อวาน', 'yesterday'),
            _buildDateRangeChip('7 วัน', 'last_7d'),
            _buildDateRangeChip('14 วัน', 'last_14d'),
            _buildDateRangeChip('30 วัน', 'last_30d'),
            _buildDateRangeChip('เดือนนี้', 'this_month'),
            _buildCustomDateChip(),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformanceCardsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 140,
                  child: PerformanceCard(
                    title: '💰 ใช้จ่ายรวม',
                    value: _formatCurrency(_getTotalSpend()),
                    gradient: LinearGradient(
                      colors: [Colors.blue[500]!, Colors.blue[700]!],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 140,
                  child: PerformanceCard(
                    title: '💬 New/Total Inbox',
                    value:
                        '${_formatNumber(_getTotalNewInbox())}\n${_formatNumber(_getTotalInbox())}',
                    gradient: LinearGradient(
                      colors: [Colors.teal[500]!, Colors.cyan[600]!],
                    ),
                    isSmallText: true,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 140,
                  child: PerformanceCard(
                    title: '💵 เงินคงเหลือ FB',
                    value: _formatCurrency(_facebookBalance),
                    subtitle: 'Facebook Balance',
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        const Color(0xFF00C853),
                        const Color(0xFF00E676),
                        Colors.green[700]!,
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 140,
                  child: PerformanceCard(
                    title: '📞 ชื่อ - เบอร์',
                    value: _formatNumber(_phoneCount),
                    subtitle: 'Phone Leads วันนี้',
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.purple[600]!,
                        Colors.deepPurple[500]!,
                        Colors.indigo[700]!,
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDailySummarySection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: const LinearGradient(
                colors: [Color(0xFF8E24AA), Color(0xFF5E35B1)],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.purple.withOpacity(0.2),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const SizedBox.shrink(),
          ),
          const SizedBox(height: 12),
          DailySummaryTable(
            summaries: _dailySummaries,
          ),
        ],
      ),
    );
  }

  Widget _buildReportSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
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
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.blue[600]!,
                  Colors.indigo[600]!,
                  Colors.purple[600]!,
                ],
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    '📋 Report ย้อนหลัง 30 วัน',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    softWrap: true,
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${_insights.length} รายการ',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[50],
            child: Row(
              children: [
                Expanded(
                  child: _buildViewModeTab('แคมเปญ', 'campaigns'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildViewModeTab('ชุดโฆษณา', 'adsets'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildViewModeTab('โฆษณา', 'ads'),
                ),
              ],
            ),
          ),
          if (_insights.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.inbox, size: 64, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'ไม่มีข้อมูล',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: _insights.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final ad = _insights[index];
                final creative = _adCreatives[ad.adId];
                final thumbnailUrl =
                    creative?.thumbnailUrl ?? creative?.imageUrl;
                final costPerConnection = ad.getCostPerAction(
                  'onsite_conversion.total_messaging_connection',
                );
                final phoneLeadCount = _phoneLeads[ad.adId] ??
                    ad.phoneLeads ??
                    ad.totalMessagingConnection;

                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _showAdPreview(ad),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey[200]!),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (_viewMode == 'ads' && thumbnailUrl != null)
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(
                                    thumbnailUrl,
                                    width: 64,
                                    height: 64,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        width: 64,
                                        height: 64,
                                        color: Colors.grey[200],
                                        child: Icon(
                                          Icons.image,
                                          color: Colors.grey[400],
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              if (_viewMode == 'ads' && thumbnailUrl != null)
                                const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      ad.adName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      ad.campaignName,
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.grey[600],
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Icon(
                                Icons.chevron_right,
                                color: Colors.grey[400],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              _buildInsightStatChip(
                                icon: Icons.monetization_on_outlined,
                                label: 'ใช้ไป ${_formatCurrency(ad.spend)}',
                                background: Colors.blue[50]!,
                                iconColor: Colors.blue[700],
                              ),
                              _buildInsightStatChip(
                                icon: Icons.mail_outline,
                                label:
                                    'ตอบแล้ว ${_formatNumber(ad.messagingFirstReply)}',
                                background: Colors.green[50]!,
                                iconColor: Colors.green[700],
                              ),
                              _buildInsightStatChip(
                                icon: Icons.record_voice_over_outlined,
                                label:
                                    'Inbox ${_formatNumber(ad.totalMessagingConnection)}',
                                background: Colors.orange[50]!,
                                iconColor: Colors.orange[700],
                              ),
                              _buildInsightStatChip(
                                icon: Icons.call_outlined,
                                label: 'โทร ${_formatNumber(phoneLeadCount)}',
                                background: Colors.purple[50]!,
                                iconColor: Colors.purple[700],
                              ),
                              _buildInsightStatChip(
                                icon: Icons.price_change_outlined,
                                label:
                                    '฿/Lead ${_formatCurrency(costPerConnection)}',
                                background: Colors.indigo[50]!,
                                iconColor: Colors.indigo[700],
                              ),
                            ],
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

  Widget _buildViewModeTab(String label, String mode) {
    final isSelected = _viewMode == mode;
    return InkWell(
      onTap: () {
        setState(() {
          _viewMode = mode;
        });
        _loadAllData();
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue[100] : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Colors.blue[300]! : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              color: isSelected ? Colors.blue[700] : Colors.grey[700],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInsightStatChip({
    required IconData icon,
    required String label,
    required Color background,
    Color? iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: iconColor ?? Colors.black87),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              softWrap: false,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
