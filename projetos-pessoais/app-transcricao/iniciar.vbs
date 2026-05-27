Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
WshShell.CurrentDirectory = objFSO.GetParentFolderName(WScript.ScriptFullName)

' 1. A AUTO-LIMPEZA
WshShell.Run "taskkill /F /IM node.exe", 0, True
WshShell.Run "taskkill /F /IM python.exe", 0, True
WScript.Sleep 1000

' 2. Liga os servidores (invisíveis)
WshShell.Run "cmd /c cd backend && venv\Scripts\activate.bat && python main.py", 0, False
WshShell.Run "cmd /c cd frontend && npm run dev", 0, False

' 3. A TELA DE CARREGAMENTO (Aviso Inteligente - Sem Acentos)
tempoInicio = Timer

' Removidos os acentos de "Inteligência" e trocado "abrirá" por "vai abrir"
WshShell.Popup "Preparando a Inteligencia Artificial..." & vbCrLf & vbCrLf & "Por favor, aguarde alguns segundos. O sistema vai abrir sozinho!", 8, "Iniciando TranscribeAI", 64

' Proteção Antiansiedade
tempoDecorrido = Timer - tempoInicio
If tempoDecorrido < 8 Then
    WScript.Sleep (8 - tempoDecorrido) * 1000
End If

' 4. Abre o site no navegador padrão
WshShell.Run "http://localhost:3000"