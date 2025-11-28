import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../models/ad_insight.dart';
import 'video_player_widget.dart';

class VideoGalleryWidget extends StatefulWidget {
  final List<AdInsight> insights;
  final Map<String, AdCreative> adCreatives;
  final bool isLoading;

  const VideoGalleryWidget({
    Key? key,
    required this.insights,
    required this.adCreatives,
    this.isLoading = false,
  }) : super(key: key);

  @override
  State<VideoGalleryWidget> createState() => _VideoGalleryWidgetState();
}

class _VideoGalleryWidgetState extends State<VideoGalleryWidget> {
  bool _isExpanded = false;
  static const int _initialDisplayCount = 4;

  List<VideoAdData> _getVideoAds() {
    final List<VideoAdData> videoAds = [];

    print('🎬 VideoGallery: Processing ${widget.insights.length} insights');
    print('🎬 VideoGallery: ${widget.adCreatives.length} creatives available');

    for (final ad in widget.insights) {
      final creative = widget.adCreatives[ad.adId];

      if (creative != null) {
        final hasVideo =
            creative.videoId != null && creative.videoId!.isNotEmpty;

        // Try multiple sources for thumbnail
        String? thumbnailUrl = creative.thumbnailUrl;
        if (thumbnailUrl == null || thumbnailUrl.isEmpty) {
          thumbnailUrl = creative.imageUrl;
        }

        // Debug log for each ad
        print(
            '📷 Ad ${ad.adId}: thumbnail=${creative.thumbnailUrl}, image=${creative.imageUrl}, video=${creative.videoId}, source=${creative.videoSource}');

        // Include ads even if they don't have thumbnail - we'll show placeholder
        videoAds.add(VideoAdData(
          adId: ad.adId,
          adName: ad.adName,
          campaignName: ad.campaignName,
          thumbnailUrl:
              thumbnailUrl ?? '', // Empty string will trigger placeholder
          videoId: creative.videoId,
          videoSource: creative.videoSource, // Direct playable URL
          isVideo: hasVideo,
          spend: ad.spend,
          leads: ad.totalMessagingConnection,
        ));
      } else {
        print('⚠️ No creative found for ad: ${ad.adId}');
      }
    }

    videoAds.sort((a, b) => b.leads.compareTo(a.leads));
    print('🎬 VideoGallery: Returning ${videoAds.length} video ads');
    return videoAds;
  }

  @override
  Widget build(BuildContext context) {
    final videoAds = _getVideoAds();
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;

    if (widget.isLoading) {
      return _buildLoadingState(isMobile);
    }

    if (videoAds.isEmpty) {
      return _buildEmptyState();
    }

    final displayAds =
        _isExpanded ? videoAds : videoAds.take(_initialDisplayCount).toList();

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
          _buildHeader(videoAds.length, isMobile),
          Padding(
            padding: EdgeInsets.all(isMobile ? 12 : 16),
            child: Column(
              children: [
                _buildVideoGrid(displayAds, isMobile),
                if (videoAds.length > _initialDisplayCount)
                  _buildShowMoreButton(videoAds.length),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(int totalCount, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 12 : 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Colors.purple[600]!, Colors.purple[400]!],
        ),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.video_library_rounded,
              color: Colors.white,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Video Ads Gallery',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: isMobile ? 16 : 18,
                  ),
                ),
                Text(
                  '$totalCount videos available',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: isMobile ? 11 : 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.play_circle_outline,
                  color: Colors.white,
                  size: isMobile ? 14 : 16,
                ),
                const SizedBox(width: 4),
                Text(
                  'Tap to play',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: isMobile ? 10 : 11,
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

  Widget _buildVideoGrid(List<VideoAdData> ads, bool isMobile) {
    final crossAxisCount = isMobile ? 2 : 3;
    final spacing = isMobile ? 10.0 : 16.0;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: spacing,
        mainAxisSpacing: spacing,
        childAspectRatio: 0.75,
      ),
      itemCount: ads.length,
      itemBuilder: (context, index) {
        return VideoCard(
          data: ads[index],
          isMobile: isMobile,
          onTap: () => _playVideo(ads[index]),
        );
      },
    );
  }

  Widget _buildShowMoreButton(int totalCount) {
    final remainingCount = totalCount - _initialDisplayCount;

    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            setState(() {
              _isExpanded = !_isExpanded;
            });
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.purple[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.purple[200]!),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _isExpanded
                      ? Icons.keyboard_arrow_up
                      : Icons.keyboard_arrow_down,
                  color: Colors.purple[700],
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  _isExpanded
                      ? 'Show Less'
                      : 'Show $remainingCount More Videos',
                  style: TextStyle(
                    color: Colors.purple[700],
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState(bool isMobile) {
    final crossAxisCount = isMobile ? 2 : 3;

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
          Shimmer.fromColors(
            baseColor: Colors.grey[300]!,
            highlightColor: Colors.grey[100]!,
            child: Container(
              height: 60,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(isMobile ? 12 : 16),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: isMobile ? 10.0 : 16.0,
                mainAxisSpacing: isMobile ? 10.0 : 16.0,
                childAspectRatio: 0.75,
              ),
              itemCount: 4,
              itemBuilder: (context, index) {
                return Shimmer.fromColors(
                  baseColor: Colors.grey[300]!,
                  highlightColor: Colors.grey[100]!,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
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
            Icon(Icons.video_library_outlined,
                size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No video ads available',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Video thumbnails will appear here when available',
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[500],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _playVideo(VideoAdData data) {
    final videoUrl = _getPlayableVideoUrl(data);
    print('🎬 Playing video: $videoUrl');
    
    FullscreenVideoPlayer.show(
      context,
      videoUrl: videoUrl,
      title: data.adName,
    );
  }

  String _getPlayableVideoUrl(VideoAdData data) {
    // Priority 1: Use direct video source URL if available
    if (data.videoSource != null && data.videoSource!.isNotEmpty) {
      print('✅ Using videoSource: ${data.videoSource}');
      return data.videoSource!;
    }
    
    // Priority 2: Fallback to sample video for demo
    print('⚠️ No videoSource available, using sample video');
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }
}

class VideoCard extends StatelessWidget {
  final VideoAdData data;
  final bool isMobile;
  final VoidCallback onTap;

  const VideoCard({
    Key? key,
    required this.data,
    required this.isMobile,
    required this.onTap,
  }) : super(key: key);

  // Fallback placeholder image URL
  static const String _placeholderImage =
      'https://via.placeholder.com/400x300/e0e0e0/666666?text=Ad+Image';

  // Validate and fix image URL
  String _getValidImageUrl(String? url) {
    if (url == null || url.isEmpty) {
      print('⚠️ VideoCard: URL is null or empty for ad: ${data.adName}');
      return _placeholderImage;
    }

    // Debug log the URL
    print('🔍 VideoCard: Loading image URL: $url');

    // Check for valid URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      print('⚠️ VideoCard: Invalid URL format: $url');
      return _placeholderImage;
    }

    // Facebook CDN URLs sometimes need special handling
    // Replace any escaped characters
    String cleanUrl = url.replaceAll(r'\/', '/');

    return cleanUrl;
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = _getValidImageUrl(data.thumbnailUrl);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  flex: 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      _buildThumbnailImage(imageUrl),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.play_arrow_rounded,
                            color: Colors.white,
                            size: isMobile ? 28 : 32,
                          ),
                        ),
                      ),
                      if (data.isVideo)
                        Positioned(
                          top: 8,
                          left: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red[600],
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.videocam,
                                  color: Colors.white,
                                  size: 10,
                                ),
                                const SizedBox(width: 3),
                                Text(
                                  'VIDEO',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: isMobile ? 8 : 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green[600],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.message,
                                color: Colors.white,
                                size: 10,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                '${data.leads}',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: isMobile ? 9 : 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Container(
                    color: Colors.white,
                    padding: EdgeInsets.all(isMobile ? 8 : 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          data.adName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[800],
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '฿${data.spend.toStringAsFixed(0)}',
                          style: TextStyle(
                            fontSize: isMobile ? 10 : 11,
                            color: Colors.blue[600],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildThumbnailImage(String imageUrl) {
    // If the URL is empty or placeholder, show a styled placeholder
    if (imageUrl.isEmpty || imageUrl == _placeholderImage) {
      return _buildPlaceholderWidget();
    }

    // Use Image.network as fallback if CachedNetworkImage fails
    return Image.network(
      imageUrl,
      fit: BoxFit.cover,
      headers: const {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) {
          print('✅ Image loaded successfully: ${imageUrl.substring(0, 50)}...');
          return child;
        }
        return Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(color: Colors.grey[300]),
        );
      },
      errorBuilder: (context, error, stackTrace) {
        print('❌ Image load error for URL: $imageUrl');
        print('❌ Error details: $error');
        // Try fallback with CachedNetworkImage
        return _buildFallbackImage(imageUrl);
      },
    );
  }

  Widget _buildFallbackImage(String imageUrl) {
    return CachedNetworkImage(
      imageUrl: imageUrl,
      fit: BoxFit.cover,
      httpHeaders: const {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      placeholder: (context, url) => Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: Container(color: Colors.grey[300]),
      ),
      errorWidget: (context, url, error) {
        print('❌ CachedNetworkImage also failed for: $url');
        return _buildPlaceholderWidget();
      },
    );
  }

  Widget _buildPlaceholderWidget() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.purple[100]!, Colors.blue[100]!],
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.campaign_rounded,
            color: Colors.purple[300],
            size: 36,
          ),
          const SizedBox(height: 4),
          Text(
            'Ad Preview',
            style: TextStyle(
              fontSize: 10,
              color: Colors.purple[400],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class VideoAdData {
  final String adId;
  final String adName;
  final String campaignName;
  final String thumbnailUrl;
  final String? videoId;
  final String? videoSource; // Direct playable video URL from Facebook
  final bool isVideo;
  final double spend;
  final int leads;

  VideoAdData({
    required this.adId,
    required this.adName,
    required this.campaignName,
    required this.thumbnailUrl,
    this.videoId,
    this.videoSource,
    required this.isVideo,
    required this.spend,
    required this.leads,
  });
}
