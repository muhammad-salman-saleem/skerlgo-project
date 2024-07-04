import { Component, ViewChild } from '@angular/core';

import { Platform, ModalController, AlertController, IonRouterOutlet, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { FCM } from '@ionic-native/fcm/ngx';

import { Profile } from '@models/users';

import { AppUserService } from './services/api/app-user.service';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { UpdatePage } from '@views/update/update.page';
import { LoggerService } from '@services/utils';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  
  private readonly TAG: string = 'AppComponent';
  _currentProfile: Profile;
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet: IonRouterOutlet;

  constructor(
    private platform: Platform,
    private appVersion: AppVersion,
    private nav: NavController,
    private splashScreen: SplashScreen,
    public alertController: AlertController,
    private logger: LoggerService,
    private router: Router,
    private modalCtrl: ModalController,
    private appUserService: AppUserService,
    private fcm: FCM,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.appUserService.init();
    this.appUserService.currentProfile.subscribe((data) => {
      this._currentProfile = data;
    });
    this.platform.ready().then(() => {
      
      /*
      Environment.setEnv({
        // Api key for your server
        // (Make sure the api key should have Website restrictions for your website domain only)
        API_KEY_FOR_BROWSER_RELEASE: 'AIzaSyCP9HvLZlATQxSaMpcNsaaK-XBIDZxhOMs',

        // Api key for local development
        // (Make sure the api key should have Website restrictions for 'http://localhost' only)
        API_KEY_FOR_BROWSER_DEBUG: 'AIzaSyCP9HvLZlATQxSaMpcNsaaK-XBIDZxhOMs',
      });
      */
      
      this.splashScreen.hide();

      // subscribe to a topic
      // this.fcm.subscribeToTopic('Deals');

      // get FCM token
      this.fcm.getToken().then((token) => {
        console.log(token);
        this.appUserService.fcm_token({ token: token }).subscribe((data) => {
          console.log(data);
        });
      });

      this.appVersion.getVersionNumber().then((versionNumber) => {
        this.appUserService.check_version({ version: versionNumber }).subscribe((data) => {
          console.log(data);
          if (data.failed) {
            setTimeout(async () => {
              const modal = await this.modalCtrl.create({
                component: UpdatePage,
                cssClass: 'my-custom-class',
                componentProps: {
                  data: data,
                },
              });
              await modal.present();
              await modal.onDidDismiss().then((result) => {
                if (result.data?.done) {
                }
              });
            }, 3000);
          }
        });
      });

      // ionic push notification example
      this.fcm.onNotification().subscribe(async (data) => {
        if (data.wasTapped) {
          console.log('Received in background');
        } else {
          console.log('Received in foreground');
        }

        const alert = await this.alertController.create({
          cssClass: 'chic-choc-alert',
          header: data.title,
          message: data.body,
          buttons: [
            {
              text: 'Fermer',
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
                console.log('Confirm Cancel: blah');
              },
            },
          ],
        });

        await alert.present();
      });

      // refresh the FCM token
      this.fcm.onTokenRefresh().subscribe((token) => {
        console.log(token);
      });

      // unsubscribe from a topic
      // this.fcm.unsubscribeFromTopic('offers');
    });
  }

  ngOnInit() {
    //this.fixBackToQuit();
  }

  private fixBackToQuit() {
    this.logger.log(this.TAG, 'on start check if can go back', this.routerOutlet.canGoBack());
  
    this.platform.backButton.subscribeWithPriority(-1, (next) => {
      this.logger.log(this.TAG, 'back button from', this.router.url);
      if (!this.routerOutlet.canGoBack()) {
        const url = this.router.url;
        if (url.startsWith('/tabs/') || url.startsWith('/tabs')) {
          this.logger.log(this.TAG, 'back button action quit');
          navigator['app'].exitApp();
        } else {
          this.logger.log(this.TAG, 'back button action go home');
          this.nav.navigateRoot('');
        }
      }
  
      next();
    });
  }

  logOut() {
    this.appUserService.logout();
    this.router.navigate(['/tabs/home']);
  }
}
