import 'package:flutter/material.dart';
import '../widgets/video_player_widget.dart';

/// Demo screen to test video player functionality
class VideoPlayerDemoScreen extends StatefulWidget {
  const VideoPlayerDemoScreen({Key? key}) : super(key: key);

  @override
  State<VideoPlayerDemoScreen> createState() => _VideoPlayerDemoScreenState();
}

class _VideoPlayerDemoScreenState extends State<VideoPlayerDemoScreen> {
  // Test video URLs
  static const String primaryVideoUrl =
      'https://app.bjhbangkok.com/images/video/735392719471063.mp4';

  // Fallback test video (Big Buck Bunny - public domain)
  static const String fallbackVideoUrl =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  String _currentVideoUrl = fallbackVideoUrl;
  bool _usePrimaryUrl = false;

  void _toggleVideoSource() {
    setState(() {
      _usePrimaryUrl = !_usePrimaryUrl;
      _currentVideoUrl = _usePrimaryUrl ? primaryVideoUrl : fallbackVideoUrl;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Video Player Demo'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Toggle video source
          IconButton(
            icon: const Icon(Icons.swap_horiz),
            onPressed: _toggleVideoSource,
            tooltip: 'Switch Video Source',
          ),
          // Fullscreen button
          IconButton(
            icon: const Icon(Icons.fullscreen),
            onPressed: () {
              FullscreenVideoPlayer.show(
                context,
                videoUrl: _currentVideoUrl,
                title: 'Facebook Ad Video',
              );
            },
            tooltip: 'Fullscreen',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.grey[100]!, Colors.grey[200]!],
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Video Source Toggle Card
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: _usePrimaryUrl ? Colors.orange[50] : Colors.green[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _usePrimaryUrl
                        ? Colors.orange[200]!
                        : Colors.green[200]!,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _usePrimaryUrl ? Icons.cloud_off : Icons.cloud_done,
                      color: _usePrimaryUrl
                          ? Colors.orange[600]
                          : Colors.green[600],
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _usePrimaryUrl
                            ? 'Using BJH Video (may not exist)'
                            : 'Using Test Video (Big Buck Bunny)',
                        style: TextStyle(
                          fontSize: 13,
                          color: _usePrimaryUrl
                              ? Colors.orange[800]
                              : Colors.green[800],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: _toggleVideoSource,
                      style: TextButton.styleFrom(
                        backgroundColor: _usePrimaryUrl
                            ? Colors.orange[100]
                            : Colors.green[100],
                      ),
                      child: Text(
                        'Switch',
                        style: TextStyle(
                          color: _usePrimaryUrl
                              ? Colors.orange[800]
                              : Colors.green[800],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Header
              Container(
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
                    Row(
                      children: [
                        Icon(Icons.play_circle_fill,
                            color: Colors.blue[600], size: 28),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Facebook Ad Video',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[800],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'วิดีโอโฆษณาจาก Facebook Ads',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _currentVideoUrl,
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey[500],
                          fontFamily: 'monospace',
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Main Video Player
              Container(
                key: ValueKey(_currentVideoUrl), // Force rebuild on URL change
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: VideoPlayerWidget(
                  videoUrl: _currentVideoUrl,
                  autoPlay: false,
                  looping: true,
                  showControls: true,
                ),
              ),

              const SizedBox(height: 24),

              // Video Info Card
              Container(
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
                    Text(
                      'ฟีเจอร์ Video Player',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildFeatureItem(
                      Icons.play_arrow,
                      'Play/Pause',
                      'เล่น/หยุดวิดีโอ',
                    ),
                    _buildFeatureItem(
                      Icons.volume_up,
                      'Volume Control',
                      'ปรับระดับเสียง',
                    ),
                    _buildFeatureItem(
                      Icons.fullscreen,
                      'Fullscreen',
                      'ดูแบบเต็มจอ',
                    ),
                    _buildFeatureItem(
                      Icons.speed,
                      'Playback Speed',
                      'ปรับความเร็ว',
                    ),
                    _buildFeatureItem(
                      Icons.loop,
                      'Loop',
                      'เล่นวนซ้ำ',
                    ),
                    _buildFeatureItem(
                      Icons.error_outline,
                      'Error Handling',
                      'แสดงข้อผิดพลาดอย่างเป็นมิตร',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Thumbnail style preview
              Container(
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
                    Text(
                      'Thumbnail Preview Style',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 150,
                      child: VideoThumbnailPlayer(
                        key: ValueKey('thumb_$_currentVideoUrl'),
                        videoUrl: _currentVideoUrl,
                        height: 150,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 20, color: Colors.blue[600]),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[800],
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
