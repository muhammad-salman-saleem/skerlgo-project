import { Component, OnInit, OnDestroy, ViewEncapsulation, Input, ViewChildren, QueryList, ElementRef, EventEmitter, Output, Renderer2 } from '@angular/core';

import { Router } from '@angular/router';

import { HomeData } from '@models/business';
import { LoggerService } from '@services/utils';
import { HomeProvider } from '@providers';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sliders',
  templateUrl: 'sliders.page.html',
  styleUrls: ['sliders.page.scss'],
  //encapsulation: ViewEncapsulation.None,
})
export class SlidersPage implements OnInit, OnDestroy {
  private readonly TAG: string = 'HomePage';
  scrollDepthTriggered = false;

  data: HomeData;
  sliders: any;
  slideOpts = {
    speed: 400,
    loop: false,
    autoplay: {
      delay: 200500,
      pauseOnMouseEnter: true,
    },
  };

  constructor(
    private logger: LoggerService,
    private homePrv: HomeProvider,
    private router: Router,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.sliders = [
      {
        img: "assets/icon/sliders/1.svg",
        title: "It’s simple, and quick !",
        description: "In order to continue,you will need  to log-in  ou sign-up if you don’t have an account yet."
      },
    ];

    this.logger.log(this.TAG, 'init');

    this.homePrv.data('list').subscribe(
      async (res) => {
        this.logger.log(this.TAG, 'home data', res);
        this.data = res;
      },
      (err) => console.log(''),
    );

  }

  ngOnDestroy() {
    this.logger.log(this.TAG, 'destroy');
  }

  page_categorie(categorie) {
    this.router.navigate([
      '/tabs/home/categorie',
      {
        id: categorie.id,
        count_prestations: categorie.count_prestations,
        count_categories: categorie.count_categories,
      },
    ]);
  }

  page_login() {
    this.router.navigate([
      '/login',
    ]);
  }

  page_inscription() {
    this.router.navigate([
      '/register',
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

  profil_page() {
    this.router.navigate(['/app/profil']);
  }

  logChoice(choice) {
  };
}
