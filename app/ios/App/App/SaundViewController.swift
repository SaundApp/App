import UIKit
import Capacitor

class SaundViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        webView!.allowsBackForwardNavigationGestures = true
    }

}
