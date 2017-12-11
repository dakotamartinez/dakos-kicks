require('dotenv').config();

const Bot = require('../../src/bot/bot.js');

const message = {
  text: '',
  username: 'adidas-carts',
  bot_id: 'B89T0GELW',
  attachments: [{
    text: 'Email: <mailto:adidas.carts5218012@colorwheelfilms.com|adidas.carts5218012@colorwheelfilms.com>\nPassword: Shoes1234?',
    title: 'Account login Size: 7',
    footer: 'Splashforce',
    id: 1,
    title_link: 'https://cp.adidas.com/idp/startSSO.ping?username=adidas.carts5218012@colorwheelfilms.com&password=Shoes1234?&signinSubmit=Sign%20in&IdpAdapterId=adidasIdP10&SpSessionAuthnAdapterId=https://cp.adidas.com/web/&PartnerSpId=sp:demandware&validator_id=adieComDWgb&TargetResource=https://www.adidas.com/on/demandware.store/Sites-adidas-US-Site/en_US/MyAccount-ResumeLogin?target=account&target=account&InErrorResource=https://www.adidas.com/on/demandware.store/Sites-adidas-US-Site/en_US/null&loginUrl=https://cp.adidas.com/web/eCom/en_US/loadsignin&cd=eCom|en_US|cp.adidas.com|null&remembermeParam=&app=eCom&locale=US&domain=cp.adidas.com&email=&pfRedirectBaseURL_test=https://cp.adidas.com&pfStartSSOURL_test=https://cp.adidas.com/idp/startSSO.ping&resumeURL_test=&FromFinishRegistraion=&CSRFToken=null',
    thumb_height: 2000,
    thumb_width: 2000,
    thumb_url: 'http://demandware.edgesuite.net/sits_pod20-adidas/dw/image/v2/aaqx_prd/on/demandware.static/-/Sites-adidas-products/en_US/dw2f4adb27/zoom/BZ0223_01_standard.jpg',
    ts: 1513010054,
    color: '36a64f'
  }],
  type: 'message',
  subtype: 'bot_message',
  team: 'T7YM92SCW',
  channel: 'C8A3K844X',
  event_ts: '1513010054.000649',
  ts: '1513010054.000649'
};

const bot = new Bot();

bot.waitUntilReady()
  // .then(() => bot.handleCart(message))
  // .catch(err => console.log('error', err))
  // .then(() => {
    // console.log('closing db');
    // return bot.db.close()
  // })
  // .then(result => {
    // console.log(bot.db.conn);
  // })
  .then(() => {
    console.log('bot is watching');
  })
  .catch(err => console.log('error', err))