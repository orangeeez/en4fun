import { Component, ComponentFactoryResolver, ViewContainerRef, ViewChild, Output, EventEmitter, ElementRef, ComponentRef, AfterViewInit } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseListObservable } from "angularfire2/database";

@Component({
  selector: 'page-add-reading',
  templateUrl: 'add-reading.html'
})
export class AddReadingPage implements AfterViewInit {
  @ViewChild(Content) content: Content;
  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
  type: string;
  title: string;
  selectedCollection: any;
  collectionKeys: FirebaseListObservable<any[]>;
  counter: number = 0;
  text: string = '';
  shortText: string = '';
  items: any[];
  reading: any;
  imageURL: string = "assets/images/addland.jpg";
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    private componentFactoryResolver: ComponentFactoryResolver) {
      this.items = [];
      this.reading = this.navParams.get('reading');
      this.collectionKeys = this.afDB.list(`readingCollections`);
    }

  ngAfterViewInit() {
    if (this.reading) {
      this.title = this.reading.$key;
      this.selectedCollection = this.navParams.get('collectionKey');
      this.afDB.database.ref(`readingTexts/${this.reading.$key}`).once('value')
        .then(text => {
          this.parseReading(text.val());
          this.content.scrollToTop();
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
    ref.instance.fieldEmitter.subscribe(content => {});
    ref.instance.removeEmitter.subscribe(id => this.items = this.items.filter(item => item.id !== id));
    if (value)
      ref.instance.field.nativeElement.innerHTML = value;

    this.items.push(ref.instance.field.nativeElement);
  }

  onAddImageClick(value) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(ReadingImage);
    const ref = this.target.createComponent(factory);
    ref.changeDetectorRef.detectChanges();
    ref.instance.image.nativeElement.id = this.counter++;
    ref.instance._ref = ref;
    ref.instance.image.nativeElement.src = 'assets/images/addland.jpg';
    ref.instance.image.nativeElement.focus();
    ref.instance.removeEmitter.subscribe(id => this.items = this.items.filter(item => item.id !== id));
    if (value)
      ref.instance.image.nativeElement.src = value;

    this.items.push(ref.instance.image.nativeElement);
  }

  onAddQuoteClick(value) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(ReadingQuote);
    const ref = this.target.createComponent(factory);
    ref.changeDetectorRef.detectChanges();
    ref.instance.quote.nativeElement.id = this.counter++;
    ref.instance._ref = ref;
    ref.instance.quote.nativeElement.focus();
    ref.instance.removeEmitter.subscribe(id => this.items = this.items.filter(item => item.id !== id));
    if (value)
      ref.instance.quote.nativeElement.innerHTML = value;

    this.items.push(ref.instance.quote.nativeElement);
  }

  onCheckmarkReadingClick() {
    var isShortText = false;
    var text = '';
    for (let item of this.items)
      switch (item.className) {
        case 'text': 
          text = item.innerHTML.replace(/<br>/g, '');
          text = text.replace(/<div>/g, '');
          text = text.replace(/<\/div>/g, '');
          this.text += '<p><reading>' + text + '</reading></p>';

          if (!isShortText) {
            isShortText = true;
            this.shortText = text.substring(0, 100).replace(/<p>/g, '') + '...';
          }
          break;
        case 'blockquote':
          this.text += '<p><blockquote>' + item.innerHTML + '</blockquote></p>';
          break;
        case 'image':
          this.text += '<p>' + item.outerHTML + '</img></p>';
          break;
      }

      if (this.selectedCollection) {
        this.afDB.database.ref(`readingCollections/${this.selectedCollection}/${this.title}`).set(true);
        this.afDB.database.ref(`/readingKeys/${this.title}`).set({ used: true });
      }
      else {
        this.afDB.database.ref(`readingCollections/other/${this.title}`).set(true);      
        this.afDB.database.ref(`/readingKeys/${this.title}`).set({ used: false });        
      }

      this.afDB.database.ref(`/readingTexts/${this.title}`).set(this.text);
      this.afDB.database.ref(`/readings/${this.title}`).set({
        imageURL: this.imageURL,
        shortText: this.shortText
      });

      this.navCtrl.pop();
  }

  parseReading(text) {
    var items = text.match(/<img(.*?)<\/img>|<blockquote>(.*?)<\/blockquote>|<reading>(.*?)<\/reading>/g).map(function(val) {
       return val;
    });
    for (let item of items) {
      let value;
      if (item.startsWith('<reading>')) {
        value = item.replace(/<\/?reading>|<\/?reading>/g,'');
        this.onAddTextClick(value);
      }
      else if (item.startsWith('<blockquote>')) {
        value = item.replace(/<\/?blockquote>|<\/?blockquote>/g,''); 
        this.onAddQuoteClick(value);
      }
      else if (item.startsWith('<img')) {
        var regex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;
        this.onAddImageClick(value);
      }
    }
  }
}

@Component({
  selector: 'reading-text',
  templateUrl: 'reading-text.html',
})
export class ReadingText {
  @ViewChild('field') field: ElementRef;
  @Output() fieldEmitter = new EventEmitter();
  @Output() removeEmitter = new EventEmitter();
  
  content: string;
  _ref: ComponentRef<ReadingText>;
  constructor() {}

  onFieldPasteClick(event) {
    event.preventDefault();
    var text = event.clipboardData.getData("text/plain");
    this.field.nativeElement.innerHTML += text;
  }

  onFieldKeydownClick(event) {}

  onRemoveEditableClick() {
    this._ref.destroy();
    this.removeEmitter.emit(this._ref.instance.field.nativeElement.id);
  }
}

@Component({
  selector: 'reading-image',
  templateUrl: 'reading-image.html',
})
export class ReadingImage {
  @ViewChild('image') image: ElementRef;
  @Output() removeEmitter = new EventEmitter();

  _ref: ComponentRef<ReadingImage>;  
  constructor() {}

  onRemoveEditableClick() {
    this._ref.destroy();
    this.removeEmitter.emit(this._ref.instance.image.nativeElement.id);
  }
}

@Component({
  selector: 'reading-quote',
  templateUrl: 'reading-quote.html',
})
export class ReadingQuote {
  @ViewChild('quote') quote: ElementRef;
  @Output() removeEmitter = new EventEmitter();
  
  content: string;  
  _ref: ComponentRef<ReadingQuote>;  
  constructor() {}

  onRemoveEditableClick() {
    this._ref.destroy();
    this.removeEmitter.emit(this._ref.instance.quote.nativeElement.id);
  }
}
