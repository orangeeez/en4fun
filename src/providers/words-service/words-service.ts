import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import GoogleTranslator from "google-translator";
import 'rxjs/add/operator/map';

@Injectable()
export class WordsServiceProvider {
  url: string;
  conjuctionURL: string;
  headers: Headers;
  mashape: string;
  constructor(public http: Http) {
    this.mashape = 'TtUzsrsEaUmshbfK6VBMls3d7lrdp1zDWOOjsnF36LZus21vvh';
    this.url = 'https://wordsapiv1.p.mashape.com/words/';
    this.conjuctionURL = 'http://192.241.243.213:5000/api/conjuction/';
    this.headers = new Headers();
    this.headers.append('Accept', 'application/json');
    this.headers.append('X-Mashape-Key', this.mashape);
  }

  getWord(word: string): Observable<any> {
    return this.http.get(this.url + word, { headers: this.headers })
      .map(word => word.json());
  }

  translateWord(word: string, callback: any): any {
    return GoogleTranslator('en', 'ru', word, callback);
  }

  getConjuction(word: string) {
    return this.http.get(this.conjuctionURL + word)
      .map(words => words.json());
  }
}
