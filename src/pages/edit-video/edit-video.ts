import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { NavController, NavParams, ModalController, Content } from 'ionic-angular';
import { VideoModal } from "../add-videos/add-videos";
import { ReadingText } from "../add-reading/add-reading";
import { AngularFireDatabase } from "angularfire2/database";

@Component({
  selector: 'page-edit-video',
  templateUrl: 'edit-video.html',
})
export class EditVideoPage implements AfterViewInit {
  @ViewChild(Content) content: Content;  
  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
  
  collectionKey: string;
  videoKey: string;
  video: any;
  counter: number = 0;
  items: any;
  text: string = '';
    
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    private componentFactoryResolver: ComponentFactoryResolver) {
      this.collectionKey = navParams.get('collectionKey');
      this.videoKey = navParams.get('videoKey');
      this.video = this.navParams.get('video');    
      this.items = [];      
    }

    ngAfterViewInit() {
      if (this.video) {
        this.afDB.database.ref(`videoTexts/${this.video.id}`).once('value')
          .then(text => {
            if (text.val()) {
              this.parseVideo(text.val());
              this.content.scrollToTop();
            }
          });
      }
    }

    onAddTextClick(value) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(ReadingText);
      const ref = this.target.createComponent(factory);
      ref.instance.field.nativeElement.id = this.counter++;
      ref.instance._ref = ref;
      ref.changeDetectorRef.detectChanges();
      ref.instance.field.nativeElement.focus();
      ref.instance.fieldEmitter.subscribe(content => { });
      ref.instance.removeEmitter.subscribe(id => this.items = this.items.filter(item => item.id !== id));
      if (value)
        ref.instance.field.nativeElement.innerHTML = value;
  
      this.items.push(ref.instance.field.nativeElement);
    }

    onAddQuestionsClick(videoKey, collectionKey) {
      const modal = this.modalCtrl.create(VideoModal,
        {
          collectionKey: this.collectionKey,
          videoKey: this.videoKey
        });
  
      modal.onDidDismiss(data => {});
      modal.present();
    }

    onCheckmarkVideoClick() {
      var text = '';
      for (let item of this.items)
        switch (item.className) {
          case 'text':
            text = item.innerHTML.replace(/<br>/g, '');
            text = text.replace(/<div>/g, '');
            text = text.replace(/<\/div>/g, '');
            this.text += '<p><reading>' + text + '</reading></p>';
          break;
        }

        this.afDB.database.ref(`/videoTexts/${this.video.id}`).set(this.text);
        this.navCtrl.pop();        
    }

    parseVideo(text) {
      var items = text.match(/<reading>(.*?)<\/reading>/g).map(function (val) {
        return val;
      });
      for (let item of items) {
        let value;
        if (item.startsWith('<reading>')) {
          value = item.replace(/<\/?reading>|<\/?reading>/g, '');
          this.onAddTextClick(value);
        }
      }
    }
}
