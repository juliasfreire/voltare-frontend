
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ContactButton from "@/components/ContactButton";
import {
    ArrowLeft,
    ShoppingBag,
    Package,
    RefreshCw,
    AlertCircle,
    MessageCircle,
} from "lucide-react";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

type Produto = {
    id: number | string;
    nome?: string;
    titulo?: string;
    descricao?: string;
    preco?: number | string;
    valor?: number | string;
    imagem?: string;
    imagemUrl?: string;
    // Adicione estes campos para suportar o ID do colaborador/vendedor:
    colaboradorId?: number | string;
    colaborador_id?: number | string;
    colaborador?: string | { id?: number | string; nome?: string };
    id_prestador?: number | string;
    nomeColaborador?: string;
    prestador_nome?: string;
};

function extrairLista(dados: unknown): Produto[] {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (dados && typeof dados === "object") {
        const resposta = dados as Record<string, unknown>;

        if (Array.isArray(resposta.content)) return resposta.content;
        if (Array.isArray(resposta.produtos)) return resposta.produtos;
        if (Array.isArray(resposta.data)) return resposta.data;
    }

    return [];
}

function nomeDoColaborador(produto: Produto) {
    if (typeof produto.colaborador === "string") {
        return produto.colaborador;
    }

    return (
        produto.nomeColaborador ||
        produto.prestador_nome ||
        produto.colaborador?.nome ||
        "Colaborador"
    );
}

function formatarPreco(valor: number | string | undefined) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return String(valor);
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}


function idDoColaborador(produto: Produto): number | string | undefined {
    if (produto.colaboradorId) return produto.colaboradorId;
    if (produto.colaborador_id) return produto.colaborador_id;
    if (produto.id_prestador) return produto.id_prestador;

    if (typeof produto.colaborador === "object") {
        return produto.colaborador?.id;
    }

    return undefined;
}
export default function LojaPage() {
    const router = useRouter();

    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [rotaMensagens, setRotaMensagens] = useState("/cliente/mensagens");

    // Identifica se o usuário é cliente ou colaborador
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");

        if (!usuarioSalvo) return;

        try {
            const usuario = JSON.parse(usuarioSalvo);

            const tipo = String(
                usuario.tipo ||
                usuario.perfil ||
                usuario.role ||
                ""
            ).toLowerCase();

            if (
                tipo.includes("colaborador") ||
                tipo.includes("profissional")
            ) {
                setRotaMensagens("/colaborador/mensagens");
            } else {
                setRotaMensagens("/cliente/mensagens");
            }
        } catch {
            setRotaMensagens("/cliente/mensagens");
        }
    }, []);

    async function carregarProdutos(signal?: AbortSignal) {
        try {
            setCarregando(true);
            setErro("");

            const token = localStorage.getItem("token");

            const resposta = await fetch(`${API_URL}/produtos`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {}),
                },
                cache: "no-store",
                signal,
            });

            if (resposta.status === 401 || resposta.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuarioLogado");
                router.push("/login");
                return;
            }

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os produtos.");
            }

            const dados = await resposta.json();

            setProdutos(extrairLista(dados));
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return;
            }

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar os produtos."
            );
        } finally {
            if (!signal?.aborted) {
                setCarregando(false);
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController();

        carregarProdutos(controller.signal);

        return () => controller.abort();
    }, []);

    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-sky-50 px-3 py-6 text-slate-800 sm:px-6 sm:py-8 md:px-10">

            <div className="mx-auto w-full max-w-6xl">

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-cyan-900 transition hover:underline sm:text-base"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Voltar
                </button>

                <section className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:rounded-2xl sm:p-8">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-7 w-7 shrink-0 text-cyan-900 sm:h-8 sm:w-8" />

                            <h1 className="text-2xl font-bold text-cyan-950 sm:text-3xl">
                                Loja
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => carregarProdutos()}
                            disabled={carregando}
                            className="flex items-center gap-2 rounded-lg border border-sky-200 px-3 py-2 text-sm font-medium text-cyan-900 transition hover:bg-sky-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    carregando ? "animate-spin" : ""
                                }`}
                            />
                            Atualizar
                        </button>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
                        Confira os produtos e materiais elétricos
                        disponibilizados pelos colaboradores.
                    </p>

                </section>

                <section className="mt-7">

                    <h2 className="mb-5 text-xl font-bold text-slate-900 sm:text-2xl">
                        Produtos disponíveis
                    </h2>

                    {carregando && (
                        <div className="flex min-h-45 flex-col items-center justify-center rounded-xl border border-sky-100 bg-white p-6 text-center">
                            <RefreshCw className="mb-3 h-8 w-8 animate-spin text-cyan-800" />

                            <p className="text-sm text-slate-500 sm:text-base">
                                Carregando produtos...
                            </p>
                        </div>
                    )}

                    {!carregando && erro && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-white p-6 text-center">

                            <AlertCircle className="mb-3 h-9 w-9 text-red-500" />

                            <p className="text-sm text-red-600 sm:text-base">
                                {erro}
                            </p>

                            <button
                                type="button"
                                onClick={() => carregarProdutos()}
                                className="mt-4 rounded-lg bg-cyan-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
                            >
                                Tentar novamente
                            </button>

                        </div>
                    )}

                    {!carregando && !erro && produtos.length === 0 && (
                        <div className="flex min-h-55 flex-col items-center justify-center rounded-xl border border-sky-100 bg-white px-5 py-8 text-center">

                            <Package className="mb-3 h-12 w-12 text-slate-300" />

                            <h3 className="text-lg font-semibold text-slate-800">
                                Nenhum produto disponível
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Quando os colaboradores cadastrarem produtos,
                                eles aparecerão aqui.
                            </p>

                        </div>
                    )}

                    {!carregando && !erro && produtos.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {produtos.map((produto, indice) => {
                                const nome =
                                    produto.nome ||
                                    produto.titulo ||
                                    "Produto sem nome";

                                const preco = formatarPreco(
                                    produto.preco ?? produto.valor
                                );

                                const imagem =
                                    produto.imagem || produto.imagemUrl;

                                return (
                                    <article
                                        key={produto.id ?? indice}
                                        className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm transition hover:shadow-md"
                                    >

                                        {/* IMAGEM */}
                                        <div className="flex h-48 w-full items-center justify-center overflow-hidden bg-sky-50 sm:h-52">

                                            {imagem ? (
                                                <img
                                                    src={imagem}
                                                    alt={nome}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Package className="h-16 w-16 text-sky-200" />
                                            )}

                                        </div>

                                        {/* INFORMAÇÕES */}
                                        <div className="flex flex-1 flex-col p-5">

                                            <h3 className="wrap-break-word text-lg font-bold text-slate-900">
                                                {nome}
                                            </h3>

                                            {produto.descricao && (
                                                <p className="mt-2 wrap-break-word text-sm leading-6 text-slate-600">
                                                    {produto.descricao}
                                                </p>
                                            )}

                                            <p className="mt-4 text-xs text-slate-500">
                                                Vendedor:{" "}
                                                {nomeDoColaborador(produto)}
                                            </p>

                                            {preco && (
                                                <p className="mt-3 text-xl font-bold text-cyan-900">
                                                    {preco}
                                                </p>
                                            )}

                                            {/* CONVERSAR COM VENDEDOR */}
                                           <ContactButton
                                                      colaboradorId={idDoColaborador(produto) ?? ""}
                                                        produtoId={produto.id}
                                                      buttonText="Conversar com vendedor"
                                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 sm:text-base"
/>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

                <footer className="py-7 text-center text-xs text-slate-500 sm:text-sm">
                    © Voltare. Todos os direitos reservados.
                </footer>

            </div>
        </main>
    );
}

