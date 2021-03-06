const i18n = require("../util/i18n");
const puppeteer = require("puppeteer");

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= 9000){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

var count = 0;
let meme;
let used = false;
module.exports = {
  name: "meme",
  description: i18n.__("meme.description"),
  execute(message) {
    function refresh(){
        message.channel.send('Tunggu sebentar ya~ karui mau buka fb dulu...').then((msg) => {
           
                (async () => {
                const browser = await puppeteer.launch({
                    'args' : [
                        '--no-sandbox',
                        '--disable-setuid-sandbox'
                        ]
                });
            try{
                const page = await browser.newPage();
                await page.goto("https://facebook.com/");
                await page.waitForSelector("#email");
                await page.type("#email", "kucing.upnjatim@gmail.com");
                await page.type("#pass", "rifki123");
                await page.click('[type="submit"]');
                await page.waitForNavigation();
                await page.goto("https://facebook.com/");
        
                await autoScroll(page)
                meme = await page.evaluate(()=> {
                    const feeds = document.querySelectorAll('[role="feed"] [data-pagelet]');
                    const links = [];
                    feeds.forEach((img) => {
                        try {
                            var link = img.querySelector('img[referrerpolicy="origin-when-cross-origin"]').getAttribute('src');
                            var check = img.querySelector('span').innerHTML;
                            if(!link.includes('emoji') && !check.includes('Pertemanan')){
                                links.push(link);
                            }
                        } catch (error) {}
                    });
                    return links;
                
                });
                count = 0;
                msg.edit(meme[count]);
                used=false;
                count++;
                /*for(i=1; i<=15; i++){
                    await page.screenshot({
                    path: './Screenshot/'+i+'.png',
                    clip: {
                        x: 145+(i*),
                        y: 515,
                        width: 512,
                        height: 880
                    }
                    });
                }
                */
            } catch (error) {
                console.log('failed to fetch facebook..');
                msg.edit('Awwww... Karui gagal buka fesbuk T.T');
            } finally {
                await browser.close()
            }
        })();
    });
}
    
    if(!meme || count>=meme.length){
        if(used) message.channel.send('Maaf, perintah ini sedang dijalankan~');
        else {
            used=true;
            refresh();
        }
    }
    else if(count<meme.length){
        message.channel.send(meme[count]);
        count++;
    }
    else{
        message.channel.send(i18n.__("meme.errOutOfArray")).catch(console.error);
    }
  }
};
