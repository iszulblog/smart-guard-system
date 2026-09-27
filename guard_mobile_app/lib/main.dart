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
      title: 'SGVS Pengawal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF0284C7),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0284C7),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF1E293B),
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
      ..setBackgroundColor(const Color(0xFF0F172A))
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
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Tetapan Alamat Pelayan (Server URL)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Masukkan IP pelayan komputer anda atau alamat web live (cth: Ngrok / Localtunnel):',
              style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: textController,
              style: const TextStyle(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF0F172A),
                hintText: 'https://smart-guard-system.vercel.app/guard/login',
                hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              children: [
                ActionChip(
                  label: const Text('Vercel Live (Lalai)', style: TextStyle(fontSize: 10)),
                  onPressed: () => textController.text = 'https://smart-guard-system.vercel.app/guard/login',
                ),
                ActionChip(
                  label: const Text('Wi-Fi Tempatan', style: TextStyle(fontSize: 10)),
                  onPressed: () => textController.text = 'http://192.168.0.14:3000/guard/login',
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0284C7),
              foregroundColor: Colors.white,
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
            child: const Text('Simpan & Muat Semula'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.security, size: 18, color: Color(0xFF38BDF8)),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SGVS PENGAWAL', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('Sistem Kehadiran Pos', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, size: 20, color: Color(0xFF94A3B8)),
            tooltip: 'Tetapan Pelayan',
            onPressed: _showChangeServerDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, size: 20, color: Color(0xFF94A3B8)),
            tooltip: 'Segar Semula',
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
                color: Color(0xFF38BDF8),
              ),
            ),
          if (_hasError)
            Container(
              color: const Color(0xFF0F172A),
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off, size: 64, color: Color(0xFFF59E0B)),
                    const SizedBox(height: 16),
                    const Text(
                      'Tidak Dapat Menyambung ke Pelayan',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Alamat sasaran: $_serverUrl\nPastikan pelayan web telah dijalankan (npm run dev) dan peranti berada dalam talian atau rangkaian Wi-Fi yang sama.',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF38BDF8)),
                          onPressed: _showChangeServerDialog,
                          icon: const Icon(Icons.edit, size: 16),
                          label: const Text('Tukar URL Pelayan'),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0284C7),
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () => _controller.loadRequest(Uri.parse(_serverUrl)),
                          icon: const Icon(Icons.refresh, size: 16),
                          label: const Text('Cuba Lagi'),
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
