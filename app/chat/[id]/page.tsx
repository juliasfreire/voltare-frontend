"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import useChat from "@/hooks/useChat";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";

function ChatScreen() {
  const params = useParams();
  const router = useRouter();
  const conversationId = Number(params.id);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    try {
      const payloadBase64 = storedToken.split(".")[1];
      const decoded = JSON.parse(atob(payloadBase64));
      setCurrentUserId(decoded.id || decoded.sub);
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
    }
  }, [router]);

  const { mensagens, enviar } = useChat(conversationId, token || "");

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    enviar(inputMessage);
    setInputMessage("");
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Carregando chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-3xl mx-auto border-x shadow-sm">
      {/* Cabeçalho do Chat */}
      <div className="flex items-center px-6 py-4 bg-white border-b shadow-sm">
        <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition" title="Voltar">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800">Chat da Conversa</h1>
            <p className="text-xs text-gray-400">ID: #{conversationId}</p>
          </div>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {mensagens.length === 0 ? (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-sm">Ainda não há mensagens aqui.</p>
            <p className="text-xs mt-1">Envie uma mensagem abaixo para iniciar a conversa!</p>
          </div>
        ) : (
          mensagens.map((msg) => {
            const isMe = msg.remetente_id === currentUserId; 
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                }`}>
                  {msg.texto}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.criado_em).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input de Envio de Mensagem */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2 items-center">
        <input 
          type="text" 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          placeholder="Digite sua mensagem..." 
          className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" 
        />
        <button type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center shadow-sm">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

// O Next.js exige que componentes que usam useParams fiquem dentro de um Suspense para renderização estática
export default function ChatScreenPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen text-gray-500">
        Carregando estrutura do chat...
      </div>
    }>
      <ChatScreen />
    </Suspense>
  );
}
