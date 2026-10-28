
"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  LogOut,
  BriefcaseBusiness,
  ShoppingCart,
  MessageCircle,
  UserCircle,
  Send,
  ArrowLeft,
} from "lucide-react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

type Mensagem = {
  id: string;
  user: string;
  text: string;
  createdAt: string;
};

export default function MensagensPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const fimMensagensRef = useRef<HTMLDivElement | null>(null);

  const [nome, setNome] = useState("");
  const [codigoSala, setCodigoSala] = useState("");
  const [texto, setTexto] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conectado, setConectado] = useState(false);
  const [entrou, setEntrou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [ano, setAno] = useState<number | null>(null);

  // Define o ano somente depois que o componente for montado.
  useEffect(() => {
    setAno(new Date().getFullYear());
  }, []);

  // Conexão com o servidor Socket.IO.
  useEffect(() => {
    const socket = io("http://localhost:3001", {
      autoConnect: false,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConectado(true);
      setErro("");
    });

    socket.on("disconnect", () => {
      setConectado(false);
    });

    socket.on("connect_error", () => {
      setConectado(false);
      setErro("Não foi possível conectar ao servidor do chat.");
    });

    socket.on("chat:history", (historico: Mensagem[]) => {
      setMensagens(Array.isArray(historico) ? historico : []);
      setCarregando(false);
    });

    socket.on("chat:message", (mensagem: Mensagem) => {
      setMensagens((atuais) => {
        if (atuais.some((item) => item.id === mensagem.id)) {
          return atuais;
        }

        return [...atuais, mensagem];
      });
    });

    socket.on("chat:error", (mensagem: string) => {
      setErro(mensagem);
      setCarregando(false);
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Mantém a conversa posicionada na mensagem mais recente.
  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [mensagens]);

  function entrarNaConversa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const socket = socketRef.current;
    const nomeLimpo = nome.trim();
    const salaLimpa = codigoSala.trim();

    setErro("");

    if (!socket?.connected) {
      setErro("O servidor do chat está desconectado.");
      return;
    }

    if (!nomeLimpo || !salaLimpa) {
      setErro("Informe seu nome e o código da conversa.");
      return;
    }

    setCarregando(true);
    setMensagens([]);

    socket.emit("chat:join", {
      user: nomeLimpo,
      roomId: salaLimpa,
    });

    setEntrou(true);
  }

  function enviarMensagem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const socket = socketRef.current;
    const mensagemLimpa = texto.trim();

    if (!socket?.connected || !entrou || !mensagemLimpa) {
      return;
    }

    setErro("");

    socket.emit("chat:send", {
      text: mensagemLimpa,
    });

    setTexto("");
  }

  function sairDaConversa() {
    setEntrou(false);
    setMensagens([]);
    setTexto("");
    setErro("");
    setCarregando(false);
  }

  const abas = [
    {
      nome: "Profissionais",
      Icon: BriefcaseBusiness,
      rota: "/cliente",
    },
    {
      nome: "Loja",
      Icon: ShoppingCart,
      rota: "/cliente/loja",
    },
    {
      nome: "Mensagens",
      Icon: MessageCircle,
      rota: "/cliente/mensagens",
    },
    {
      nome: "Perfil",
      Icon: UserCircle,
      rota: "/cliente/perfil",
    },
  ];

  return (
    <main className="min-h-screen bg-sky-50 text-slate-800">
      {/* Cabeçalho da EletroConnect */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white px-5 py-4 shadow-sm sm:px-10">
        <button
          type="button"
          onClick={() => router.push("/cliente")}
          aria-label="Página inicial"
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
          {/* Navegação do cliente */}
          <nav className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
            {abas.map(({ nome: titulo, Icon, rota }) => {
              const ativo = titulo === "Mensagens";

              return (
                <button
                  key={titulo}
                  type="button"
                  onClick={() => router.push(rota)}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex min-h-[70px] items-center justify-center gap-2 px-3 py-4 text-sm transition sm:text-base ${
                    ativo
                      ? "bg-sky-200 font-semibold text-cyan-900"
                      : "text-slate-600 hover:bg-sky-50"
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {titulo}
                </button>
              );
            })}
          </nav>

          {/* Área de mensagens */}
          <section className="bg-slate-50/70 px-4 py-7 sm:px-8 sm:py-9">
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Mensagens
            </h1>

            <p className="mb-6 text-slate-600">
              Converse em tempo real com outros usuários da EletroConnect.
            </p>

            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
              {/* Status da conexão */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {entrou ? `Conversa: ${codigoSala}` : "Nova conversa"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    <span
                      className={`mr-2 inline-block h-2 w-2 rounded-full ${
                        conectado ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {conectado ? "Conectado" : "Desconectado"}
                  </p>
                </div>

                {entrou && (
                  <button
                    type="button"
                    onClick={sairDaConversa}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>
                )}
              </div>

              {!entrou ? (
                <form
                  onSubmit={entrarNaConversa}
                  className="space-y-5 p-5 sm:p-8"
                >
                  <div>
                    <label
                      htmlFor="nome"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Seu nome
                    </label>

                    <input
                      id="nome"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      placeholder="Digite seu nome"
                      maxLength={40}
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="codigoSala"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Código da conversa
                    </label>

                    <input
                      id="codigoSala"
                      value={codigoSala}
                      onChange={(event) => setCodigoSala(event.target.value)}
                      placeholder="Ex.: conversa-123"
                      maxLength={80}
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      As duas pessoas precisam usar o mesmo código.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!conectado || carregando}
                    className="w-full rounded-lg bg-cyan-900 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {carregando ? "Entrando..." : "Entrar na conversa"}
                  </button>
                </form>
              ) : (
                <>
                  {/* Histórico de mensagens */}
                  <div className="h-[420px] space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6">
                    {mensagens.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <MessageCircle className="mb-3 h-12 w-12 text-sky-300" />

                        <p className="font-medium text-slate-700">
                          Nenhuma mensagem ainda
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Envie a primeira mensagem para começar!
                        </p>
                      </div>
                    ) : (
                      mensagens.map((mensagem) => {
                        const minhaMensagem =
                          mensagem.user === nome.trim();

                        return (
                          <div
                            key={mensagem.id}
                            className={`flex ${
                              minhaMensagem ? "justify-end" : "justify-start"
                            }`}
                          >
                            <article
                              className={`max-w-[85%] break-words rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                                minhaMensagem
                                  ? "rounded-br-sm bg-cyan-900 text-white"
                                  : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <p
                                className={`mb-1 text-xs font-semibold ${
                                  minhaMensagem
                                    ? "text-sky-100"
                                    : "text-cyan-900"
                                }`}
                              >
                                {mensagem.user}
                              </p>

                              <p className="whitespace-pre-wrap">
                                {mensagem.text}
                              </p>

                              <p
                                className={`mt-2 text-right text-xs ${
                                  minhaMensagem
                                    ? "text-sky-100"
                                    : "text-slate-400"
                                }`}
                              >
                                {new Date(
                                  mensagem.createdAt
                                ).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </article>
                          </div>
                        );
                      })
                    )}

                    <div ref={fimMensagensRef} />
                  </div>

                  {/* Envio de mensagens */}
                  <form
                    onSubmit={enviarMensagem}
                    className="flex items-center gap-2 border-t border-slate-200 bg-white p-4"
                  >
                    <input
                      value={texto}
                      onChange={(event) => setTexto(event.target.value)}
                      placeholder="Digite sua mensagem..."
                      maxLength={1000}
                      aria-label="Digite sua mensagem"
                      required
                      className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
                    />

                    <button
                      type="submit"
                      disabled={!conectado || !texto.trim()}
                      aria-label="Enviar mensagem"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </>
              )}

              {erro && (
                <p
                  role="alert"
                  className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
                >
                  {erro}
                </p>
              )}
            </div>
          </section>
        </div>

        <footer className="py-6 text-center text-sm text-slate-500">
          © {ano ?? ""} EletroConnect. Todos os direitos reservados.
        </footer>
      </div>
    </main>
  );
}
