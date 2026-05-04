[Setup]
AppName=KS Production Client
AppVersion=1.0
AppPublisher=KS Production
AppPublisherURL=https://ksproduction.tg
DefaultDirName={autopf}\KS Production\Client
DefaultGroupName=KS Production
OutputDir=installer_output
OutputBaseFilename=KS_Client_Setup
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin
WizardStyle=modern
UninstallDisplayName=KS Production Client
UninstallDisplayIcon={app}\KS_Client.exe

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "Créer un raccourci sur le Bureau"; GroupDescription: "Icônes supplémentaires:"

[Files]
Source: "dist\KS_Production_Client\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\KS Production Client"; Filename: "{app}\KS_Client.exe"
Name: "{group}\Désinstaller KS Production Client"; Filename: "{uninstallexe}"
Name: "{userdesktop}\KS Production Client"; Filename: "{app}\KS_Client.exe"; Tasks: desktopicon

[Code]
var
  ServerIPPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  ServerIPPage := CreateInputQueryPage(wpSelectTasks,
    'Adresse du serveur',
    'Entrez l''adresse IP du PC serveur KS Production',
    'Cette adresse sera utilisée pour se connecter au serveur sur votre réseau local.');
  ServerIPPage.Add('Adresse IP du serveur (ex: 192.168.1.80):', False);
  ServerIPPage.Values[0] := '192.168.1.80';
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: string;
  IP: string;
begin
  if CurStep = ssPostInstall then
  begin
    IP := ServerIPPage.Values[0];
    if IP = '' then IP := '192.168.1.80';
    ConfigFile := ExpandConstant('{app}\server_config.ini');
    SaveStringToFile(ConfigFile,
      '[server]' + #13#10 +
      '# Adresse IP du PC serveur KS Production' + #13#10 +
      'ip   = ' + IP + #13#10 +
      'port = 5000' + #13#10,
      False);
  end;
end;

[Run]
Filename: "{app}\KS_Client.exe"; Description: "Lancer KS Production Client"; Flags: nowait postinstall skipifsilent
