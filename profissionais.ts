export type Profissional = {
    id: number | string;
    nome: string;
    especialidade: string;
    descricao: string;
    experiencia: string;
};

export type NovoProfissional = Omit<Profissional, "id">;

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

export async function listarProfissionais(
    signal?: AbortSignal
): Promise<Profissional[]> {
    const resposta = await fetch(`${API_URL}/servicos`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
        cache: "no-store",
        signal,
    });

    if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const dados: unknown = await resposta.json();

    if (Array.isArray(dados)) {
        return dados as Profissional[];
    }

    if (dados && typeof dados === "object") {
        const objeto = dados as Record<string, unknown>;
        const lista = objeto.content ?? objeto.servicos ?? objeto.data;

        if (Array.isArray(lista)) {
            return lista as Profissional[];
        }
    }

    throw new Error("A API não retornou uma lista válida de profissionais.");
}
