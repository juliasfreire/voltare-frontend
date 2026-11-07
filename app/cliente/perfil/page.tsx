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
    Mail,
} from "lucide-react";

type Usuario = {
    id?: number | string;
    nome?: string;
    email?: string;
    tipo?: string;
};

type Favorito = {
    id: string;
    nome: string;
};

const CHAVE_FAVORITOS = "eletroconnect_favoritos_cliente";

export default function PerfilClientePage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [favoritos, setFavoritos] = useState<Favorito[]>([]);

    // Recupera os dados do usuário salvos durante o login.
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
            console.error("Erro ao recuperar dados do usuário:", error);

            localStorage.removeItem("usuarioLogado");
            router.push("/login");
        }
    }, [router]);

    // Carrega os profissionais favoritos salvos na página inicial.
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

    // Remove um profissional dos favoritos.
    function removerFavorito(id: string) {
        setFavoritos((atuais) => {
            const atualizados = atuais.filter(
                (favorito) => favorito.id !== id
            );

            try {
                localStorage.setItem(
                    CHAVE_FAVORITOS,
                    JSON.stringify(atualizados)
                );
            } catch (error) {
                console.error("Erro ao atualizar favoritos:", error);
            }

            return atualizados;
        });
    }

    function sair() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioLogado");
        router.push("/login");
    }

    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-sky-50 text-slate-800">

            <header className="flex min-h-19 w-full flex-col items-center justify-between gap-3 border-b border-sky-100 bg-white px-4 py-4 shadow-sm sm:flex-row sm:px-6 md:px-10">

                <button
                    type="button"
                    onClick={() => router.push("/cliente")}
                    className="flex items-center gap-2 sm:gap-3"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 sm:h-12 sm:w-12">
                        <Zap className="h-6 w-6 fill-amber-300 text-amber-950 sm:h-7 sm:w-7" />
                    </span>

                    <span className="text-xl font-bold text-cyan-900 sm:text-2xl">
                        Voltare
                    </span>
                </button>

                <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-end">

                    <span className="text-sm text-slate-600 sm:text-base">
                        Olá, {usuario?.nome || "Cliente"}
                    </span>

                    <button
                        type="button"
                        onClick={sair}
                        aria-label="Sair da conta"
                        title="Sair"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-900"
                    >
                        <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>

                </div>
            </header>

            <div className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-6 sm:py-8 md:px-8 md:py-10">

                <div className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-sm sm:rounded-2xl">

                    {/* Alterado de grid-cols-2 para grid-cols-4 para ficarem em linha reta */}
                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">

                        <button
                            type="button"
                            onClick={() => router.push("/cliente")}
                            className="flex min-h-16.25 items-center justify-center gap-2 px-2 py-3 text-xs text-slate-600 transition hover:bg-sky-50 sm:min-h-17.5 sm:px-3 sm:text-sm md:text-base"
                        >
                            <BriefcaseBusiness className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                            <span>Profissionais</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/cliente/loja")}
                            className="flex min-h-16.25 items-center justify-center gap-2 px-2 py-3 text-xs text-slate-600 transition hover:bg-sky-50 sm:min-h-17.5 sm:px-3 sm:text-sm md:text-base"
                        >
                            <ShoppingCart className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                            <span>Loja</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/cliente/mensagens")}
                            className="flex min-h-16.25 items-center justify-center gap-2 px-2 py-3 text-xs text-slate-600 transition hover:bg-sky-50 sm:min-h-17.5 sm:px-3 sm:text-sm md:text-base"
                        >
                            <MessageCircle className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                            <span>Mensagens</span>
                        </button>

                        <button
                            type="button"
                            aria-current="page"
                            className="flex min-h-16.25 items-center justify-center gap-2 border-b-2 border-sky-300 bg-sky-200 px-2 py-3 text-xs font-semibold text-cyan-900 sm:min-h-17.5 sm:px-3 sm:text-sm md:text-base"
                        >
                            <UserCircle className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                            <span>Perfil</span>
                        </button>

                    </nav>

                    <section className="bg-slate-50/70 px-3 py-6 sm:px-6 sm:py-8 md:px-8 md:py-9">

                        <div className="mx-auto w-full max-w-5xl">

                            <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:mb-7 sm:text-3xl">
                                Meu Perfil
                            </h1>

                            <article className="flex flex-col items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:rounded-2xl sm:p-6 md:p-8">

                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sky-200 text-cyan-900 sm:h-24 sm:w-24">
                                    <UserCircle className="h-14 w-14 sm:h-16 sm:w-16" />
                                </div>

                                <div className="w-full min-w-0 flex-1 text-center sm:text-left">

                                    <h2 className="wrap-break-word text-xl font-bold text-slate-950 sm:text-2xl">
                                        {usuario?.nome || "Cliente"}
                                    </h2>

                                    <p className="mt-2 flex items-center justify-center gap-2 break-all text-sm text-slate-500 sm:justify-start sm:text-base">
                                        <Mail className="h-5 w-5 shrink-0" />
                                        {usuario?.email || "E-mail não informado"}
                                    </p>

                                    <span className="mt-4 inline-flex rounded-full bg-sky-200 px-4 py-1.5 text-xs font-medium text-cyan-950 sm:text-sm">
                                        Perfil de cliente
                                    </span>

                                </div>

                            </article>

                            <section className="mt-8 sm:mt-10">

                                <h2 className="mb-5 flex items-center justify-center gap-2 text-center text-lg font-bold text-slate-950 sm:justify-start sm:text-2xl">
                                    <Heart className="h-5 w-5 shrink-0 fill-red-500 text-red-500 sm:h-6 sm:w-6" />
                                    <span>Profissionais Favoritos</span>
                                    <span className="text-sm font-medium text-slate-500">
                                        ({favoritos.length})
                                    </span>
                                </h2>

                                {favoritos.length === 0 ? (

                                    <div className="flex min-h-37.5 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-7 text-center sm:rounded-2xl sm:px-5 sm:py-8">

                                        <Heart className="mb-3 h-9 w-9 text-slate-300" />

                                        <p className="max-w-lg text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                                            Seus profissionais favoritos aparecerão
                                            aqui quando você adicionar alguém aos
                                            favoritos na página de profissionais.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => router.push("/cliente")}
                                            className="mt-4 text-sm font-semibold text-cyan-900 hover:underline sm:text-base"
                                        >
                                            Explorar profissionais
                                        </button>

                                    </div>

                                ) : (

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        {favoritos.map((favorito) => (

                                            <article
                                                key={favorito.id}
                                                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-5"
                                            >

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-200 text-lg font-bold text-cyan-900">
                                                        {favorito.nome?.trim().charAt(0).toUpperCase() || "C"}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="wrap-break-word text-sm font-bold text-slate-950 sm:text-base">
                                                            {favorito.nome || "Colaborador"}
                                                        </h3>

                                                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                                            Colaborador favorito
                                                        </p>
                                                    </div>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removerFavorito(favorito.id)}
                                                    aria-label={`Remover ${favorito.nome} dos favoritos`}
                                                    title="Desfavoritar"
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 transition hover:bg-rose-50"
                                                >
                                                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                                                </button>

                                            </article>

                                        ))}

                                    </div>

                                )}

                            </section>

                        </div>
                    </section>
                </div>

                <footer className="px-2 py-6 text-center text-xs text-slate-500 sm:text-sm">
                    © Voltare. Todos os direitos reservados.
                </footer>

            </div>
        </main>
    );
}