
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, AlertCircle, X } from "lucide-react";

interface ContactButtonProps {
    colaboradorId: number | string;
    servicoId?: number | string;
    produtoId?: number | string;
    buttonText?: string;
    className?: string;
}

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

function obterIdUsuario(): string | null {
    try {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");

        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);

            const id =
                usuario.id ??
                usuario.usuario_id ??
                usuario.id_usuario ??
                usuario.userId;

            if (id !== undefined && id !== null) {
                return String(id);
            }
        }

        const token = localStorage.getItem("token");

        if (!token) return null;

        const partes = token.split(".");

        if (partes.length !== 3) return null;

        const payload = partes[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const dadosToken = JSON.parse(atob(payload));

        const id =
            dadosToken.id ??
            dadosToken.usuario_id ??
            dadosToken.id_usuario ??
            dadosToken.userId ??
            dadosToken.sub;

        return id !== undefined && id !== null
            ? String(id)
            : null;

    } catch (error) {
        console.error("Erro ao identificar usuário:", error);
        return null;
    }
}

export default function ContactButton({
    colaboradorId,
    servicoId,
    produtoId,
    buttonText = "Entrar em contato",
    className = "",
}: ContactButtonProps) {

    const router = useRouter();

    const [avisoAberto, setAvisoAberto] = useState(false);
    const [mensagemAviso, setMensagemAviso] = useState("");
    const [tituloAviso, setTituloAviso] = useState("Atenção!");
    const [carregando, setCarregando] = useState(false);

    function mostrarAviso(
        mensagem: string,
        titulo = "Atenção!"
    ) {
        setTituloAviso(titulo);
        setMensagemAviso(mensagem);
        setAvisoAberto(true);
    }

    async function handleContact() {

        if (
            colaboradorId === undefined ||
            colaboradorId === null ||
            String(colaboradorId).trim() === ""
        ) {
            mostrarAviso(
                "Não foi possível identificar o vendedor deste produto."
            );
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        // Identifica o usuário logado.
        const usuarioId = obterIdUsuario();

        // Impede que o usuário converse consigo mesmo.
        if (
            usuarioId !== null &&
            usuarioId === String(colaboradorId)
        ) {
            mostrarAviso(
                "Você não pode conversar consigo mesmo.",
                "Não foi possível iniciar a conversa"
            );
            return;
        }

        try {
            setCarregando(true);

            const res = await fetch(`${API_URL}/conversas`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    colaborador_id: colaboradorId,
                    servico_id: servicoId || null,
                    produto_id: produtoId || null,
                }),
            });

            const dados = await res.json().catch(() => ({}));

            if (!res.ok) {
                mostrarAviso(
                    dados.mensagem ||
                    dados.message ||
                    "Não foi possível iniciar a conversa. Tente novamente.",
                    "Erro ao abrir conversa"
                );
                return;
            }

            const conversa =
                dados.conversa ||
                dados.data ||
                dados;

            if (!conversa?.id) {
                console.error(
                    "Resposta inválida do servidor:",
                    dados
                );

                mostrarAviso(
                    "O servidor não retornou os dados necessários para abrir a conversa.",
                    "Erro ao abrir conversa"
                );
                return;
            }

            // Abre o chat.
            router.push(`/chat/${conversa.id}`);

        } catch (error) {
            console.error("Erro ao iniciar chat:", error);

            mostrarAviso(
                "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
                "Erro de conexão"
            );

        } finally {
            setCarregando(false);
        }
    }

    const isInvalid =
        colaboradorId === undefined ||
        colaboradorId === null ||
        String(colaboradorId).trim() === "";

    return (
        <>
            <button
                type="button"
                onClick={handleContact}
                disabled={isInvalid || carregando}
                className={`flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            >
                <MessageCircle className="h-4 w-4" />

                {carregando ? "Abrindo conversa..." : buttonText}
            </button>

            {/* MODAL DE AVISO */}
            {avisoAberto && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
                    onClick={() => setAvisoAberto(false)}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-aviso"
                        aria-describedby="mensagem-aviso"
                        className="relative w-full max-w-sm rounded-2xl border border-sky-100 bg-white p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setAvisoAberto(false)}
                            aria-label="Fechar aviso"
                            className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                            <AlertCircle className="h-8 w-8 text-amber-600" />
                        </div>

                        <h2
                            id="titulo-aviso"
                            className="mt-4 text-xl font-bold text-cyan-950"
                        >
                            {tituloAviso}
                        </h2>

                        <p
                            id="mensagem-aviso"
                            className="mt-3 text-sm leading-6 text-slate-600"
                        >
                            {mensagemAviso}
                        </p>

                        <button
                            type="button"
                            onClick={() => setAvisoAberto(false)}
                            className="mt-6 w-full rounded-xl bg-cyan-950 px-5 py-3 font-semibold text-white transition hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        >
                            OK
                        </button>
                    </section>
                </div>
            )}
        </>
    );
}
