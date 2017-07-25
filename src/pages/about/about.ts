import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {BackgroundMode} from '@ionic-native/background-mode';
import {LocalNotifications} from '@ionic-native/local-notifications';
import {Geolocation} from '@ionic-native/geolocation';
import {Toast} from '@ionic-native/toast';
import {Http} from '@angular/http';
import { ScreenOrientation } from '@ionic-native/screen-orientation';


import {LoadingController} from 'ionic-angular';

import 'rxjs/add/operator/map';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})


export class AboutPage {
    item: any;
    data: any;
    dataNext: any;
    Math: any;
    loading: any;
    backGround: any;

    constructor(public navCtrl: NavController, private camera: Camera, private backgroundMode: BackgroundMode,
                private localNotifications: LocalNotifications,
                private http: Http, private geolocation: Geolocation, public loadingCtrl: LoadingController,
                private toast: Toast, private screenOrientation: ScreenOrientation) {
        this.backgroundMode.enable();
        this.backgroundMode.setDefaults({
            silent: true
        });
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

        this.Math = Math;
        this.weather(null).then(()=>{
            this.backgroundMode.on('activate').subscribe(
                data =>{
                    this.backGround = setInterval(() => {

                        this.weather(null).then(() => {
                            this.localNotifications.schedule({
                                title: "In " + this.data.city + " now " + this.data.temp + "°",
                                text: "Updated: " + new Date().toLocaleTimeString(),
                                sound: "",
                                icon: 'icon_weather'
                            });
                        });

                    }, 60000);
                }
            );
            this.backgroundMode.on('deactivate').subscribe(
                data =>{
                    clearInterval(this.backGround);
                }
            )
        });

    }


    push() {
        this.localNotifications.schedule({
            title: 'Ты пидор',
            text: 'Я серьезно, ты ебаный пидор'
        });
    }

    weather(refresher) {
        return new Promise(function (resolve, reject) {

            let timeOutRefresher;
            let timeOutLoading;

            let clearer = function (context) {
                let _thisContext = context;
                clearTimeout(timeOutRefresher);
                clearTimeout(timeOutLoading);
                if (refresher) refresher.complete();
                else _thisContext.loading.dismiss();
            };

            let weatherUpdater = function (position) {
                this.http.get("http://api.openweathermap.org/data/2.5/forecast?q=" + position + "&APPID=022f9ad3e093f273fc884b7d65a23b8d&units=metric")
                    .map(response => response.json())
                    .subscribe(
                        data => {
                            this.data = {};
                            this.dataNext = [];
                            this.data.temp = Math.round(data['list'][0]['main']['temp']);
                            this.data.city = data['city']['name'];
                            this.data.date = new Date();
                            this.data.img = data['list'][0]['weather'][0]['icon'];

                            let curDate = new Date();
                            curDate.setHours(12);
                            let curDay = curDate.getTime();

                            let counter = 0;
                            for (let i in data['list']) {
                                if (data['list'].hasOwnProperty(i)) {
                                    let date = new Date(parseInt(data['list'][i]['dt'].toString() + "000", 10));

                                    if ((date.getTime() - curDay >= 86400000) && counter < 3) {
                                        data['list'][i]['dt'] = new Date(date.getTime());
                                        this.dataNext.push(data['list'][i]);
                                        counter++;
                                        curDay = date.getTime();
                                    }
                                }
                            }
                            clearer(this);
                            this.toast.show('Updated successfully...', '2000', 'top').subscribe(
                                toast => {
                                }
                            );
                            resolve();
                        }
                        , err => {
                            clearer(this);
                            this.toast.show('Problem with Weather Provider', '2000', 'top').subscribe(
                                toast => {
                                }
                            );
                            reject('Provider');
                        });
            };

            if (!refresher) {
                this.loading = this.loadingCtrl.create({
                    content: 'Please wait...',
                    showBackdrop: false
                });

                this.loading.present();

                timeOutLoading = setTimeout(() => {
                    this.toast.show(`Check geoposition settings...`, '5000', 'top').subscribe(
                        toast => {
                            console.log(toast);
                        }
                    );
                    this.loading.dismiss();
                }, 5000);
            }
            else {
                timeOutRefresher = setTimeout(() => {
                    this.toast.show(`Update failed...`, '2000', 'top').subscribe(
                        toast => {
                            console.log(toast);
                        }
                    );
                    refresher.complete();
                }, 5000);
            }
            this.geolocation.getCurrentPosition({maximumAge: 3600, timeout: 4000}).then((resp) => {
                this.http.get("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + resp.coords.latitude + "," + resp.coords.longitude)
                    .map(response => response.json())
                    .subscribe(
                        data => {
                            weatherUpdater.call(this, data['results'][0]['address_components'][5]['long_name']);
                        }, err => {
                            clearer(this);
                            this.toast.show('Problem with Google Geocoder', '2000', 'top').subscribe(
                                toast => {
                                }
                            );
                            reject('GeoCoder');
                        });

            }).catch((error) => {
                clearer(this);
                this.toast.show("Geoposition error:\n" + error.message + '\nRefreshing for - ' + (this.data ? this.data.city : "unknown"), '3000', 'top').subscribe(
                    toast => {
                    }
                );
                if (this.data) weatherUpdater.call(this, this.data.city);
                else reject('Geo');
            });
        }.bind(this));
    }

}


