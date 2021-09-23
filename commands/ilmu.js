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
setInterval(checkTugas, 300000);

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
  let totalOld=0, totalNew=0;
  for(var k=0;k<b.length;k++){
    for (var i = 0; i < b[k].length;i++) {
      var check = true;
      for(var j=0;j<a[k].length;j++){
        if (a[k][j].judul == b[k][i].judul){
          check = false;
          break;
        }
      }
      if(check){
        console.log('Ada yang baru!!!!');
        const embed = new Discord.MessageEmbed()
          .setAuthor(b[k][i].matkul)
          .setTimestamp()
          .setURL(b[k][i].link)
          .setAuthor('Bot Ilmu~', 'https://www.nationstates.net/images/flags/uploads/makaino_ririmu__541757.jpg')
          .setImage('https://ilmu.upnjatim.ac.id/pluginfile.php/1/theme_trending/logo/1631499983/logo%20ilmu%20Blue%203.png')
          .addFields({name: b[k][i].judul, value: b[k][i].deskripsi})
          .setFooter('Jangan lupa makan~!');
        switch(b[k][i].jenis){
          case ' File':
            embed.setTitle(`Ada materi baru dari mata kuliah ${b[k][i].matkul}!`);
            embed.setColor('#9EE6AF');
            break;
          case ' URL':
            embed.setTitle(`Ada link baru dari mata kuliah ${b[k][i].matkul}!`);
            embed.setColor('#000080');
            break;
          case 'Tugas':
            embed.setTitle(`Ada tugas baru dari mata kuliah ${b[k][i].matkul}!`);
            embed.setColor('#D11141');
            break;
          case ' pilihan':
            embed.setTitle(`Ada absensi/pilihan baru dari mata kuliah ${b[k][i].matkul}!`);
            embed.setColor('#e8f427');
            break;
          default:
            embed.setTitle(`Ada ${b[k][i].jenis} baru dari mata kuliah ${b[k][i].matkul}!`);
            embed.setColor('#2D042D');
        }
        const wc = new Discord.WebhookClient('889867515528884324','rrdyzkNRVsgufFiuLIRTvipFUaLWfSw6uTnS-9si37AiEX10sBQ7ePW8npz4jYZjdSON');
        wc.send(embed);
      }
    }
    totalOld+=a[k].length;
    totalNew+=b[k].length;
  }
  console.log(`Perbandingan : old=${totalOld}:new=${totalNew}`);
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
      materi = [];
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
              let link = window.location.href;
              if(bagian.getElementsByClassName('activityinstance').length>0){
                judul = bagian.querySelector('.instancename').textContent;
                link = bagian.querySelector('a').getAttribute('href');
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
              if(!deskripsi) deskripsi = 'Tidak ada deskripsi..';
              if(judul.includes(jenis)) judul = judul.replace(jenis,'');
              if(!jenis) jenis='Tugas';
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
          materi.push(kuliah);
        }
      }
      console.log('fetch ilmu success');
      await page.close();
    } catch (error) {
      return console.log('connection failed..');
    }
  })();
}
