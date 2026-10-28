
"use client";

import { useRouter } from "next/navigation";
import { Zap, Users, Shield, ShoppingBag } from "lucide-react";

export default function SobrePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-sky-50 px-5 pb-12 pt-2 sm:px-8">

           
            <section className="flex flex-col items-center text-center">

               
                <div className="mb-10 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-amber-200 shadow-lg">
                    <Zap className="h-14 w-14 fill-amber-300 text-amber-950" />
                </div>

                
                <h1 className="text-4xl font-extrabold tracking-tight text-cyan-900 sm:text-5xl lg:text-7xl">
                    A Rede da Eletrotécnica
                </h1>

                
                <p className="mt-6 max-w-5xl text-lg leading-relaxed text-slate-700 sm:text-2xl">
                    Conectamos clientes aos melhores profissionais do mercado.
                    Contrate serviços especializados e compre peças de reposição
                    com segurança e rapidez.
                </p>

                <button
                    type="button"
                    onClick={() => router.push("/cadastro")}
                    className="mt-14 rounded-full bg-amber-200 px-10 py-5 text-lg font-bold text-amber-950 shadow-md transition-colors hover:bg-amber-300 sm:px-16 sm:text-2xl"
                >
                    Entrar na Plataforma
                </button>

            </section>

            <section className="mx-auto mt-24 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">

                <div className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center shadow-sm transition-shadow hover:shadow-md">

                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-200">
                        <Users className="h-10 w-10 text-cyan-900" />
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-slate-950 sm:text-2xl">
                        Conexão Direta
                    </h2>

                    <p className="text-base leading-7 text-slate-600 sm:text-lg">
                        Chat integrado para negociar diretamente com profissionais
                        e encontrar a solução ideal para seu serviço.
                    </p>

                </div>

                <div className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center shadow-sm transition-shadow hover:shadow-md">

                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-200">
                        <Shield className="h-10 w-10 text-cyan-900" />
                    </div>

                    <h2 className="mb-3 text-xl font-bold text-slate-950 sm:text-2xl">
                        Perfis Verificados
                    </h2>

                    <p className="text-base leading-7 text-slate-600 sm:text-lg">
                        Analise o portfólio e a experiência de cada profissional
                        para escolher quem atende às suas necessidades.
                    </p>

                </div>

                <div className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center shadow-sm transition-shadow hover:shadow-md">

                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-200">
                        <ShoppingBag className="h-10 w-10 text-cyan-900" />
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
