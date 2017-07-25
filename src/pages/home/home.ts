import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DetailsPage } from  '../details/details';

import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  title: any;
  data: any[];
  dataOriginal: any[];

  constructor(public navCtrl: NavController, private http: Http) {
    this.initializeItems();
  }
  initializeItems(){
    this.http.get("https://api.vk.com/method/friends.get?user_id=179667459&order=name&fields=photo_100,first_name,last_name&v=5.65")
        .map(response => response.json())
        .subscribe(
            data => {
              this.data = data['response']['items'];
              this.dataOriginal = Object.assign([], this.data);
            }
        );
  }
  reinitializeItems(){
    this.data = Object.assign([], this.dataOriginal);
  }

  clickMeFunction (value){
    this.navCtrl.push(DetailsPage, {
      item: value
    });
  }
  getItems(ev: any) {
    // Reset items back to all of the items
    this.reinitializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.data = this.data.filter((item) => {
        return ((item.last_name.toLowerCase() + item.first_name.toLowerCase()).indexOf(val.toLowerCase()) > -1);
      })
    }
  }

}
