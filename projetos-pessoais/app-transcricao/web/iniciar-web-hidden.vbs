Option Explicit
Dim shell, fso, webDir, ps1, cmd, exitCode
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

webDir = fso.GetParentFolderName(WScript.ScriptFullName)
ps1 = webDir & "\iniciar-web-hidden.ps1"

If Not fso.FileExists(ps1) Then
  WScript.Echo "ERRO: iniciar-web-hidden.ps1 nao encontrado."
  WScript.Quit 1
End If

cmd = "powershell -NoProfile -ExecutionPolicy Bypass -File """ & ps1 & """ -WebDir """ & webDir & """"
exitCode = shell.Run(cmd, 0, True)
WScript.Quit exitCode
