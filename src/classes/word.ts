export class Word {
  imageURL: string;
  pronunciation: string;
  translations: any;
  definitions: any;
  synonyms: any;
  examples: any;
  parts: any;

  constructor() {
    this.translations = [];
    this.definitions = [];
    this.synonyms = [];
    this.examples = [];
    this.parts = [];
  }
}