// The first matching rule wins, so keep more specific keywords before generic ones.
export const OFX_CATEGORY_RULES = [
  { category: "Transporte", keywords: ["uber", "99", "taxi", "metro", "metrô", "onibus", "ônibus", "combustivel", "combustível", "posto"] },
  { category: "Alimentação", keywords: ["ifood", "mercado", "supermercado", "mercearia", "padaria", "restaurante", "cafe", "café", "oxxo"] },
  { category: "Moradia", keywords: ["aluguel", "condominio", "condomínio"] },
  { category: "Saúde", keywords: ["farmacia", "farmácia", "drogaria", "medico", "médico", "hospital", "clinica", "clínica", "dr", "drog", "med", "medic", "medicina"] },
  { category: "Assinaturas", keywords: ["netflix", "spotify", "google", "apple", "assinatura", "prime", "disney", "hbo", "max"] },
  { category: "Contas da casa", keywords: ["energia", "luz", "agua", "água", "internet", "telefone", "celular", "gas", "gás"] },
  { category: "Educação", keywords: ["escola", "faculdade", "curso", "alura", "udemy", "educacao", "educação"] },
  { category: "Compras", keywords: ["amazon", "mercado livre", "shopee", "compra", "magazine", "magalu", "marketp"] },
  { category: "Viagens", keywords: ["hotel", "airbnb", "booking", "passagem", "latam", "gol", "azul"] },
  { category: "Cuidados pessoais", keywords: ["barbearia", "salao", "salão", "cabelo", "academia"] },
  { category: "Pets", keywords: ["pet", "veterinario", "veterinário", "racao", "ração"] },
];
