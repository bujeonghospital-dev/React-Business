class Action {
  final String actionType;
  final String value;

  Action({
    required this.actionType,
    required this.value,
  });

  factory Action.fromJson(Map<String, dynamic> json) {
    return Action(
      actionType: json['action_type'] ?? '',
      value: json['value']?.toString() ?? '0',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'action_type': actionType,
      'value': value,
    };
  }
}

class AdCreative {
  final String id;
  final String? thumbnailUrl;
  final String? imageUrl;
  final String? videoId;
  final dynamic objectStorySpec;
  final String? effectiveObjectStoryId;

  AdCreative({
    required this.id,
    this.thumbnailUrl,
    this.imageUrl,
    this.videoId,
    this.objectStorySpec,
    this.effectiveObjectStoryId,
  });

  factory AdCreative.fromJson(Map<String, dynamic> json) {
    return AdCreative(
      id: json['id']?.toString() ?? '',
      thumbnailUrl: json['thumbnail_url'],
      imageUrl: json['image_url'],
      videoId: json['video_id'],
      objectStorySpec: json['object_story_spec'],
      effectiveObjectStoryId: json['effective_object_story_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'thumbnail_url': thumbnailUrl,
      'image_url': imageUrl,
      'video_id': videoId,
      'object_story_spec': objectStorySpec,
      'effective_object_story_id': effectiveObjectStoryId,
    };
  }
}

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
  final List<Action>? actions;
  final List<Action>? conversions;
  final List<Action>? costPerActionType;
  final AdCreative? creative;
  final int? phoneLeads;

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
    this.actions,
    this.conversions,
    this.costPerActionType,
    this.creative,
    this.phoneLeads,
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
      actions: json['actions'] != null
          ? (json['actions'] as List)
              .map((action) => Action.fromJson(action))
              .toList()
          : null,
      conversions: json['conversions'] != null
          ? (json['conversions'] as List)
              .map((conversion) => Action.fromJson(conversion))
              .toList()
          : null,
      costPerActionType: json['cost_per_action_type'] != null
          ? (json['cost_per_action_type'] as List)
              .map((cost) => Action.fromJson(cost))
              .toList()
          : null,
      creative: json['creative'] != null
          ? AdCreative.fromJson(json['creative'])
          : null,
      phoneLeads: json['phone_leads'],
    );
  }

  int getResultsByActionType(String actionType) {
    if (actions == null) return 0;
    final action = actions!.firstWhere(
      (a) => a.actionType == actionType,
      orElse: () => Action(actionType: '', value: '0'),
    );
    return int.tryParse(action.value) ?? 0;
  }

  double getCostPerAction(String actionType) {
    if (costPerActionType == null) return 0;
    final cost = costPerActionType!.firstWhere(
      (c) => c.actionType == actionType,
      orElse: () => Action(actionType: '', value: '0'),
    );
    return double.tryParse(cost.value) ?? 0;
  }
}

class DailySummary {
  final String date;
  final double totalSpend;
  final int newInbox;
  final int totalInbox;
  final int phoneLeads;

  DailySummary({
    required this.date,
    required this.totalSpend,
    required this.newInbox,
    required this.totalInbox,
    required this.phoneLeads,
  });

  factory DailySummary.fromJson(Map<String, dynamic> json) {
    return DailySummary(
      date: json['date'] ?? '',
      totalSpend: double.tryParse(json['total_spend']?.toString() ?? '0') ?? 0,
      newInbox: json['new_inbox'] ?? 0,
      totalInbox: json['total_inbox'] ?? 0,
      phoneLeads: json['phone_leads'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'total_spend': totalSpend,
      'new_inbox': newInbox,
      'total_inbox': totalInbox,
      'phone_leads': phoneLeads,
    };
  }
}
