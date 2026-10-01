import type { DemoRoom } from "@/services/demo/types";

/** Quartos fictícios da demonstração. Fotos ilustrativas, não de uma pousada real. */
export const DEMO_ROOMS: DemoRoom[] = [
  {
    id: "RM-101",
    name: "Suíte Master com Hidro",
    category: "Suíte Master",
    capacity: 2,
    base_price: 680,
    size: "45 m²",
    bed_type: "1 Cama King Size",
    amenities: [
      "Hidromassagem",
      "Varanda com Vista",
      "Ar-Condicionado",
      "Wi-Fi Fibra",
      "Café Gourmet",
      'Smart TV 55"',
    ],
    operational_status: "occupied",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Nossa acomodação mais nobre com banheira de imersão dupla, cama com dossel e varanda privativa voltada para a serra.",
    is_active: true,
  },
  {
    id: "RM-102",
    name: "Chalé Jardim das Hortênsias",
    category: "Chalé Jardim",
    capacity: 4,
    base_price: 520,
    size: "52 m²",
    bed_type: "1 Cama Queen + 2 Camas Solteiro",
    amenities: [
      "Lareira Ecológica",
      "Deck Privativo",
      "Rede de Descanso",
      "Wi-Fi Fibra",
      "Frigobar Retrô",
      "Cafeteira Nespresso",
    ],
    operational_status: "available",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Ambiente rústico e aconchegante cercado por flores, lareira a lenha e deque privativo com rede para contemplação.",
    is_active: true,
  },
  {
    id: "RM-103",
    name: "Suíte Romântica Serena",
    category: "Suíte Romântica",
    capacity: 2,
    base_price: 490,
    size: "38 m²",
    bed_type: "1 Cama Queen Size",
    amenities: [
      "Ar-Condicionado",
      "Frigobar",
      "Wi-Fi Fibra",
      "Vista Bosque",
      "Chuveiro Duplo",
    ],
    operational_status: "cleaning",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Projetada para casais que buscam tranquilidade, com iluminação acolhedora e enxoval 400 fios de puro algodão egípcio.",
    is_active: true,
  },
  {
    id: "RM-104",
    name: "Apartamento Standard Confort",
    category: "Standard",
    capacity: 3,
    base_price: 340,
    size: "32 m²",
    bed_type: "1 Cama Casal + 1 Solteiro",
    amenities: [
      "Wi-Fi Fibra",
      "Ar-Condicionado",
      "Smart TV",
      "Cofre Digital",
      "Mesa de Trabalho",
    ],
    operational_status: "available",
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Conforto prático e elegante, perfeito para estadias de descanso e pequenas famílias que priorizam excelente custo-benefício.",
    is_active: true,
  },
  {
    id: "RM-105",
    name: "Chalé Mirante da Serra",
    category: "Chalé Jardim",
    capacity: 2,
    base_price: 590,
    size: "44 m²",
    bed_type: "1 Cama King Size",
    amenities: [
      "Ofurô Externo",
      "Vista Panorâmica",
      "Ar Quente/Frio",
      "Adega de Vinhos",
      "Wi-Fi Fibra",
    ],
    operational_status: "maintenance",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "No ponto mais alto da pousada, possui ofurô aquecido ao ar livre sob um pergolado de madeira nobre.",
    is_active: true,
  },
  {
    id: "RM-106",
    name: "Suíte Família Raízes",
    category: "Família",
    capacity: 5,
    base_price: 610,
    size: "60 m²",
    bed_type: "1 Cama Queen + 3 Camas Solteiro",
    amenities: [
      "2 Ambientes",
      "Cozinha de Apoio",
      "Varanda Térrea",
      "Wi-Fi Fibra",
      'Smart TV 50"',
    ],
    operational_status: "available",
    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Espaço amplo com dois ambientes integrados, ideal para viajar com crianças ou grupos de amigos mantendo a privacidade.",
    is_active: true,
  },
];
