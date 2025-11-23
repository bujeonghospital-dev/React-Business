import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../models/ad_insight.dart';

class TopAdsSection extends StatelessWidget {
  final List<AdInsight> insights;
  final Map<String, AdCreative> adCreatives;
  final Map<String, int> phoneLeads;
  final String sortBy;
  final bool isCreativesLoading;
  final Function(String) onSortChanged;
  final Function(AdInsight) onAdTap;

  const TopAdsSection({
    Key? key,
    required this.insights,
    required this.adCreatives,
    required this.phoneLeads,
    required this.sortBy,
    required this.isCreativesLoading,
    required this.onSortChanged,
    required this.onAdTap,
  }) : super(key: key);

  String _formatCurrency(double value) {
    return '฿${NumberFormat('#,##0.00', 'th_TH').format(value)}';
  }

  String _formatNumber(int value) {
    return NumberFormat('#,##0', 'th_TH').format(value);
  }

  List<AdInsight> _getSortedTopAds() {
    final List<AdInsight> sortedAds = List.from(insights);

    if (sortBy == 'leads') {
      sortedAds.sort((a, b) =>
          b.totalMessagingConnection.compareTo(a.totalMessagingConnection));
    } else {
      sortedAds.sort((a, b) {
        final aCost =
            a.getCostPerAction('onsite_conversion.total_messaging_connection');
        final bCost =
            b.getCostPerAction('onsite_conversion.total_messaging_connection');
        return aCost.compareTo(bCost);
      });
    }

    return sortedAds.take(20).toList();
  }

  @override
  Widget build(BuildContext context) {
    final topAds = _getSortedTopAds();

    if (topAds.isEmpty) {
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
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.emoji_events, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'ไม่มีข้อมูล TOP Ads',
                style: TextStyle(
                  fontSize: 18,
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
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.purple[600]!, Colors.pink[600]!],
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        '🏆 TOP 20 Ads',
                        style: TextStyle(
                          fontSize: 22,
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
                        '${topAds.length} โฆษณา',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Sort Buttons
                Row(
                  children: [
                    Expanded(
                      child: _buildSortButton(
                        context,
                        '💬 Total Inbox',
                        'leads',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildSortButton(
                        context,
                        '💰 ต้นทุน',
                        'cost',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Loading Indicator
          if (isCreativesLoading)
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.blue[50],
              child: Row(
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.blue[700]!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'กำลังโหลดรูปภาพโฆษณา...',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.blue,
                    ),
                  ),
                ],
              ),
            ),

          // Ads List
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            itemCount: topAds.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final ad = topAds[index];
              final creative = adCreatives[ad.adId];
              final phoneLeadCount = phoneLeads[ad.adId] ?? 0;
              final rank = index + 1;

              return _buildAdCard(
                context,
                ad,
                creative,
                phoneLeadCount,
                rank,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSortButton(BuildContext context, String label, String value) {
    final isSelected = sortBy == value;
    return ElevatedButton(
      onPressed: () => onSortChanged(value),
      style: ElevatedButton.styleFrom(
        backgroundColor:
            isSelected ? Colors.white : Colors.white.withOpacity(0.2),
        foregroundColor: isSelected ? Colors.purple[700] : Colors.white,
        elevation: isSelected ? 4 : 0,
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 13,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildAdCard(
    BuildContext context,
    AdInsight ad,
    AdCreative? creative,
    int phoneLeadCount,
    int rank,
  ) {
    final thumbnailUrl = creative?.thumbnailUrl ?? creative?.imageUrl;
    final costPerConnection =
        ad.getCostPerAction('onsite_conversion.total_messaging_connection');

    return InkWell(
      onTap: () => onAdTap(ad),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: rank <= 3 ? Colors.amber[400]! : Colors.grey[200]!,
            width: rank <= 3 ? 2 : 1,
          ),
          boxShadow: [
            if (rank <= 3)
              BoxShadow(
                color: Colors.amber.withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 78,
                height: 78,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Positioned.fill(
                      child: _buildThumbnail(thumbnailUrl),
                    ),
                    Positioned(
                      top: -6,
                      left: -6,
                      child: _buildRankBadge(rank),
                    ),
                  ],
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
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      ad.campaignName,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _buildStatChip(
                          icon: Icons.monetization_on_outlined,
                          label: _formatCurrency(ad.spend),
                          background: Colors.blue[50]!,
                          iconColor: Colors.blue[700],
                        ),
                        _buildStatChip(
                          icon: Icons.chat_bubble_outline,
                          label: _formatNumber(ad.messagingFirstReply),
                          background: Colors.green[50]!,
                          iconColor: Colors.green[700],
                        ),
                        _buildStatChip(
                          icon: Icons.call_outlined,
                          label: _formatNumber(phoneLeadCount),
                          background: Colors.purple[50]!,
                          iconColor: Colors.purple[700],
                        ),
                        _buildStatChip(
                          icon: Icons.price_change_outlined,
                          label: '฿/Lead ${_formatCurrency(costPerConnection)}',
                          background: Colors.orange[50]!,
                          iconColor: Colors.orange[700],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRankBadge(int rank) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: rank == 1
              ? [Colors.amber[400]!, Colors.amber[600]!]
              : rank == 2
                  ? [Colors.grey[300]!, Colors.grey[400]!]
                  : rank == 3
                      ? [Colors.orange[300]!, Colors.orange[400]!]
                      : [Colors.blue[300]!, Colors.blue[400]!],
        ),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          '#$rank',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildThumbnail(String? thumbnailUrl) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: thumbnailUrl != null
          ? CachedNetworkImage(
              imageUrl: thumbnailUrl,
              width: 72,
              height: 72,
              fit: BoxFit.cover,
              placeholder: (context, url) => Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Container(
                  width: 72,
                  height: 72,
                  color: Colors.white,
                ),
              ),
              errorWidget: (context, url, error) => Container(
                width: 72,
                height: 72,
                color: Colors.grey[200],
                child: Icon(
                  Icons.image,
                  size: 28,
                  color: Colors.grey[400],
                ),
              ),
            )
          : Container(
              width: 72,
              height: 72,
              color: const Color(0xffF2F2F2),
              child: const Icon(
                Icons.image_outlined,
                size: 30,
                color: Colors.grey,
              ),
            ),
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    required Color background,
    Color? iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: iconColor ?? Colors.black87),
          const SizedBox(width: 4),
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
