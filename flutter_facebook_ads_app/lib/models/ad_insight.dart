class AdInsight {
  final String adId;
  final String adName;
  final String adsetId;
  final String adsetName;
  final String campaignId;
  final String campaignName;
  final double spend;
  final int impressions;
  final int clicks;
  final double ctr;
  final double cpc;
  final double cpm;
  final int leads;
  final int messagingFirstReply;
  final int totalMessagingConnection;
  final String dateStart;
  final String dateStop;
  final int? reach;
  final double? frequency;

  AdInsight({
    required this.adId,
    required this.adName,
    required this.adsetId,
    required this.adsetName,
    required this.campaignId,
    required this.campaignName,
    required this.spend,
    required this.impressions,
    required this.clicks,
    required this.ctr,
    required this.cpc,
    required this.cpm,
    required this.leads,
    required this.messagingFirstReply,
    required this.totalMessagingConnection,
    required this.dateStart,
    required this.dateStop,
    this.reach,
    this.frequency,
  });

  factory AdInsight.fromJson(Map<String, dynamic> json) {
    // Helper function to parse actions
    int getActionValue(List<dynamic>? actions, String actionType) {
      if (actions == null) return 0;
      try {
        final action = actions.firstWhere(
          (a) => a['action_type'] == actionType,
          orElse: () => {'value': '0'},
        );
        return int.tryParse(action['value'].toString()) ?? 0;
      } catch (e) {
        return 0;
      }
    }

    return AdInsight(
      adId: json['ad_id'] ?? '',
      adName: json['ad_name'] ?? '',
      adsetId: json['adset_id'] ?? '',
      adsetName: json['adset_name'] ?? '',
      campaignId: json['campaign_id'] ?? '',
      campaignName: json['campaign_name'] ?? '',
      spend: double.tryParse(json['spend']?.toString() ?? '0') ?? 0,
      impressions: int.tryParse(json['impressions']?.toString() ?? '0') ?? 0,
      clicks: int.tryParse(json['clicks']?.toString() ?? '0') ?? 0,
      ctr: double.tryParse(json['ctr']?.toString() ?? '0') ?? 0,
      cpc: double.tryParse(json['cpc']?.toString() ?? '0') ?? 0,
      cpm: double.tryParse(json['cpm']?.toString() ?? '0') ?? 0,
      leads: getActionValue(json['actions'], 'lead'),
      messagingFirstReply: getActionValue(
          json['actions'], 'onsite_conversion.messaging_first_reply'),
      totalMessagingConnection: getActionValue(
          json['actions'], 'onsite_conversion.total_messaging_connection'),
      dateStart: json['date_start'] ?? '',
      dateStop: json['date_stop'] ?? '',
      reach: int.tryParse(json['reach']?.toString() ?? '0'),
      frequency: double.tryParse(json['frequency']?.toString() ?? '0'),
    );
  }
}
