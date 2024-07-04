import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { CountdownComponent, CountdownConfig } from 'ngx-countdown';

import { HomeData } from '@models/business';
import { LoggerService } from '@services/utils';
import { HomeProvider } from '@providers';
import { IonSlides, ModalController, PopoverController } from '@ionic/angular';
import { NotationPage } from '@views/notation/notation.page';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';


import { AppReservationStorage } from '@services/security';
import { ApiReservation } from '@models/security';
import { AppUserService } from '@services/api/app-user.service';
import { AvisPage } from '@views/avis/avis.page';

@Component({
  selector: 'app-grid',
  templateUrl: 'grid.page.html',
  styleUrls: ['grid.page.scss'],
  //encapsulation: ViewEncapsulation.None, // added
})
export class GridPage implements OnInit, OnDestroy {
  private readonly TAG: string = 'HomePage';
  scrollDepthTriggered = false;

  @ViewChild('slides', {static: true}) slides: IonSlides;

  currentLang = window.localStorage['appLang'] ?  window.localStorage['appLang'] : 'en';
  dataText = {
    title_h4 : {
      fr: 'Grid',
      en: 'Grid'
    },
  };

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 400,
  };


  user: any;

  title: any;
  categorie: any;
  lecon_id: any;
  lettre_: any;
  lettre_index: any;
  data: any;
  favorites: any;
  opacity = 1;
  reservationStorage = {} as ApiReservation;

  
  radio: MediaObject;

  romaji: boolean;
  illustrations: boolean;

  constructor(
    private logger: LoggerService,
    private homePrv: HomeProvider,
    private router: Router,
    private modalCtrl: ModalController,
    public media: Media,
    private popoverCtrl: PopoverController,
    private appUserService: AppUserService,
    private nativeAudio: NativeAudio,
    private reservationStrg: AppReservationStorage,
    private countdown: CountdownComponent,
    private route: ActivatedRoute,
  ) {

    
    this.user = this.appUserService.getUser();

    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {

          this.title = this.router.getCurrentNavigation().extras.state.title;
          this.categorie = this.router.getCurrentNavigation().extras.state.id;
      }
    });
   
  }

  ngOnInit() {
    this.logger.log(this.TAG, 'init');
    this.reservationStorage = this.reservationStrg.load();

    this.homePrv.grid(this.categorie).subscribe(
      async (res) => {
        this.logger.log(this.TAG, 'home data', res);
        this.data = res;
        
      },
      (err) => console.log(JSON.stringify(err)),
    );

  }

  ngOnDestroy() {
    this.logger.log(this.TAG, 'destroy');
  }

  page_categorie(categorie) {
    this.router.navigate([
      '/tabs/home/categorie',
      {
        id: categorie,
      },
    ]);
  }

  page_specifique() {
    if(true){
      let navigationExtras: NavigationExtras = { state: { demande_specifique: true } };
      this.router.navigate(['/prestation'], navigationExtras);
    }
  }


  page_prestation(prestation) {
    this.router.navigate([
      '/tabs/home/prestation',
      {
        id: prestation.id,
      },
    ]);
  }

  page_giveaway(giveaway) {
    this.router.navigate([
      '/tabs/home/giveaway',
      {
        id: giveaway.id,
      },
    ]);
  }

  async logScrolling($event) {
    const currentScrollDepth = $event.detail.scrollTop;
    if (currentScrollDepth > 10) this.scrollDepthTriggered = true;
    else this.scrollDepthTriggered = false;
  }
}
