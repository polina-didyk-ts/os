export const REQUEST_TYPES = [
  {
    id: "order",
    icon: "ShoppingCart",
    title: "Order",
    description: "Stationery, food, equipment",
  },
  {
    id: "problem",
    icon: "Search",
    title: "Problem",
    description: "Something is broken or not working",
  },
  {
    id: "question",
    icon: "Mail",
    title: "Question",
    description: "Ask the office manager",
  },
  {
    id: "idea",
    icon: "Lightbulb",
    title: "Idea / Feedback",
    description: "Your suggestions",
  },
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number]["id"];
