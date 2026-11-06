// app/colaborador/mensagens/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronRight, UserCheck } from 'lucide-react';

type Conversation = {
  id: number;
  client_id: number;
  provider_id: number;
  updated_at: string;
};

export default function ColaboradorMensagensPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar conversas:", err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando conversas do prestador/vendedor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">Atendimentos e Vendas (Colaborador)</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border shadow-sm">
          <p className="text-gray-500">Nenhum cliente entrou em contato ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => router.push(`/chat/${conv.id}`)}
              className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-500 transition"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Atendimento #{conv.id}</h3>
                  <p className="text-xs text-gray-400">Última atividade: {new Date(conv.updated_at).toLocaleString()}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}