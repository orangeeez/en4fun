export class Lingua {
    static helpingVerbs = ['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'could', 'should', 'would', 'may', 'might', 'must', 'shall', 'can', 'will', 'do', 'did', 'does', 'having'];
    static personalPronouns = ['i', 'me', 'we', 'us', 'you', 'she', 'she', 'he', 'it', 'they'];    
    static relativePronouns = [ 'that', 'which', 'who', 'whom', 'whose', 'whichever', 'whoever', 'whomever'];
    static demonstrativePronouns = ['this', 'that', 'those', 'these'];
    static indefinitePronouns = ['anybody', 'anyone', 'anything', 'each', 'either', 'everybody', 'everyone', 'everything', 'neither', 'nobody', 'noone', 'nothing', 'one', 'somebody', 'someone', 'something'];
    static reflexivePronouns = ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves'];
    static possessivePronouns = ['her', 'him', 'my', 'your', 'his', 'its', 'our', 'their', 'them', 'ours', 'yours', 'theirs', 'hers'];

    static checkForPronounsAndVerbs(value: string) {
        value = value.toLowerCase();
        if (this.isInArray(value, this.helpingVerbs))
            return this.getRandomValues(6, this.helpingVerbs, value);
        
        else if (this.isInArray(value, this.personalPronouns))
            return this.getRandomValues(6, this.personalPronouns, value);
        
        else if (this.isInArray(value, this.relativePronouns))
            return this.getRandomValues(6, this.relativePronouns, value);        

        else if (this.isInArray(value, this.demonstrativePronouns))
            return this.getRandomValues(6, this.demonstrativePronouns, value);        

        else if (this.isInArray(value, this.indefinitePronouns))
            return this.getRandomValues(6, this.indefinitePronouns, value);

        else if (this.isInArray(value, this.demonstrativePronouns))
            return this.getRandomValues(4, this.demonstrativePronouns, value);

        else if (this.isInArray(value, this.possessivePronouns))
            return this.getRandomValues(6, this.possessivePronouns, value);
    }

    static isInArray(value, array) {
        return array.indexOf(value) > -1;
    }

    static getRandomValues(count, arr, value){
        var result = [];
        var _tmp = arr.slice();
        for(var i = 0; i<count; i++){
          var index = Math.ceil(Math.random() * 10) % _tmp.length;
          result.push(_tmp.splice(index, 1)[0]);
        }
        if (!this.isInArray(value, result))
            result[Math.floor(Math.random() * result.length)] = value;

        return result;
    }
    static shuffleArray(array): any[] {
        let a = array;
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
}
