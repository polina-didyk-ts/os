export const REQUEST_TYPES = [
  {
    id: "order",
    icon: "ShoppingCart",
    title: "Замовити",
    description: "Канцелярія, їжа, обладнання",
  },
  {
    id: "problem",
    icon: "Search",
    title: "Проблема",
    description: "Зламалось або не працює",
  },
  {
    id: "question",
    icon: "Mail",
    title: "Питання",
    description: "Уточнення до офіс-менеджера",
  },
  {
    id: "idea",
    icon: "Lightbulb",
    title: "Ідея / Фідбек",
    description: "Ваші пропозиції",
  },
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number]["id"];
