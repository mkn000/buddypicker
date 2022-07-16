export class User {
  name: string;
  name_alt?: string;
  id: string;

  constructor(name: string, name_alt: string, id: string) {
    this.name = name;
    this.id = id;
    this.name_alt = name_alt;
  }
}
