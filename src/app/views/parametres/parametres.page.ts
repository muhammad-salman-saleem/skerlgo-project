import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Platform, AlertController, ModalController, ToastController, LoadingController, NavController } from '@ionic/angular';

import { LoggerService } from '@services/utils';
import { ProfilProvider } from '@providers';
import { AppUserService } from '@services/api/app-user.service';
import { CguPage } from '@views/cgu/cgu.page';

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.page.html',
  styleUrls: ['./parametres.page.scss'],
})
export class ParametresPage implements OnInit {

  public newsletter: any;
  public notif_match: any;
  
  user: any;

  webApp : boolean;

  currentLang = window.localStorage['appLang'] ?  window.localStorage['appLang'] : 'en';
  dataText = {
    title_h1 : {
      fr: 'Paramètres',
      en: 'Settings'
    },
    langue : {
      fr: 'LANGUES',
      en: 'LANGUAGE'
    },
    langue_app : {
      fr: 'Langue de l’application',
      en: 'Language of the app'
    },
    langue_cards : {
      fr: 'Langue des cartes',
      en: 'Language of the cards'
    },
    autre : {
      fr: 'AUTRES',
      en: 'OTHERS'
    },
    autre_romaji : {
      fr: 'Cachet l’alphabet Romaji',
      en: 'Hide Romaji in  examples'
    },
    autre_audio : {
      fr: 'Audio',
      en: 'Audio'
    },
    logout : {
      fr: 'se déconnecter',
      en: 'Logout'
    },
  };

  constructor(
    public alertController: AlertController,
    private logger: LoggerService,
    private profilPrv: ProfilProvider,
    public loadingController: LoadingController,
    private modalCtrl: ModalController,
    private appUserService: AppUserService,
    private nav: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform,
  ) {
    
      this.user = this.appUserService.getUser();
      
      this.appUserService.currentisWebApp.subscribe((data) => {
        this.webApp = data;
      });

      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.newsletter= this.router.getCurrentNavigation().extras.state.newsletter;
          this.notif_match= this.router.getCurrentNavigation().extras.state.notif_match;
        }
      });
  }

  ngOnInit() {
  }
  
  async dismissForm() {
    const alert = await this.alertController.create({
      cssClass: 'skillsay-alert', mode: "md",
      header:  'Voulez-vous vraiment quitter sans enregistrer ?',
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          cssClass: 'non',
          handler: (blah) => {
          },
        },
        {
          text: 'Oui, je quitte',
          cssClass: 'oui',
          handler: async (alertData) => {
            this.router.navigate(['/app/profil']);
          },
        },
      ],
    });
    await alert.present();
  }

  async cgu_page() {
    if(this.webApp) {
      let navigationExtras: NavigationExtras = { state: {  } };
      this.router.navigate(['/app/profil/parametres/cgu'], navigationExtras);
    } else {
      const modal = await this.modalCtrl.create({
        component: CguPage,
        cssClass: 'my-custom-class',
        componentProps: {
        },
      });
      await modal.present();
      await modal.onDidDismiss().then((result) => {
        if (result.data?.dismiss) {
        }
      });
    }
  };

  change_password() {
    this.router.navigate(['/change-password']);
  }

  logOut() {
    this.appUserService.logout();
    if(!document.URL.startsWith('http') || document.URL.startsWith('http://localhost') || document.URL.startsWith('https://localhost')) {
      this.nav.navigateRoot('/tabs/home');
    } else {
      this.nav.navigateRoot('/tabs/home');
    }
    //this.router.navigate(['/sliders']);
  }

  chooseLang() {
    window.localStorage['appLang'] = this.currentLang;
  }

  param_notifications() {
    let navigationExtras: NavigationExtras = { state: { newsletter: this.newsletter, notif_match: this.notif_match } };
    this.router.navigate([this.user.type == 2 ?'/app/mon-profil/parametres/notifications':'/app/profil/parametres/notifications'], navigationExtras);
  }

  param_compte() {
    let navigationExtras: NavigationExtras = { state: {  } };
    this.router.navigate([this.user.type == 2 ? '/app/mon-profil/parametres/compte' : '/app/profil/parametres/compte'], navigationExtras);
  }

}
