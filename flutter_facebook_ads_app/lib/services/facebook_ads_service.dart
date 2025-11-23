import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/ad_insight.dart';

class FacebookAdsService {
  static const String baseUrl =
      'https://believable-ambition-production.up.railway.app/api';

  // Next.js API URL (production)
  static const String nextApiUrl =
      'https://tpp-thanakon.store/api'; // Fetch Facebook Ads Insights
  Future<List<AdInsight>> fetchInsights({
    required String level, // 'campaign', 'adset', or 'ad'
    String datePreset = 'today',
    String? timeSince,
    String? timeUntil,
    int retryCount = 0,
  }) async {
    try {
      String url = '$baseUrl/facebook-ads-campaigns?level=$level';

      // Add filtering for messaging actions
      final filtering = jsonEncode([
        {
          'field': 'action_type',
          'operator': 'IN',
          'value': [
            'onsite_conversion.messaging_first_reply',
            'onsite_conversion.total_messaging_connection',
          ],
        },
      ]);
      url += '&filtering=${Uri.encodeComponent(filtering)}';
      url += '&action_breakdowns=action_type';

      // Add date range
      if (timeSince != null && timeUntil != null) {
        final timeRange = jsonEncode({'since': timeSince, 'until': timeUntil});
        url += '&time_range=${Uri.encodeComponent(timeRange)}';
      } else {
        url += '&date_preset=$datePreset';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 403 &&
          response.body.contains('Application request limit reached')) {
        // Rate limit - retry with exponential backoff
        if (retryCount < 3) {
          final retryDelay = Duration(seconds: 30 * (1 << retryCount));
          await Future.delayed(retryDelay);
          return fetchInsights(
            level: level,
            datePreset: datePreset,
            timeSince: timeSince,
            timeUntil: timeUntil,
            retryCount: retryCount + 1,
          );
        }
        throw Exception('API Rate Limit exceeded');
      }

      if (response.statusCode != 200) {
        throw Exception('Failed to load insights: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      if (data['success'] != true) {
        throw Exception(data['error'] ?? 'Unknown error');
      }

      final List<dynamic> insightsData = data['data'] ?? [];
      final insights = insightsData
          .map((json) => AdInsight.fromJson(json))
          .toList();

      return insights;
    } catch (e) {
      throw Exception('Error fetching insights: $e');
    }
  }

  // Fetch Ad Creative
  Future<AdCreative?> fetchAdCreative(String adId) async {
    try {
      final url = '$baseUrl/facebook-ads-creative?ad_id=$adId';
      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        return null;
      }

      final data = jsonDecode(response.body);
      if (data['success'] != true) {
        return null;
      }

      return AdCreative.fromJson(data['data']);
    } catch (e) {
      return null;
    }
  }

  // Fetch Multiple Ad Creatives
  Future<Map<String, AdCreative>> fetchAdCreatives(List<String> adIds) async {
    final Map<String, AdCreative> creativesMap = {};

    await Future.wait(
      adIds.map((adId) async {
        final creative = await fetchAdCreative(adId);
        if (creative != null) {
          creativesMap[adId] = creative;
        }
      }),
    );

    return creativesMap;
  }

  // Fetch Google Sheets Data
  Future<int> fetchGoogleSheetsData({
    String datePreset = 'today',
    String? timeSince,
    String? timeUntil,
  }) async {
    try {
      String url = '$baseUrl/google-sheets-data';

      if (timeSince != null && timeUntil != null) {
        final timeRange = jsonEncode({'since': timeSince, 'until': timeUntil});
        url += '?time_range=${Uri.encodeComponent(timeRange)}';
      } else {
        url += '?date_preset=$datePreset';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        return 0;
      }

      final data = jsonDecode(response.body);
      if (data['success'] != true) {
        return 0;
      }

      return data['total'] ?? 0;
    } catch (e) {
      return 0;
    }
  }

  // Fetch Google Ads Data
  Future<int> fetchGoogleAdsData({
    String datePreset = 'today',
    String? startDate,
    String? endDate,
  }) async {
    try {
      String url = '$baseUrl/google-ads';

      if (startDate != null && endDate != null) {
        url += '?startDate=$startDate&endDate=$endDate';
      } else {
        // Calculate date range from preset
        final dates = _calculateDateRange(datePreset);
        url += '?startDate=${dates['start']}&endDate=${dates['end']}';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        return 0;
      }

      final data = jsonDecode(response.body);
      if (data['error'] != null) {
        return 0;
      }

      return data['summary']?['totalClicks'] ?? 0;
    } catch (e) {
      return 0;
    }
  }

  // Fetch Facebook Balance
  Future<double> fetchFacebookBalance() async {
    try {
      // Use Next.js API directly
      final url = '$nextApiUrl/facebook-ads-balance';
      print('🔍 Fetching Facebook Balance from: $url');

      final response = await http.get(Uri.parse(url));

      print('📊 Balance Response Status: ${response.statusCode}');
      print('📊 Balance Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final balance =
              double.tryParse(
                data['data']['available_balance']?.toString() ?? '0',
              ) ??
              0;
          print('✅ Facebook Balance: $balance');
          return balance;
        }
      }

      print('❌ Balance API returned error');
      return 0;
    } catch (e) {
      print('❌ Error fetching Facebook Balance: $e');
      return 0;
    }
  }

  // Fetch Phone Count
  Future<int> fetchPhoneCount() async {
    try {
      // Use Next.js API directly
      final url = '$nextApiUrl/phone-count';
      print('🔍 Fetching Phone Count from: $url');

      final response = await http.get(Uri.parse(url));

      print('📞 Phone Count Response Status: ${response.statusCode}');
      print('📞 Phone Count Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['count'] != null) {
          final count = data['count'] as int;
          print('✅ Phone Count: $count');
          return count;
        }
      }

      print('❌ Phone Count API returned error');
      return 0;
    } catch (e) {
      print('❌ Error fetching Phone Count: $e');
      return 0;
    }
  }

  // Fetch Phone Leads for specific ads
  Future<Map<String, int>> fetchPhoneLeads({
    required List<String> adIds,
    String? date,
  }) async {
    try {
      final adIdsParam = adIds.join(',');
      String url = '$baseUrl/facebook-ads-phone-leads?ad_ids=$adIdsParam';
      if (date != null) {
        url += '&date=$date';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        return {};
      }

      final data = jsonDecode(response.body);
      if (data['success'] != true) {
        return {};
      }

      final Map<String, int> phoneLeadsMap = {};
      final phoneLeadsData = data['data'] as Map<String, dynamic>?;

      if (phoneLeadsData != null) {
        phoneLeadsData.forEach((adId, count) {
          phoneLeadsMap[adId] = count is int ? count : 0;
        });
      }

      return phoneLeadsMap;
    } catch (e) {
      return {};
    }
  }

  // Fetch Daily Summary Data (last 30 days)
  Future<List<DailySummary>> fetchDailySummaryData() async {
    try {
      final url =
          '$baseUrl/facebook-ads-campaigns?level=ad&date_preset=last_30d&time_increment=1';
      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        return [];
      }

      final data = jsonDecode(response.body);
      if (data['success'] != true) {
        return [];
      }

      final List<dynamic> insightsData = data['data'] ?? [];
      final insights = insightsData
          .map((json) => AdInsight.fromJson(json))
          .toList();

      // Group by date
      final Map<String, DailySummary> dailyMap = {};

      for (final insight in insights) {
        final date = insight.dateStart;
        if (!dailyMap.containsKey(date)) {
          dailyMap[date] = DailySummary(
            date: date,
            totalSpend: 0,
            newInbox: 0,
            totalInbox: 0,
            phoneLeads: 0,
          );
        }

        final current = dailyMap[date]!;
        dailyMap[date] = DailySummary(
          date: date,
          totalSpend: current.totalSpend + insight.spend,
          newInbox: current.newInbox + insight.messagingFirstReply,
          totalInbox: current.totalInbox + insight.totalMessagingConnection,
          phoneLeads: current.phoneLeads + (insight.phoneLeads ?? 0),
        );
      }

      final summaries = dailyMap.values.toList();
      summaries.sort((a, b) => b.date.compareTo(a.date)); // Sort descending
      return summaries.take(30).toList();
    } catch (e) {
      return [];
    }
  }

  // Helper function to calculate date range from preset
  Map<String, String> _calculateDateRange(String preset) {
    final today = DateTime.now();
    DateTime startDate = today;
    DateTime endDate = today;

    switch (preset) {
      case 'today':
        startDate = endDate = today;
        break;
      case 'yesterday':
        startDate = endDate = today.subtract(const Duration(days: 1));
        break;
      case 'last_7d':
        startDate = today.subtract(const Duration(days: 7));
        break;
      case 'last_14d':
        startDate = today.subtract(const Duration(days: 14));
        break;
      case 'last_30d':
        startDate = today.subtract(const Duration(days: 30));
        break;
      case 'this_month':
        startDate = DateTime(today.year, today.month, 1);
        break;
      case 'last_month':
        startDate = DateTime(today.year, today.month - 1, 1);
        endDate = DateTime(today.year, today.month, 0);
        break;
    }

    return {'start': _formatDate(startDate), 'end': _formatDate(endDate)};
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}
