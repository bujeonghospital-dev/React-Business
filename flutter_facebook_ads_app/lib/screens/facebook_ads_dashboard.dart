import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/ad_insight.dart';

class FacebookAdsDashboard extends StatefulWidget {
  const FacebookAdsDashboard({super.key});

  @override
  State<FacebookAdsDashboard> createState() => _FacebookAdsDashboardState();
}

class _FacebookAdsDashboardState extends State<FacebookAdsDashboard>
    with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();

  bool _isLoading = true;
  String _dateRange = 'today';
  String _viewMode = 'ads'; // 'campaigns', 'adsets', 'ads'
  String _topAdsSortBy = 'leads'; // 'leads' or 'cost'

  List<AdInsight> _insights = [];
  int _googleSheetsCount = 0;
  int _googleAdsCount = 0;
  double _facebookBalance = 0;
  int _phoneCount = 0;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final results = await Future.wait([
        _apiService.fetchFacebookAds(
          level: _viewMode == 'campaigns'
              ? 'campaign'
              : _viewMode == 'adsets'
                  ? 'adset'
                  : 'ad',
          datePreset: _dateRange,
        ),
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
          SnackBar(content: Text('เกิดข้อผิดพลาด: $e')),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF1877F2),
        title: const Text(
          'Facebook Ads Manager',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
            tooltip: 'รีเฟรช',
          ),
        ],
      ),
      body: _isLoading
          ? _buildLoadingState()
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    _buildDateRangeTabs(),
                    _buildPerformanceCards(),
                    _buildTopAdsSection(),
                    _buildAdTable(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1877F2)),
          ),
          SizedBox(height: 16),
          Text(
            'กำลังโหลดข้อมูล...',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateRangeTabs() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildTab('วันนี้', 'today'),
            const SizedBox(width: 8),
            _buildTab('เมื่อวาน', 'yesterday'),
            const SizedBox(width: 8),
            _buildTab('7 วัน', 'last_7d'),
            const SizedBox(width: 8),
            _buildTab('14 วัน', 'last_14d'),
            const SizedBox(width: 8),
            _buildTab('30 วัน', 'last_30d'),
            const SizedBox(width: 8),
            _buildTab('เดือนนี้', 'this_month'),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String label, String value) {
    final isSelected = _dateRange == value;
    return GestureDetector(
      onTap: () {
        setState(() => _dateRange = value);
        _loadData();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [Color(0xFF1877F2), Color(0xFF5B51D8)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                )
              : null,
          color: isSelected ? null : Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF1877F2).withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildPerformanceCards() {
    return Container(
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  '💵 ใช้จ่ายรวม',
                  '฿${NumberFormat('#,##0.00').format(_totalSpend)}',
                  Icons.account_balance_wallet,
                  const Color(0xFFEF4444),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricCard(
                  'New Inbox',
                  _totalMessagingFirstReply.toString(),
                  Icons.mark_email_unread,
                  const Color(0xFF3B82F6),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  'Total Inbox',
                  _totalMessagingConnection.toString(),
                  Icons.all_inbox,
                  const Color(0xFF10B981),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricCard(
                  '💵 เงินคงเหลือ',
                  '฿${NumberFormat('#,##0.00').format(_facebookBalance)}',
                  Icons.account_balance,
                  const Color(0xFF8B5CF6),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildMetricCard(
            '📞 ชื่อ - เบอร์',
            _phoneCount.toString(),
            Icons.phone_android,
            const Color(0xFF14B8A6),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white,
            color.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color.withOpacity(0.8), color],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 22),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey[700],
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildTopAdsSection() {
    final topAds = _insights.take(5).toList();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🏆 TOP 5 Ads',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          ...topAds.asMap().entries.map((entry) {
            final index = entry.key;
            final ad = entry.value;
            return _buildTopAdItem(index + 1, ad);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildTopAdItem(int rank, AdInsight ad) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: rank <= 3 ? const Color(0xFF1877F2) : Colors.grey[400],
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '$rank',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ad.adName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${ad.messagingFirstReply} leads • ฿${NumberFormat('#,##0.00').format(ad.spend)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdTable() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1877F2), Color(0xFF5B51D8)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.assessment, color: Colors.white),
                const SizedBox(width: 8),
                const Text(
                  'รายงานโฆษณา',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Text(
                  '${_insights.length} รายการ',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _insights.length,
            itemBuilder: (context, index) {
              final ad = _insights[index];
              return _buildAdListItem(ad);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAdListItem(AdInsight ad) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey[200]!),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            ad.adName,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildStatChip(
                  '💬', ad.messagingFirstReply.toString(), Colors.blue),
              const SizedBox(width: 8),
              _buildStatChip('📊', ad.impressions.toString(), Colors.orange),
              const SizedBox(width: 8),
              _buildStatChip('💰', '฿${NumberFormat('#,##0').format(ad.spend)}',
                  Colors.green),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String icon, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
