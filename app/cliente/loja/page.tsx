
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function LojaPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-sky-50 px-5 py-8 sm:px-10">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={() => router.push("/cliente")}
                    className="mb-6 flex items-center gap-2 text-cyan-900 hover:underline"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Voltar para profissionais
                </button>

                <section className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-cyan-900" />
                        <h1 className="text-3xl font-bold text-cyan-950">
                            Loja
                        </h1>
                    </div>

                    <p className="mt-4 text-slate-600">
                        Aqui ficarão os produtos e materiais elétricos
                        disponíveis para compra.
                    </p>
                </section>
            </div>
        </main>
    );
}
