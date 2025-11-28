import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';

/// A comprehensive video player widget with full controls and error handling
class VideoPlayerWidget extends StatefulWidget {
  /// The URL of the video to play
  final String videoUrl;

  /// Optional thumbnail URL to show before video loads
  final String? thumbnailUrl;

  /// Whether to auto-play the video
  final bool autoPlay;

  /// Whether to loop the video
  final bool looping;

  /// Whether to show controls
  final bool showControls;

  /// Aspect ratio of the video (default: 16/9)
  final double aspectRatio;

  /// Placeholder widget while loading
  final Widget? placeholder;

  /// Error widget when video fails to load
  final Widget? errorWidget;

  /// Callback when video state changes
  final Function(VideoPlayerValue)? onStateChanged;

  const VideoPlayerWidget({
    Key? key,
    required this.videoUrl,
    this.thumbnailUrl,
    this.autoPlay = false,
    this.looping = false,
    this.showControls = true,
    this.aspectRatio = 16 / 9,
    this.placeholder,
    this.errorWidget,
    this.onStateChanged,
  }) : super(key: key);

  @override
  State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  VideoPlayerController? _videoPlayerController;
  ChewieController? _chewieController;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  @override
  void didUpdateWidget(VideoPlayerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl) {
      _disposeControllers();
      _initializePlayer();
    }
  }

  Future<void> _initializePlayer() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
      _errorMessage = '';
    });

    try {
      // Create video player controller
      _videoPlayerController = VideoPlayerController.networkUrl(
        Uri.parse(widget.videoUrl),
        httpHeaders: {
          'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
          'User-Agent': 'Flutter Video Player',
        },
      );

      // Add listener for state changes
      _videoPlayerController!.addListener(_onVideoStateChanged);

      // Initialize the controller
      await _videoPlayerController!.initialize();

      // Create chewie controller for better controls
      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController!,
        aspectRatio: _videoPlayerController!.value.aspectRatio,
        autoPlay: widget.autoPlay,
        looping: widget.looping,
        showControls: widget.showControls,
        autoInitialize: true,
        errorBuilder: (context, errorMessage) {
          return _buildErrorWidget(errorMessage);
        },
        placeholder: widget.placeholder ?? _buildPlaceholder(),
        materialProgressColors: ChewieProgressColors(
          playedColor: Colors.blue[600]!,
          handleColor: Colors.blue[400]!,
          backgroundColor: Colors.grey[300]!,
          bufferedColor: Colors.blue[200]!,
        ),
        additionalOptions: (context) {
          return <OptionItem>[
            OptionItem(
              onTap: (BuildContext ctx) =>
                  _videoPlayerController?.seekTo(Duration.zero),
              iconData: Icons.replay,
              title: 'Replay',
            ),
          ];
        },
      );

      setState(() {
        _isLoading = false;
        _isInitialized = true;
      });
    } catch (e) {
      debugPrint('Video player error: $e');
      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = _parseError(e);
      });
    }
  }

  void _onVideoStateChanged() {
    if (_videoPlayerController != null) {
      widget.onStateChanged?.call(_videoPlayerController!.value);

      // Check for errors during playback
      if (_videoPlayerController!.value.hasError) {
        setState(() {
          _hasError = true;
          _errorMessage = _videoPlayerController!.value.errorDescription ??
              'Unknown error occurred';
        });
      }
    }
  }

  String _parseError(dynamic error) {
    final errorString = error.toString().toLowerCase();

    if (errorString.contains('socket') || errorString.contains('connection')) {
      return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้\nConnection failed';
    } else if (errorString.contains('format') ||
        errorString.contains('codec')) {
      return 'รูปแบบวิดีโอไม่รองรับ\nUnsupported video format';
    } else if (errorString.contains('404') ||
        errorString.contains('not found')) {
      return 'ไม่พบไฟล์วิดีโอ\nVideo not found';
    } else if (errorString.contains('403') ||
        errorString.contains('forbidden')) {
      return 'ไม่มีสิทธิ์เข้าถึงวิดีโอ\nAccess denied';
    } else if (errorString.contains('cors')) {
      return 'ปัญหา CORS - ไม่สามารถเข้าถึงข้ามโดเมน\nCORS policy blocked';
    } else if (errorString.contains('ssl') ||
        errorString.contains('certificate')) {
      return 'ปัญหา SSL Certificate\nSSL certificate error';
    } else if (errorString.contains('timeout')) {
      return 'หมดเวลาเชื่อมต่อ\nConnection timeout';
    }

    return 'เกิดข้อผิดพลาด: ${error.toString()}\nError loading video';
  }

  void _disposeControllers() {
    _videoPlayerController?.removeListener(_onVideoStateChanged);
    _chewieController?.dispose();
    _videoPlayerController?.dispose();
    _chewieController = null;
    _videoPlayerController = null;
  }

  @override
  void dispose() {
    _disposeControllers();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildLoadingWidget();
    }

    if (_hasError) {
      return widget.errorWidget ?? _buildErrorWidget(_errorMessage);
    }

    if (_isInitialized && _chewieController != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: AspectRatio(
          aspectRatio:
              _videoPlayerController?.value.aspectRatio ?? widget.aspectRatio,
          child: Chewie(controller: _chewieController!),
        ),
      );
    }

    return _buildPlaceholder();
  }

  Widget _buildLoadingWidget() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(12),
      ),
      child: AspectRatio(
        aspectRatio: widget.aspectRatio,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Thumbnail if available
            if (widget.thumbnailUrl != null)
              Image.network(
                widget.thumbnailUrl!,
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
                errorBuilder: (_, __, ___) => Container(color: Colors.black),
              ),
            // Loading overlay
            Container(
              color: Colors.black.withOpacity(0.5),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 48,
                    height: 48,
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.blue[400]!),
                      strokeWidth: 3,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'กำลังโหลดวิดีโอ...',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(12),
      ),
      child: AspectRatio(
        aspectRatio: widget.aspectRatio,
        child: widget.thumbnailUrl != null
            ? Image.network(
                widget.thumbnailUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _buildDefaultPlaceholder(),
              )
            : _buildDefaultPlaceholder(),
      ),
    );
  }

  Widget _buildDefaultPlaceholder() {
    return Container(
      color: Colors.grey[900],
      child: Center(
        child: Icon(
          Icons.play_circle_outline,
          size: 64,
          color: Colors.white.withOpacity(0.7),
        ),
      ),
    );
  }

  Widget _buildErrorWidget(String message) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.grey[900]!, Colors.grey[800]!],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withOpacity(0.3), width: 1),
      ),
      child: AspectRatio(
        aspectRatio: widget.aspectRatio,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Error icon with animation
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.error_outline,
                  size: 48,
                  color: Colors.red[400],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'ไม่สามารถโหลดวิดีโอได้',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                message,
                style: TextStyle(
                  color: Colors.grey[400],
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 20),
              // Retry button
              ElevatedButton.icon(
                onPressed: _initializePlayer,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('ลองอีกครั้ง'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[600],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Video URL hint
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.grey[800],
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  widget.videoUrl.length > 50
                      ? '${widget.videoUrl.substring(0, 50)}...'
                      : widget.videoUrl,
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 10,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A simple inline video player for thumbnails/previews
class VideoThumbnailPlayer extends StatefulWidget {
  final String videoUrl;
  final String? thumbnailUrl;
  final double? width;
  final double? height;

  const VideoThumbnailPlayer({
    Key? key,
    required this.videoUrl,
    this.thumbnailUrl,
    this.width,
    this.height,
  }) : super(key: key);

  @override
  State<VideoThumbnailPlayer> createState() => _VideoThumbnailPlayerState();
}

class _VideoThumbnailPlayerState extends State<VideoThumbnailPlayer> {
  bool _isPlaying = false;

  @override
  Widget build(BuildContext context) {
    if (_isPlaying) {
      return SizedBox(
        width: widget.width,
        height: widget.height,
        child: VideoPlayerWidget(
          videoUrl: widget.videoUrl,
          thumbnailUrl: widget.thumbnailUrl,
          autoPlay: true,
          showControls: true,
        ),
      );
    }

    return GestureDetector(
      onTap: () => setState(() => _isPlaying = true),
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: Colors.grey[900],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            if (widget.thumbnailUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  widget.thumbnailUrl!,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                  errorBuilder: (_, __, ___) =>
                      Container(color: Colors.grey[900]),
                ),
              ),
            Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[600]!.withOpacity(0.9),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.blue.withOpacity(0.4),
                    blurRadius: 16,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(
                Icons.play_arrow,
                color: Colors.white,
                size: 32,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Fullscreen video player dialog
class FullscreenVideoPlayer extends StatelessWidget {
  final String videoUrl;
  final String? title;

  const FullscreenVideoPlayer({
    Key? key,
    required this.videoUrl,
    this.title,
  }) : super(key: key);

  static Future<void> show(
    BuildContext context, {
    required String videoUrl,
    String? title,
  }) {
    // Set landscape orientation for fullscreen
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    return Navigator.of(context)
        .push(
      MaterialPageRoute(
        builder: (context) => FullscreenVideoPlayer(
          videoUrl: videoUrl,
          title: title,
        ),
      ),
    )
        .then((_) {
      // Restore portrait orientation
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
      ]);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: title != null ? Text(title!) : null,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Center(
        child: VideoPlayerWidget(
          videoUrl: videoUrl,
          autoPlay: true,
          showControls: true,
        ),
      ),
    );
  }
}
