"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Zap, LogOut, LayoutGrid, ShoppingCart, MessageCircle,
    UserCircle, BriefcaseBusiness, Package, Plus, X,
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
        s.prestador_nome || // Mapeia o retorno do INNER JOIN do backend
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

                // --- 1. VERIFIQUE AQUI SE O TOKEN VEIO VAZIO ANTES DO FETCH ---
                if (!token) {
                    router.push("/login");
                    throw new Error("Você precisa estar logado para acessar esta página.");
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

                // --- 2. TRATE AQUI SE O BACKEND RETORNOU 401 OU 403 ---
                if (!r.ok) {
                    if (r.status === 401 || r.status === 403) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("usuarioLogado");
                        router.push("/login");
                        throw new Error("Sessão expirada. Faça login novamente.");
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
                    // Trata silenciosamente se a rota '/servicos/meus' falhar
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

    async function cadastrar(e: any) {
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
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    titulo: nome.trim(), // Garante compatibilidade se o backend esperar 'titulo'
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
                e instanceof Error ? e.message : "Erro ao cadastrar serviço."
            );
        } finally {
            setSalvando(false);
        }
    }

    const abas = [
        { nome: "Início", Icon: LayoutGrid, acao: () => router.push("/colaborador") },
        { nome: "Loja", Icon: ShoppingCart, acao: () => router.push("/colaborador/loja") },
        { nome: "Mensagens", Icon: MessageCircle, acao: () => window.alert("Mensagens em breve.") },
        { nome: "Perfil", Icon: UserCircle, acao: () => router.push("/colaborador/perfil") },
    ];
    
    return (
        <main className="min-h-screen bg-sky-50 text-slate-800">
            <header className="flex items-center justify-between border-b border-sky-100 bg-white px-5 py-4 shadow-sm sm:px-10">
                <button onClick={() => router.push("/colaborador")} className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200">
                        <Zap className="h-7 w-7 fill-amber-300 text-amber-950" />
                    </span>
                    <span className="text-xl font-bold text-cyan-900 sm:text-2xl">EletroConnect</span>
                </button>
                <button onClick={() => router.push("/login")} aria-label="Sair" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                    <LogOut className="h-6 w-6" />
                </button>
            </header>

            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8">
                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
                        {abas.map(({ nome: aba, Icon, acao }, i) => (
                            <button key={aba} onClick={acao} className={`flex min-h-17.5 items-center justify-center gap-2 px-3 py-4 ${i === 0 ? "bg-sky-200 font-semibold text-cyan-900" : "hover:bg-sky-50"}`}>
                                <Icon className="h-5 w-5" />{aba}
                            </button>
                        ))}
                    </nav>

                    <section className="bg-slate-50/70 px-4 py-7 sm:px-8">
                        <div className="mx-auto max-w-6xl">
                            <div className="flex items-center justify-between gap-5 rounded-3xl bg-sky-200 p-6 sm:p-10">
                                <div>
                                    <p className="font-semibold text-cyan-900">Painel profissional</p>
                                    <h1 className="mt-2 text-3xl font-bold text-cyan-950">Bem-vindo!</h1>
                                    <p className="mt-3 leading-7 text-sky-900 sm:text-lg">
                                        Conheça outros colaboradores e publique um novo serviço ou produto.
                                    </p>
                                </div>
                                <button onClick={() => { setErroCadastro(""); setModal(true); }} aria-label="Publicar serviço" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-950 shadow-md hover:bg-amber-300">
                                    <Plus className="h-8 w-8" />
                                </button>
                            </div>

                            <div className="mt-8 grid gap-5 sm:grid-cols-3">
                                {[
                                    { Icon: BriefcaseBusiness, valor: meus.length, texto: "Serviços publicados" },
                                    { Icon: Package, valor: 0, texto: "Produtos anunciados" },
                                    { Icon: MessageCircle, valor: 0, texto: "Conversas ativas" },
                                ].map(({ Icon, valor, texto }) => (
                                    <article key={texto} className="rounded-2xl border border-slate-200 bg-white p-6">
                                        <Icon className="h-7 w-7 text-cyan-900" />
                                        <p className="mt-5 text-4xl font-bold">{valor}</p>
                                        <p className="text-slate-500">{texto}</p>
                                    </article>
                                ))}
                            </div>

                            <section className="mt-12">
                                <p className="text-sm font-medium text-cyan-900">Rede profissional</p>
                                <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Serviços de outros colaboradores</h2>

                                {carregando ? (
                                    <p className="py-10 text-center text-slate-500">Carregando serviços...</p>
                                ) : erro ? (
                                    <div className="mt-6 rounded-xl bg-white p-6">
                                        <p className="text-red-700">{erro}</p>
                                        <button onClick={() => setAtualizar((n) => n + 1)} className="mt-4 rounded-lg bg-cyan-950 px-5 py-2 text-white">Tentar novamente</button>
                                    </div>
                                ) : servicos.length === 0 ? (
                                    <p className="mt-6 rounded-xl bg-white p-8 text-center text-slate-500">Nenhum serviço publicado ainda.</p>
                                ) : (
                                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                        {servicos.map((s, i) => (
                                            <article key={s.id ?? i} className="rounded-2xl border border-slate-200 bg-white p-6">
                                                <h3 className="font-bold text-slate-950">{autor(s)}</h3>
                                                <h4 className="mt-3 text-lg font-semibold text-cyan-950">{s.titulo || s.nome || "Serviço"}</h4>
                                                <p className="mt-3 leading-7 text-slate-600">{s.descricao || "Sem descrição."}</p>
                                                {s.experiencia && <p className="mt-3 text-sm text-slate-600"><strong>Experiência:</strong> {s.experiencia}</p>}
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </section>
                </div>
                <footer className="py-6 text-center text-sm text-slate-500">EletroConnect — Painel do colaborador</footer>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
                    <section className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-cyan-950">Publicar serviço</h2>
                            <button onClick={() => setModal(false)} aria-label="Fechar" className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                        </div>

                        <form onSubmit={cadastrar} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="nome" className="mb-2 block text-sm font-medium">Nome do serviço</label>
                                <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={120} placeholder="Ex.: Instalação elétrica" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
                            </div>
                            <div>
                                <label htmlFor="experiencia" className="mb-2 block text-sm font-medium">Experiência</label>
                                <textarea id="experiencia" value={experiencia} onChange={(e) => setExperiencia(e.target.value)} maxLength={1000} rows={3} placeholder="Descreva sua experiência profissional..." className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
                            </div>
                            <div>
                                <label htmlFor="descricao" className="mb-2 block text-sm font-medium">Descrição do serviço</label>
                                <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required maxLength={2000} rows={4} placeholder="Descreva o serviço oferecido..." className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
                            </div>
                            {erroCadastro && <p role="alert" className="text-sm text-red-700">{erroCadastro}</p>}
                            <button type="submit" disabled={salvando} className="w-full rounded-xl bg-cyan-950 py-3 font-semibold text-white hover:bg-cyan-900 disabled:opacity-60">
                                {salvando ? "Publicando..." : "Publicar serviço"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
