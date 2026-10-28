
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Zap,
    LogOut,
    BriefcaseBusiness,
    ShoppingCart,
    MessageCircle,
    UserCircle,
    Heart,
    Briefcase,
} from "lucide-react";

type Servico = {
    id?: number | string;
    nome?: string;
    titulo?: string;
    descricao?: string;
    experiencia?: string;
    categoria?: string;
    nomeColaborador?: string;
    nomeProfissional?: string;
    colaborador?: string | {
        nome?: string;
        username?: string;
    };
};

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

function extrairLista(dados: unknown): Servico[] {
    if (Array.isArray(dados)) {
        return dados as Servico[];
    }

    if (dados && typeof dados === "object") {
        const objeto = dados as Record<string, unknown>;
        const itens =
            objeto.content ??
            objeto.servicos ??
            objeto.data;

        if (Array.isArray(itens)) {
            return itens as Servico[];
        }
    }

    return [];
}

function nomeDoColaborador(servico: Servico): string {
    if (typeof servico.colaborador === "string") {
        return servico.colaborador;
    }

    return (
        servico.colaborador?.nome ||
        servico.colaborador?.username ||
        servico.nomeColaborador ||
        servico.nomeProfissional ||
        "Colaborador"
    );
}

export default function ClientePage() {
    const router = useRouter();

    const [servicos, setServicos] = useState<Servico[]>([]);
    const [favoritos, setFavoritos] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [atualizar, setAtualizar] = useState(0);
    const [ano, setAno] = useState<number | null>(null);

    const abas = [
        {
            nome: "Profissionais",
            Icon: BriefcaseBusiness,
            rota: "/cliente",
            ativo: true,
        },
        {
            nome: "Loja",
            Icon: ShoppingCart,
            rota: "/cliente/loja",
            ativo: false,
        },
        {
            nome: "Mensagens",
            Icon: MessageCircle,
            rota: "/cliente/mensagens",
            ativo: false,
        },
        {
            nome: "Perfil",
            Icon: UserCircle,
            rota: "/cliente/perfil",
            ativo: false,
        },
    ];

    useEffect(() => {
        const controller = new AbortController();

        async function carregarServicos() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await fetch(`${API_URL}/servicos`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!resposta.ok) {
                    throw new Error(`Erro HTTP ${resposta.status}`);
                }

                const dados: unknown = await resposta.json();
                setServicos(extrairLista(dados));
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error("Erro ao carregar serviços:", error);

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os serviços."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        carregarServicos();

        return () => controller.abort();
    }, [atualizar]);

    useEffect(() => {
        setAno(new Date().getFullYear());
    }, []);

    function alternarFavorito(chave: string) {
        setFavoritos((atuais) =>
            atuais.includes(chave)
                ? atuais.filter((item) => item !== chave)
                : [...atuais, chave]
        );
    }

    return (
        <main className="min-h-screen bg-sky-50 text-slate-800">
            {/* Cabeçalho */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white px-5 py-4 shadow-sm sm:px-10">
                <button
                    type="button"
                    onClick={() => router.push("/cliente")}
                    aria-label="Página inicial do cliente"
                    className="flex items-center gap-3"
                >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200">
                        <Zap className="h-7 w-7 fill-amber-300 text-amber-950" />
                    </span>

                    <span className="text-xl font-bold text-cyan-900 sm:text-2xl">
                        EletroConnect
                    </span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 sm:text-base">
                        Olá, Cliente
                    </span>

                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        aria-label="Sair da conta"
                        title="Sair"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-900"
                    >
                        <LogOut className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-10">
                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
                    {/* Navegação */}
                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
                        {abas.map(({ nome, Icon, rota, ativo }) => (
                            <button
                                key={nome}
                                type="button"
                                onClick={() => router.push(rota)}
                                aria-current={ativo ? "page" : undefined}
                                className={`flex min-h-[70px] items-center justify-center gap-2 px-3 py-4 text-sm transition sm:text-base ${
                                    ativo
                                        ? "bg-sky-200 font-semibold text-cyan-900"
                                        : "text-slate-600 hover:bg-sky-50"
                                }`}
                            >
                                <Icon className="h-6 w-6 shrink-0" />
                                {nome}
                            </button>
                        ))}
                    </nav>

                    {/* Lista de serviços publicados */}
                    <section className="bg-slate-50/70 px-4 py-7 sm:px-8 sm:py-9">
                        <p className="text-sm font-medium text-cyan-900">
                            Rede profissional
                        </p>

                        <h1 className="mb-7 mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                            Serviços dos colaboradores
                        </h1>

                        {carregando ? (
                            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                                <p className="text-slate-600">
                                    Carregando serviços...
                                </p>
                            </div>
                        ) : erro ? (
                            <div className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Não foi possível carregar os serviços
                                </h2>

                                <p className="mt-3 break-words text-sm text-red-700">
                                    {erro}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setAtualizar((n) => n + 1)}
                                    className="mt-5 rounded-lg bg-cyan-950 px-6 py-3 font-semibold text-white transition hover:bg-cyan-900"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : servicos.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                                <BriefcaseBusiness className="mx-auto mb-4 h-12 w-12 text-sky-700" />

                                <h2 className="text-xl font-bold text-slate-900">
                                    Nenhum serviço publicado
                                </h2>

                                <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
                                    Quando os colaboradores publicarem serviços,
                                    eles aparecerão aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 lg:grid-cols-2">
                                {servicos.map((servico, indice) => {
                                    const chave = String(
                                        servico.id ?? `servico-${indice}`
                                    );
                                    const favorito = favoritos.includes(chave);
                                    const autor = nomeDoColaborador(servico);
                                    const titulo =
                                        servico.titulo ||
                                        servico.nome ||
                                        "Serviço";

                                    return (
                                        <article
                                            key={chave}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-200 text-xl font-bold text-cyan-900">
                                                        {autor.trim().charAt(0).toUpperCase() || "C"}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h2 className="break-words font-bold text-slate-950">
                                                            {autor}
                                                        </h2>
                                                        <p className="text-sm text-slate-500">
                                                            Colaborador
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => alternarFavorito(chave)}
                                                    aria-label={
                                                        favorito
                                                            ? "Remover dos favoritos"
                                                            : "Adicionar aos favoritos"
                                                    }
                                                    aria-pressed={favorito}
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 transition hover:bg-rose-50"
                                                >
                                                    <Heart
                                                        className={`h-5 w-5 ${
                                                            favorito
                                                                ? "fill-red-500 text-red-500"
                                                                : "text-slate-400"
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            <h3 className="mt-5 break-words text-lg font-semibold text-cyan-950">
                                                {titulo}
                                            </h3>

                                            {servico.categoria && (
                                                <p className="mt-1 text-sm text-cyan-800">
                                                    {servico.categoria}
                                                </p>
                                            )}

                                            <p className="mt-3 whitespace-pre-line break-words leading-7 text-slate-600">
                                                {servico.descricao || "Sem descrição."}
                                            </p>

                                            {servico.experiencia && (
                                                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                                                        <Briefcase className="h-5 w-5 text-slate-500" />
                                                        Experiência
                                                    </h4>

                                                    <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                                                        {servico.experiencia}
                                                    </p>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => router.push("/cliente/mensagens")}
                                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-amber-200 px-5 py-3 font-semibold text-amber-950 transition hover:bg-amber-300"
                                            >
                                                <MessageCircle className="h-5 w-5" />
                                                Conversar
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                <footer className="py-6 text-center text-sm text-slate-500">
                    © {ano ?? ""} EletroConnect. Todos os direitos reservados.
                </footer>
            </div>
        </main>
    );
}
