"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  BarChart3,
  Check,
  Clock,
  Copy,
  Download,
  Globe,
  History,
  Mic,
  Moon,
  Square,
  Sun,
  Trash2,
  UploadCloud,
  Volume2,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import { useAppStore, type AudioFile, type HistoryItem } from "@/store";
import {
  copyToClipboard,
  downloadFile,
  formatDate,
  formatFileSize,
  formatTime,
  generateId,
  getAudioDuration,
  isAudioFile,
} from "@/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TranscriptionApp() {
  const store = useAppStore();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [text, setText] = useState("");
  const [rawText, setRawText] = useState("");
  const [copied, setCopied] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [difficultyMode, setDifficultyMode] = useState(false);
  const [processingLevel, setProcessingLevel] = useState<"normal" | "hard" | "experimental">("normal");

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("transcriptionHistory") || "[]") as HistoryItem[];
      const dark = localStorage.getItem("darkMode") === "true";
      if (dark !== store.darkMode) store.toggleDarkMode();
      history.forEach((item) => store.addToHistory(item));
    } catch {
      toast.error("Falha ao carregar histórico local");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("transcriptionHistory", JSON.stringify(store.history));
  }, [store.history]);

  useEffect(() => {
    localStorage.setItem("darkMode", String(store.darkMode));
    document.documentElement.classList.toggle("dark", store.darkMode);
  }, [store.darkMode]);

  const loadAudio = async (file: File) => {
    if (!isAudioFile(file)) {
      toast.error("Selecione um arquivo de áudio válido");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Arquivo acima de 500MB");
      return;
    }

    const duration = await getAudioDuration(file);
    const audioFile: AudioFile = {
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      duration,
      url: URL.createObjectURL(file),
    };

    store.setCurrentAudio(audioFile);
    store.setAudioURL(audioFile.url);
    store.setCurrentTranscription(null);
    setText("");
    setRawText("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `gravacao_${Date.now()}.webm`, { type: "audio/webm" });
        await loadAudio(file);
      };

      recorder.start();
      store.setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((v) => v + 1), 1000);
    } catch {
      toast.error("Não foi possível acessar o microfone");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !store.isRecording) return;
    mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    store.setIsRecording(false);
  };

  const transcribe = async () => {
    if (!store.currentAudio) return;
    store.setIsProcessing(true);
    store.setProcessingProgress(10);

    const formData = new FormData();
    formData.append("file", store.currentAudio.file);

    try {
      const response = await axios.post(`${API_URL}/transcribe`, formData, {
        params: {
          language: "pt",
          enhance_audio: true,
          difficulty_mode: difficultyMode,
          processing_level: processingLevel,
        },
        onUploadProgress: (e) => {
          const progress = Math.round(((e.loaded || 0) / (e.total || 1)) * 70);
          store.setProcessingProgress(Math.min(80, 10 + progress));
        },
      });

      const result = response.data;
      store.setCurrentTranscription({
        id: result.job_id || generateId(),
        text: result.text,
        language: result.language || "pt",
        duration: result.duration || store.currentAudio.duration,
        confidence: result.confidence || 0.75,
        timestamp: new Date(),
        status: "completed",
        segments: result.segments || [],
      });

      const item: HistoryItem = {
        id: generateId(),
        fileName: store.currentAudio.name,
        transcription: result.text,
        timestamp: Date.now(),
        duration: result.duration || store.currentAudio.duration,
        language: result.language || "pt",
        confidence: result.confidence || 0.75,
      };
      store.addToHistory(item);
      setText(result.text || "");
      setRawText(result.raw_text || result.text || "");
      store.setProcessingProgress(100);
      toast.success("Transcrição concluída");
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const backendMessage =
        data?.detail || data?.message || error?.message || "Erro ao transcrever";
      console.error("Erro de transcrição", {
        status,
        data,
        url: `${API_URL}/transcribe`,
      });
      toast.error(`Erro ${status ?? "de rede"}: ${backendMessage}`);
    } finally {
      store.setIsProcessing(false);
      setTimeout(() => store.setProcessingProgress(0), 500);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">TranscribeAI</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Transcrição PT-BR com pipeline para áudio difícil</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<History size={18} />} onClick={() => store.toggleHistory()} />
            <Button variant="ghost" size="sm" icon={store.darkMode ? <Sun size={18} /> : <Moon size={18} />} onClick={() => store.toggleDarkMode()} />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-4">
          <section className="space-y-4 lg:col-span-3">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 hover:border-indigo-400 dark:border-slate-600 dark:bg-slate-800">
                <UploadCloud className="mb-3 h-10 w-10 text-slate-400" />
                <span className="text-center text-sm">Upload de áudio (MP3/WAV/OGG/M4A/WebM)</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".mp3,.wav,.ogg,.m4a,.webm,audio/*"
                  onChange={(e) => e.target.files?.[0] && loadAudio(e.target.files[0])}
                />
              </label>

              <button
                className={`rounded-2xl border-2 p-8 font-semibold ${store.isRecording ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950" : "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950"}`}
                onClick={store.isRecording ? stopRecording : startRecording}
              >
                {store.isRecording ? <Square className="mx-auto mb-3 h-10 w-10" /> : <Mic className="mx-auto mb-3 h-10 w-10" />}
                {store.isRecording ? `Parar (${formatTime(recordingSeconds)})` : "Gravar microfone"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-sm">Modo áudio difícil (ruído, eco, fala rápida)</div>
              <button
                onClick={() => setDifficultyMode((v) => !v)}
                className={`rounded-full px-3 py-1 text-sm ${difficultyMode ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700"}`}
              >
                {difficultyMode ? "Ativo" : "Inativo"}
              </button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-sm">Nível de limpeza</div>
              <select
                value={processingLevel}
                onChange={(e) => setProcessingLevel(e.target.value as "normal" | "hard" | "experimental")}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="normal">Normal (conservador)</option>
                <option value="hard">Áudio difícil (moderado)</option>
                <option value="experimental">Experimental (agressivo)</option>
              </select>
            </div>

            {store.currentAudio && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{store.currentAudio.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(store.currentAudio.size)} • {formatTime(store.currentAudio.duration)}</p>
                  </div>
                  <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={() => store.setCurrentAudio(null)} />
                </div>
                <audio controls className="w-full" src={store.audioURL || undefined} />
              </div>
            )}

            {store.currentAudio && (
              <Button fullWidth size="lg" loading={store.isProcessing} onClick={transcribe}>
                {store.isProcessing ? "Transcrevendo..." : "Transcrever agora"}
              </Button>
            )}

            {store.isProcessing && (
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div className="h-full bg-indigo-600" animate={{ width: `${store.processingProgress}%` }} />
              </div>
            )}

            {store.currentTranscription && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                  <Check className="text-green-600" size={18} />
                  <span>Concluída</span>
                  <span className="text-slate-400">•</span>
                  <span className="inline-flex items-center gap-1"><Globe size={14} />{store.currentTranscription.language.toUpperCase()}</span>
                  <span className="inline-flex items-center gap-1"><BarChart3 size={14} />{Math.round(store.currentTranscription.confidence * 100)}%</span>
                </div>

                <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Transcrição bruta (modelo)</div>
                <textarea
                  className="h-56 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700"
                  value={rawText}
                  readOnly
                />
                <div className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-500">Transcrição corrigida (conservadora)</div>
                <textarea
                  className="h-56 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {Array.isArray((store.currentTranscription as any)?.segments) && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
                    Segmentos incertos:{" "}
                    {((store.currentTranscription as any).segments || [])
                      .filter((s: any) => s?.uncertain)
                      .map((s: any) => `[${Math.round((s.confidence || 0) * 100)}%] ${s.text}`)
                      .join(" | ") || "nenhum"}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Button
                    variant={copied ? "success" : "secondary"}
                    onClick={async () => {
                      if (await copyToClipboard(text)) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }
                    }}
                    icon={<Copy size={16} />}
                  >
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button variant="secondary" onClick={() => downloadFile(text, `transcricao_${Date.now()}.txt`)} icon={<Download size={16} />}>TXT</Button>
                  <Button variant="secondary" onClick={() => downloadFile(text, `transcricao_${Date.now()}.txt`)} icon={<Download size={16} />}>Baixar</Button>
                </div>
              </div>
            )}

            {!store.currentAudio && !store.currentTranscription && (
              <div className="py-10 text-center text-slate-500">
                <Volume2 className="mx-auto mb-3 h-10 w-10" />
                Envie ou grave um áudio para começar
              </div>
            )}
          </section>

          <aside className={`${store.showHistory ? "block" : "hidden"} rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 lg:block`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Histórico</h2>
              <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={() => store.toggleHistory()} />
            </div>

            <div className="space-y-2">
              {store.history.length === 0 && <p className="text-sm text-slate-500">Sem transcrições ainda</p>}
              {store.history.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <p className="truncate text-sm font-medium">{item.fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(item.timestamp)}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Clock size={12} />{formatTime(item.duration)}</span>
                    <span>{Math.round(item.confidence * 100)}%</span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => {
                        setText(item.transcription);
                        store.setCurrentTranscription({
                          id: item.id,
                          text: item.transcription,
                          language: item.language,
                          duration: item.duration,
                          confidence: item.confidence,
                          timestamp: new Date(item.timestamp),
                          status: "completed",
                        });
                      }}
                    >
                      Abrir
                    </Button>
                    <Button size="xs" variant="ghost" icon={<Trash2 size={12} />} onClick={() => store.deleteFromHistory(item.id)} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

