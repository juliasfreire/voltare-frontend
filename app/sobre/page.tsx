
"use client";

import { useRouter } from "next/navigation";
import { Zap, Users, Shield, ShoppingBag } from "lucide-react";

export default function SobrePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-sky-50 px-3 pb-10 pt-4 sm:px-8 sm:pb-12 sm:pt-2">

            <section className="flex flex-col items-center text-center">

                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-200 shadow-lg sm:mb-10 sm:h-[120px] sm:w-[120px]">
                    <Zap className="h-11 w-11 fill-amber-300 text-amber-950 sm:h-14 sm:w-14" />
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-cyan-900 sm:text-5xl lg:text-7xl">
                    A Rede da Eletrotécnica
                </h1>

                <p className="mt-4 max-w-5xl text-base leading-relaxed text-slate-700 sm:mt-6 sm:text-2xl">
                    Conectamos clientes aos melhores profissionais do mercado.
                    Contrate serviços especializados e compre peças de reposição
                    com segurança e rapidez.
                </p>

                <button
                    type="button"
                    onClick={() => router.push("/cadastro")}
                    className="mt-8 w-full max-w-xs rounded-full bg-amber-200 px-6 py-4 text-base font-bold text-amber-950 shadow-md transition-colors hover:bg-amber-300 sm:mt-14 sm:max-w-none sm:w-auto sm:px-16 sm:py-5 sm:text-2xl"
                >
                    Entrar na Plataforma
                </button>

            </section>

            <section className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-5 sm:mt-24 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-3xl border border-slate-100 bg-white px-5 py-8 text-center shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-10">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-200 sm:mb-6 sm:h-20 sm:w-20">
                        <Users className="h-8 w-8 text-cyan-900 sm:h-10 sm:w-10" />
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-slate-950 sm:text-2xl">
                        Conexão Direta
                    </h2>

                    <p className="text-base leading-7 text-slate-600 sm:text-lg">
                        Chat integrado para negociar diretamente com profissionais
                        e encontrar a solução ideal para seu serviço.
                    </p>

                </div>

                <div className="rounded-3xl border border-slate-100 bg-white px-5 py-8 text-center shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-10">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-200 sm:mb-6 sm:h-20 sm:w-20">
                        <Shield className="h-8 w-8 text-cyan-900 sm:h-10 sm:w-10" />
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-slate-950 sm:text-2xl">
                        Perfis Verificados
                    </h2>

                    <p className="text-base leading-7 text-slate-600 sm:text-lg">
                        Analise o portfólio e a experiência de cada profissional
                        para escolher quem atende às suas necessidades.
                    </p>

                </div>

                <div className="rounded-3xl border border-slate-100 bg-white px-5 py-8 text-center shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-10 md:col-span-2 lg:col-span-1">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-200 sm:mb-6 sm:h-20 sm:w-20">
                        <ShoppingBag className="h-8 w-8 text-cyan-900 sm:h-10 sm:w-10" />
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-slate-950 sm:text-2xl">
                        Marketplace de Peças
                    </h2>

                    <p className="text-base leading-7 text-slate-600 sm:text-lg">
                        Compre disjuntores, contatores, fios e outros materiais
                        elétricos em um só lugar.
                    </p>

                </div>

            </section>

        </main>
    );
}
