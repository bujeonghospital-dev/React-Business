import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/ad_insight.dart';

class FacebookAdsDashboard extends StatefulWidget {
  const FacebookAdsDashboard({super.key});

  @override
  State<FacebookAdsDashboard> createState() => _FacebookAdsDashboardState();
}

class _FacebookAdsDashboardState extends State<FacebookAdsDashboard> {
  final ApiService _apiService = ApiService();
  final ScrollController _scrollController = ScrollController();

  bool _isLoading = true;
  String _dateRange = 'today';
  String _topAdsSortBy = 'leads';

  List<AdInsight> _insights = [];
  int _googleSheetsCount = 0;
  int _googleAdsCount = 0;
  double _facebookBalance = 0;
  int _phoneCount = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final results = await Future.wait([
        _apiService.fetchFacebookAds(level: 'ad', datePreset: _dateRange),
        _apiService.fetchGoogleSheetsData(datePreset: _dateRange),
        _apiService.fetchGoogleAdsData(),
        _apiService.fetchFacebookBalance(),
        _apiService.fetchPhoneCount(),
      ]);

      setState(() {
        _insights = results[0] as List<AdInsight>;
        _googleSheetsCount = results[1] as int;
        _googleAdsCount = results[2] as int;
        _facebookBalance = results[3] as double;
        _phoneCount = results[4] as int;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('เกิดข้อผิดพลาด: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  int get _totalMessagingFirstReply {
    return _insights.fold(0, (sum, ad) => sum + ad.messagingFirstReply);
  }

  int get _totalMessagingConnection {
    return _insights.fold(0, (sum, ad) => sum + ad.totalMessagingConnection);
  }

  double get _totalSpend {
    return _insights.fold(0.0, (sum, ad) => sum + ad.spend);
  }

  List<AdInsight> get _topAds {
    final sorted = List<AdInsight>.from(_insights);
    if (_topAdsSortBy == 'leads') {
      sorted.sort(
          (a, b) => b.messagingFirstReply.compareTo(a.messagingFirstReply));
    } else {
      sorted.sort((a, b) => b.spend.compareTo(a.spend));
    }
    return sorted.take(10).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: _isLoading ? _buildLoadingState() : _buildContent(),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(
              strokeWidth: 5,
              valueColor: AlwaysStoppedAnimation<Color>(
                Color(0xFF1877F2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'กำลังโหลดข้อมูล...',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 18,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'โปรดรอสักครู่',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(0xFF1877F2),
      child: CustomScrollView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // Date Range Tabs
          _buildDateRangeTabs(),

          // Performance Cards + TOP Ads Grid
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Column: Performance Cards (50%)
                  Expanded(
                    flex: 1,
                    child: _buildPerformanceCards(),
                  ),
                  const SizedBox(width: 12),
                  // Right Column: TOP Ads (50%)
                  Expanded(
                    flex: 1,
                    child: _buildTopAdsSection(),
                  ),
                ],
              ),
            ),
          ),

          // Report Ad Table
          _buildAdTable(),
        ],
      ),
    );
  }

  Widget _buildDateRangeTabs() {
    return SliverAppBar(
      floating: true,
      snap: true,
      elevation: 0,
      backgroundColor: Colors.white,
      toolbarHeight: 70,
      flexibleSpace: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                _buildTabChip('📊', '📊 ช่องควบคุม', 'control', isLabel: true),
                const SizedBox(width: 8),
                _buildTabChip('📅', 'วันนี้', 'today'),
                const SizedBox(width: 8),
                _buildTabChip('🕐', 'เมื่อวาน', 'yesterday'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildTabChip('📆', '7 วัน', 'last_7d'),
                const SizedBox(width: 8),
                _buildTabChip('📆', '14 วัน', 'last_14d'),
                const SizedBox(width: 8),
                _buildTabChip('📆', '30 วัน', 'last_30d'),
                const SizedBox(width: 8),
                _buildTabChip('📆', 'เดือนนี้', 'this_month'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabChip(String icon, String label, String value,
      {bool isLabel = false}) {
    final isSelected = _dateRange == value && !isLabel;
    return GestureDetector(
      onTap: isLabel
          ? null
          : () {
              setState(() => _dateRange = value);
              _loadData();
            },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isLabel
              ? Colors.grey[100]
              : isSelected
                  ? const Color(0xFF3B82F6)
                  : Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!isLabel) Text(icon, style: const TextStyle(fontSize: 14)),
            if (!isLabel) const SizedBox(width: 4),
            Text(
              isLabel ? label : label.replaceAll('$icon ', ''),
              style: TextStyle(
                color: isLabel
                    ? Colors.grey[700]
                    : isSelected
                        ? Colors.white
                        : Colors.black87,
                fontWeight:
                    isSelected || isLabel ? FontWeight.w600 : FontWeight.normal,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformanceCards() {
    return Column(
      children: [
        _buildMetricCard(
          'Facebook Leads',
          _totalMessagingFirstReply.toString(),
          '💬',
          const Color(0xFF3B82F6),
        ),
        const SizedBox(height: 12),
        _buildMetricCard(
          'Total Connection',
          _totalMessagingConnection.toString(),
          '📊',
          const Color(0xFF10B981),
        ),
        const SizedBox(height: 12),
        _buildMetricCard(
          'Google Sheets',
          _googleSheetsCount.toString(),
          '📄',
          const Color(0xFFF59E0B),
        ),
        const SizedBox(height: 12),
        _buildMetricCard(
          'Google Ads',
          _googleAdsCount.toString(),
          '📢',
          const Color(0xFFEF4444),
        ),
        const SizedBox(height: 12),
        _buildMetricCard(
          'FB Balance',
          '฿${NumberFormat('#,##0.00').format(_facebookBalance)}',
          '💰',
          const Color(0xFF8B5CF6),
        ),
        const SizedBox(height: 12),
        _buildMetricCard(
          'Phone Leads',
          _phoneCount.toString(),
          '📞',
          const Color(0xFF14B8A6),
        ),
      ],
    );
  }

  Widget _buildMetricCard(
      String label, String value, String emoji, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(emoji, style: const TextStyle(fontSize: 24)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopAdsSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                '🏆 TOP 10 Ads',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const Spacer(),
              _buildSortButton(),
            ],
          ),
          const SizedBox(height: 20),
          ..._topAds.asMap().entries.map((entry) {
            final index = entry.key;
            final ad = entry.value;
            return _buildTopAdItem(index + 1, ad);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildSortButton() {
    return PopupMenuButton<String>(
      initialValue: _topAdsSortBy,
      onSelected: (value) {
        setState(() => _topAdsSortBy = value);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              _topAdsSortBy == 'leads' ? 'Leads' : 'Cost',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down, size: 18),
          ],
        ),
      ),
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: 'leads',
          child: Text('เรียงตาม Leads'),
        ),
        const PopupMenuItem(
          value: 'cost',
          child: Text('เรียงตามค่าใช้จ่าย'),
        ),
      ],
    );
  }

  Widget _buildTopAdItem(int rank, AdInsight ad) {
    final bool isTopThree = rank <= 3;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: isTopThree
            ? LinearGradient(
                colors: [
                  const Color(0xFF3B82F6).withOpacity(0.1),
                  const Color(0xFF8B5CF6).withOpacity(0.1),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isTopThree ? null : Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isTopThree
              ? const Color(0xFF3B82F6).withOpacity(0.3)
              : Colors.grey[200]!,
          width: 1.5,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: isTopThree
                  ? const LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
              color: isTopThree ? null : Colors.grey[400],
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '$rank',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ad.adName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    _buildStatBadge(
                      '💬',
                      ad.messagingFirstReply.toString(),
                      Colors.blue,
                    ),
                    const SizedBox(width: 6),
                    _buildStatBadge(
                      '💰',
                      '฿${NumberFormat('#,##0').format(ad.spend)}',
                      Colors.green,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatBadge(String icon, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 11)),
          const SizedBox(width: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: color.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdTable() {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
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
            // Header with Gradient
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.assessment_outlined,
                      color: Colors.white, size: 28),
                  const SizedBox(width: 12),
                  const Text(
                    'รายงานโฆษณา',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${_insights.length} รายการ',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Table Content
            if (_insights.isEmpty)
              Padding(
                padding: const EdgeInsets.all(48),
                child: Column(
                  children: [
                    Icon(Icons.inbox_outlined,
                        size: 64, color: Colors.grey[300]),
                    const SizedBox(height: 16),
                    Text(
                      'ไม่มีข้อมูลโฆษณา',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _insights.length,
                itemBuilder: (context, index) {
                  final ad = _insights[index];
                  return _buildAdListItem(ad, index);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdListItem(AdInsight ad, int index) {
    final isEven = index % 2 == 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: isEven ? Colors.grey[50] : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[200]!,
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ad Name
          Text(
            ad.adName,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 10),

          // Stats Row
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildStatChip('💬 Leads', ad.messagingFirstReply.toString(),
                  const Color(0xFF3B82F6)),
              _buildStatChip(
                  '📊 Impressions',
                  NumberFormat('#,##0').format(ad.impressions),
                  const Color(0xFFF59E0B)),
              _buildStatChip(
                  '👆 Clicks', ad.clicks.toString(), const Color(0xFF8B5CF6)),
              _buildStatChip(
                  '💰 Cost',
                  '฿${NumberFormat('#,##0.00').format(ad.spend)}',
                  const Color(0xFF10B981)),
              _buildStatChip('📈 CTR', '${ad.ctr.toStringAsFixed(2)}%',
                  const Color(0xFFEC4899)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
