export class Utils  {
    static RemoveDots(value: string): string {
        return value.split('.').join("");
    }
    static GetFileName(fullPath: string, dirPath: string): string {
        return fullPath.split(dirPath)[1];
    }
    static ParseWordsApiWord(categories, word) {
        categories.pronunciation = word.pronunciation.all;

        for (let result of word.results) {
            categories.definitions.push(result.definition);
            categories.parts.push(result.partOfSpeech);
            categories.examples.push.apply(categories.examples, result.examples);
            categories.synonyms.push.apply(categories.synonyms, result.synonyms);
        }

        categories.parts = categories.parts.filter((item, pos) => {
            return categories.parts.indexOf(item) == pos;
        });

        categories.synonyms = categories.synonyms.filter((item, pos) => {
            return categories.synonyms.indexOf(item) == pos;
        });

        return;
    }
    static ParseGoogleTranslateWord(categories, word) {
        categories.translations.push.apply(categories.translations, word.target.synonyms);
        return;
    }
}