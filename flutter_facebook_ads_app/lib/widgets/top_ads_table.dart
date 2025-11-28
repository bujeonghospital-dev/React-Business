import 'package:flutter/material.dart' hide Action;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../models/ad_insight.dart';

class TopAdsTable extends StatefulWidget {
  final List<AdInsight> insights;
  final Map<String, AdCreative> adCreatives;
  final Map<String, int> phoneLeads;
  final bool isCreativesLoading;
  final Function(AdInsight) onAdTap;

  const TopAdsTable({
    Key? key,
    required this.insights,
    required this.adCreatives,
    required this.phoneLeads,
    required this.isCreativesLoading,
    required this.onAdTap,
  }) : super(key: key);

  @override
  State<TopAdsTable> createState() => _TopAdsTableState();
}

class _TopAdsTableState extends State<TopAdsTable> {
  String _sortBy = 'leads'; // leads, phone, thruplay, cost
  int _limit = 20;

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'en_US').format(value)}';
  }

  String _formatNumber(int value) {
    return NumberFormat('#,##0', 'en_US').format(value);
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

  List<AdInsight> _getSortedTopAds() {
    final List<AdInsight> sortedAds = List.from(widget.insights);

    switch (_sortBy) {
      case 'leads':
        sortedAds.sort((a, b) =>
            b.totalMessagingConnection.compareTo(a.totalMessagingConnection));
        break;
      case 'phone':
        sortedAds.sort((a, b) {
          final aPhone = widget.phoneLeads[a.adId] ?? 0;
          final bPhone = widget.phoneLeads[b.adId] ?? 0;
          return bPhone.compareTo(aPhone);
        });
        break;
      case 'thruplay':
        sortedAds.sort((a, b) {
          final aThru = _getThruPlay(a);
          final bThru = _getThruPlay(b);
          return bThru.compareTo(aThru);
        });
        break;
      case 'cost':
        sortedAds.sort((a, b) {
          final aCost = a
              .getCostPerAction('onsite_conversion.total_messaging_connection');
          final bCost = b
              .getCostPerAction('onsite_conversion.total_messaging_connection');
          // Lower cost is better, so ascending order
          if (aCost == 0 && bCost == 0) return 0;
          if (aCost == 0) return 1;
          if (bCost == 0) return -1;
          return aCost.compareTo(bCost);
        });
        break;
    }

    return _limit == -1 ? sortedAds : sortedAds.take(_limit).toList();
  }

  @override
  Widget build(BuildContext context) {
    final topAds = _getSortedTopAds();
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    // Debug: Log creatives count
    debugPrint(
        '[TopAdsTable] Building with ${widget.adCreatives.length} creatives');
    debugPrint(
        '[TopAdsTable] isCreativesLoading: ${widget.isCreativesLoading}');
    debugPrint('[TopAdsTable] topAds count: ${topAds.length}');

    if (topAds.isEmpty) {
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
                'No TOP Ads data',
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
                        'TOP ${_limit == -1 ? "All" : _limit} Ads',
                        style: TextStyle(
                          fontSize: isMobile ? 16 : 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    // Orange Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFF97316), Color(0xFFEA580C)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'นักเตะยอดเยี่ยม',
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
                      _buildFilterButton('💰 เงินหมุน', 'cost', isMobile),
                      const SizedBox(width: 6),
                      _buildFilterButton('▶️ ThruPlay', 'thruplay', isMobile),
                      const SizedBox(width: 12),
                      // Limit Dropdown
                      _buildLimitDropdown(isMobile),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Loading Indicator
          if (widget.isCreativesLoading)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.blue[50],
              child: Row(
                children: [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.blue[700]!),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Loading images...',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.blue[700],
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
                    SizedBox(
                        width: isMobile ? 48 : 60,
                        child: _buildHeaderCell('Ad Image', 60, isMobile)),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('จ่ายเงิน', isMobile)),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('New Inbox', isMobile,
                            color: Colors.orange[700])),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('Total Inbox', isMobile,
                            color: Colors.blue[700])),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('ชื่อ-เบอร์', isMobile,
                            color: Colors.green[700])),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded('ThruPlay', isMobile)),
                    Expanded(
                        flex: 2,
                        child: _buildHeaderCellExpanded(
                            'เงินหมุน Inbox', isMobile)),
                  ],
                ),
              ),

              // Table Rows
              ...topAds.asMap().entries.map((entry) {
                final index = entry.key;
                final ad = entry.value;
                final creative = widget.adCreatives[ad.adId];
                final phoneLeadCount = widget.phoneLeads[ad.adId] ?? 0;
                final thumbnailUrl =
                    creative?.thumbnailUrl ?? creative?.imageUrl;
                final costPerConnection = ad.getCostPerAction(
                    'onsite_conversion.total_messaging_connection');
                final thruPlay = _getThruPlay(ad);

                // Debug logging for thumbnail URLs
                if (index < 5) {
                  debugPrint('[TopAdsTable] Row $index - adId: ${ad.adId}');
                  debugPrint(
                      '[TopAdsTable] Row $index - creative found: ${creative != null}');
                  if (creative != null) {
                    debugPrint(
                        '[TopAdsTable] Row $index - thumbnailUrl: ${creative.thumbnailUrl}');
                    debugPrint(
                        '[TopAdsTable] Row $index - imageUrl: ${creative.imageUrl}');
                  }
                  debugPrint(
                      '[TopAdsTable] Row $index - final thumbnailUrl: $thumbnailUrl');
                }

                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => widget.onAdTap(ad),
                    child: Container(
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
                          // Thumbnail
                          SizedBox(
                            width: isMobile ? 48 : 60,
                            child: Center(
                              child: _buildThumbnail(thumbnailUrl, isMobile),
                            ),
                          ),
                          // Spent
                          Expanded(
                            flex: 2,
                            child: Text(
                              _formatCurrency(ad.spend),
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
                              '${ad.messagingFirstReply}',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: isMobile ? 12 : 13,
                                color: Colors.orange[700],
                              ),
                            ),
                          ),
                          // Total Inbox
                          Expanded(
                            flex: 2,
                            child: Text(
                              '${ad.totalMessagingConnection}',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: isMobile ? 12 : 13,
                                color: Colors.blue[700],
                              ),
                            ),
                          ),
                          // Phone Leads (ชื่อ-เบอร์)
                          Expanded(
                            flex: 2,
                            child: Text(
                              '$phoneLeadCount',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: isMobile ? 12 : 13,
                                color: Colors.green[700],
                              ),
                            ),
                          ),
                          // ThruPlay
                          Expanded(
                            flex: 2,
                            child: Text(
                              _formatNumber(thruPlay),
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                fontSize: isMobile ? 12 : 13,
                                color: Colors.grey[700],
                              ),
                            ),
                          ),
                          // Cost per Inbox
                          Expanded(
                            flex: 2,
                            child: Text(
                              costPerConnection > 0
                                  ? _formatCurrency(costPerConnection)
                                  : '—',
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
                    ),
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

  Widget _buildThumbnail(String? thumbnailUrl, bool isMobile) {
    final size = isMobile ? 40.0 : 48.0;

    // Check if URL is valid and not empty
    final validUrl = thumbnailUrl != null &&
        thumbnailUrl.isNotEmpty &&
        (thumbnailUrl.startsWith('http://') ||
            thumbnailUrl.startsWith('https://'));

    // Nice placeholder widget for when no image is available
    Widget buildPlaceholder({bool isError = false}) {
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isError
                ? [Colors.orange[100]!, Colors.orange[200]!]
                : [Colors.blue[50]!, Colors.blue[100]!],
          ),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Center(
          child: Icon(
            isError ? Icons.image_not_supported_outlined : Icons.campaign,
            size: size * 0.5,
            color: isError ? Colors.orange[400] : Colors.blue[400],
          ),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(6),
      child: validUrl
          ? CachedNetworkImage(
              imageUrl: thumbnailUrl,
              width: size,
              height: size,
              fit: BoxFit.cover,
              httpHeaders: const {
                'Accept': 'image/*',
                'User-Agent': 'Flutter App',
              },
              placeholder: (context, url) => Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child:
                    Container(width: size, height: size, color: Colors.white),
              ),
              errorWidget: (context, url, error) {
                return buildPlaceholder(isError: true);
              },
            )
          : buildPlaceholder(),
    );
  }
}
