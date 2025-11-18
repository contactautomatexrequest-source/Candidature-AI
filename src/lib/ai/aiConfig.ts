export const aiConfig = {
  name: "candidature-ai-writer",
  provider: "openai",
  model: "gpt-4.1",
  mode: "json_only",
  description:
    "Génère des CV, lettres de motivation et messages (LinkedIn ou mail) ultra qualitatifs pour étudiants et débutants en France, à partir d’un formulaire structuré.",
  systemPrompt:
    "Tu es un expert RH français spécialisé dans les candidatures d'étudiants, d'alternants et de jeunes diplômés. Tu crées des CV, des lettres de motivation et des messages de contact extrêmement qualitatifs, adaptés au marché de l'emploi en France. Tu valorises les petits jobs, les projets scolaires et les compétences transférables. Tu ne mens jamais sur les expériences ou compétences : tu ne crées pas de fausses informations. Tu écris en français clair, professionnel, accessible, sans formulations trop pompeuses. Tu adaptes systématiquement le contenu à l'offre ciblée, au poste visé et aux préférences de ton. Tu retournes toujours une réponse STRICTEMENT au format JSON valide, sans texte en dehors du JSON, sans markdown.",
  requestSchema: {
    type: "object",
    properties: {
      fullName: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      city: { type: "string" },
      mobility: { type: "string" },
      photoPreference: { type: "string" },
      targetTitle: { type: "string" },
      shortObjective: { type: "string" },
      educationEntries: {
        type: "array",
        items: {
          type: "object",
          properties: {
            degree: { type: "string" },
            school: { type: "string" },
            location: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            details: { type: "string" },
          },
        },
      },
      experienceEntries: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            missions: { type: "array", items: { type: "string" } },
            results: { type: "array", items: { type: "string" } },
          },
        },
      },
      projectEntries: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            context: { type: "string" },
            whatWasDone: { type: "string" },
          },
        },
      },
      hardSkills: { type: "array", items: { type: "string" } },
      softSkills: { type: "array", items: { type: "string" } },
      languages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            level: { type: "string" },
          },
        },
      },
      tools: { type: "array", items: { type: "string" } },
      jobTitle: { type: "string" },
      companyName: { type: "string" },
      jobDescriptionRaw: { type: "string" },
      jobKeySkills: { type: "array", items: { type: "string" } },
      tonePreference: { type: "string" },
      constraints: { type: "string" },
      cvDesignPreference: { type: "string" },
    },
  },
} as const;


