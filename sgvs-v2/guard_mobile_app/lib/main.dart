import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SGVSApp());
}

class SGVSApp extends StatelessWidget {
  const SGVSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SGVS Guard V2',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        primaryColor: const Color(0xFF0284C7),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF0284C7),
          secondary: Color(0xFF059669),
          surface: Colors.white,
        ),
      ),
      home: const GuardWebViewScreen(),
    );
  }
}

class GuardWebViewScreen extends StatefulWidget {
  const GuardWebViewScreen({super.key});

  @override
  State<GuardWebViewScreen> createState() => _GuardWebViewScreenState();
}

class _GuardWebViewScreenState extends State<GuardWebViewScreen> {
  late final WebViewController _controller;
  String _serverUrl = 'https://smart-guard-system.vercel.app/guard/login';
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _initPermissionsAndWebView();
  }

  void _initPermissionsAndWebView() {
    final WebViewController controller = WebViewController();

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFF8FAFC))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _isLoading = false;
              _hasError = true;
              _errorMessage = error.description;
            });
          },
        ),
      );

    // Grant WebRTC Camera and Geolocation in Android WebView
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setMediaPlaybackRequiresUserGesture(false);

      androidController.setOnPlatformPermissionRequest((request) {
        request.grant();
      });

      androidController.setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: (request) async {
          return const GeolocationPermissionsResponse(allow: true, retain: true);
        },
      );
    }

    _controller = controller;
    _controller.loadRequest(Uri.parse(_serverUrl));
  }

  void _showChangeServerDialog() {
    final textController = TextEditingController(text: _serverUrl);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Server Configuration', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Specify production live endpoint or local network host IP:',
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: textController,
              style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                hintText: 'https://smart-guard-system.vercel.app/guard/login',
                hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              children: [
                ActionChip(
                  label: const Text('Live Production', style: TextStyle(fontSize: 10)),
                  onPressed: () => textController.text = 'https://smart-guard-system.vercel.app/guard/login',
                ),
                ActionChip(
                  label: const Text('Local Host (Port 3000)', style: TextStyle(fontSize: 10)),
                  onPressed: () => textController.text = 'http://192.168.0.14:3000/guard/login',
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0284C7),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              final newUrl = textController.text.trim();
              if (newUrl.isNotEmpty) {
                setState(() {
                  _serverUrl = newUrl;
                });
                _controller.loadRequest(Uri.parse(newUrl));
              }
              Navigator.pop(context);
            },
            child: const Text('Apply & Reload'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.security, size: 18, color: Color(0xFF0284C7)),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SGVS GUARD V2', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                Text('Geofencing & Patrol System', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 20, color: Color(0xFF64748B)),
            tooltip: 'Server Settings',
            onPressed: _showChangeServerDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, size: 20, color: Color(0xFF64748B)),
            tooltip: 'Reload',
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF0284C7),
              ),
            ),
          if (_hasError)
            Container(
              color: const Color(0xFFF8FAFC),
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off, size: 54, color: Color(0xFFF59E0B)),
                    const SizedBox(height: 16),
                    const Text(
                      'Connection Unavailable',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Target URL: $_serverUrl\nPlease ensure your device has internet access or local network connectivity.',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF0284C7)),
                          onPressed: _showChangeServerDialog,
                          icon: const Icon(Icons.edit, size: 16),
                          label: const Text('Change URL'),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0284C7),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () => _controller.loadRequest(Uri.parse(_serverUrl)),
                          icon: const Icon(Icons.refresh, size: 16),
                          label: const Text('Retry'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
