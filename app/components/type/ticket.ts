
export type Ticket = {
  id: number;
  content: string;
  isTemp?: boolean;
};

export type List = {
  id: string;
  category: string;
  tickets: Ticket[];
};

export type ProjectDetail = {
  id?: string;
  lists: List[];
};