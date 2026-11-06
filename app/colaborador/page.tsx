
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Zap,
    LogOut,
    LayoutGrid,
    ShoppingCart,
    MessageCircle,
    UserCircle,
    BriefcaseBusiness,
    Package,
    Plus,
    X,
} from "lucide-react";

type Servico = {
    id?: number | string;
    nome?: string;
    titulo?: string;
    descricao?: string;
    experiencia?: string;
    prestador_nome?: string;
    nomeColaborador?: string;
    nomeProfissional?: string;
    colaborador?: string | { nome?: string; username?: string };
};

const API = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

function lista(dados: unknown): Servico[] {
    if (Array.isArray(dados)) return dados as Servico[];

    if (dados && typeof dados === "object") {
        const d = dados as Record<string, unknown>;
        const itens = d.content ?? d.servicos ?? d.data;

        if (Array.isArray(itens)) return itens as Servico[];
    }

    return [];
}

function autor(s: Servico): string {
    if (typeof s.colaborador === "string") return s.colaborador;

    return (
        s.prestador_nome ||
        s.colaborador?.nome ||
        s.colaborador?.username ||
        s.nomeColaborador ||
        s.nomeProfissional ||
        "Colaborador"
    );
}

export default function ColaboradorPage() {
    const router = useRouter();

    const [servicos, setServicos] = useState<Servico[]>([]);
    const [meus, setMeus] = useState<Servico[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [atualizar, setAtualizar] = useState(0);

    const [modal, setModal] = useState(false);
    const [nome, setNome] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [descricao, setDescricao] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");

    useEffect(() => {
        const ctrl = new AbortController();

        async function carregar() {
            try {
                setCarregando(true);
                setErro("");

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    throw new Error(
                        "Você precisa estar logado para acessar esta página."
                    );
                }

                const headersAuth = {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                };

                const r = await fetch(`${API}/servicos`, {
                    headers: headersAuth,
                    cache: "no-store",
                    signal: ctrl.signal,
                });

                if (!r.ok) {
                    if (r.status === 401 || r.status === 403) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("usuarioLogado");
                        router.push("/login");

                        throw new Error(
                            "Sessão expirada. Faça login novamente."
                        );
                    }

                    throw new Error(`Erro HTTP ${r.status}`);
                }

                setServicos(lista(await r.json()));

                try {
                    const resposta = await fetch(`${API}/servicos/meus`, {
                        headers: headersAuth,
                        cache: "no-store",
                        signal: ctrl.signal,
                    });

                    if (resposta.ok) {
                        setMeus(lista(await resposta.json()));
                    }
                } catch {
                    // Trata silenciosamente se a rota falhar.
                }
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;

                setErro(
                    e instanceof Error
                        ? e.message
                        : "Não foi possível carregar os serviços."
                );
            } finally {
                if (!ctrl.signal.aborted) setCarregando(false);
            }
        }

        carregar();

        return () => ctrl.abort();
    }, [atualizar, router]);

    async function cadastrar(e:any) {
        e.preventDefault();
        setSalvando(true);
        setErroCadastro("");

        try {
            const token = localStorage.getItem("token");

            const r = await fetch(`${API}/servicos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {}),
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    titulo: nome.trim(),
                    experiencia: experiencia.trim(),
                    descricao: descricao.trim(),
                }),
            });

            if (!r.ok) {
                const dadosErro = await r.json().catch(() => ({}));

                throw new Error(
                    dadosErro.mensagem ||
                    dadosErro.message ||
                    `Erro HTTP ${r.status}`
                );
            }

            setModal(false);
            setNome("");
            setExperiencia("");
            setDescricao("");
            setAtualizar((n) => n + 1);
        } catch (e) {
            setErroCadastro(
                e instanceof Error
                    ? e.message
                    : "Erro ao cadastrar serviço."
            );
        } finally {
            setSalvando(false);
        }
    }

    const abas = [
        {
            nome: "Início",
            Icon: LayoutGrid,
            acao: () => router.push("/colaborador"),
        },
        {
            nome: "Loja",
            Icon: ShoppingCart,
            acao: () => router.push("/colaborador/loja"),
        },
        {
            nome: "Mensagens",
            Icon: MessageCircle,
            acao: () => window.alert("Mensagens em breve."),
        },
        {
            nome: "Perfil",
            Icon: UserCircle,
            acao: () => router.push("/colaborador/perfil"),
        },
    ];

    return (
        <main className="min-h-screen overflow-x-hidden bg-sky-50 text-slate-800">

            <header className="flex items-center justify-between gap-3 border-b border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4 lg:px-10">
                <button
                    onClick={() => router.push("/colaborador")}
                    className="flex min-w-0 items-center gap-2 sm:gap-3"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 sm:h-12 sm:w-12">
                        <Zap className="h-6 w-6 fill-amber-300 text-amber-950 sm:h-7 sm:w-7" />
                    </span>

                    <span className="truncate text-lg font-bold text-cyan-900 sm:text-2xl">
                        EletroConnect
                    </span>
                </button>

                <button
                    onClick={() => router.push("/login")}
                    aria-label="Sair"
                    className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                >
                    <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
            </header>

            <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">

                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">

                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
                        {abas.map(({ nome: aba, Icon, acao }, i) => (
                            <button
                                key={aba}
                                onClick={acao}
                                className={`flex min-h-14 items-center justify-center gap-2 px-2 py-3 text-sm transition sm:min-h-16 sm:px-3 sm:py-4 sm:text-base ${
                                    i === 0
                                        ? "bg-sky-200 font-semibold text-cyan-900"
                                        : "text-slate-600 hover:bg-sky-50"
                                }`}
                            >
                                <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span>{aba}</span>
                            </button>
                        ))}
                    </nav>

                    <section className="bg-slate-50/70 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
                        <div className="mx-auto max-w-6xl">

                            <div className="flex flex-col gap-5 rounded-2xl bg-sky-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:rounded-3xl sm:p-8 lg:p-10">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-cyan-900 sm:text-base">
                                        Painel profissional
                                    </p>

                                    <h1 className="mt-2 text-2xl font-bold text-cyan-950 sm:text-3xl lg:text-4xl">
                                        Bem-vindo!
                                    </h1>

                                    <p className="mt-3 text-sm leading-6 text-sky-900 sm:max-w-2xl sm:text-base sm:leading-7 lg:text-lg">
                                        Conheça outros colaboradores e publique
                                        um novo serviço ou produto.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setErroCadastro("");
                                        setModal(true);
                                    }}
                                    aria-label="Publicar serviço"
                                    className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-200 text-amber-950 shadow-md transition hover:bg-amber-300 sm:h-14 sm:w-14 sm:rounded-full"
                                >
                                    <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                                    <span className="font-semibold sm:hidden">
                                        Publicar serviço
                                    </span>
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                                {[
                                    {
                                        Icon: BriefcaseBusiness,
                                        valor: meus.length,
                                        texto: "Serviços publicados",
                                    },
                                    {
                                        Icon: Package,
                                        valor: 0,
                                        texto: "Produtos anunciados",
                                    },
                                    {
                                        Icon: MessageCircle,
                                        valor: 0,
                                        texto: "Conversas ativas",
                                    },
                                ].map(({ Icon, valor, texto }) => (
                                    <article
                                        key={texto}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                                    >
                                        <Icon className="h-6 w-6 text-cyan-900 sm:h-7 sm:w-7" />

                                        <p className="mt-3 text-3xl font-bold sm:mt-5 sm:text-4xl">
                                            {valor}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                            {texto}
                                        </p>
                                    </article>
                                ))}
                            </div>

                            <section className="mt-8 sm:mt-12">
                                <p className="text-sm font-medium text-cyan-900">
                                    Rede profissional
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl lg:text-3xl">
                                    Serviços de outros colaboradores
                                </h2>

                                {carregando ? (
                                    <p className="py-10 text-center text-sm text-slate-500 sm:text-base">
                                        Carregando serviços...
                                    </p>
                                ) : erro ? (
                                    <div className="mt-5 rounded-xl bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
                                        <p className="wrap-break-word text-sm text-red-700 sm:text-base">
                                            {erro}
                                        </p>

                                        <button
                                            onClick={() =>
                                                setAtualizar((n) => n + 1)
                                            }
                                            className="mt-4 w-full rounded-lg bg-cyan-950 px-5 py-3 text-sm text-white transition hover:bg-cyan-900 sm:w-auto"
                                        >
                                            Tentar novamente
                                        </button>
                                    </div>
                                ) : servicos.length === 0 ? (
                                    <p className="mt-5 rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm sm:mt-6 sm:p-8 sm:text-base">
                                        Nenhum serviço publicado ainda.
                                    </p>
                                ) : (
                                    <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">
                                        {servicos.map((s, i) => (
                                            <article
                                                key={s.id ?? i}
                                                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
                                            >
                                                <h3 className="wrap-break-word font-bold text-slate-950">
                                                    {autor(s)}
                                                </h3>

                                                <h4 className="mt-3 wrap-break-word text-base font-semibold text-cyan-950 sm:text-lg">
                                                    {s.titulo || s.nome || "Serviço"}
                                                </h4>

                                                <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                                                    {s.descricao || "Sem descrição."}
                                                </p>

                                                {s.experiencia && (
                                                    <p className="mt-3 wrap-break-word text-sm leading-6 text-slate-600">
                                                        <strong>Experiência:</strong>{" "}
                                                        {s.experiencia}
                                                    </p>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </section>
                </div>

                <footer className="px-2 py-5 text-center text-xs text-slate-500 sm:py-6 sm:text-sm">
                    EletroConnect — Painel do colaborador
                </footer>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-5">
                    <section className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6 lg:p-8">

                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-cyan-950 sm:text-2xl">
                                Publicar serviço
                            </h2>

                            <button
                                onClick={() => setModal(false)}
                                aria-label="Fechar"
                                className="shrink-0 rounded-lg p-2 transition hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={cadastrar} className="mt-5 space-y-4 sm:mt-6">

                            <div>
                                <label
                                    htmlFor="nome"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Nome do serviço
                                </label>

                                <input
                                    id="nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    required
                                    maxLength={120}
                                    placeholder="Ex.: Instalação elétrica"
                                    className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:px-4 sm:text-base"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="experiencia"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Experiência
                                </label>

                                <textarea
                                    id="experiencia"
                                    value={experiencia}
                                    onChange={(e) => setExperiencia(e.target.value)}
                                    maxLength={1000}
                                    rows={3}
                                    placeholder="Descreva sua experiência profissional..."
                                    className="w-full min-w-0 resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:px-4 sm:text-base"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="descricao"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Descrição do serviço
                                </label>

                                <textarea
                                    id="descricao"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    required
                                    maxLength={2000}
                                    rows={4}
                                    placeholder="Descreva o serviço oferecido..."
                                    className="w-full min-w-0 resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:px-4 sm:text-base"
                                />
                            </div>

                            {erroCadastro && (
                                <p
                                    role="alert"
                                    className="wrap-break-word text-sm text-red-700"
                                >
                                    {erroCadastro}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={salvando}
                                className="w-full rounded-xl bg-cyan-950 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                            >
                                {salvando
                                    ? "Publicando..."
                                    : "Publicar serviço"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
