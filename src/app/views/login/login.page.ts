import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppUserService } from '../../services/api/app-user.service';
import { Platform, LoadingController, AlertController, ToastController, NavController, PopoverController } from '@ionic/angular';
import { LoggerService } from '@services/utils';
import { Router, ActivatedRoute } from '@angular/router';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { SignInWithApple, AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';


import { PasswordPage } from '@views/password/password.page';

import { OauthCordova } from "ng2-cordova-oauth/platform/cordova";
import { LinkedIn } from "ng2-cordova-oauth/core";
import { environment } from "../../../environments/environment";
import { HomeProvider } from '@providers';
import { RegisterPage } from '@views/register/register.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public loginForm: FormGroup;
  isSubmited: boolean = false;
  snapshot: any;
  snapshot_id: any;

  private readonly TAG: string = 'LoginPage';
  
  pwdIcon = "eye-outline";
  showPwd = false;
  message:any;

  popovered: any;
  
  linkedinClientId: string;
  linkedinRedirectUri: string;

  authorizationCode: string;
  oAuthToken: string;
  oAuthVerifier: string;
  // popup related
  private windowHandle: Window;   // reference to the window object we will create    
  private intervalId: any = null;  // For setting interval time between we check for authorization code or token
  private loopCount = 6000;   // the count until which the check will be done, or after window be closed automatically.
  private intervalLength = 100;   // the gap in which the check will be done for code.

  constructor(
    private logger: LoggerService,
    private fb: Facebook,
    private googlePlus: GooglePlus,
    private userPrv: AppUserService,
    private homePrv: HomeProvider,
    public formBuilder: FormBuilder,
    public platform: Platform,
    private router: Router,
    public toastController: ToastController,
    private nav: NavController,
    public signInWithApple: SignInWithApple,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    public loadingController: LoadingController,
  ) {
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.required],
      remember: [true, Validators.nullValidator],
    });

    this.fb.isDataAccessExpired()
    .then((res: any) => {
      this.fb.logout();
     }).catch(e => {
    });

    if (this.userPrv.isLoggedIn()) {
      //this.router.navigate(['/tabs/home']);
    }
  }

  doAuthorization(url?: string, socialMediaProvider?: string, isRegisterAction?: boolean) {
    /* isRegisterAction flag i am using to check if the process is for registration or Login */
    /* socialMediaProvider is for name of social media , it is optional*/
         
      let loopCount = this.loopCount;
    
      /* Create the window object by passing url and optional window title */
      this.windowHandle = this.createOauthWindow("https://www.linkedin.com/oauth/v2/authorization?response_type=code&scope=r_emailaddress,r_liteprofile&client_id="+this.linkedinClientId+"&redirect_uri="+this.linkedinRedirectUri, 'OAuth login');
    
      /* Now start the timer for which the window will stay, and after time over window will be closed */
      this.intervalId = window.setInterval(() => {     
        if (loopCount-- < 0) {
          window.clearInterval(this.intervalId);
          this.windowHandle.close();
        } else {
            let href: string;  // For referencing window url
            try {
              href = this.windowHandle.location.href; // set window location to href string
            } catch (e) {
              // console.log('Error:', e); // Handle any errors here
            }

            if (href != null) {
              if (href && (href).indexOf(this.linkedinRedirectUri) === 0 && href.match('code')) {
                // for google , fb, github, linkedin
                loopCount = -1;
                window.clearInterval(this.intervalId);
                this.authorizationCode = this.getQueryString('code', href);
                //this.login_ln_process(this.authorizationCode, this.linkedinRedirectUri);
                this.windowHandle.close();
              }
          }
        }
       }, this.intervalLength);
  }

  // Method for getting query parameters from query string
  getQueryString = function(field: any, url: string) {
  const windowLocationUrl = url;
  const reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
  const string = reg.exec(windowLocationUrl);
  return string ? string[1] : null;
  }
    
  createOauthWindow(url: string, name = 'Authorization', width = 500, height = 600, left = 0, top = 0) {
      if (url == null) {
          return null;
      }
      const options = `width=${width},height=${height},left=${left},top=${top}`;
      return window.open(url, name, options);
  }

  ngOnInit() {

    this.route.params.subscribe((params) => {
      this.snapshot = params.snapshot as string;
      this.snapshot_id = params.snapshot_id as string;
    });
  }

  togglePwd() {
    this.showPwd = !this.showPwd;
    this.pwdIcon = this.showPwd ? "eye-off-outline" : "eye-outline";
  }

  onSignIn() {

    if (this.loginForm.valid) {
      
      this.userPrv.login(this.loginForm.value).subscribe(
        (res) => {
          this.logger.log(this.TAG, 'Signup Page', res);
          console.log('res', res);
          if (res && res.token) {
            this.loginForm.reset();
            if(this.popovered){
              this.popoverCtrl.dismiss({
                dismiss: true
              });
            }
            let paramsSnap = {};
            if (this.snapshot && this.snapshot !== 'null') {
              paramsSnap = {
                id: this.snapshot_id,
              };
            }
            this.nav.navigateRoot(this.snapshot && this.snapshot !== 'null' ? this.snapshot : res.type == 1 ?'/tabs/home':'/tabs/home', paramsSnap);
          } else {
            console.log('res', res);
            this.message = "Wrong Password.";
          }
        },
        (err) => {
          this.alertError();
      },
      );
    }
  }
  
  dismissForm() {
    this.popoverCtrl.dismiss({
      dismiss: true
    });
  }

  async alertError(message = null) {
    const toast = await this.toastController.create({
      position: 'top',
      cssClass: 'toast-error',
      message: message ? message : "Wrong Password.",
      duration: 2000,
    });
    toast.present();
  }

  page_register() {
    return null;
    this.router.navigate([
      '/app/profil/register',
      {
        snapshot: this.snapshot && this.snapshot !== 'null' ? this.snapshot : null,
      },
    ]);
  }

  async check_provider(data) {
    const loading = await this.loadingController.create({
      spinner: 'circular',
      translucent: true,
      cssClass: 'custom-class custom-loading',
      backdropDismiss: false
  });
  await loading.present();
  this.userPrv.check_provider(data).subscribe(
    async (res) => {
      this.logger.log(this.TAG, 'Signup Page', res);
      loading.dismiss();
      if (res.success && res.user) {
        if(this.popovered){
          this.popoverCtrl.dismiss({
            dismiss: true
          });
        }
        this.nav.navigateRoot('/tabs/home');
      } else if (res.success) {
        if(this.popovered){
          this.popoverCtrl.dismiss({
            dismiss: true
          });
        }
        if(!this.popovered){
          this.router.navigate([
            '/register',
          ]);
        } else {
          const modal = await this.popoverCtrl.create({
            component: RegisterPage,
            cssClass: 'popover-register auto-height small-popover my-custom-class',
            componentProps: {
              popovered: true
            },
          });
          await modal.present();
          await modal.onDidDismiss().then((result) => {
            if (result.data?.dismiss) {
            }
          });
        }
      } else {
        loading.dismiss();
        this.alertError(res.message);
      }
    },
    (err) => { 
        loading.dismiss();
    },
  );
  }

  login_gp() {

    return false;

    this.googlePlus.login({})
    .then((res) => {
      
      this.googlePlus.logout();
      this.check_provider({email : res.email , provider : 'google', lastName: res.familyName, firstName: res.givenName});
      
     }).catch(e => {
      this.googlePlus.logout();
     });
     
  }

  
  login_fb() {

    return false;

    this.fb.login(['public_profile', 'email'])
    .then((res: FacebookLoginResponse) => {

      this.fb.api('me?fields=id,name,email,first_name,last_name', []).then(profile => {
        this.fb.logout();
        this.check_provider({email : profile['email'] , provider : 'facebook', lastName: profile['last_name'], firstName: profile['first_name']});

      });
     }).catch(e => {
       this.fb.logout();
      });
  }

  login_apple() {

    this.signInWithApple.signin({
      requestedScopes: [
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
      ]
    })
    .then((res: AppleSignInResponse) => {
      if(res.email)
        this.check_provider({email : res.email , provider : 'apple', lastName: res.fullName.familyName, firstName: res.fullName.givenName});
      else 
        this.router.navigate(['/register']);
    })
    .catch((error: AppleSignInErrorResponse) => {
      this.router.navigate(['/register']);
    });
  }

  async page_password() {
    if(this.popovered) {
      this.popoverCtrl.dismiss({
        dismiss: true
      });
      
      const modal = await this.popoverCtrl.create({
        component: PasswordPage,
        cssClass: 'auto-height small-popover my-custom-class',
        componentProps: {
          popovered: true
        },
      });
      await modal.present();
      await modal.onDidDismiss().then((result) => {
        if (result.data?.dismiss) {
        }
      });
    } else {
      this.router.navigate([
        '/password',
        {
          snapshot: this.snapshot && this.snapshot !== 'null' ? this.snapshot : null,
        },
      ]);
    }
  }
}
