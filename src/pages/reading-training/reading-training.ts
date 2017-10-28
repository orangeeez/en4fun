import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";

@Component({
  selector: 'page-reading-training',
  templateUrl: 'reading-training.html',
})
export class ReadingTrainingPage {
  studentKey: string;
  coefficient: number;
  collectionKey: any;
  reading: any;
  video: any;
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
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth) {
      this.studentKey = this.navParams.get('studentKey');
      this.collectionKey = this.navParams.get('collectionKey');
      this.reading = this.navParams.get('reading');
      this.video = this.navParams.get('video');    

      if (this.reading) {
        this.questionsAnswerObservable = this.afDB.list(`/readingQuestions/${this.collectionKey}/${this.reading.$key}/answer`);
        this.questionsTrueFalseObservable = this.afDB.list(`/readingQuestions/${this.collectionKey}/${this.reading.$key}/truefalse`);
        this.coefficientObservable = this.afDB.object(`/learned/${this.afAuth.auth.currentUser['enemail']}/reading/collections/${this.collectionKey}/${this.reading.$key}/coefficient`);
      }

      if (this.video) {
        this.questionsAnswerObservable = this.afDB.list(`/videoQuestions/${this.collectionKey}/${this.video.id}/answer`);
        this.questionsTrueFalseObservable = this.afDB.list(`/videoQuestions/${this.collectionKey}/${this.video.id}/truefalse`);
        this.coefficientObservable = this.afDB.object(`/learned/${this.afAuth.auth.currentUser['enemail']}/video/collections/${this.collectionKey}/${this.video.id}/coefficient`);
      }

      this.coefficientObservable.set(0);

      this.questionsAnswerObservable
        .subscribe(qaKeys => {
            qaKeys.forEach(qa => {
                this.questionsAnswer.push(qa);
              });
              this.questionsTrueFalseObservable
              .subscribe(qaKeys => {
                  qaKeys.forEach(qtf => {
                    this.questionsTrueFalse.push(qtf);
                    this.coefficient = 100 / (this.questionsAnswer.length + this.questionsTrueFalse.length);
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
    console.log(this.questionsTrueFalse[this.questionsTrueFalseIndex].isTrue);
    console.log(isTrue);

    this.isAnswered = true;
    
    if (this.questionsTrueFalseIndex == this.questionsTrueFalse.length - 1)
      this.isLastQuestion = true;

    if (this.questionsTrueFalse[this.questionsTrueFalseIndex].isTrue && isTrue) {
      this.isAnsweredTrue = true;
      button._elementRef.nativeElement.style.backgroundColor = '#32db64';
      button._elementRef.nativeElement.style.color = 'white';
    }
    else {
      this.isAnsweredTrue = false;      
      button._elementRef.nativeElement.style.backgroundColor = '#f53d3d';
      button._elementRef.nativeElement.style.color = 'white';
    }
  }

  onSubmitClick(isNextSection?: boolean) {
    let key;
    this.isAnswered = false;
    switch (this.section) {
      case 'answer': 
        key = this.questionsAnswer[this.questionsAnswerIndex].$key;
        if (!isNextSection) this.questionsAnswerIndex++;
      break;
      case 'truefalse': 
        key = this.questionsTrueFalse[this.questionsTrueFalseIndex].$key; 
        if (!isNextSection) this.questionsTrueFalseIndex++;        
      break;      
    }

    if (this.isAnsweredTrue)
      this.currentCoefficient += this.coefficient;

    if (this.reading)
      this.afDB.database.ref(`learned/${this.afAuth.auth.currentUser['enemail']}/reading/collections/${this.collectionKey}/${this.reading.$key}/${this.section}/${key}`).set(this.isAnsweredTrue);
    
    if (this.video)
      this.afDB.database.ref(`learned/${this.afAuth.auth.currentUser['enemail']}/video/collections/${this.collectionKey}/${this.video.id}/${this.section}/${key}`).set(this.isAnsweredTrue);
    
    this.coefficientObservable.set(Math.floor(this.currentCoefficient));
  }

  onNextSecionClick() {
    this.onSubmitClick(true);

    this.section = 'truefalse';
    this.isLastQuestionsAnswer = false;
    this.isLastTrueFalse = false;
  }

  onFinishClick() {
    this.onSubmitClick();    
    
    this.navCtrl.pop()
      .then(reason => this.navCtrl.pop());
  }
}
