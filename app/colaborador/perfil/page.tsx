
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Zap, LogOut, BriefcaseBusiness, ShoppingCart, MessageCircle,
    UserCircle, Heart, Briefcase,
} from "lucide-react";
import {
    listarProfissionais,
    type Profissional,
} from "../../../profissionais";

export default function ClientePage() {
    const router = useRouter();
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [favoritos, setFavoritos] = useState<(number | string)[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [atualizar, setAtualizar] = useState(0);
    const [ano, setAno] = useState<number | null>(null);

    const abas = [
        { nome: "Profissionais", Icon: BriefcaseBusiness, rota: "/cliente", ativo: true },
        { nome: "Loja", Icon: ShoppingCart, rota: "/cliente/loja" },
        { nome: "Mensagens", Icon: MessageCircle },
        { nome: "Perfil", Icon: UserCircle, rota: "/cliente/perfil" },
    ];

    useEffect(() => {
        const controller = new AbortController();

        async function carregar() {
            try {
                setCarregando(true);
                setErro("");
                setProfissionais(
                    await listarProfissionais(controller.signal)
                );
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") return;
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os profissionais."
                );
            } finally {
                if (!controller.signal.aborted) setCarregando(false);
            }
        }

        carregar();
        return () => controller.abort();
    }, [atualizar]);

    useEffect(() => {
        setAno(new Date().getFullYear());
    }, []);

    function alternarFavorito(id: number | string) {
        setFavoritos((lista) =>
            lista.includes(id)
                ? lista.filter((item) => item !== id)
                : [...lista, id]
        );
    }

    return (
        <main className="min-h-screen bg-sky-50 text-slate-800">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white px-5 py-4 shadow-sm sm:px-10">
                <button onClick={() => router.push("/cliente")} aria-label="Página inicial" className="flex items-center gap-3">
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
                    <button onClick={() => router.push("/login")} aria-label="Sair da conta" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-900">
                        <LogOut className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-10">
                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
                        {abas.map(({ nome, Icon, rota, ativo }) => (
                            <button
                                key={nome}
                                type="button"
                                onClick={() => {
                                    if (rota) router.push(rota);
                                    else window.alert("Mensagens estarão disponíveis em breve.");
                                }}
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

                    <section className="bg-slate-50/70 px-4 py-7 sm:px-8 sm:py-9">
                        <h1 className="mb-7 text-2xl font-bold text-slate-900 sm:text-3xl">
                            Rede de Profissionais
                        </h1>

                        {carregando ? (
                            <p className="rounded-2xl bg-white px-6 py-12 text-center text-slate-600">
                                Carregando profissionais...
                            </p>
                        ) : erro ? (
                            <div className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Não foi possível carregar os profissionais
                                </h2>
                                <p className="mt-3 break-words text-sm text-red-700">{erro}</p>
                                <button onClick={() => setAtualizar((n) => n + 1)} className="mt-5 rounded-lg bg-cyan-950 px-6 py-3 font-semibold text-white hover:bg-cyan-900">
                                    Tentar novamente
                                </button>
                            </div>
                        ) : profissionais.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                                <BriefcaseBusiness className="mx-auto mb-4 h-12 w-12 text-sky-700" />
                                <h2 className="text-xl font-bold text-slate-900">
                                    Nenhum profissional cadastrado
                                </h2>
                                <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
                                    Quando um colaborador se cadastrar e salvar seus dados,
                                    o perfil poderá aparecer aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-7">
                                {profissionais.map((p, i) => {
                                    const favorito = favoritos.includes(p.id);

                                    return (
                                        <article key={p.id ?? i} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                                            <div className="flex flex-col gap-5 sm:flex-row sm:gap-7">
                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-full bg-sky-200 text-3xl font-bold text-cyan-900 sm:h-24 sm:w-24">
                                                    {p.nome?.trim().charAt(0).toUpperCase() || "?"}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col justify-between gap-4 xl:flex-row">
                                                        <div>
                                                            <h2 className="break-words text-xl font-bold text-slate-950 sm:text-2xl">
                                                                {p.especialidade}
                                                            </h2>
                                                            <p className="mt-1 text-base text-slate-700 sm:text-lg">
                                                                {p.nome}
                                                            </p>
                                                        </div>

                                                        <div className="flex shrink-0 items-center gap-3">
                                                            <button onClick={() => window.alert("Mensagens estarão disponíveis em breve.")} className="flex items-center justify-center gap-2 rounded-full bg-amber-200 px-5 py-3 font-semibold text-amber-950 transition hover:bg-amber-300 sm:px-7">
                                                                <MessageCircle className="h-5 w-5" />
                                                                Conversar
                                                            </button>
                                                            <button
                                                                onClick={() => alternarFavorito(p.id)}
                                                                aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                                                aria-pressed={favorito}
                                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 transition hover:bg-rose-50"
                                                            >
                                                                <Heart className={`h-6 w-6 ${favorito ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="mt-5 whitespace-pre-line break-words text-base leading-7 text-slate-700 sm:text-lg">
                                                        {p.descricao}
                                                    </p>

                                                    <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                                                        <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                                                            <Briefcase className="h-5 w-5 text-slate-500" />
                                                            Experiência
                                                        </h3>
                                                        <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-600 sm:text-base">
                                                            {p.experiencia}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
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
