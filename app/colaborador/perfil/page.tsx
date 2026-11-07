
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import {
  LayoutGrid,
  ShoppingCart,
  MessageCircle,
  UserCircle,
  BriefcaseBusiness,
  Package,
  LogOut,
  RefreshCw,
  Trash2,
  Pencil,
  X,
  Zap,
} from "lucide-react";

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
};

type TipoEdicao = "servico" | "produto";

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
  const [erroAcao, setErroAcao] = useState("");
  const [atualizar, setAtualizar] = useState(0);

  const [excluindo, setExcluindo] = useState<string | null>(null);

  const [editandoTipo, setEditandoTipo] =
    useState<TipoEdicao | null>(null);

  const [itemEmEdicao, setItemEmEdicao] = useState<any>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Ano atual: evita erro de variável não declarada e divergência na hidratação.
  const [ano, setAno] = useState<number | null>(null);

  useEffect(() => {
    setAno(new Date().getFullYear());
  }, []);

  // Carregar perfil, serviços e produtos.
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

        // Buscar serviços do colaborador.
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

        // Buscar produtos do colaborador.
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

        if (!respostaProdutos.ok) {
          throw new Error(
            `Erro ao carregar produtos: HTTP ${respostaProdutos.status}`
          );
        }

        const dadosProdutos = await respostaProdutos.json();
        setProdutos(lista(dadosProdutos));

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

  // Excluir serviço ou produto.
  async function excluirAnuncio(
    tipo: TipoEdicao,
    id?: number | string
  ) {
    if (id === undefined || id === null || id === "") {
      setErroAcao("Não foi possível identificar o anúncio para excluir.");
      return;
    }

    const nomeTipo = tipo === "servico" ? "serviço" : "produto";

    const confirmar = window.confirm(
      `Tem certeza de que deseja excluir este ${nomeTipo}? Essa ação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    const chave = `${tipo}-${id}`;

    try {
      setExcluindo(chave);
      setErroAcao("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const rota =
        tipo === "servico"
          ? `/servicos/${encodeURIComponent(String(id))}`
          : `/produtos/${encodeURIComponent(String(id))}`;

      const resposta = await fetch(`${API}${rota}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        resposta.status === 401 ||
        resposta.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioLogado");
        router.push("/login");
        return;
      }

      if (!resposta.ok) {
        const texto = await resposta.text();

        let mensagem = `Erro ao excluir ${nomeTipo}: HTTP ${resposta.status}`;

        if (texto) {
          try {
            const dadosErro = JSON.parse(texto);
            mensagem =
              dadosErro.mensagem ||
              dadosErro.message ||
              mensagem;
          } catch {
            mensagem = texto;
          }
        }

        throw new Error(mensagem);
      }

      if (tipo === "servico") {
        setServicos((anteriores) =>
          anteriores.filter(
            (servico) => String(servico.id) !== String(id)
          )
        );
      } else {
        setProdutos((anteriores) =>
          anteriores.filter(
            (produto) => String(produto.id) !== String(id)
          )
        );
      }

    } catch (e) {
      setErroAcao(
        e instanceof Error
          ? e.message
          : `Não foi possível excluir o ${nomeTipo}.`
      );
    } finally {
      setExcluindo(null);
    }
  }

  // Abrir modal de edição.
  function abrirEdicao(tipo: TipoEdicao, item: Servico | Produto) {
    setErroAcao("");
    setEditandoTipo(tipo);

    if (tipo === "servico") {
      const servico = item as Servico;

      setItemEmEdicao({
        ...servico,
        titulo: servico.titulo ?? servico.nome ?? "",
        descricao: servico.descricao ?? "",
        experiencia: servico.experiencia ?? "",
      });
    } else {
      const produto = item as Produto;

      setItemEmEdicao({
        ...produto,
        nome: produto.nome ?? produto.titulo ?? "",
        preco: produto.preco ?? "",
        descricao: produto.descricao ?? "",
        imagem: produto.imagem ?? produto.imagem_url ?? "",
      });
    }
  }

  // Fechar modal.
  function fecharEdicao() {
    if (salvandoEdicao) return;

    setEditandoTipo(null);
    setItemEmEdicao(null);
  }

  // Salvar edição.
  async function salvarEdicao(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !editandoTipo ||
      !itemEmEdicao ||
      itemEmEdicao.id === undefined ||
      itemEmEdicao.id === null ||
      itemEmEdicao.id === ""
    ) {
      setErroAcao("Não foi possível identificar o anúncio para editar.");
      return;
    }

    try {
      setSalvandoEdicao(true);
      setErroAcao("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const id = encodeURIComponent(String(itemEmEdicao.id));

      const rota =
        editandoTipo === "servico"
          ? `/servicos/${id}`
          : `/produtos/${id}`;

      const corpo =
        editandoTipo === "servico"
          ? {
              titulo: itemEmEdicao.titulo ?? "",
              descricao: itemEmEdicao.descricao ?? "",
              experiencia: itemEmEdicao.experiencia ?? "",
            }
          : {
              nome: itemEmEdicao.nome ?? "",
              preco: itemEmEdicao.preco ?? "",
              descricao: itemEmEdicao.descricao ?? "",
              imagem: itemEmEdicao.imagem ?? "",
            };

      const resposta = await fetch(`${API}${rota}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(corpo),
      });

      if (
        resposta.status === 401 ||
        resposta.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioLogado");
        router.push("/login");
        return;
      }

      if (!resposta.ok) {
        const texto = await resposta.text();

        let mensagem = `Erro ao atualizar ${
          editandoTipo === "servico" ? "serviço" : "produto"
        }: HTTP ${resposta.status}`;

        if (texto) {
          try {
            const dadosErro = JSON.parse(texto);

            mensagem =
              dadosErro.mensagem ||
              dadosErro.message ||
              mensagem;
          } catch {
            mensagem = texto;
          }
        }

        throw new Error(mensagem);
      }

      // Atualizar serviço na tela.
      if (editandoTipo === "servico") {
        const corpoServico = corpo as {
          titulo: string;
          descricao: string;
          experiencia: string;
        };

        setServicos((anteriores) =>
          anteriores.map((servico) =>
            String(servico.id) === String(itemEmEdicao.id)
              ? {
                  ...servico,
                  titulo: corpoServico.titulo,
                  descricao: corpoServico.descricao,
                  experiencia: corpoServico.experiencia,
                }
              : servico
          )
        );
      } else {
        // Atualizar produto na tela.
        const corpoProduto = corpo as {
          nome: string;
          preco: string;
          descricao: string;
          imagem: string;
        };

        setProdutos((anteriores) =>
          anteriores.map((produto) =>
            String(produto.id) === String(itemEmEdicao.id)
              ? {
                  ...produto,
                  nome: corpoProduto.nome,
                  preco: corpoProduto.preco,
                  descricao: corpoProduto.descricao,
                  imagem: corpoProduto.imagem,
                  imagem_url: corpoProduto.imagem,
                }
              : produto
          )
        );
      }

      setEditandoTipo(null);
      setItemEmEdicao(null);

    } catch (e) {
      setErroAcao(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvandoEdicao(false);
    }
  }

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

  // Sair da conta.
  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioLogado");
    router.push("/login");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-sky-50 text-slate-800">

      {/* CABEÇALHO NO TOPO */}
      <div className="w-full p-0">
        <header className="flex min-h-19 w-full flex-col items-center justify-between gap-3 border-b border-sky-100 bg-white px-4 py-4 shadow-sm sm:flex-row sm:px-6 md:px-10">
          <button
            type="button"
            onClick={() => router.push("/colaborador")}
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
              Olá, {usuario?.nome || "Colaborador"}
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
      </div>

      {/* CONTEÚDO E NAVEGAÇÃO */}
      <div className="mx-auto mt-6 w-full max-w-[1600px] px-3 sm:mt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">

          {/* NAVEGAÇÃO */}
          <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
            {abas.map(({ nome, Icon, rota }) => (
              <button
                key={nome}
                type="button"
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

              {/* DADOS DO COLABORADOR */}
              <article className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-200 sm:h-20 sm:w-20">
                  <UserCircle className="h-9 w-9 text-cyan-900 sm:h-11 sm:w-11" />
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="break-words text-xl font-bold text-slate-950 sm:text-2xl">
                    {usuario?.nome || "Colaborador"}
                  </h1>

                  <p className="mt-1 break-all text-sm text-slate-500 sm:text-base">
                    {usuario?.email || "E-mail não informado"}
                  </p>

                  <span className="mt-3 inline-flex max-w-full rounded-full bg-sky-200 px-3 py-2 text-xs font-medium text-cyan-950 sm:px-4 sm:text-sm">
                    Vendedor e prestador de serviços
                  </span>
                </div>
              </article>

              {/* MENSAGENS DE ERRO */}
              {erroAcao && (
                <div
                  role="alert"
                  className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="break-words">{erroAcao}</p>

                  <button
                    type="button"
                    onClick={() => setErroAcao("")}
                    className="self-end font-semibold hover:underline sm:self-auto"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {/* SERVIÇOS */}
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

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => abrirEdicao("servico", servico)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-cyan-950 transition hover:bg-sky-100"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar serviço
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirAnuncio("servico", servico.id)}
                            disabled={
                              excluindo === `servico-${servico.id}` ||
                              excluindo !== null
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            {excluindo === `servico-${servico.id}`
                              ? "Excluindo..."
                              : "Excluir serviço"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* PRODUTOS */}
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

                          {produto.preco !== undefined && (
                            <p className="mt-4 break-words text-lg font-bold text-cyan-950">
                              R$ {String(produto.preco)}
                            </p>
                          )}

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => abrirEdicao("produto", produto)}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-cyan-950 transition hover:bg-sky-100"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar produto
                            </button>

                            <button
                              type="button"
                              onClick={() => excluirAnuncio("produto", produto.id)}
                              disabled={
                                excluindo === `produto-${produto.id}` ||
                                excluindo !== null
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              {excluindo === `produto-${produto.id}`
                                ? "Excluindo..."
                                : "Excluir produto"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* ATUALIZAR */}
              <div className="mt-8 flex justify-center sm:mt-10">
                <button
                  type="button"
                  onClick={() => setAtualizar((n) => n + 1)}
                  disabled={carregando || excluindo !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:opacity-50 sm:w-auto sm:px-6 sm:text-base"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar informações
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RODAPÉ */}
        <footer className="px-2 py-5 text-center text-xs text-slate-500 sm:py-6 sm:text-sm">
          © {ano ?? ""} Voltare. Todos os direitos reservados.
        </footer>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editandoTipo && itemEmEdicao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Editar{" "}
                {editandoTipo === "servico" ? "Serviço" : "Produto"}
              </h3>

              <button
                type="button"
                onClick={fecharEdicao}
                disabled={salvandoEdicao}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Fechar edição"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={salvarEdicao} className="mt-5 space-y-4">
              {/* SERVIÇO */}
              {editandoTipo === "servico" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Título do serviço
                    </label>

                    <input
                      type="text"
                      value={itemEmEdicao.titulo ?? ""}
                      onChange={(e) =>
                        setItemEmEdicao({
                          ...itemEmEdicao,
                          titulo: e.target.value,
                        })
                      }
                      required
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-1 focus:ring-cyan-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Descrição
                    </label>

                    <textarea
                      rows={3}
                      value={itemEmEdicao.descricao ?? ""}
                      onChange={(e) =>
                        setItemEmEdicao({
                          ...itemEmEdicao,
                          descricao: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-1 focus:ring-cyan-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Experiência
                    </label>

                    <input
                      type="text"
                      value={itemEmEdicao.experiencia ?? ""}
                      onChange={(e) =>
                        setItemEmEdicao({
                          ...itemEmEdicao,
                          experiencia: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-1 focus:ring-cyan-900"
                    />
                  </div>
                </>
              )}

              {/* PRODUTO */}
              {editandoTipo === "produto" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Nome do produto
                    </label>

                    <input
                      type="text"
                      value={itemEmEdicao.nome ?? ""}
                      onChange={(e) =>
                        setItemEmEdicao({
                          ...itemEmEdicao,
                          nome: e.target.value,
                        })
                      }
                      required
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-1 focus:ring-cyan-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Descrição
                    </label>

                    <textarea
                      rows={3}
                      value={itemEmEdicao.descricao ?? ""}
                      onChange={(e) =>
                        setItemEmEdicao({
                          ...itemEmEdicao,
                          descricao: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-1 focus:ring-cyan-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Preço (R$)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemEmEdicao.preco ?? ""}
                      onChange={(e) =>
                        setItemEmEdicao({
                          ...itemEmEdicao,
                          preco: e.target.value,
                        })
                      }
                      required
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-1 focus:ring-cyan-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      URL da imagem
                    </label>

                    <input
                      type="text"
                      value={itemEmEdicao.imagem ?? ""}
                      onChange={(e) =>
                        setItemEmEdicao({
                          ...itemEmEdicao,
                          imagem: e.target.value,
                        })
                      }
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-1 focus:ring-cyan-900"
                    />
                  </div>
                </>
              )}

              {/* BOTÕES DO MODAL */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={fecharEdicao}
                  disabled={salvandoEdicao}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="rounded-xl bg-cyan-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:opacity-50"
                >
                  {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
