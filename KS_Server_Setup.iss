[Setup]
AppName=KS Production Serveur
AppVersion=1.0
AppPublisher=KS Production
AppPublisherURL=https://ksproduction.tg
DefaultDirName={autopf}\KS Production\Serveur
DefaultGroupName=KS Production
OutputDir=installer_output
OutputBaseFilename=KS_Server_Setup
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin
WizardStyle=modern
UninstallDisplayName=KS Production Serveur
UninstallDisplayIcon={app}\KS_Server.exe

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "Créer un raccourci sur le Bureau"; GroupDescription: "Icônes supplémentaires:"
Name: "firewallrule"; Description: "Ouvrir le port 5000 dans le pare-feu Windows (requis pour le réseau LAN)"; GroupDescription: "Réseau:"

[Files]
Source: "dist\KS_Production_Server\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\KS Production Serveur"; Filename: "{app}\KS_Server.exe"
Name: "{group}\Désinstaller KS Production Serveur"; Filename: "{uninstallexe}"
Name: "{userdesktop}\KS Production Serveur"; Filename: "{app}\KS_Server.exe"; Tasks: desktopicon

[Run]
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""KS Production"" dir=in action=allow protocol=TCP localport=5000"; Flags: runhidden; Tasks: firewallrule
Filename: "{app}\KS_Server.exe"; Description: "Lancer KS Production Serveur"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""KS Production"""; Flags: runhidden
