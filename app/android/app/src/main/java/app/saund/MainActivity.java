package app.saund;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();
        WebView webview = getBridge().getWebView();
        webview.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
    }

    @Override
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        registerPlugin(com.getcapacitor.community.stripe.StripePlugin.class);
    }
}