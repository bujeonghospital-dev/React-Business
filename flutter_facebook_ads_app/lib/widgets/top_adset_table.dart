import 'package:flutter/material.dart' hide Action;
import 'package:intl/intl.dart';
import '../models/ad_insight.dart';

class TopAdSetTable extends StatefulWidget {
  final List<AdInsight> insights;
  final Map<String, int> phoneLeads;

  const TopAdSetTable({
    Key? key,
    required this.insights,
    required this.phoneLeads,
  }) : super(key: key);

  @override
  State<TopAdSetTable> createState() => _TopAdSetTableState();
}

class _TopAdSetTableState extends State<TopAdSetTable> {
  String _sortBy = 'leads'; // leads, phone, thruplay
  int _limit = 20;
  // Empty set means show ALL data (no filter active)
  Set<String> _campaignFilter = {}; // TOF, MOF, BOF - empty = show all

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'en_US').format(value)}';
  }

  String _formatNumber(int value) {
    return NumberFormat('#,##0', 'en_US').format(value);
  }

  // Determine campaign type from campaign name
  String _getCampaignType(String campaignName) {
    final lowerName = campaignName.toLowerCase();
    if (lowerName.contains('tof') || lowerName.contains('top of')) {
      return 'TOF';
    } else if (lowerName.contains('mof') || lowerName.contains('middle of')) {
      return 'MOF';
    } else if (lowerName.contains('bof') || lowerName.contains('bottom of')) {
      return 'BOF';
    }
    return 'MOF'; // Default
  }

  int _getThruPlay(AdInsight ad) {
    if (ad.actions == null) return 0;
    try {
      final action = ad.actions!.firstWhere(
        (a) => a.actionType == 'video_view' || a.actionType == 'thruplay',
        orElse: () => Action(actionType: '', value: '0'),
      );
      return int.tryParse(action.value) ?? 0;
    } catch (e) {
      return 0;
    }
  }

  // Aggregate data by adset
  List<Map<String, dynamic>> _getAggregatedAdSets() {
    // Group ads by adset_id
    final Map<String, Map<String, dynamic>> adSetMap = {};

    for (var ad in widget.insights) {
      final campaignType = _getCampaignType(ad.campaignName);

      // Apply campaign filter - if empty, show all; otherwise filter by selected types
      if (_campaignFilter.isNotEmpty && !_campaignFilter.contains(campaignType))
        continue;

      if (!adSetMap.containsKey(ad.adsetId)) {
        adSetMap[ad.adsetId] = {
          'adsetId': ad.adsetId,
          'adsetName': ad.adsetName,
          'campaignName': ad.campaignName,
          'campaignType': campaignType,
          'spend': 0.0,
          'newInbox': 0,
          'totalInbox': 0,
          'phoneLeads': 0,
          'thruPlay': 0,
        };
      }

      adSetMap[ad.adsetId]!['spend'] =
          (adSetMap[ad.adsetId]!['spend'] as double) + ad.spend;
      adSetMap[ad.adsetId]!['newInbox'] =
          (adSetMap[ad.adsetId]!['newInbox'] as int) + ad.messagingFirstReply;
      adSetMap[ad.adsetId]!['totalInbox'] =
          (adSetMap[ad.adsetId]!['totalInbox'] as int) +
              ad.totalMessagingConnection;
      adSetMap[ad.adsetId]!['phoneLeads'] =
          (adSetMap[ad.adsetId]!['phoneLeads'] as int) +
              (widget.phoneLeads[ad.adId] ?? 0);
      adSetMap[ad.adsetId]!['thruPlay'] =
          (adSetMap[ad.adsetId]!['thruPlay'] as int) + _getThruPlay(ad);
    }

    final adSets = adSetMap.values.toList();

    // Sort based on selected criteria
    switch (_sortBy) {
      case 'leads':
        adSets.sort((a, b) =>
            (b['totalInbox'] as int).compareTo(a['totalInbox'] as int));
        break;
      case 'phone':
        adSets.sort((a, b) =>
            (b['phoneLeads'] as int).compareTo(a['phoneLeads'] as int));
        break;
      case 'thruplay':
        adSets.sort(
            (a, b) => (b['thruPlay'] as int).compareTo(a['thruPlay'] as int));
        break;
    }

    return _limit == -1 ? adSets : adSets.take(_limit).toList();
  }

  @override
  Widget build(BuildContext context) {
    final adSets = _getAggregatedAdSets();
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    if (adSets.isEmpty) {
      return Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.emoji_events, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No Ad Set data',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
          // Header with Blue Gradient
          Container(
            padding: EdgeInsets.all(isMobile ? 12 : 16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  Color(0xFF2563EB), // blue-600
                  Color(0xFF1D4ED8), // blue-700
                ],
              ),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Column(
              children: [
                // Title Row
                Row(
                  children: [
                    Text(
                      '🏆',
                      style: TextStyle(fontSize: isMobile ? 20 : 24),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'TOP ${_limit == -1 ? "All" : _limit} Ad Set',
                        style: TextStyle(
                          fontSize: isMobile ? 16 : 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    // Green Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF22C55E), Color(0xFF16A34A)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'พื้นที่ลูกค้ายอดเยี่ยม',
                        style: TextStyle(
                          fontSize: isMobile ? 10 : 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Filter Buttons Row
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterButton('💬 Total Inbox', 'leads', isMobile),
                      const SizedBox(width: 6),
                      _buildFilterButton('📞 ชื่อ-เบอร์', 'phone', isMobile),
                      const SizedBox(width: 6),
                      _buildFilterButton('▶️ ThruPlay', 'thruplay', isMobile),
                      const SizedBox(width: 12),
                      // Funnel Stage Tabs
                      _buildFunnelTab('TOF', Colors.blue, isMobile),
                      const SizedBox(width: 4),
                      _buildFunnelTab('MOF', Colors.orange, isMobile),
                      const SizedBox(width: 4),
                      _buildFunnelTab('BOF', Colors.red, isMobile),
                      const SizedBox(width: 12),
                      // Limit Dropdown
                      _buildLimitDropdown(isMobile),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Table with full width
          Column(
            children: [
              // Table Header
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(
                  horizontal: isMobile ? 8 : 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
                child: Row(
                  children: [
                    SizedBox(
                        width: 32, child: _buildHeaderCell('#', 32, isMobile)),
                    Expanded(
                        flex: 3,
                        child: _buildHeaderCellExpanded('Ad Set', isMobile)),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('จ่ายเงิน', isMobile)),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('New Inbox', isMobile,
                            color: Colors.blue[700])),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('Total Inbox', isMobile,
                            color: Colors.green[700])),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('ชื่อ-เบอร์', isMobile,
                            color: Colors.orange[700])),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('ThruPlay', isMobile)),
                  ],
                ),
              ),

              // Table Rows
              ...adSets.asMap().entries.map((entry) {
                final index = entry.key;
                final adSet = entry.value;

                return Container(
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 8 : 12,
                    vertical: isMobile ? 8 : 10,
                  ),
                  decoration: BoxDecoration(
                    color: index % 2 == 0 ? Colors.white : Colors.grey[50],
                    border: Border(
                      bottom: BorderSide(color: Colors.grey[200]!),
                    ),
                  ),
                  child: Row(
                    children: [
                      // Rank
                      SizedBox(
                        width: 32,
                        child: Text(
                          '${index + 1}',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: isMobile ? 13 : 14,
                            color: Colors.grey[700],
                          ),
                        ),
                      ),
                      // Ad Set Name
                      Expanded(
                        flex: 3,
                        child: Text(
                          adSet['adsetName'] ?? '',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontWeight: FontWeight.w500,
                            fontSize: isMobile ? 11 : 12,
                            color: Colors.grey[800],
                          ),
                        ),
                      ),
                      // Spent
                      Expanded(
                        flex: 2,
                        child: Text(
                          _formatCurrency(adSet['spend'] as double),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: isMobile ? 12 : 13,
                            color: Colors.grey[800],
                          ),
                        ),
                      ),
                      // New Inbox
                      Expanded(
                        flex: 2,
                        child: Text(
                          '${adSet['newInbox']}',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: isMobile ? 12 : 13,
                            color: Colors.blue[700],
                          ),
                        ),
                      ),
                      // Total Inbox
                      Expanded(
                        flex: 2,
                        child: Text(
                          '${adSet['totalInbox']}',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: isMobile ? 12 : 13,
                            color: Colors.green[700],
                          ),
                        ),
                      ),
                      // Phone Leads (ชื่อ-เบอร์)
                      Expanded(
                        flex: 2,
                        child: Text(
                          '${adSet['phoneLeads']}',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: isMobile ? 12 : 13,
                            color: Colors.orange[700],
                          ),
                        ),
                      ),
                      // ThruPlay
                      Expanded(
                        flex: 2,
                        child: Text(
                          _formatNumber(adSet['thruPlay'] as int),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.w500,
                            fontSize: isMobile ? 12 : 13,
                            color: Colors.grey[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderCell(String text, double width, bool isMobile,
      {Color? color}) {
    return SizedBox(
      width: width,
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: isMobile ? 11 : 12,
          color: color ?? Colors.grey[700],
        ),
      ),
    );
  }

  Widget _buildHeaderCellExpanded(String text, bool isMobile, {Color? color}) {
    return Text(
      text,
      textAlign: TextAlign.center,
      style: TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: isMobile ? 11 : 12,
        color: color ?? Colors.grey[700],
      ),
    );
  }

  Widget _buildFilterButton(String label, String value, bool isMobile) {
    final isSelected = _sortBy == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _sortBy = value;
        });
      },
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 8 : 12,
          vertical: isMobile ? 6 : 8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(8),
          border: isSelected
              ? Border.all(color: Colors.blue[300]!, width: 1)
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: isMobile ? 10 : 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.blue[700] : Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildFunnelTab(String label, Color color, bool isMobile) {
    final isSelected = _campaignFilter.contains(label);
    // Determine the specific color for each funnel stage
    final Color activeColor;
    final Color inactiveColor;
    final Color inactiveBorderColor;

    switch (label) {
      case 'TOF':
        activeColor = Colors.blue[600]!;
        inactiveColor = Colors.blue[100]!;
        inactiveBorderColor = Colors.blue[300]!;
        break;
      case 'MOF':
        activeColor = Colors.orange[600]!;
        inactiveColor = Colors.orange[100]!;
        inactiveBorderColor = Colors.orange[300]!;
        break;
      case 'BOF':
        activeColor = Colors.red[600]!;
        inactiveColor = Colors.red[100]!;
        inactiveBorderColor = Colors.red[300]!;
        break;
      default:
        activeColor = color;
        inactiveColor = Colors.white.withOpacity(0.3);
        inactiveBorderColor = Colors.white.withOpacity(0.5);
    }

    return GestureDetector(
      onTap: () {
        setState(() {
          if (isSelected) {
            // Toggle off - remove from filter
            _campaignFilter.remove(label);
          } else {
            // Toggle on - add to filter
            _campaignFilter.add(label);
          }
        });
      },
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 10 : 14,
          vertical: isMobile ? 6 : 8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : inactiveColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? activeColor : inactiveBorderColor,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: activeColor.withOpacity(0.4),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: isMobile ? 10 : 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : inactiveBorderColor,
          ),
        ),
      ),
    );
  }

  Widget _buildLimitDropdown(bool isMobile) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: _limit,
          dropdownColor: Colors.amber[50],
          icon:
              const Icon(Icons.arrow_drop_down, color: Colors.white, size: 20),
          style: TextStyle(
            fontSize: isMobile ? 11 : 12,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
          items: const [
            DropdownMenuItem(value: 5, child: Text('Top 5')),
            DropdownMenuItem(value: 10, child: Text('Top 10')),
            DropdownMenuItem(value: 15, child: Text('Top 15')),
            DropdownMenuItem(value: 20, child: Text('Top 20')),
            DropdownMenuItem(value: 30, child: Text('Top 30')),
            DropdownMenuItem(value: -1, child: Text('All')),
          ],
          onChanged: (value) {
            if (value != null) {
              setState(() {
                _limit = value;
              });
            }
          },
        ),
      ),
    );
  }
}
