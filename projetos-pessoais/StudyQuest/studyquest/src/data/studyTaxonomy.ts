export type StudyArea = {
  name: string;
  subjects: Array<{
    name: string;
    topics: string[];
  }>;
};

export const studyAreas: StudyArea[] = [
  {
    name: "Ciencias Exatas",
    subjects: [
      {
        name: "Matematica",
        topics: [
          "Algebra",
          "Geometria",
          "Funcoes",
          "Estatistica",
          "Probabilidade",
          "Porcentagem",
          "Razao e proporcao",
        ],
      },
      {
        name: "Fisica",
        topics: [
          "Mecanica",
          "Termologia",
          "Optica",
          "Ondulatoria",
          "Eletricidade",
          "Cinematica",
          "Dinamica",
        ],
      },
      {
        name: "Quimica",
        topics: [
          "Quimica geral",
          "Fisico-quimica",
          "Quimica organica",
          "Estequiometria",
          "Solucoes",
          "Ligacoes quimicas",
        ],
      },
    ],
  },
  {
    name: "Ciencias da Natureza",
    subjects: [
      {
        name: "Biologia",
        topics: [
          "Ecologia",
          "Genetica",
          "Citologia",
          "Fisiologia humana",
          "Evolucao",
          "Botanica",
          "Zoologia",
        ],
      },
    ],
  },
  {
    name: "Linguagens",
    subjects: [
      {
        name: "Portugues",
        topics: [
          "Gramatica",
          "Interpretacao de texto",
          "Figuras de linguagem",
          "Concordancia",
          "Regencia",
        ],
      },
      {
        name: "Literatura",
        topics: [
          "Escolas literarias",
          "Modernismo",
          "Romantismo",
          "Realismo",
          "Literatura brasileira",
        ],
      },
      {
        name: "Ingles",
        topics: ["Reading", "Vocabulary", "Grammar", "Text interpretation"],
      },
      {
        name: "Redacao",
        topics: [
          "Introducao",
          "Desenvolvimento",
          "Conclusao",
          "Repertorio sociocultural",
          "Competencias ENEM",
          "Tese",
          "Argumentacao",
        ],
      },
    ],
  },
  {
    name: "Ciencias Humanas",
    subjects: [
      {
        name: "Historia",
        topics: [
          "Brasil Colonia",
          "Brasil Imperio",
          "Republica",
          "Guerras Mundiais",
          "Guerra Fria",
          "Antiguidade",
          "Idade Media",
        ],
      },
      {
        name: "Geografia",
        topics: [
          "Geopolitica",
          "Climatologia",
          "Urbanizacao",
          "Cartografia",
          "Globalizacao",
          "Meio ambiente",
        ],
      },
      {
        name: "Filosofia",
        topics: [
          "Filosofia antiga",
          "Etica",
          "Politica",
          "Conhecimento",
          "Existencialismo",
        ],
      },
      {
        name: "Sociologia",
        topics: ["Cultura", "Sociedade", "Trabalho", "Cidadania", "Movimentos sociais"],
      },
    ],
  },
];

export function getAreaForSubject(subject: string) {
  return studyAreas.find((area) =>
    area.subjects.some((item) => item.name === subject),
  )?.name ?? "Linguagens";
}

export function getSubjectsForArea(areaName: string) {
  if (areaName === "all") {
    return studyAreas.flatMap((area) => area.subjects.map((subject) => subject.name));
  }

  return studyAreas.find((area) => area.name === areaName)?.subjects.map((subject) => subject.name) ?? [];
}

export function getTopicsForSubject(subjectName: string) {
  return (
    studyAreas
      .flatMap((area) => area.subjects)
      .find((subject) => subject.name === subjectName)?.topics ?? []
  );
}
