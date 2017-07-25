import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {Http} from '@angular/http';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';

/**
 * Generated class for the DetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {
  item: any;
  loading: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private http: Http, public loadingCtrl: LoadingController ) {
      this.loading = loadingCtrl.create({
          content: 'Please wait...',
          duration: 5000
      });
      this.loading.present();
    http.get("https://api.vk.com/method/users.get?user_id=" + navParams.get('item') +  "&fields=photo_max,first_name,last_name,followers_count&v=5.65")
        .map(response => response.json())
        .subscribe(
            data => {
              this.item = data['response'][0];
            }
        );
  }
  imageLoaded(){
      this.loading.dismiss();
  }

  ionViewDidLoad() {
      //this.loading.dismiss();
    console.log('ionViewDidLoad DetailsPage');
  }

}
