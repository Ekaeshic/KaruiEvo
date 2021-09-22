const puppeteer = require("puppeteer");
const i18n = require("../util/i18n");
const Discord = require("discord.js");

const CHANNEL_ID = '804362969513328640';

let matkul = [
    ['https://ilmu.upnjatim.ac.id/course/view.php?id=7838','PEMROGRAMAN WEB KELAS C-Sugiarto'],
    ['https://ilmu.upnjatim.ac.id/course/view.php?id=7822','KECERDASAN BUATAN KELAS C-Intan Yuniar'],
    ['https://ilmu.upnjatim.ac.id/course/view.php?id=7815','DESAIN ANTARMUKA KELAS D-Agung Mustika'],
    ['https://ilmu.upnjatim.ac.id/course/view.php?id=7829','MACHINE LEARNING KELAS A Andreas Nugroho'],
    ['https://ilmu.upnjatim.ac.id/course/view.php?id=7816','VISI KOMPUTER KELAS A Fetty Tri']
];
let materi = [];

refresh();
setInterval(checkTugas, 600000);

function checkTugas(){
  if(materi.length==0){
    refresh();
  }
  else{
    console.log('Mengecek....');
    old = materi;
    refresh();
    setTimeout(arraysEqual, 24000, old, materi);
  }
}

function arraysEqual(a, b) {
  for (var i = 0; i < b.length; ++i) {
    if (a[i].judul !== b[i].judul){
      const embed = new Discord.MessageEmbed()
        .setAuthor(b[i].matkul)
        .setTimestamp()
        .setURL(b[i].link)
        .setAuthor('Bot Ilmu~', 'https://www.nationstates.net/images/flags/uploads/makaino_ririmu__541757.jpg')
        .setImage('https://ilmu.upnjatim.ac.id/pluginfile.php/1/theme_trending/logo/1631499983/logo%20ilmu%20Blue%203.png')
        .addFields({name: b[i].judul, value: b[i].deskripsi})
        .setFooter('Jangan lupa makan~!');
      switch(b[i].jenis){
        case 'file':
          embed.setTitle(`Ada materi baru dari mata kuliah ${b[i].matkul}!`);
          embed.setColor('#9EE6AF');
          break;
        case 'URL':
          embed.setTitle(`Ada link baru dari mata kuliah ${b[i].matkul}!`);
          embed.setColor('#000080');
          break;
        case 'pilihan':
          embed.setTitle(`Ada Tugas baru dari mata kuliah ${b[i].matkul}!`);
          embed.setColor('#D11141');
          break;
        default:
          embed.setTitle(`Ada ${b[i].jenis} baru dari mata kuliah ${b[i].matkul}!`);
          embed.setColor('#2D042D');
      }
      const wc = new Discord.WebhookClient('889867515528884324','rrdyzkNRVsgufFiuLIRTvipFUaLWfSw6uTnS-9si37AiEX10sBQ7ePW8npz4jYZjdSON');
      wc.send(embed);
      return;
    }
  }
  return console.log('Tidak ada perubahan..');
}
function refresh(){
  (async () => {
    const browser = await puppeteer.launch({
      'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
  });
    const page = await browser.newPage();
    try {
      await page.goto("https://ilmu.upnjatim.ac.id/login/index.php?authCAS=NOCAS");
      await page.waitForSelector('#username', '19081010105');
      await page.type("#username", "19081010105");
      await page.type("#password", "12082001");
      await page.click("#loginbtn");
      console.log('connected');
      await page.waitForNavigation();
      for(let i=0;i<matkul.length;i++){
        await page.goto(matkul[i][0]);
        await page.waitForSelector('.section.img-text');
        const kuliah = await page.evaluate(() => {
          const scrape = document.querySelectorAll('.section.img-text .activity');
          let submateri = [];
          if(scrape.length>1){
            scrape.forEach((bagian) => {
              let judul, deskripsi, jenis;
              const matkul = document.querySelector('#page > div.internalbanner > div > h1').textContent;
              const link = window.location.href;
              if(bagian.getElementsByClassName('activityinstance').length>0){
                judul = bagian.querySelector('.instancename').textContent;
                if(bagian.getElementsByClassName('contentafterlink').length>0){
                  deskripsi = bagian.querySelector('.contentafterlink .no-overflow').textContent;
                }
                if(bagian.getElementsByClassName('accesshide').length>0){
                  jenis = bagian.querySelector('.accesshide').textContent;                  
                }
              }
              else if(bagian.getElementsByClassName('contentwithoutlink')){
                judul = 'Pemberitahuan';
                deskripsi = document.querySelector('.contentwithoutlink').textContent;
                jenis = 'pemberitahuan';
              }
              const tugas = {
                'matkul': matkul,
                'judul': judul,
                'deskripsi': deskripsi,
                'jenis': jenis,
                'link': link
              }
              submateri.push(tugas);
            });
            return submateri;
          }
          else{
            return;
          }
        });
        if(kuliah){
          materi = [...new Set([...materi, ...kuliah])];
        }
      }
       console.log('fetch ilmu success');
      await browser.close();
    } catch (error) {
      return console.log('connection failed..');
    }
  })();
}
