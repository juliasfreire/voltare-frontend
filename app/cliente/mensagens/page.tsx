
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  ChevronRight,
  User,
} from "lucide-react";

type Usuario = {
  id?: number | string;
  nome?: string;
  email?: string;
  tipo?: string;
};

type Conversation = {
  id: number;
  cliente_id?: number;
  colaborador_id?: number;
  client_id?: number;
  provider_id?: number;
  cliente_nome?: string;
  colaborador_nome?: string;
  ultima_mensagem?: string;
  ultima_texto?: string;
  updated_at?: string;
  servico_titulo?: string;
  produto_nome?: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

export default function ClienteMensagensPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
      }
    }

    async function carregarConversas() {
      try {
        const resposta = await fetch(`${API_URL}/conversas`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (resposta.status === 401 || resposta.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuarioLogado");
          router.push("/login");
          return;
        }

        if (!resposta.ok) {
          throw new Error(`Erro no servidor: Status ${resposta.status}`);
        }

        const data = await resposta.json();

        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          console.error("Formato inesperado:", data);
          setConversations([]);
        }
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarConversas();
  }, [router]);

  function nomeDoColaborador(conv: Conversation) {
    return conv.colaborador_nome || "Colaborador";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Carregando conversas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-cyan-100 p-3 rounded-xl text-cyan-700">
            <MessageSquare className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Minhas mensagens
            </h1>
            <p className="text-sm text-slate-500">
              Converse com os colaboradores da Voltare.
            </p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
            <div className="bg-cyan-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-cyan-600" />
            </div>

            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Nenhuma conversa ainda
            </h2>

            <p className="text-sm text-slate-500">
              Você ainda não iniciou nenhuma conversa com um colaborador.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const ultimaAtividade =
                conv.updated_at || conv.ultima_mensagem;

              return (
                <div
                  key={conv.id}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-cyan-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="bg-cyan-50 p-3 rounded-full text-cyan-700 shrink-0">
                      <User className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {nomeDoColaborador(conv)}
                      </h3>

                      {conv.ultima_texto && (
                        <p className="text-sm text-slate-500 truncate mt-1">
                          {conv.ultima_texto}
                        </p>
                      )}

                      {ultimaAtividade && (
                        <p className="text-xs text-slate-400 mt-1">
                          Última atividade:{" "}
                          {new Date(ultimaAtividade).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 ml-3" />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
