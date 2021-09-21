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
setInterval(checkTugas, 1800000);

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
  if (a === b) return true;
  let length;
  if(a.length>b.length) length=a.length;
  else length=b.length;

  for (var i = 0; i < length; ++i) {
    if (a[i].judul !== b[i].judul){
      const embed = new Discord.MessageEmbed()
        .setAuthor(b[i].matkul)
        .setTimestamp()
        .setURL(b[i].link)
        .addFields({name: b[i].judul, value: b[i].deskripsi})
        .addField({name: '[Link](${b[i].link})', value: 'Link ilmu'})
        .setFooter('Jangan lupa makan~!');
      switch(b[i].jenis){
        case 'file':
          embed.setTitle('Ada materi baru dari mata kuliah ${b[i].matkul}!');
          embed.setColor('#9EE6AF');
          break;
        case 'URL':
          embed.setTitle('Ada link baru dari mata kuliah ${b[i].matkul}!');
          embed.setColor('#000080');
          break;
        case 'pilihan':
          embed.setTitle('Ada Tugas baru dari mata kuliah ${b[i].matkul}!');
          embed.setColor('#D11141');
          break;
        default:
          embed.setTitle('Ada ${b[i].jenis} baru dari mata kuliah ${b[i].matkul}!');
          embed.setColor('#2D042D');
      }
      client.channels.get(CHANNEL_ID).send(embed);
    }
  }
  return true;
}

function refresh(){
  (async () => {
    const browser = await puppeteer.launch({
      'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--proxy-server=139.99.74.79:8080'
        ]
  });
    const page = await browser.newPage();
    try {
      await page.goto("https://ilmu.upnjatim.ac.id/login/index.php?authCAS=NOCAS");
    } catch (error) {
      return console.error(error);
    }
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
    await browser.close();
  })();
}
