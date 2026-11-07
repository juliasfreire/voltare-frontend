
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
    LoaderCircle,
} from "lucide-react";

type Usuario = {
    id?: number | string;
    nome?: string;
    email?: string;
    tipo?: string;
};

type Servico = {
    id?: number | string;
    nome?: string;
    titulo?: string;
    descricao?: string;
    experiencia?: string;
    categoria?: string;
    prestador_nome?: string;
    prestador_id?: number | string;
    colaborador_id?: number | string;
    nomeColaborador?: string;
    nomeProfissional?: string;
    colaborador?: string | {
        id?: number | string;
        nome?: string;
        username?: string;
    };
};

type Favorito = {
    id: string;
    nome: string;
};

type Conversa = {
    id: number | string;
};

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

const CHAVE_FAVORITOS = "eletroconnect_favoritos_cliente";

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
        servico.prestador_nome ||
        servico.colaborador?.nome ||
        servico.colaborador?.username ||
        servico.nomeColaborador ||
        servico.nomeProfissional ||
        "Colaborador"
    );
}

function idDoColaborador(servico: Servico): number | null {
    const id =
        servico.prestador_id ??
        servico.colaborador_id ??
        (typeof servico.colaborador === "object"
            ? servico.colaborador?.id
            : undefined);

    if (id === undefined || id === null || String(id).trim() === "") {
        return null;
    }

    const numero = Number(id);

    return Number.isInteger(numero) && numero > 0
        ? numero
        : null;
}

export default function ClientePage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [favoritos, setFavoritos] = useState<Favorito[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [atualizar, setAtualizar] = useState(0);
    const [ano, setAno] = useState<number | null>(null);
    const [abrindoConversa, setAbrindoConversa] = useState<number | null>(null);
    const [erroConversa, setErroConversa] = useState("");

    // Recupera os dados do usuário.
    useEffect(() => {
        const token = localStorage.getItem("token");
        const usuarioSalvo = localStorage.getItem("usuarioLogado");

        if (!token || !usuarioSalvo) {
            router.push("/login");
            return;
        }

        try {
            const dadosUsuario = JSON.parse(usuarioSalvo);

            setUsuario({
                id: dadosUsuario.id,
                nome: dadosUsuario.nome,
                email: dadosUsuario.email,
                tipo: dadosUsuario.tipo,
            });
        } catch (error) {
            console.error("Erro ao recuperar usuário:", error);

            localStorage.removeItem("usuarioLogado");
            router.push("/login");
        }
    }, [router]);

    // Recupera os favoritos.
    useEffect(() => {
        try {
            const salvos = localStorage.getItem(CHAVE_FAVORITOS);

            if (salvos) {
                const dados = JSON.parse(salvos);

                if (Array.isArray(dados)) {
                    setFavoritos(dados);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar favoritos:", error);
        }
    }, []);

    // Carrega os serviços.
    useEffect(() => {
        const controller = new AbortController();

        async function carregarServicos() {
            try {
                setCarregando(true);
                setErro("");

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    throw new Error("Faça login novamente.");
                }

                const resposta = await fetch(`${API_URL}/servicos`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!resposta.ok) {
                    const corpoErro = await resposta.text();

                    if (
                        resposta.status === 401 ||
                        resposta.status === 403
                    ) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("usuarioLogado");
                        router.push("/login");

                        throw new Error("Sessão expirada. Faça login novamente.");
                    }

                    throw new Error(
                        `Erro HTTP ${resposta.status}: ${corpoErro}`
                    );
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
    }, [atualizar, router]);

    useEffect(() => {
        setAno(new Date().getFullYear());
    }, []);

    // Abas de navegação.
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

    // Favorita ou desfavorita um colaborador.
    function alternarFavorito(servico: Servico) {
        const id = idDoColaborador(servico);

        if (!id) {
            alert("Não foi possível identificar o colaborador.");
            return;
        }

        const nome = nomeDoColaborador(servico);
        const idString = String(id);

        setFavoritos((atuais) => {
            const jaFavoritado = atuais.some(
                (favorito) => favorito.id === idString
            );

            const atualizados = jaFavoritado
                ? atuais.filter((favorito) => favorito.id !== idString)
                : [...atuais, { id: idString, nome }];

            try {
                localStorage.setItem(
                    CHAVE_FAVORITOS,
                    JSON.stringify(atualizados)
                );
            } catch (error) {
                console.error("Erro ao salvar favoritos:", error);
            }

            return atualizados;
        });
    }

    // Abre uma conversa com o colaborador.
    async function abrirConversa(servico: Servico) {
        const servicoId = Number(servico.id);
        const colaboradorId = idDoColaborador(servico);

        if (!Number.isInteger(servicoId) || servicoId <= 0) {
            setErroConversa("Não foi possível identificar o serviço.");
            return;
        }

        if (!colaboradorId) {
            setErroConversa(
                "Não foi possível identificar o ID do colaborador. Verifique se a API retorna prestador_id."
            );
            return;
        }

        const usuarioId = Number(usuario?.id);

        if (
            Number.isInteger(usuarioId) &&
            usuarioId > 0 &&
            usuarioId === colaboradorId
        ) {
            setErroConversa("Você não pode conversar consigo mesmo.");
            return;
        }

        try {
            setErroConversa("");
            setAbrindoConversa(servicoId);

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const resposta = await fetch(`${API_URL}/conversas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    colaborador_id: colaboradorId,
                    servico_id: servicoId,
                }),
            });

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                throw new Error(
                    dados?.error ||
                    dados?.message ||
                    `Não foi possível abrir a conversa. Erro ${resposta.status}.`
                );
            }

            const conversa = dados as Conversa;

            const conversaId = Number(conversa?.id);

            if (!Number.isInteger(conversaId) || conversaId <= 0) {
                throw new Error(
                    "O servidor não retornou um ID de conversa válido."
                );
            }

            router.push(`/chat/${conversaId}`);

        } catch (error) {
            console.error("Erro ao abrir conversa:", error);

            setErroConversa(
                error instanceof Error
                    ? error.message
                    : "Não foi possível abrir a conversa."
            );
        } finally {
            setAbrindoConversa(null);
        }
    }

    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-sky-50 text-slate-800">

            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4 lg:px-10">

                <button
                    type="button"
                    onClick={() => router.push("/cliente")}
                    aria-label="Página inicial do cliente"
                    className="flex min-w-0 items-center gap-2 sm:gap-3"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 sm:h-12 sm:w-12">
                        <Zap className="h-6 w-6 fill-amber-300 text-amber-950 sm:h-7 sm:w-7" />
                    </span>

                    <span className="text-lg font-bold text-cyan-900 sm:text-2xl">
                        Voltare
                    </span>
                </button>

                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="min-w-0 text-right">
                        <span className="block text-xs text-slate-600 sm:text-base">
                            Olá, {usuario?.nome || "Cliente"}
                        </span>

                    
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("usuarioLogado");
                            router.push("/login");
                        }}
                        aria-label="Sair da conta"
                        title="Sair"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-900"
                    >
                        <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>
            </header>

            <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

                <div className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm sm:rounded-2xl">

                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">

                        {abas.map(({ nome, Icon, rota, ativo }) => (
                            <button
                                key={nome}
                                type="button"
                                onClick={() => router.push(rota)}
                                aria-current={ativo ? "page" : undefined}
                                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-3 text-xs transition sm:min-h-[75px] sm:flex-row sm:gap-2 sm:px-3 sm:text-sm md:text-base ${
                                    ativo
                                        ? "bg-sky-200 font-semibold text-cyan-900"
                                        : "text-slate-600 hover:bg-sky-50"
                                }`}
                            >
                                <Icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                                <span>{nome}</span>
                            </button>
                        ))}

                    </nav>

                    <section className="bg-slate-50/70 px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">

                        <div className="mb-6 sm:mb-8">
                            <p className="text-xs font-medium text-cyan-900 sm:text-sm">
                                Rede profissional
                            </p>

                            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
                                Serviços dos colaboradores
                            </h1>
                        </div>

                        {erroConversa && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                            >
                                {erroConversa}
                            </div>
                        )}

                        {carregando ? (
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center sm:rounded-2xl sm:px-6 sm:py-12">
                                <p className="text-sm text-slate-600 sm:text-base">
                                    Carregando serviços...
                                </p>
                            </div>

                        ) : erro ? (

                            <div className="rounded-xl border border-red-200 bg-white px-4 py-8 text-center sm:rounded-2xl sm:px-6 sm:py-10">

                                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    Não foi possível carregar os serviços
                                </h2>

                                <p className="mt-3 break-words text-sm text-red-700">
                                    {erro}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setAtualizar((n) => n + 1)}
                                    className="mt-5 w-full rounded-lg bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900 sm:w-auto sm:text-base"
                                >
                                    Tentar novamente
                                </button>
                            </div>

                        ) : servicos.length === 0 ? (

                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center sm:rounded-2xl sm:px-6 sm:py-12">

                                <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-sky-700 sm:h-12 sm:w-12" />

                                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    Nenhum serviço publicado
                                </h2>

                                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                                    Quando os colaboradores publicarem serviços,
                                    eles aparecerão aqui.
                                </p>
                            </div>

                        ) : (

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">

                                {servicos.map((servico, indice) => {
                                    const chave = String(
                                        servico.id ?? `servico-${indice}`
                                    );

                                    const autor = nomeDoColaborador(servico);
                                    const idFavorito = idDoColaborador(servico);

                                    const favorito = idFavorito !== null &&
                                        favoritos.some(
                                            (item) => item.id === String(idFavorito)
                                        );

                                    const titulo =
                                        servico.titulo ||
                                        servico.nome ||
                                        "Serviço";

                                    const servicoId = Number(servico.id);
                                    const estaAbrindo =
                                        abrindoConversa === servicoId;

                                    return (
                                        <article
                                            key={chave}
                                            className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-6 lg:p-7"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-2 sm:gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-200 text-lg font-bold text-cyan-900 sm:h-14 sm:w-14 sm:text-xl">
                                                        {autor.trim().charAt(0).toUpperCase() || "C"}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h2 className="break-words text-sm font-bold text-slate-950 sm:text-base">
                                                            {autor}
                                                        </h2>

                                                        <p className="text-xs text-slate-500 sm:text-sm">
                                                            Colaborador
                                                        </p>
                                                    </div>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => alternarFavorito(servico)}
                                                    aria-label={
                                                        favorito
                                                            ? "Remover dos favoritos"
                                                            : "Adicionar aos favoritos"
                                                    }
                                                    aria-pressed={favorito}
                                                    title={
                                                        favorito
                                                            ? "Desfavoritar colaborador"
                                                            : "Favoritar colaborador"
                                                    }
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 transition hover:bg-rose-50 sm:h-11 sm:w-11"
                                                >
                                                    <Heart
                                                        className={`h-5 w-5 transition ${
                                                            favorito
                                                                ? "fill-red-500 text-red-500"
                                                                : "text-slate-400"
                                                        }`}
                                                    />
                                                </button>

                                            </div>

                                            <h3 className="mt-5 break-words text-base font-semibold text-cyan-950 sm:text-lg">
                                                {titulo}
                                            </h3>

                                            {servico.categoria && (
                                                <p className="mt-1 break-words text-xs text-cyan-800 sm:text-sm">
                                                    {servico.categoria}
                                                </p>
                                            )}

                                            <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                                                {servico.descricao || "Sem descrição."}
                                            </p>

                                            {servico.experiencia && (
                                                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">

                                                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 sm:text-base">
                                                        <Briefcase className="h-5 w-5 shrink-0 text-slate-500" />
                                                        Experiência
                                                    </h4>

                                                    <p className="whitespace-pre-line break-words text-xs leading-6 text-slate-600 sm:text-sm">
                                                        {servico.experiencia}
                                                    </p>

                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                disabled={abrindoConversa !== null}
                                                onClick={() => abrirConversa(servico)}
                                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 py-3 text-sm font-semibold text-cyan-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                            >
                                                {estaAbrindo ? (
                                                    <>
                                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                                        Abrindo conversa...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MessageCircle className="h-5 w-5" />
                                                        Conversar
                                                    </>
                                                )}
                                            </button>

                                        </article>
                                    );
                                })}

                            </div>
                        )}

                    </section>
                </div>

                <footer className="px-2 py-5 text-center text-xs text-slate-500 sm:py-6 sm:text-sm">
                    © {ano ?? ""} Voltare. Todos os direitos reservados.
                </footer>

            </div>
        </main>
    );
}
