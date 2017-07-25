import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import 'tracking';
import 'tracking/build/data/face';



@Component({
    selector: 'page-contact',
    templateUrl: 'contact.html'
})
export class ContactPage {
    item: any;
    window: any;

    constructor(public navCtrl: NavController, private camera: Camera) {

        this.windowOpen();
        this.window = window;
    }

    windowOpen() {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        };

        this.camera.getPicture(options).then((imageData) => {
            // imageData is either a base64 encoded string or a file URI
            // If it's base64:

            this.item = 'data:image/jpeg;base64,' + imageData;
        }, (err) => {
            // Handle error
        });
    }


    imageLoaded() {
        const elements = document.getElementsByClassName("rect");
        for (var i in elements){
            elements[i].remove();
        }


        let img = document.getElementById('img');

        let tracker = new tracking.ObjectTracker(['face']);


        tracking.track('#img', tracker);

        tracker.on('track', function(event) {

            if(!event.data) return;

            event.data.forEach(function(rect) {
                plot(rect.x, rect.y, rect.width, rect.height);
            });

        });

        let plot = function(x, y, w, h) {
            let rect = document.createElement('div');
            document.querySelector('.demo-container').appendChild(rect);
            rect.classList.add('rect');
            rect.style.width = w + 'px';
            rect.style.height = h + 'px';
            rect.style.left = (img.offsetLeft + x) + 'px';
            rect.style.top = (img.offsetTop + y) + 'px';
        };

    };


}
