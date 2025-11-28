import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;
import '../services/language_service.dart';

/// A stunning language switcher with beautiful animations and visual effects
class LanguageSwitcher extends StatefulWidget {
  /// Callback when language changes
  final Function(AppLanguage)? onLanguageChanged;

  /// Size variant: 'small', 'medium', 'large'
  final String size;

  /// Show text labels alongside flags
  final bool showLabels;

  /// Enable particle burst effect on switch
  final bool enableParticles;

  const LanguageSwitcher({
    Key? key,
    this.onLanguageChanged,
    this.size = 'medium',
    this.showLabels = true,
    this.enableParticles = true,
  }) : super(key: key);

  @override
  State<LanguageSwitcher> createState() => _LanguageSwitcherState();
}

class _LanguageSwitcherState extends State<LanguageSwitcher>
    with TickerProviderStateMixin {
  late AnimationController _slideController;
  late AnimationController _glowController;
  late AnimationController _bounceController;
  late AnimationController _particleController;

  late Animation<double> _slideAnimation;
  late Animation<double> _glowAnimation;
  late Animation<double> _bounceAnimation;

  bool _isHovered = false;
  List<_Particle> _particles = [];
  final math.Random _random = math.Random();

  @override
  void initState() {
    super.initState();
    _initAnimations();
    LanguageService.instance.addListener(_onLanguageChanged);
  }

  void _initAnimations() {
    // Slide animation for toggle
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _slideAnimation = CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutBack,
    );

    // Glow/pulse animation
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    _glowAnimation = Tween<double>(begin: 0.3, end: 0.8).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    // Bounce animation on toggle
    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _bounceAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.15), weight: 30),
      TweenSequenceItem(tween: Tween(begin: 1.15, end: 0.95), weight: 30),
      TweenSequenceItem(tween: Tween(begin: 0.95, end: 1.0), weight: 40),
    ]).animate(CurvedAnimation(
      parent: _bounceController,
      curve: Curves.easeOutBack,
    ));

    // Particle animation
    _particleController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    // Set initial state based on current language
    if (LanguageService.instance.isEnglish) {
      _slideController.value = 1.0;
    }
  }

  void _onLanguageChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    LanguageService.instance.removeListener(_onLanguageChanged);
    _slideController.dispose();
    _glowController.dispose();
    _bounceController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  double get _toggleWidth {
    switch (widget.size) {
      case 'small':
        return widget.showLabels ? 100 : 70;
      case 'large':
        return widget.showLabels ? 160 : 110;
      default:
        return widget.showLabels ? 130 : 90;
    }
  }

  double get _toggleHeight {
    switch (widget.size) {
      case 'small':
        return 36;
      case 'large':
        return 52;
      default:
        return 44;
    }
  }

  double get _fontSize {
    switch (widget.size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  }

  double get _flagSize {
    switch (widget.size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 22;
    }
  }

  void _generateParticles() {
    if (!widget.enableParticles) return;

    _particles = List.generate(12, (index) {
      final angle = (index / 12) * 2 * math.pi;
      return _Particle(
        angle: angle,
        distance: _random.nextDouble() * 30 + 20,
        size: _random.nextDouble() * 4 + 2,
        color: _getParticleColor(index),
      );
    });

    _particleController.forward(from: 0);
  }

  Color _getParticleColor(int index) {
    final colors = [
      Colors.blue[400]!,
      Colors.blue[300]!,
      Colors.purple[300]!,
      Colors.cyan[300]!,
      Colors.white,
      Colors.amber[300]!,
    ];
    return colors[index % colors.length];
  }

  Future<void> _toggleLanguage() async {
    // Haptic feedback
    HapticFeedback.mediumImpact();

    // Start animations
    _bounceController.forward(from: 0);
    _generateParticles();

    // Toggle slide animation
    if (LanguageService.instance.isThai) {
      _slideController.forward();
    } else {
      _slideController.reverse();
    }

    // Toggle language
    await LanguageService.instance.toggleLanguage();

    // Callback
    widget.onLanguageChanged?.call(LanguageService.instance.currentLanguage);
  }

  @override
  Widget build(BuildContext context) {
    final isThai = LanguageService.instance.isThai;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: _toggleLanguage,
        child: AnimatedBuilder(
          animation: Listenable.merge([
            _slideAnimation,
            _glowAnimation,
            _bounceAnimation,
            _particleController,
          ]),
          builder: (context, child) {
            return Transform.scale(
              scale: _isHovered ? 1.05 : _bounceAnimation.value,
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  // Glow effect
                  if (_isHovered)
                    Positioned.fill(
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          borderRadius:
                              BorderRadius.circular(_toggleHeight / 2),
                          boxShadow: [
                            BoxShadow(
                              color: (isThai ? Colors.blue : Colors.purple)
                                  .withOpacity(_glowAnimation.value * 0.5),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Main toggle container
                  _buildToggleContainer(isThai),

                  // Particles
                  if (_particles.isNotEmpty)
                    ..._particles.map((particle) => _buildParticle(particle)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildToggleContainer(bool isThai) {
    return Container(
      width: _toggleWidth,
      height: _toggleHeight,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(_toggleHeight / 2),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isThai
              ? [
                  const Color(0xFF1E40AF), // blue-800
                  const Color(0xFF3B82F6), // blue-500
                ]
              : [
                  const Color(0xFF6B21A8), // purple-800
                  const Color(0xFFA855F7), // purple-500
                ],
        ),
        boxShadow: [
          BoxShadow(
            color: (isThai ? Colors.blue : Colors.purple).withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Animated sliding pill
          AnimatedPositioned(
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeOutBack,
            left: isThai ? 4 : _toggleWidth - _toggleHeight + 4,
            top: 4,
            child: Container(
              width: _toggleHeight - 8,
              height: _toggleHeight - 8,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular((_toggleHeight - 8) / 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  transitionBuilder: (child, animation) {
                    return ScaleTransition(
                      scale: animation,
                      child: FadeTransition(
                        opacity: animation,
                        child: child,
                      ),
                    );
                  },
                  child: Text(
                    isThai ? '🇹🇭' : '🇬🇧',
                    key: ValueKey(isThai),
                    style: TextStyle(fontSize: _flagSize),
                  ),
                ),
              ),
            ),
          ),

          // Labels
          if (widget.showLabels)
            Positioned.fill(
              child: Row(
                children: [
                  // Thai label
                  Expanded(
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 200),
                      opacity: isThai ? 0 : 1,
                      child: Center(
                        child: Padding(
                          padding: EdgeInsets.only(left: _toggleHeight * 0.3),
                          child: Text(
                            'TH',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: _fontSize,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  // English label
                  Expanded(
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 200),
                      opacity: isThai ? 1 : 0,
                      child: Center(
                        child: Padding(
                          padding: EdgeInsets.only(right: _toggleHeight * 0.3),
                          child: Text(
                            'EN',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: _fontSize,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildParticle(_Particle particle) {
    return AnimatedBuilder(
      animation: _particleController,
      builder: (context, child) {
        final progress = _particleController.value;
        final x = math.cos(particle.angle) * particle.distance * progress;
        final y = math.sin(particle.angle) * particle.distance * progress;
        final opacity = (1 - progress).clamp(0.0, 1.0);

        return Positioned(
          left: _toggleWidth / 2 + x - particle.size / 2,
          top: _toggleHeight / 2 + y - particle.size / 2,
          child: Opacity(
            opacity: opacity,
            child: Container(
              width: particle.size * (1 - progress * 0.5),
              height: particle.size * (1 - progress * 0.5),
              decoration: BoxDecoration(
                color: particle.color,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: particle.color.withOpacity(0.5),
                    blurRadius: 4,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _Particle {
  final double angle;
  final double distance;
  final double size;
  final Color color;

  _Particle({
    required this.angle,
    required this.distance,
    required this.size,
    required this.color,
  });
}

/// Alternative: Flip-style language switcher with 3D card flip animation
class LanguageSwitcherFlip extends StatefulWidget {
  final Function(AppLanguage)? onLanguageChanged;

  const LanguageSwitcherFlip({
    Key? key,
    this.onLanguageChanged,
  }) : super(key: key);

  @override
  State<LanguageSwitcherFlip> createState() => _LanguageSwitcherFlipState();
}

class _LanguageSwitcherFlipState extends State<LanguageSwitcherFlip>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _showFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutBack),
    );

    _showFront = LanguageService.instance.isThai;
    if (!_showFront) {
      _controller.value = 1.0;
    }

    LanguageService.instance.addListener(_onLanguageChanged);
  }

  void _onLanguageChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    LanguageService.instance.removeListener(_onLanguageChanged);
    _controller.dispose();
    super.dispose();
  }

  Future<void> _flip() async {
    HapticFeedback.mediumImpact();

    if (_showFront) {
      await _controller.forward();
    } else {
      await _controller.reverse();
    }

    _showFront = !_showFront;
    await LanguageService.instance.toggleLanguage();
    widget.onLanguageChanged?.call(LanguageService.instance.currentLanguage);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flip,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final angle = _animation.value * math.pi;
          final isFront = angle < math.pi / 2;

          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(angle),
            child: isFront
                ? _buildCard(AppLanguage.thai)
                : Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()..rotateY(math.pi),
                    child: _buildCard(AppLanguage.english),
                  ),
          );
        },
      ),
    );
  }

  Widget _buildCard(AppLanguage language) {
    final isThai = language == AppLanguage.thai;
    return Container(
      width: 80,
      height: 44,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isThai
              ? [const Color(0xFF1E40AF), const Color(0xFF3B82F6)]
              : [const Color(0xFF6B21A8), const Color(0xFFA855F7)],
        ),
        boxShadow: [
          BoxShadow(
            color: (isThai ? Colors.blue : Colors.purple).withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            language.flag,
            style: const TextStyle(fontSize: 22),
          ),
          const SizedBox(width: 6),
          Text(
            isThai ? 'TH' : 'EN',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}

/// Compact dropdown-style language switcher
class LanguageSwitcherDropdown extends StatefulWidget {
  final Function(AppLanguage)? onLanguageChanged;

  const LanguageSwitcherDropdown({
    Key? key,
    this.onLanguageChanged,
  }) : super(key: key);

  @override
  State<LanguageSwitcherDropdown> createState() =>
      _LanguageSwitcherDropdownState();
}

class _LanguageSwitcherDropdownState extends State<LanguageSwitcherDropdown>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _expandAnimation;
  late Animation<double> _rotateAnimation;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _expandAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutBack,
    );
    _rotateAnimation = Tween<double>(begin: 0, end: 0.5).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    LanguageService.instance.addListener(_onLanguageChanged);
  }

  void _onLanguageChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    LanguageService.instance.removeListener(_onLanguageChanged);
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    HapticFeedback.lightImpact();
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    });
  }

  Future<void> _selectLanguage(AppLanguage language) async {
    HapticFeedback.mediumImpact();
    await LanguageService.instance.setLanguage(language);
    widget.onLanguageChanged?.call(language);
    _toggle();
  }

  @override
  Widget build(BuildContext context) {
    final currentLang = LanguageService.instance.currentLanguage;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Main button
        GestureDetector(
          onTap: _toggle,
          child: MouseRegion(
            cursor: SystemMouseCursors.click,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _isExpanded ? Colors.blue[400]! : Colors.grey[300]!,
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(_isExpanded ? 0.15 : 0.08),
                    blurRadius: _isExpanded ? 12 : 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    currentLang.flag,
                    style: const TextStyle(fontSize: 20),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    currentLang.name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[800],
                    ),
                  ),
                  const SizedBox(width: 6),
                  RotationTransition(
                    turns: _rotateAnimation,
                    child: Icon(
                      Icons.keyboard_arrow_down,
                      size: 20,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // Dropdown items
        SizeTransition(
          sizeFactor: _expandAnimation,
          child: Container(
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: AppLanguage.values.map((lang) {
                final isSelected = lang == currentLang;
                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _selectLanguage(lang),
                    borderRadius: BorderRadius.circular(8),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color:
                            isSelected ? Colors.blue[50] : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            lang.flag,
                            style: const TextStyle(fontSize: 20),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            lang.name,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.w500,
                              color: isSelected
                                  ? Colors.blue[700]
                                  : Colors.grey[700],
                            ),
                          ),
                          if (isSelected) ...[
                            const SizedBox(width: 8),
                            Icon(
                              Icons.check_circle,
                              size: 18,
                              color: Colors.blue[600],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }
}

/// Minimal icon-only language toggle
class LanguageSwitcherIcon extends StatefulWidget {
  final Function(AppLanguage)? onLanguageChanged;
  final double size;

  const LanguageSwitcherIcon({
    Key? key,
    this.onLanguageChanged,
    this.size = 40,
  }) : super(key: key);

  @override
  State<LanguageSwitcherIcon> createState() => _LanguageSwitcherIconState();
}

class _LanguageSwitcherIconState extends State<LanguageSwitcherIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    LanguageService.instance.addListener(_onLanguageChanged);
  }

  void _onLanguageChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    LanguageService.instance.removeListener(_onLanguageChanged);
    _controller.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    HapticFeedback.mediumImpact();
    _controller.forward(from: 0);
    await LanguageService.instance.toggleLanguage();
    widget.onLanguageChanged?.call(LanguageService.instance.currentLanguage);
  }

  @override
  Widget build(BuildContext context) {
    final currentLang = LanguageService.instance.currentLanguage;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: _toggle,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
            border: Border.all(
              color: _isHovered ? Colors.blue[400]! : Colors.grey[300]!,
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(_isHovered ? 0.15 : 0.08),
                blurRadius: _isHovered ? 12 : 6,
                offset: const Offset(0, 2),
              ),
              if (_isHovered)
                BoxShadow(
                  color: Colors.blue.withOpacity(0.3),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
            ],
          ),
          child: AnimatedScale(
            scale: _isHovered ? 1.1 : 1.0,
            duration: const Duration(milliseconds: 150),
            child: Center(
              child: RotationTransition(
                turns: _controller,
                child: Text(
                  currentLang.flag,
                  style: TextStyle(fontSize: widget.size * 0.5),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
