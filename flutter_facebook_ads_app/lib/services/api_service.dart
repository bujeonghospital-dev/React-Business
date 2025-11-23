import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/ad_insight.dart';

class ApiService {
  static const String baseUrl =
      'https://believable-ambition-production.up.railway.app/api';

  // Fetch Facebook Ads data
  Future<List<AdInsight>> fetchFacebookAds({
    String level = 'ad',
    String datePreset = 'today',
    String? timeRange,
  }) async {
    try {
      var url = '$baseUrl/facebook-ads-campaigns?level=$level';

      // Add filtering for messaging actions
      final filtering = jsonEncode([
        {
          'field': 'action_type',
          'operator': 'IN',
          'value': [
            'onsite_conversion.messaging_first_reply',
            'onsite_conversion.total_messaging_connection',
          ],
        }
      ]);
      url += '&filtering=${Uri.encodeComponent(filtering)}';
      url += '&action_breakdowns=action_type';

      // Add date range
      if (timeRange != null) {
        url += '&time_range=${Uri.encodeComponent(timeRange)}';
      } else {
        url += '&date_preset=$datePreset';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return (data['data'] as List)
              .map((item) => AdInsight.fromJson(item))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error fetching Facebook Ads: $e');
      return [];
    }
  }

  // Fetch Google Sheets data
  Future<int> fetchGoogleSheetsData({
    String datePreset = 'today',
    String? timeRange,
  }) async {
    try {
      var url = '$baseUrl/google-sheets-data';

      if (timeRange != null) {
        url += '?time_range=${Uri.encodeComponent(timeRange)}';
      } else {
        url += '?date_preset=$datePreset';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['total'] ?? 0;
        }
      }
      return 0;
    } catch (e) {
      print('Error fetching Google Sheets data: $e');
      return 0;
    }
  }

  // Fetch Google Ads data
  Future<int> fetchGoogleAdsData({
    String? startDate,
    String? endDate,
  }) async {
    try {
      var url = '$baseUrl/google-ads';

      if (startDate != null && endDate != null) {
        url += '?startDate=$startDate&endDate=$endDate';
      } else {
        final today = DateTime.now().toIso8601String().split('T')[0];
        url += '?startDate=$today&endDate=$today';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['error'] == null) {
          return data['summary']?['totalClicks'] ?? 0;
        }
      }
      return 0;
    } catch (e) {
      print('Error fetching Google Ads data: $e');
      return 0;
    }
  }

  // Fetch Facebook Balance
  Future<double> fetchFacebookBalance() async {
    try {
      final response = await http.get(
        Uri.parse('https://tpp-thanakon.store/api/facebook-ads-balance'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return (data['data']['available_balance'] ?? 0).toDouble();
        }
      }
      return 0;
    } catch (e) {
      print('Error fetching Facebook balance: $e');
      return 0;
    }
  }

  // Fetch Phone Count
  Future<int> fetchPhoneCount() async {
    try {
      final response = await http.get(
        Uri.parse('https://tpp-thanakon.store/api/phone-count'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['count'] ?? 0;
        }
      }
      return 0;
    } catch (e) {
      print('Error fetching phone count: $e');
      return 0;
    }
  }

  // Fetch Daily Summary (Last 30 days)
  Future<List<AdInsight>> fetchDailySummary() async {
    try {
      var url = '$baseUrl/facebook-ads-campaigns?level=ad';

      // Add filtering for messaging actions
      final filtering = jsonEncode([
        {
          'field': 'action_type',
          'operator': 'IN',
          'value': [
            'onsite_conversion.messaging_first_reply',
            'onsite_conversion.total_messaging_connection',
          ],
        }
      ]);
      url += '&filtering=${Uri.encodeComponent(filtering)}';
      url += '&action_breakdowns=action_type';
      url += '&date_preset=last_30d&time_increment=1';

      print('Fetching daily summary from: $url'); // Debug log

      final response = await http.get(Uri.parse(url));

      print(
          'Daily summary response status: ${response.statusCode}'); // Debug log

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final insights = (data['data'] as List)
              .map((item) => AdInsight.fromJson(item))
              .toList();
          print(
              'Daily summary loaded: ${insights.length} records'); // Debug log
          return insights;
        }
      }
      print('Daily summary failed or empty'); // Debug log
      return [];
    } catch (e) {
      print('Error fetching daily summary: $e');
      return [];
    }
  }
}
