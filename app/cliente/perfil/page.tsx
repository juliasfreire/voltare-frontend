"use client";

import { useRouter } from "next/navigation";
import {Zap,LogOut,BriefcaseBusiness,ShoppingCart,MessageCircle,UserCircle,Heart,ShoppingBag,Mail,
} from "lucide-react";

export default function PerfilClientePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-sky-50 text-slate-800">
            
            <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white px-5 py-4 shadow-sm sm:px-10">
                <button
                    type="button"
                    onClick={() => router.push("/cliente")}
                    className="flex items-center gap-3"
                >
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

                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        aria-label="Sair da conta"
                        title="Sair"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-900"
                    >
                        <LogOut className="h-6 w-6" />
                    </button>
                </div>
            </header>

            
            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-10">
                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">

                    
                    <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
                        <button
                            type="button"
                            onClick={() => router.push("/cliente")}
                            className="flex min-h-[70px] items-center justify-center gap-2 px-3 py-4 text-sm text-slate-600 transition hover:bg-sky-50 sm:text-base"
                        >
                            <BriefcaseBusiness className="h-6 w-6" />
                            Profissionais
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/cliente/loja")}
                            className="flex min-h-[70px] items-center justify-center gap-2 px-3 py-4 text-sm text-slate-600 transition hover:bg-sky-50 sm:text-base"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            Loja
                        </button>

                        <button
                            type="button"
                            className="flex min-h-[70px] items-center justify-center gap-2 px-3 py-4 text-sm text-slate-600 transition hover:bg-sky-50 sm:text-base"
                        >
                            <MessageCircle className="h-6 w-6" />
                            Mensagens
                        </button>

                        <button
                            type="button"
                            aria-current="page"
                            className="flex min-h-[70px] items-center justify-center gap-2 border-b-2 border-sky-300 bg-sky-200 px-3 py-4 text-sm font-semibold text-cyan-900 sm:text-base"
                        >
                            <UserCircle className="h-6 w-6" />
                            Perfil
                        </button>
                    </nav>

                    <section className="bg-slate-50/70 px-4 py-7 sm:px-8 sm:py-9">
                        <div className="mx-auto max-w-5xl">

                            <h1 className="mb-7 text-2xl font-bold text-slate-900 sm:text-3xl">
                                Meu Perfil
                            </h1>

                            <article className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-full bg-sky-200 text-cyan-900">
                                    <UserCircle className="h-16 w-16" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-2xl font-bold text-slate-950">
                                        Nome do Cliente
                                    </h2>

                                    <p className="mt-2 flex items-center gap-2 break-all text-slate-500">
                                        <Mail className="h-5 w-5 shrink-0" />
                                        cliente@email.com
                                    </p>

                                    <span className="mt-4 inline-flex rounded-full bg-sky-200 px-4 py-1.5 text-sm font-medium text-cyan-950">
                                        Perfil de cliente
                                    </span>
                                </div>
                            </article>

                            <section className="mt-10">
                                <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-950 sm:text-2xl">
                                    <Heart className="h-6 w-6 fill-red-500 text-red-500" />
                                    Profissionais Favoritos
                                </h2>

                                <div className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center">
                                    <Heart className="mb-3 h-9 w-9 text-slate-300" />

                                    <p className="max-w-lg leading-7 text-slate-500">
                                        Seus profissionais favoritos aparecerão
                                        aqui quando você adicionar alguém aos
                                        favoritos na página de profissionais.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => router.push("/cliente")}
                                        className="mt-4 font-semibold text-cyan-900 hover:underline"
                                    >
                                        Explorar profissionais
                                    </button>
                                </div>
                            </section>

                            <section className="mt-10">
                                <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-950 sm:text-2xl">
                                    <ShoppingBag className="h-6 w-6 text-cyan-900" />
                                    Minhas Compras
                                </h2>

                                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-200">
                                        <ShoppingBag className="h-8 w-8 text-cyan-900" />
                                    </div>

                                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                        Nenhuma compra para mostrar
                                    </h3>

                                    <p className="mt-2 max-w-lg leading-7 text-slate-500">
                                        Quando a loja estiver integrada, suas
                                        compras e seus pedidos poderão aparecer
                                        nesta seção.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => router.push("/cliente/loja")}
                                        className="mt-4 rounded-lg bg-amber-200 px-6 py-3 font-semibold text-amber-950 transition hover:bg-amber-300"
                                    >
                                        Visitar loja
                                    </button>
                                </div>
                            </section>

                        </div>
                    </section>
                </div>

                <footer className="py-6 text-center text-sm text-slate-500">
                    © EletroConnect. Todos os direitos reservados.
                </footer>
            </div>
        </main>
    );
}
