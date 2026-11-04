
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  MessageCircle,
  UserCircle,
  BriefcaseBusiness,
  Package,
  LogOut,
  RefreshCw,
} from "lucide-react";

// Endereço do backend
const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

const ROTA_MEUS_PRODUTOS = "/produtos/meus";

type Usuario = {
  nome?: string;
  email?: string;
  tipo?: string;
  id?: number | string;
};

type Servico = {
  id?: number | string;
  nome?: string;
  titulo?: string;
  descricao?: string;
  experiencia?: string;
};

type Produto = {
  id?: number | string;
  nome?: string;
  titulo?: string;
  descricao?: string;
  preco?: number | string;
  imagem?: string;
  imagem_url?: string;
  categoria?: string;
};

function lista(dados: unknown): any[] {
  if (Array.isArray(dados)) return dados;

  if (dados && typeof dados === "object") {
    const d = dados as Record<string, unknown>;
    const itens = d.content ?? d.servicos ?? d.produtos ?? d.data;

    if (Array.isArray(itens)) return itens;
  }

  return [];
}

export default function PerfilColaboradorPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizar, setAtualizar] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarPerfil() {
      try {
        setCarregando(true);
        setErro("");

        const token = localStorage.getItem("token");
        const usuarioSalvo = localStorage.getItem("usuarioLogado");

        if (!token || !usuarioSalvo) {
          router.push("/login");
          return;
        }

        const dadosUsuario = JSON.parse(usuarioSalvo) as Usuario;
        setUsuario(dadosUsuario);

        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const respostaServicos = await fetch(
          `${API}/servicos/meus`,
          {
            method: "GET",
            headers,
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (
          respostaServicos.status === 401 ||
          respostaServicos.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuarioLogado");
          router.push("/login");
          return;
        }

        if (!respostaServicos.ok) {
          throw new Error(
            `Erro ao carregar serviços: HTTP ${respostaServicos.status}`
          );
        }

        const dadosServicos = await respostaServicos.json();
        setServicos(lista(dadosServicos));

        try {
          const respostaProdutos = await fetch(
            `${API}${ROTA_MEUS_PRODUTOS}`,
            {
              method: "GET",
              headers,
              cache: "no-store",
              signal: controller.signal,
            }
          );

          if (
            respostaProdutos.status === 401 ||
            respostaProdutos.status === 403
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuarioLogado");
            router.push("/login");
            return;
          }

          if (respostaProdutos.ok) {
            const dadosProdutos = await respostaProdutos.json();
            setProdutos(lista(dadosProdutos));
          } else {
            setProdutos([]);
            console.warn(
              "Não foi possível carregar os produtos:",
              respostaProdutos.status
            );
          }
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;

          console.error("Erro ao buscar produtos:", e);
          setProdutos([]);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;

        setErro(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar seu perfil."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarPerfil();

    return () => controller.abort();
  }, [atualizar, router]);

  // Navegação entre as páginas
  const abas = [
    {
      nome: "Início",
      Icon: LayoutGrid,
      rota: "/colaborador",
    },
    {
      nome: "Loja",
      Icon: ShoppingCart,
      rota: "/colaborador/loja",
    },
    {
      nome: "Mensagens",
      Icon: MessageCircle,
      rota: "/colaborador/mensagens",
    },
    {
      nome: "Perfil",
      Icon: UserCircle,
      rota: "/colaborador/perfil",
    },
  ];

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioLogado");
    router.push("/login");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-sky-50 text-slate-800">

      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">

          <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
            {abas.map(({ nome, Icon, rota }) => (
              <button
                key={nome}
                onClick={() => router.push(rota)}
                className={`flex min-h-14 items-center justify-center gap-2 px-2 py-3 text-sm transition sm:min-h-16 sm:px-3 sm:py-4 sm:text-base ${
                  nome === "Perfil"
                    ? "bg-sky-200 font-semibold text-cyan-950"
                    : "text-slate-600 hover:bg-sky-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span>{nome}</span>
              </button>
            ))}
          </nav>

          <section className="min-h-[650px] bg-slate-50/70 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

            <div className="mx-auto max-w-6xl">

              <article className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-8">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-200 sm:h-20 sm:w-20">
                  <UserCircle className="h-9 w-9 text-cyan-900 sm:h-11 sm:w-11" />
                </div>

                <div className="min-w-0 flex-1">

                  <h1 className="break-words text-xl font-bold text-slate-950 sm:text-2xl">
                    {usuario?.nome || "Colaborador"}
                  </h1>

                  <p className="mt-1 break-all text-sm text-slate-500 sm:text-base sm:text-lg">
                    {usuario?.email || "E-mail não informado"}
                  </p>

                  <span className="mt-3 inline-flex max-w-full rounded-full bg-sky-200 px-3 py-2 text-xs font-medium text-cyan-950 sm:px-4 sm:text-sm">
                    Vendedor e prestador de serviços
                  </span>

                </div>

                <button
                  onClick={sair}
                  className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700 sm:w-auto sm:py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>

              </article>

              <section className="mt-8 sm:mt-9">

                <div className="flex items-center gap-3">
                  <BriefcaseBusiness className="h-5 w-5 shrink-0 text-cyan-900 sm:h-6 sm:w-6" />

                  <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                    Seus Serviços
                  </h2>
                </div>

                {carregando ? (
                  <p className="py-12 text-center text-sm text-slate-500 sm:py-16 sm:text-base">
                    Carregando seus serviços...
                  </p>
                ) : erro ? (
                  <p className="mt-5 break-words rounded-xl bg-white p-5 text-center text-sm text-red-600 sm:mt-6 sm:p-6 sm:text-base">
                    {erro}
                  </p>
                ) : servicos.length === 0 ? (
                  <div className="py-10 text-center sm:py-14">
                    <p className="text-base text-slate-500 sm:text-lg">
                      Nenhum serviço cadastrado.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">

                    {servicos.map((servico, index) => (
                      <article
                        key={servico.id ?? index}
                        className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 sm:h-11 sm:w-11">
                            <BriefcaseBusiness className="h-5 w-5 text-cyan-900" />
                          </div>

                          <h3 className="break-words text-base font-bold text-cyan-950 sm:text-lg">
                            {servico.titulo || servico.nome || "Serviço"}
                          </h3>

                        </div>

                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                          {servico.descricao || "Sem descrição disponível."}
                        </p>

                        {servico.experiencia && (
                          <p className="mt-3 break-words text-sm leading-6 text-slate-500">
                            <strong>Experiência:</strong>{" "}
                            {servico.experiencia}
                          </p>
                        )}
                      </article>
                    ))}

                  </div>
                )}

              </section>

              <section className="mt-9 sm:mt-12">

                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 shrink-0 text-cyan-900 sm:h-6 sm:w-6" />

                  <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                    Seus Produtos
                  </h2>
                </div>

                {carregando ? (
                  <p className="py-12 text-center text-sm text-slate-500 sm:py-16 sm:text-base">
                    Carregando seus produtos...
                  </p>
                ) : produtos.length === 0 ? (
                  <div className="py-10 text-center sm:py-14">
                    <p className="text-base text-slate-500 sm:text-lg">
                      Nenhum produto anunciado.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">

                    {produtos.map((produto, index) => (
                      <article
                        key={produto.id ?? index}
                        className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                      >
                        {(produto.imagem || produto.imagem_url) && (
                          <img
                            src={produto.imagem || produto.imagem_url}
                            alt={produto.nome || produto.titulo || "Produto"}
                            className="h-44 w-full object-cover sm:h-48"
                          />
                        )}

                        <div className="p-4 sm:p-6">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 sm:h-11 sm:w-11">
                              <Package className="h-5 w-5 text-cyan-900" />
                            </div>

                            <h3 className="break-words text-base font-bold text-cyan-950 sm:text-lg">
                              {produto.nome || produto.titulo || "Produto"}
                            </h3>

                          </div>

                          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                            {produto.descricao || "Sem descrição disponível."}
                          </p>

                          {produto.categoria && (
                            <p className="mt-2 break-words text-sm text-slate-500">
                              Categoria: {produto.categoria}
                            </p>
                          )}

                          {produto.preco !== undefined && (
                            <p className="mt-4 break-words text-lg font-bold text-cyan-950">
                              R$ {String(produto.preco)}
                            </p>
                          )}

                        </div>
                      </article>
                    ))}

                  </div>
                )}

              </section>

              <div className="mt-8 flex justify-center sm:mt-10">
                <button
                  onClick={() => setAtualizar((n) => n + 1)}
                  disabled={carregando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar informações
                </button>
              </div>

            </div>

          </section>

        </div>

        <footer className="px-2 py-5 text-center text-xs text-slate-500 sm:py-6 sm:text-sm">
          EletroConnect — Perfil do colaborador
        </footer>

      </div>

    </main>
  );
}
