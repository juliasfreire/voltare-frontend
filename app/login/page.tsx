"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { Zap } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

type DadosToken = {
    id?: number | string;
    nome?: string;
    name?: string;
    nomeCompleto?: string;
    nome_completo?: string;
    nome_usuario?: string;
    email?: string;
    tipo?: string;
    perfil?: string;
    role?: string;
    tipoUsuario?: string;
    usuario?: Record<string, any>;
    user?: Record<string, any>;
    dados?: Record<string, any>;
};

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function logar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!email.trim() || !senha) {
            Swal.fire({
                title: "Campos incompletos",
                text: "Preencha o e-mail e a senha.",
                icon: "warning",
                confirmButtonText: "Ok",
            });
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    senha,
                }),
            });

            const texto = await resposta.text();
            let dados: Record<string, any> = {};

            try {
                dados = texto ? JSON.parse(texto) : {};
            } catch {
                throw new Error(
                    "O backend retornou uma resposta inválida."
                );
            }

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.message ||
                    "E-mail ou senha incorretos."
                );
            }

            if (!dados.token) {
                throw new Error(
                    "Token de autenticação não recebido do servidor."
                );
            }

            localStorage.setItem("token", dados.token);

            const usuarioDecodificado =
                jwtDecode<DadosToken>(dados.token);

            const usuarioToken =
                usuarioDecodificado.usuario ||
                usuarioDecodificado.user ||
                usuarioDecodificado.dados ||
                {};

            const nome =
                usuarioToken.nome ||
                usuarioToken.name ||
                usuarioToken.nomeCompleto ||
                usuarioToken.nome_completo ||
                usuarioToken.nome_usuario ||
                usuarioDecodificado.nome ||
                usuarioDecodificado.name ||
                usuarioDecodificado.nomeCompleto ||
                usuarioDecodificado.nome_completo ||
                usuarioDecodificado.nome_usuario ||
                "";

            const emailUsuario =
                usuarioToken.email ||
                usuarioDecodificado.email ||
                email.trim();

            const idUsuario =
                usuarioToken.id ||
                usuarioDecodificado.id;

            const tipo = String(
                usuarioToken.tipo ||
                usuarioToken.perfil ||
                usuarioToken.role ||
                usuarioDecodificado.tipo ||
                usuarioDecodificado.perfil ||
                usuarioDecodificado.role ||
                usuarioDecodificado.tipoUsuario ||
                ""
            )
                .toLowerCase()
                .trim();

            const ehCliente =
                tipo.includes("cliente") ||
                tipo.includes("client") ||
                tipo === "1";

            const ehColaborador =
                tipo.includes("colaborador") ||
                tipo.includes("profissional") ||
                tipo.includes("provider") ||
                tipo.includes("prestador") ||
                tipo === "2";

            if (ehCliente) {
                localStorage.setItem(
                    "usuarioLogado",
                    JSON.stringify({
                        id: idUsuario,
                        nome: nome,
                        email: emailUsuario,
                        tipo: "cliente",
                    })
                );

                await Swal.fire({
                    title: "Login realizado!",
                    text: "Bem-vindo à Voltare.",
                    icon: "success",
                    confirmButtonText: "Continuar",
                });

                router.push("/cliente");

            } else if (ehColaborador) {
                localStorage.setItem(
                    "usuarioLogado",
                    JSON.stringify({
                        id: idUsuario,
                        nome: nome,
                        email: emailUsuario,
                        tipo: "colaborador",
                    })
                );

                await Swal.fire({
                    title: "Login realizado!",
                    text: "Bem-vindo à Voltare.",
                    icon: "success",
                    confirmButtonText: "Continuar",
                });

                router.push("/colaborador");

            } else {
                throw new Error(
                    `O tipo de conta '${tipo}' dentro do token não é válido.`
                );
            }

        } catch (error) {
            Swal.fire({
                title: "Não foi possível entrar",
                text:
                    error instanceof Error
                        ? error.message
                        : "Verifique sua conexão com o servidor.",
                icon: "error",
                confirmButtonText: "Ok",
            });
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-sky-50 px-3 py-6 sm:px-6 sm:py-8">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-lg">

                <header className="flex flex-col items-center bg-sky-200 px-4 py-6 text-center sm:px-6 sm:py-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 shadow-sm">
                        <Zap className="h-6 w-6 fill-amber-400 text-amber-950" />
                    </div>

                    <h1 className="text-2xl font-bold text-cyan-950 sm:text-3xl">
                        Voltare
                    </h1>

                    <p className="mt-1 max-w-xs text-sm text-sky-900 sm:max-w-full">
                        Acesse sua conta na maior rede de eletrotécnica
                    </p>
                </header>

                <div className="flex border-b border-slate-100 text-center">
                    <button
                        type="button"
                        className="w-1/2 border-b-2 border-amber-400 py-3 text-sm font-bold text-slate-900"
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/cadastro")}
                        className="w-1/2 py-3 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600"
                    >
                        Criar Conta
                    </button>
                </div>

                <form onSubmit={logar} className="p-4 sm:p-6">
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="w-full min-w-0 rounded-lg border border-slate-200 p-3 text-sm outline-none transition-colors focus:border-sky-300 sm:p-2.5"
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="senha"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="w-full min-w-0 rounded-lg border border-slate-200 p-3 text-sm outline-none transition-colors focus:border-sky-300 sm:p-2.5"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full cursor-pointer rounded-lg bg-cyan-950 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </main>
    );
}