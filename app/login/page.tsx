
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { Zap } from "lucide-react";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

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
                throw new Error("O backend retornou uma resposta inválida.");
            }

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.message ||
                    "E-mail ou senha incorretos."
                );
            }

            const usuario = dados.usuario ?? dados.user ?? dados.data ?? dados;

            const tipo = String(
                usuario.tipo ??
                usuario.perfil ??
                usuario.role ??
                usuario.tipoUsuario ??
                dados.tipo ??
                ""
            ).toLowerCase();

            if (tipo.includes("cliente")) {
                localStorage.setItem(
                    "usuarioLogado",
                    JSON.stringify({
                        nome: usuario.nome ?? usuario.name ?? usuario.username,
                        email: usuario.email ?? email.trim(),
                        tipo,
                    })
                );

                await Swal.fire({
                    title: "Login realizado!",
                    text: "Bem-vindo à Voltare.",
                    icon: "success",
                    confirmButtonText: "Continuar",
                });

                router.push("/cliente");
            } else if (
                tipo.includes("colaborador") ||
                tipo.includes("profissional")
            ) {
                localStorage.setItem(
                    "usuarioLogado",
                    JSON.stringify({
                        nome: usuario.nome ?? usuario.name ?? usuario.username,
                        email: usuario.email ?? email.trim(),
                        tipo,
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
                    "O backend não informou se a conta é de cliente ou colaborador."
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
        <main className="flex min-h-screen items-center justify-center bg-sky-50 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-lg">
                <header className="flex flex-col items-center bg-sky-200 px-6 py-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 shadow-sm">
                        <Zap className="h-6 w-6 fill-amber-400 text-amber-950" />
                    </div>

                    <h1 className="text-2xl font-bold text-cyan-950">
                        Voltare
                    </h1>

                    <p className="mt-1 text-sm text-sky-900">
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
                        className="w-1/2 py-3 text-sm font-semibold text-slate-400"
                    >
                        Criar Conta
                    </button>
                </div>

                <form onSubmit={logar} className="p-6">
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
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-300"
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
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-sky-300"
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
