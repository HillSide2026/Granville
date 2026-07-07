import { granville } from "./granville";

export const homepageFr = {
  navigation: {
    links: [
      { text: "Plateforme", href: "/#platform" },
      { text: "Paiements", href: "/#payments" },
      { text: "Contact", href: "/#contact" },
    ],
    primaryAction: {
      text: "Demander l'accès",
      href: granville.requestAccessUrl,
    },
  },
  hero: {
    tagline: "Paiements Mondiaux",
    title: "Une Plateforme. Des Flux Financiers Mondiaux.",
    subtitle:
      "Granville Finance fournit des infrastructures financières et des technologies de paiement pour aider les entreprises à déplacer, gérer et croître.",
    primaryAction: {
      text: "Demander l'accès",
      href: granville.requestAccessUrl,
    },
    secondaryAction: {
      text: "Découvrir la Plateforme",
      href: "/#platform",
    },
    highlights: [] as string[],
  },
  trust: {
    label: "Infrastructure financière conçue pour les environnements réglementés",
    items: [
      "Paiements domestiques et transfrontaliers",
      "Trésorerie multidevise",
      "Contrôles d'accès de niveau bancaire",
      "Visibilité des règlements en temps réel",
    ],
  },
  products: {
    tagline: "Plateforme",
    title: "Une Plateforme Puissante pour les Flux Financiers Modernes.",
    subtitle: "",
    items: [
      {
        title: "Plateforme de Paiements",
        description:
          "Coordonnez les flux de paiements nationaux et internationaux grâce à une couche d'infrastructure unifiée conçue pour la rapidité et la clarté.",
        icon: "arrow/arrow-transaction-left-right",
      },
      {
        title: "Fonctionnalités de Trésorerie",
        description:
          "Centralisez la gestion des comptes, la visibilité des liquidités, la gestion des devises et les opérations de trésorerie auprès des partenaires financiers.",
        icon: "banking/bank",
      },
      {
        title: "Sécurité Opérationnelle",
        description:
          "Contrôles d'accès intégrés, surveillance, authentification et protections opérationnelles conçus pour les environnements financiers réglementés.",
        icon: "security/shield-protection-secure-check",
      },
    ],
  },
  operatingModel: {
    tagline: "RÉVOLUTIONNER LES PAIEMENTS",
    title: "Optimisez Votre Infrastructure pour les Flux Financiers d'Entreprise.",
    subtitle:
      "Granville Finance aide les entreprises mondiales à optimiser les paiements, les devises et les flux de travail financiers sur tous les marchés sans recourir à des infrastructures bancaires fragmentées.",
    contentTitle: "Conçu pour l'Échelle et le Contrôle",
    contentBody:
      "Modernisez vos opérations mondiales avec une infrastructure financière et de trésorerie conçue pour l'échelle, la visibilité et le contrôle. Granville Finance aide les équipes à simplifier leurs flux de travail et leur croissance internationale grâce à notre plateforme financière unifiée.",
    items: [
      {
        title: "Optimisez les Opérations",
        description:
          "Consolidez les rails de paiement, les processus d'équipe et les systèmes externes en une plateforme unique et unifiée conçue pour l'échelle, la visibilité et le contrôle.",
      },
      {
        title: "Simplifiez les Flux de Travail",
        description:
          "Unifiez les devises, les approbations, la réconciliation et les rapports en flux de travail standardisés qui réduisent les interventions manuelles et améliorent la cohérence opérationnelle sur tous les marchés.",
      },
      {
        title: "Améliorez la Visibilité",
        description:
          "Obtenez une visibilité en temps réel sur les flux de transactions, le statut des règlements, les résultats de réconciliation et les performances opérationnelles grâce à une infrastructure de surveillance et de reporting centralisée.",
      },
    ],
  },
  company: {
    title: "Société",
    items: [
      {
        title: "Carrières",
        description:
          "Construisez l'avenir des mouvements financiers mondiaux. Évoluez avec Granville Finance à mesure que nous développons notre infrastructure financière et notre plateforme technologique de paiement.",
        icon: "user/group-user",
      },
      {
        title: "Actualités",
        description:
          "Suivez les lancements de produits et les mises à jour de l'entreprise. Un espace centralisé pour les annonces, les notes de marché et les jalons de la plateforme au fil de la croissance de Granville Finance.",
        icon: "report/doc-page-paper-lined",
      },
    ],
  },
  closing: {
    tagline: "CONTACT",
    title: "Développez des opérations de paiement mondiales modernes.",
    subtitle:
      "Parlez à Granville Finance pour découvrir comment nous pouvons aider votre équipe d'opérations financières à aller de l'avant avec confiance.",
    primaryAction: {
      text: "Demander l'accès",
      href: granville.requestAccessUrl,
    },
    secondaryAction: {
      text: "Nous contacter",
      href: "/contact",
    },
  },
} as const;
