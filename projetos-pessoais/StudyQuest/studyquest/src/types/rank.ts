export type CompetitiveRank = {
  id: number;
  name: string;
  division: string;
  minPoints: number;
  colorClass: string;
  icon: "graduation-cap" | "shield" | "flask" | "star" | "brain" | "crown";
};
