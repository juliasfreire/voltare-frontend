
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    ChevronRight,
    UserCheck,
} from "lucide-react";

type Usuario = {
    id?: number | string;
    nome?: string;
    email?: string;
    tipo?: string;
};

type Conversation = {
    id: number;
    cliente_id?: number | string;
    colaborador_id?: number | string;

    // Compatibilidade com nomes antigos dos campos
    client_id?: number | string;
    provider_id?: number | string;

    cliente_nome?: string;
    colaborador_nome?: string;

    updated_at?: string;
    ultima_texto?: string;
    servico_titulo?: string;
    produto_nome?: string;
};

const API = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

export default function ColaboradorMensagensPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const usuarioSalvo = localStorage.getItem("usuarioLogado");

        if (!token) {
            router.push("/login");
            return;
        }

        if (usuarioSalvo) {
            try {
                setUsuario(JSON.parse(usuarioSalvo) as Usuario);
            } catch (e) {
                console.error("Erro ao recuperar usuário:", e);
            }
        }

        async function carregarConversas() {
            try {
                setLoading(true);
                setErro("");

                const resposta = await fetch(`${API}/conversas`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                if (!resposta.ok) {
                    if (resposta.status === 401 || resposta.status === 403) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("usuarioLogado");
                        router.push("/login");
                        return;
                    }

                    throw new Error(
                        `Não foi possível carregar as conversas. Erro ${resposta.status}.`
                    );
                }

                const dados = await resposta.json();

                if (Array.isArray(dados)) {
                    setConversations(dados);
                } else {
                    setConversations([]);
                }
            } catch (e) {
                console.error("Erro ao carregar conversas:", e);

                setErro(
                    e instanceof Error
                        ? e.message
                        : "Erro ao carregar as conversas."
                );
            } finally {
                setLoading(false);
            }
        }

        carregarConversas();
    }, [router]);

    // Identifica o nome da pessoa que está do outro lado da conversa.
    function nomeDaPessoa(conv: Conversation): string {
        const tipo = usuario?.tipo?.toLowerCase();

        // Quando o usuário logado é colaborador, mostra o cliente.
        if (tipo === "colaborador" || tipo === "profissional") {
            return conv.cliente_nome || "Cliente";
        }

        // Quando o usuário logado é cliente, mostra o colaborador.
        if (tipo === "cliente") {
            return conv.colaborador_nome || "Colaborador";
        }

        // Alternativa caso o tipo não esteja disponível.
        const idUsuario = String(usuario?.id ?? "");
        const idCliente = String(conv.cliente_id ?? conv.client_id ?? "");
        const idColaborador = String(
            conv.colaborador_id ?? conv.provider_id ?? ""
        );

        if (idUsuario && idUsuario === idCliente) {
            return conv.colaborador_nome || "Colaborador";
        }

        if (idUsuario && idUsuario === idColaborador) {
            return conv.cliente_nome || "Cliente";
        }

        return conv.cliente_nome || conv.colaborador_nome || "Conversa";
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sky-50 p-6">
                <p className="text-center text-slate-500">
                    Carregando conversas...
                </p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-sky-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-4xl">

                <div className="mb-6 flex items-center gap-3">
                    <MessageSquare className="h-7 w-7 text-cyan-900" />

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Minhas mensagens
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Olá, {usuario?.nome || "Colaborador"}
                        </p>
                    </div>
                </div>

                {erro ? (
                    <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
                        <p className="text-sm text-red-600">{erro}</p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-xl bg-cyan-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-900"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm">
                        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                        <p className="font-medium text-slate-700">
                            Nenhuma conversa ainda.
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                            Quando um cliente entrar em contato, a conversa aparecerá aqui.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                type="button"
                                onClick={() => router.push(`/chat/${conv.id}`)}
                                className="flex w-full items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white p-4 text-left shadow-sm transition hover:border-cyan-400 hover:shadow-md sm:p-5"
                            >
                                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                    <div className="shrink-0 rounded-full bg-sky-100 p-3 text-cyan-900">
                                        <UserCheck className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold text-slate-900">
                                            {nomeDaPessoa(conv)}
                                        </h3>

                                        {conv.ultima_texto && (
                                            <p className="mt-1 truncate text-sm text-slate-500">
                                                {conv.ultima_texto}
                                            </p>
                                        )}

                                        {conv.updated_at && (
                                            <p className="mt-1 text-xs text-slate-400">
                                                Última atividade:{" "}
                                                {new Date(
                                                    conv.updated_at
                                                ).toLocaleString("pt-BR")}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
