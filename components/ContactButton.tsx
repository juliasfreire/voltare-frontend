'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface ContactButtonProps {
  colaboradorId: number | string;
  servicoId?: number | string;
  produtoId?: number | string;
  buttonText?: string;
  className?: string;
}

export default function ContactButton({ 
  colaboradorId, 
  servicoId, 
  produtoId, 
  buttonText = "Entrar em contato",
  className = ""
}: ContactButtonProps) {
  const router = useRouter();

  async function handleContact() {
    // Validação extra preventiva no Frontend
    if (!colaboradorId) {
      alert("Erro: Não foi possível identificar o vendedor deste produto.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversas`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          colaborador_id: colaboradorId, 
          servico_id: servicoId || null, 
          produto_id: produtoId || null 
        }),
      });

      if (!res.ok) throw new Error("Erro ao abrir conversa");

      const conv = await res.json();
      
      if (conv && conv.id) {
        router.push(`/chat/${conv.id}`);
      } else {
        throw new Error("Resposta do servidor inválida");
      }
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      alert("Não foi possível iniciar a conversa. Tente novamente.");
    }
  }

  // Se não houver ID do colaborador, desabilita visualmente o botão (opcional)
  const isInvalid = !colaboradorId;

  return (
    <button
      onClick={handleContact}
      disabled={isInvalid}
      className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow-sm ${
        isInvalid ? 'opacity-50 cursor-not-allowed filter grayscale' : ''
      } ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {buttonText}
    </button>
  );
}

