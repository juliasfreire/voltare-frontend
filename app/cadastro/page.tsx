"use client";

//Julinha esteve aqui

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Zap } from "lucide-react";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

export default function CadastroPage() {
    const router = useRouter();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [tipo, setTipo] = useState<"cliente" | "prestador">("cliente");
    const [carregando, setCarregando] = useState(false);

    async function cadastrar(e:any) {
        e.preventDefault();

        if (!nome.trim() || !email.trim() || !senha) {
            await Swal.fire({
                title: "Campos incompletos",
                text: "Preencha todos os campos.",
                icon: "warning",
                confirmButtonText: "Ok",
                confirmButtonColor: "#083344",
            });
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/cadastrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: email.trim(),
                    senha,
                    tipo,
                }),
            });

            const texto = await resposta.text();
            let dados: Record<string, unknown> = {};

            if (texto) {
                try {
                    dados = JSON.parse(texto) as Record<string, unknown>;
                } catch {
                    dados = { mensagem: texto };
                }
            }

            if (!resposta.ok) {
                const mensagem =
                    dados.mensagem ??
                    dados.message ??
                    dados.erro ??
                    dados.error;

                throw new Error(
                    typeof mensagem === "string"
                        ? mensagem
                        : `Não foi possível realizar o cadastro (HTTP ${resposta.status}).`
                );
            }

            await Swal.fire({
                title: "Cadastro realizado!",
                text: "Sua conta foi criada com sucesso. Faça login para continuar.",
                icon: "success",
                confirmButtonText: "Ir para o login",
                confirmButtonColor: "#083344",
            });

            router.push("/login");
        } catch (error) {
            await Swal.fire({
                title: "Não foi possível cadastrar",
                text:
                    error instanceof Error
                        ? error.message
                        : "Verifique sua conexão com o servidor.",
                icon: "error",
                confirmButtonText: "Ok",
                confirmButtonColor: "#083344",
            });
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-sky-50 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-lg">

                {/* Cabeçalho no mesmo estilo do login */}
                <header className="flex flex-col items-center bg-sky-200 px-6 py-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 shadow-sm">
                        <Zap className="h-6 w-6 fill-amber-400 text-amber-950" />
                    </div>

                    <h1 className="text-2xl font-bold text-cyan-950">
                        Voltare
                    </h1>

                    <p className="mt-1 text-sm text-sky-900">
                        Crie sua conta na maior rede de eletrotécnica
                    </p>
                </header>

                {/* Abas */}
                <div className="flex border-b border-slate-100 text-center">
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="w-1/2 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-50"
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        aria-current="page"
                        className="w-1/2 border-b-2 border-amber-400 py-3 text-sm font-bold text-slate-900"
                    >
                        Criar Conta
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={cadastrar} className="p-6">
                    <div className="mb-4">
                        <label
                            htmlFor="nome"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Nome completo
                        </label>

                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            autoComplete="name"
                            placeholder="Digite seu nome"
                            maxLength={120}
                            required
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none transition focus:border-sky-300"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            placeholder="seuemail@exemplo.com"
                            maxLength={180}
                            required
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none transition focus:border-sky-300"
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="senha"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Senha
                        </label>

                        <input
                            id="senha"
                            name="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Crie uma senha"
                            minLength={6}
                            required
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none transition focus:border-sky-300"
                        />

                        <p className="mt-1 text-xs text-slate-500">
                            Use pelo menos 6 caracteres.
                        </p>
                    </div>

                    {/* Tipo de conta */}
                    <fieldset className="mb-6">
                        <legend className="mb-2 block text-sm font-medium text-slate-700">
                            Tipo de conta
                        </legend>

                        <div className="grid grid-cols-2 gap-3">
                            <label
                                className={`cursor-pointer rounded-lg border p-3 text-center transition ${
                                    tipo === "cliente"
                                        ? "border-sky-300 bg-sky-50"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="cliente"
                                    checked={tipo === "cliente"}
                                    onChange={() => setTipo("cliente")}
                                    className="sr-only"
                                />

                                <span className="block text-sm font-semibold text-slate-800">
                                    Cliente
                                </span>
                                <span className="mt-1 block text-xs text-slate-500">
                                    Procurar serviços
                                </span>
                            </label>

                            <label
                                className={`cursor-pointer rounded-lg border p-3 text-center transition ${
                                    tipo === "prestador"
                                        ? "border-sky-300 bg-sky-50"
                                        : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="prestador"
                                    checked={tipo === "prestador"}
                                    onChange={() => setTipo("prestador")}
                                    className="sr-only"
                                />

                                <span className="block text-sm font-semibold text-slate-800">
                                    Colaborador
                                </span>
                                <span className="mt-1 block text-xs text-slate-500">
                                    Publicar serviços
                                </span>
                            </label>
                        </div>
                    </fieldset>

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full cursor-pointer rounded-lg bg-cyan-950 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {carregando ? "Cadastrando..." : "Criar conta"}
                    </button>
                </form>
            </div>
        </main>
    );
}
