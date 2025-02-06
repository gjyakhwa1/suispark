export default interface IRoom {
  id: string;
  active: boolean;
  funded: boolean;
  proposal: {
    abstract: string;
    teamDetails: string;
  };
}
