"use client";
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";

// Correção: Tipagem com letras minúsculas (primitivos do TS)
type Mensagem = { 
  id: number; 
  conversa_id: number; 
  remetente_id: number; // Padronizado aqui
  texto: string; 
  criado_em: string; 
}

export default function useChat(conversaId: number, token: string) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  useEffect(() => {
    if (!token || !conversaId) return; // Evita rodar sem token válido

    const socket = getSocket(token);

    // Buscar histórico do backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversas/${conversaId}/mensagens`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setMensagens)
      .catch((e) => console.error("Erro ao buscar mensagens:", e));

    // Conecta e entra na sala
    const join = () => socket.emit("conversa:join", { conversaId });
    
    socket.on("connect", join);

    if (!socket.connected) {
      socket.connect();
    } else {
      join();
    }

    // Ouvir mensagens em tempo real
    const onNew = (msg: Mensagem) => {
      if (msg.conversa_id !== conversaId) return;
      setMensagens((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    };

    socket.on("mensagem:new", onNew);

    // Cleanup completo para evitar vazamento de memória e duplicação
    return () => {
      socket.emit("conversa:leave", { conversaId });
      socket.off("connect", join);
      socket.off("mensagem:new", onNew);
    };
  }, [conversaId, token]);

  const enviar = useCallback(
    (texto: string) => {
      if (!token) return;
      getSocket(token).emit("mensagem:send", { conversaId, texto }, (res: any) => {
        if (!res?.ok) {
          console.error(res?.error || "Erro ao enviar mensagem");
        }
      });
    },
    [conversaId, token]
  );

  return { mensagens, enviar };
}
