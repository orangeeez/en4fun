import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { CollectionPage } from "../collection/collection";

@Component({
  selector: 'page-reading-training',
  templateUrl: 'reading-training.html',
})
export class ReadingTrainingPage {
  studentKey: string;
  coefficient: number;
  collection: any;
  reading: any;
  section: string = 'answer';
  questionsAnswer: any[] = [];
  questionsTrueFalse: any[] = [];
  questionsAnswerObservable: FirebaseListObservable<any[]>;
  questionsTrueFalseObservable: FirebaseListObservable<any[]>;
  coefficientObservable: FirebaseObjectObservable<any>;
  questionsAnswerIndex: number = 0;
  questionsTrueFalseIndex: number = 0;
  currentCoefficient: number = 0;
  isAnswered: boolean;
  isAnsweredTrue: boolean;
  isLastQuestion: boolean;
  isLastQuestionsAnswer: boolean;
  isLastTrueFalse: boolean;

  constructor(
    public appCtrl: App,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) {
      this.studentKey = this.navParams.get('studentKey');
      this.collection = this.navParams.get('collection');
      this.reading = this.navParams.get('reading');

      this.questionsAnswerObservable = this.afDB.list(`/readingQuestions/${this.collection.$key}/${this.reading.$key}/answer`);
      this.questionsTrueFalseObservable = this.afDB.list(`/readingQuestions/${this.collection.$key}/${this.reading.$key}/truefalse`);
      this.coefficientObservable = this.afDB.object(`/learned/${this.afAuth.auth.currentUser['enemail']}/reading/collections/${this.collection.$key}/${this.reading.$key}/coefficient`);

      this.coefficientObservable.set(0);

      this.questionsAnswerObservable
        .subscribe(qaKeys => {
            qaKeys.forEach(qa => {
              this.questionsAnswer.push(qa);
              this.questionsTrueFalseObservable
              .subscribe(qaKeys => {
                  qaKeys.forEach(qtf => {
                    this.questionsTrueFalse.push(qtf);
                    this.coefficient = 100 / (this.questionsAnswer.length + this.questionsTrueFalse.length);
                  });
              });
            });
        });
  }

  onAnswerClick(answer: any, button) {
    this.isAnswered = true;
    this.isAnsweredTrue = answer.isCorrect;

    if (!answer.isCorrect) {
      button._elementRef.nativeElement.style.backgroundColor = '#f53d3d';
      button._elementRef.nativeElement.style.color = 'white';
    }

    if (this.questionsAnswerIndex == this.questionsAnswer.length - 1)
      this.isLastQuestionsAnswer = true;
  }

  onTrueFalseClick(button, isTrue) {
    this.isAnswered = true;

    if (this.questionsTrueFalseIndex == this.questionsTrueFalse.length - 1)
      this.isLastQuestion = true;

    if (this.questionsTrueFalse[this.questionsTrueFalseIndex].isTrue && isTrue) {
      this.isAnsweredTrue = true;
      button._elementRef.nativeElement.style.backgroundColor = '#32db64';
      button._elementRef.nativeElement.style.color = 'white';
    }
    else if (this.questionsTrueFalse[this.questionsTrueFalseIndex].isTrue && !isTrue) {
      this.isAnsweredTrue = false;      
      button._elementRef.nativeElement.style.backgroundColor = '#f53d3d';
      button._elementRef.nativeElement.style.color = 'white';
    }
  }

  onSubmitClick() {
    let key;
    this.isAnswered = false;
    switch (this.section) {
      case 'answer': key = this.questionsAnswer[this.questionsAnswerIndex].$key; break;
      case 'truefalse': key = this.questionsTrueFalse[this.questionsTrueFalseIndex].$key; break;      
    }

    if (this.isAnsweredTrue)
      this.currentCoefficient += this.coefficient;

    this.afDB.database.ref(`learned/${this.afAuth.auth.currentUser['enemail']}/reading/collections/${this.collection.$key}/${this.reading.$key}/${this.section}/${key}`).set(this.isAnsweredTrue);
    this.coefficientObservable.set(this.currentCoefficient);
  }

  onNextSecionClick() {
    this.onSubmitClick();

    this.section = 'truefalse';
    this.isLastQuestionsAnswer = false;
    this.isLastTrueFalse = false;
  }

  onFinishClick() {
    this.onSubmitClick();    
    
    this.appCtrl.getRootNav().push(CollectionPage, {
      type: 'reading',
      collection: this.collection,
      studentKey: this.studentKey
    })
  }
}
