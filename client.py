"""
KS Production — Client Desktop
Se connecte au serveur KS Production sur le réseau local.
"""
import sys
import os
import configparser
import webview

def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

def get_server_url():
    """Lire IP depuis server_config.ini ou arguments ligne de commande."""
    # Priorité : argument ligne de commande
    if len(sys.argv) > 1:
        ip   = sys.argv[1]
        port = sys.argv[2] if len(sys.argv) > 2 else "5000"
        return f"http://{ip}:{port}"

    # Sinon lire le fichier de config
    config_path = os.path.join(os.path.dirname(sys.executable)
                               if getattr(sys, "frozen", False)
                               else os.path.abspath("."),
                               "server_config.ini")
    if os.path.exists(config_path):
        cfg = configparser.ConfigParser()
        cfg.read(config_path)
        ip   = cfg.get("server", "ip",   fallback="192.168.1.10")
        port = cfg.get("server", "port", fallback="5000")
        return f"http://{ip}:{port}"

    # Défaut
    return "http://192.168.1.10:5000"


def main():
    server_url = get_server_url()
    print(f"[CLIENT] Connexion à : {server_url}")

    window = webview.create_window(
        title    = "KS Production",
        url      = f"{server_url}/login",
        width    = 1280,
        height   = 800,
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
                window.set_title("KS Production")
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
    webview.start(debug=False)


if __name__ == "__main__":
    main()
