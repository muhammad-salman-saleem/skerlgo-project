import { Component, OnInit, OnDestroy, ViewEncapsulation, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';

import { AppUserService } from '../../services/api/app-user.service';
import { NotationData } from '@models/business';
import { LoggerService } from '@services/utils';
import { NotationProvider, PrestationProvider } from '@providers';
import { Watchable } from '@models/utils';
import { switchMap, tap, count } from 'rxjs/operators';

import { AppReservationStorage } from '@services/security';

import { uniqBy } from 'lodash';
import * as _ from 'lodash';
import { ApiReservation } from '@models/security';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';

@Component({
  selector: 'app-notation',
  templateUrl: './notation.page.html',
  styleUrls: ['./notation.page.scss'],
  encapsulation: ViewEncapsulation.None, // added
})

// implements OnInit
export class NotationPage {
  private readonly TAG: string = 'NotationPage';
  private idW: Watchable<number> = new Watchable<number>();

  notation: NotationData;

  data: any;

  @Input() lecon: any;
  @Input() categorie: any;
  @Input() guide: any;

  constructor(
    private logger: LoggerService,
    private notationPrv: NotationProvider,
    private prestationPrv: PrestationProvider,
    private userPrv: AppUserService,
    private modalCtrl: ModalController,
    public alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  // ngOnInit
  ionViewWillEnter() {
  }

  ngOnDestroy() {
    this.logger.log(this.TAG, 'destroy');
  }

  ratingChange(notation, prestation) {
    prestation.notation = notation;
  }
  
  page_grid() {
    
    this.modalCtrl.dismiss({
      dismissed: true,
    });
    
    let navigationExtras: NavigationExtras = { state: { id: this.categorie, title: this.categorie } };
    this.router.navigate(['/tabs/home/grid'], navigationExtras);
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      dismissed: true,
    });
  }
}
