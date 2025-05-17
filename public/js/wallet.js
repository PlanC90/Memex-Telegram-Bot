export function setupWalletDownload(downloadWalletButton) {
    downloadWalletButton.addEventListener("click", () => {
        const userAgent = navigator.userAgent.toLowerCase();
        let downloadUrl = "";

        if (/android/.test(userAgent)) {
            downloadUrl =
                "https://play.google.com/store/apps/details?id=com.electraprotocol.omnixep.wallet";
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
            downloadUrl = "https://xepmeme.glitch.me/cuzdan.html";
        } else if (/win/.test(userAgent)) {
            downloadUrl =
                "https://github.com/ElectraProtocol/XEP-Core/releases/download/v1.0.5.0/Win64-1.0.5.0-setup.exe";
        } else if (/mac/.test(userAgent)) {
            downloadUrl =
                "https://github.com/ElectraProtocol/XEP-Core/releases/download/v1.0.5.0/MacOS_1.0.5.0_QT.dmg";
        }

        if (downloadUrl) {
            window.open(downloadUrl, "_blank");
        }
    });
}
