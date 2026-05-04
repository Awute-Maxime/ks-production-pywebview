"""
KS Production — Client Desktop
Se connecte au serveur KS Production sur le réseau local.
"""
import sys
import os
import re
import configparser
import webview

def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

_IP_RE = re.compile(r'^(\d{1,3}\.){3}\d{1,3}$|^localhost$|^127\.\d+\.\d+\.\d+$')

def _valider_ip(ip):
    return bool(_IP_RE.match(ip.strip()))

def get_server_url():
    """Lire IP depuis server_config.ini ou arguments ligne de commande."""
    # Priorité : argument ligne de commande
    if len(sys.argv) > 1:
        ip   = sys.argv[1]
        port = sys.argv[2] if len(sys.argv) > 2 else "5000"
        if not _valider_ip(ip):
            print(f"[CLIENT] IP invalide: {ip} — utilisation du defaut 127.0.0.1")
            ip = "127.0.0.1"
        return f"http://{ip}:{port}"

    # Sinon lire le fichier de config
    config_path = os.path.join(os.path.dirname(sys.executable)
                               if getattr(sys, "frozen", False)
                               else os.path.abspath("."),
                               "server_config.ini")
    if os.path.exists(config_path):
        cfg = configparser.ConfigParser()
        cfg.read(config_path)
        ip   = cfg.get("server", "ip",   fallback="127.0.0.1")
        port = cfg.get("server", "port", fallback="5000")
        if not _valider_ip(ip):
            print(f"[CLIENT] IP invalide dans server_config.ini: {ip} — utilisation du defaut 127.0.0.1")
            ip = "127.0.0.1"
        return f"http://{ip}:{port}"

    # Défaut
    return "http://127.0.0.1:5000"


def main():
    server_url = get_server_url()
    print(f"[CLIENT] Connexion à : {server_url}")

    # Fenêtre login : même taille que le serveur, centrée
    lw, lh = 460, 640
    lx, ly = 730, 220
    try:
        import ctypes
        user32 = ctypes.windll.user32
        user32.SetProcessDPIAware()
        sw = user32.GetSystemMetrics(0)
        sh = user32.GetSystemMetrics(1)
        lx = (sw - lw) // 2
        ly = (sh - lh) // 2
    except Exception:
        pass

    window = webview.create_window(
        title    = "KS Production — Client",
        url      = f"{server_url}/login",
        width    = lw,
        height   = lh,
        x        = lx,
        y        = ly,
        resizable= True,
        confirm_close = False,
    )

    state = {"connecte": False}

    def on_loaded():
        import time
        time.sleep(0.3)
        url = window.get_current_url() or ""
        if "/dashboard" in url or ("/login" not in url and url):
            if not state["connecte"]:
                state["connecte"] = True
                window.set_title("KS Production — Client")
                try:
                    import ctypes
                    user32 = ctypes.windll.user32
                    user32.SetProcessDPIAware()
                    w = user32.GetSystemMetrics(0)
                    h = user32.GetSystemMetrics(1)
                    window.resize(w, h)
                    window.move(0, 0)
                except Exception:
                    pass

    window.events.loaded += on_loaded
    import tempfile
    _client_storage = os.path.join(tempfile.gettempdir(), 'ks_production_client')
    os.makedirs(_client_storage, exist_ok=True)
    webview.start(debug=False, storage_path=_client_storage, private_mode=True)


if __name__ == "__main__":
    main()
