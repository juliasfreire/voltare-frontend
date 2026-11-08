
"use client";

import { useEffect, useState, type FormEvent } from "react";
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
    ChevronDown,
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

type Usuario = {
    nome?: string;
    email?: string;
    tipo?: string;
    id?: number | string;
};

const API = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

function lista(dados: unknown): Servico[] {
    if (Array.isArray(dados)) return dados as Servico[];

    if (dados && typeof dados === "object") {
        const d = dados as Record<string, unknown>;
        const itens = d.content ?? d.servicos ?? d.data ?? d.produtos;

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

function converterParaBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export default function ColaboradorPage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Usuario | null>(null);

    // Ano atual para o rodapé.
    const [ano, setAno] = useState<number | null>(null);

    const [servicos, setServicos] = useState<Servico[]>([]);
    const [meus, setMeus] = useState<Servico[]>([]);
    const [quantidadeProdutos, setQuantidadeProdutos] = useState(0);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [atualizar, setAtualizar] = useState(0);

    const [menuAberto, setMenuAberto] = useState(false);
    const [modal, setModal] = useState<"servico" | "produto" | null>(null);

    const [nome, setNome] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [descricao, setDescricao] = useState("");

    const [nomeProduto, setNomeProduto] = useState("");
    const [precoProduto, setPrecoProduto] = useState("");
    const [descricaoProduto, setDescricaoProduto] = useState("");
    const [imagemProduto, setImagemProduto] = useState<File | null>(null);

    const [salvando, setSalvando] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");

    // Define o ano atual após a montagem da página.
    useEffect(() => {
        setAno(new Date().getFullYear());
    }, []);

    // Recupera o nome do usuário assim que a página abre.
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");

        if (!usuarioSalvo) {
            router.push("/login");
            return;
        }

        try {
            const dadosUsuario = JSON.parse(usuarioSalvo) as Usuario;
            setUsuario(dadosUsuario);
        } catch (erro) {
            console.error("Erro ao recuperar usuário:", erro);
        }
    }, [router]);

    // Carrega serviços e produtos.
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
                } catch (e) {
                    if (e instanceof Error && e.name === "AbortError") {
                        return;
                    }
                }

                try {
                    const respostaProdutos = await fetch(
                        `${API}/produtos/meus`,
                        {
                            headers: headersAuth,
                            cache: "no-store",
                            signal: ctrl.signal,
                        }
                    );

                    if (respostaProdutos.ok) {
                        const dadosProdutos = await respostaProdutos.json();
                        setQuantidadeProdutos(lista(dadosProdutos).length);
                    }
                } catch (e) {
                    if (e instanceof Error && e.name === "AbortError") {
                        return;
                    }
                }
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;

                setErro(
                    e instanceof Error
                        ? e.message
                        : "Não foi possível carregar os dados."
                );
            } finally {
                if (!ctrl.signal.aborted) setCarregando(false);
            }
        }

        carregar();

        return () => ctrl.abort();
    }, [atualizar, router]);

    function abrirServico() {
        setMenuAberto(false);
        setErroCadastro("");
        setModal("servico");
    }

    function abrirProduto() {
        setMenuAberto(false);
        setErroCadastro("");
        setModal("produto");
    }

    async function cadastrarServico(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setSalvando(true);
        setErroCadastro("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                throw new Error("Faça login para publicar um serviço.");
            }

            const r = await fetch(`${API}/servicos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
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

            setModal(null);
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

    async function cadastrarProduto(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setSalvando(true);
        setErroCadastro("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                throw new Error("Faça login para publicar um produto.");
            }

            if (!imagemProduto) {
                throw new Error("Selecione uma imagem para o produto.");
            }

            const imagemBase64 = await converterParaBase64(imagemProduto);

            const r = await fetch(`${API}/produtos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nome: nomeProduto.trim(),
                    preco: Number(precoProduto),
                    descricao: descricaoProduto.trim(),
                    imagem: imagemBase64,
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

            setModal(null);
            setNomeProduto("");
            setPrecoProduto("");
            setDescricaoProduto("");
            setImagemProduto(null);

            setAtualizar((n) => n + 1);
        } catch (e) {
            setErroCadastro(
                e instanceof Error
                    ? e.message
                    : "Erro ao cadastrar produto."
            );
        } finally {
            setSalvando(false);
        }
    }

    function fecharModal() {
        if (salvando) return;

        setModal(null);
        setErroCadastro("");
    }

    function sair() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioLogado");
        router.push("/login");
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
            acao: () => router.push("/colaborador/mensagens"),
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
                    type="button"
                    onClick={() => router.push("/colaborador")}
                    className="flex min-w-0 items-center gap-2 sm:gap-3"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 sm:h-12 sm:w-12">
                        <Zap className="h-6 w-6 fill-amber-300 text-amber-950 sm:h-7 sm:w-7" />
                    </span>

                    <span className="truncate text-lg font-bold text-cyan-900 sm:text-2xl">
                        Voltare
                    </span>
                </button>

                <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-4">
                    <span className="max-w-[180px] truncate text-sm text-slate-600 sm:max-w-none sm:text-base">
                        Olá, {usuario?.nome || "Colaborador"}
                    </span>

                    <button
                        type="button"
                        onClick={sair}
                        aria-label="Sair da conta"
                        title="Sair"
                        className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-900"
                    >
                        <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>
            </header>

            <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
                        {abas.map(({ nome: aba, Icon, acao }, i) => (
                            <button
                                key={aba}
                                type="button"
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

                                <div className="group relative z-20 w-full shrink-0 sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setMenuAberto((v) => !v)}
                                        aria-label="Escolher o que publicar"
                                        aria-expanded={menuAberto}
                                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-200 text-amber-950 shadow-md transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:h-14 sm:w-14 sm:rounded-full"
                                    >
                                        <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                                        <span className="font-semibold sm:hidden">
                                            Publicar
                                        </span>
                                        <ChevronDown className="h-4 w-4 sm:hidden" />
                                    </button>

                                    <div
                                        className={`absolute right-0 top-full mt-2 w-full min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-all sm:w-56 ${
                                            menuAberto
                                                ? "visible translate-y-0 opacity-100"
                                                : "invisible translate-y-2 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={abrirServico}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-cyan-950"
                                        >
                                            <BriefcaseBusiness className="h-5 w-5 text-cyan-900" />
                                            Cadastrar serviço
                                        </button>

                                        <div className="border-t border-slate-100" />

                                        <button
                                            type="button"
                                            onClick={abrirProduto}
                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-cyan-950"
                                        >
                                            <Package className="h-5 w-5 text-cyan-900" />
                                            Cadastrar produto
                                        </button>
                                    </div>
                                </div>
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
                                        valor: quantidadeProdutos,
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
                                            onClick={() => setAtualizar((n) => n + 1)}
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

                {/* RODAPÉ VOLTARE */}
                <footer className="px-2 py-5 text-center text-xs text-slate-500 sm:py-6 sm:text-sm">
                    © {ano ?? ""} Voltare. Todos os direitos reservados.
                </footer>
            </div>

            {/* Modal de cadastro de serviço */}
            {modal === "servico" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-5">
                    <section className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6 lg:p-8">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-cyan-950 sm:text-2xl">
                                Publicar serviço
                            </h2>

                            <button
                                type="button"
                                onClick={fecharModal}
                                aria-label="Fechar"
                                className="shrink-0 rounded-lg p-2 transition hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={cadastrarServico} className="mt-5 space-y-4 sm:mt-6">
                            <div>
                                <label htmlFor="nome" className="mb-2 block text-sm font-medium">
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
                                <label htmlFor="experiencia" className="mb-2 block text-sm font-medium">
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
                                <label htmlFor="descricao" className="mb-2 block text-sm font-medium">
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
                                <p role="alert" className="wrap-break-word text-sm text-red-700">
                                    {erroCadastro}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={salvando}
                                className="w-full rounded-xl bg-cyan-950 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                            >
                                {salvando ? "Publicando..." : "Publicar serviço"}
                            </button>
                        </form>
                    </section>
                </div>
            )}

            {/* Modal de cadastro de produto */}
            {modal === "produto" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-5">
                    <section className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6 lg:p-8">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-cyan-950 sm:text-2xl">
                                Cadastrar produto
                            </h2>

                            <button
                                type="button"
                                onClick={fecharModal}
                                aria-label="Fechar"
                                className="shrink-0 rounded-lg p-2 transition hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={cadastrarProduto} className="mt-5 space-y-4 sm:mt-6">
                            <div>
                                <label htmlFor="nomeProduto" className="mb-2 block text-sm font-medium">
                                    Nome do produto
                                </label>

                                <input
                                    id="nomeProduto"
                                    value={nomeProduto}
                                    onChange={(e) => setNomeProduto(e.target.value)}
                                    required
                                    maxLength={120}
                                    placeholder="Ex.: Disjuntor elétrico"
                                    className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:px-4 sm:text-base"
                                />
                            </div>

                            <div>
                                <label htmlFor="precoProduto" className="mb-2 block text-sm font-medium">
                                    Preço (R$)
                                </label>

                                <input
                                    id="precoProduto"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={precoProduto}
                                    onChange={(e) => setPrecoProduto(e.target.value)}
                                    required
                                    placeholder="Ex.: 49.90"
                                    className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:px-4 sm:text-base"
                                />
                            </div>

                            <div>
                                <label htmlFor="descricaoProduto" className="mb-2 block text-sm font-medium">
                                    Descrição do produto
                                </label>

                                <textarea
                                    id="descricaoProduto"
                                    value={descricaoProduto}
                                    onChange={(e) => setDescricaoProduto(e.target.value)}
                                    required
                                    maxLength={2000}
                                    rows={4}
                                    placeholder="Descreva as características do produto..."
                                    className="w-full min-w-0 resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:px-4 sm:text-base"
                                />
                            </div>

                            <div>
                                <label htmlFor="imagemProduto" className="mb-2 block text-sm font-medium">
                                    Imagem do produto
                                </label>

                                <input
                                    id="imagemProduto"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImagemProduto(e.target.files[0]);
                                        }
                                    }}
                                    required
                                    className="w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-cyan-950 hover:file:bg-sky-200"
                                />
                            </div>

                            {erroCadastro && (
                                <p role="alert" className="wrap-break-word text-sm text-red-700">
                                    {erroCadastro}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={salvando}
                                className="w-full rounded-xl bg-cyan-950 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                            >
                                {salvando ? "Cadastrando..." : "Cadastrar produto"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
