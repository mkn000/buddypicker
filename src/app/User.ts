export class User {
  name: string;
  name_alt?: string;
  id: string;
  isMember?: boolean | null;
  assignedTo?: number | null;

  constructor(name: string, name_alt: string, id: string) {
    this.name = name;
    this.id = id;
    this.name_alt = name_alt;
  }
}
