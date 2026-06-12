// =========================================================
// AKER OSGB - Veri Deposu (CMS)
// =========================================================
// Bu dosya, sitedeki dinamik içerikleri (kariyer ilanları,
// belgeler, haberler, ekip üyeleri) ve iş başvurularını
// localStorage üzerinde saklayan basit bir veri katmanıdır.
// Admin panelinden yapılan değişiklikler buradan okunur/yazılır.

(function (window) {
  var DATA_KEY = 'aker_cms_data_v1';
  var APPLICATIONS_KEY = 'aker_cms_applications_v1';

  var DEFAULT_DATA = {
    clients: [
      { id: 'client-1', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575189767x803704118326693100/Weber.jpg' },
      { id: 'client-2', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764571387334x318249350807093800/Voestalpine.png' },
      { id: 'client-3', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764571474391x393521252175562900/Vivotech.gif' },
      { id: 'client-4', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764576327191x164834667111436670/TOSB.jpg' },
      { id: 'client-5', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722493904959x507109104753978200/site_logo_2772926034.png' },
      { id: 'client-6', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573967186x232678931280317470/Taya%C5%9F.jpg' },
      { id: 'client-7', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764576581627x908836555015601400/S%C3%B6nmez%20trafo.png' },
      { id: 'client-8', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722493935074x694410002877576600/logo%20%281%29.png' },
      { id: 'client-9', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764571057972x560254867239624400/Rafex.jpg' },
      { id: 'client-10', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722494214354x692032659418965000/logo-1.svg' },
      { id: 'client-11', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764576631233x637739509765310800/Plastay.png' },
      { id: 'client-12', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764571159779x814571160803562600/Pimta%C5%9F.png' },
      { id: 'client-13', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764576414621x175619432633726370/Pimsa%20automotive.jpg' },
      { id: 'client-14', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764576526074x419369386375598700/%C3%96zmer%20pastac%C4%B1l%C4%B1k.webp' },
      { id: 'client-15', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722494238074x517596156973263700/logo%20%284%29.png' },
      { id: 'client-16', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575242496x159585091142194340/Odeabank.jpg' },
      { id: 'client-17', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573114800x965504982575070300/Numarine.webp' },
      { id: 'client-18', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573904582x347904774761522700/Namet.jpg' },
      { id: 'client-19', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722494335513x968283903446260900/images%20%281%29.png' },
      { id: 'client-20', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575376515x899407806612340700/Kubota.webp' },
      { id: 'client-21', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575885084x837542926944235600/K%C3%B6rfez%20D%C3%B6k%C3%BCm.jpg' },
      { id: 'client-22', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575788761x834056473429975300/Kocaeli%20Kobi%20OSGB.jpg' },
      { id: 'client-23', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764574333667x316049698039441400/Kocaeli%20B%C3%BCy%C3%BCk%C5%9Fehir%20Belediyesi.jpg' },
      { id: 'client-24', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573623821x418636949681972000/Ki%C4%9F%C4%B1l%C4%B1.png' },
      { id: 'client-25', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575713000x164450581692651140/Kc%20kimya.png' },
      { id: 'client-26', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764576470268x542246617028787200/Kar%20porselen.jpg' },
      { id: 'client-27', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764570988932x737446183783901400/Karakaya.jpg' },
      { id: 'client-28', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573029185x636738668572037400/Kanca.png' },
      { id: 'client-29', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575659767x145235429286230120/%C4%B0nci%20makina.png' },
      { id: 'client-30', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575593255x741228225362877000/Hp%20pelzer%20pimsa.jpg' },
      { id: 'client-31', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722493664270x485768413591570750/logo%20%281%29.svg' },
      { id: 'client-32', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764572953190x797171859069385100/Has%C3%A7elik.jpg' },
      { id: 'client-33', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764571804514x764616063666035100/Golf.png' },
      { id: 'client-34', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573223597x887870153380383500/Gebze%20G%C3%BCzeller%20OSGB.png' },
      { id: 'client-35', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764574241990x563577758891027300/Gebze%20belediyesi.png' },
      { id: 'client-36', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575503635x926534840101168600/Fzk%20M%C3%BChendislik.webp' },
      { id: 'client-37', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575449271x905057676604447100/Fuga.webp' },
      { id: 'client-38', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764571254896x633514276626029600/Flormar.webp' },
      { id: 'client-39', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575128213x300927452857407300/Eurotray1.png' },
      { id: 'client-40', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764574654194x561468597076311100/Egesim.webp' },
      { id: 'client-41', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722493736759x867832163117568000/WhatsApp%20Image%202024-07-31%20at%2017.14.48%20%289%29.jpeg' },
      { id: 'client-42', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764574187838x734324884202857900/Dar%C4%B1ca%20belediyesi.png' },
      { id: 'client-43', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764574527750x199451383076645570/Dada%C5%9F%20metal.png' },
      { id: 'client-44', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764570846308x105319428686319060/Corning.webp' },
      { id: 'client-45', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764574037336x339223512800950400/Cfn%20kimya.jpg' },
      { id: 'client-46', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764576687630x300389448532341060/%C3%87elikel.jpg' },
      { id: 'client-47', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764575293919x526951069305787970/Bey%C3%A7elik.png' },
      { id: 'client-48', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764571320860x220356883639826620/Bericap.jpg' },
      { id: 'client-49', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764574475967x486145470914490100/Ba%C5%9Fiskele%20belediyesi.png' },
      { id: 'client-50', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573702977x838269666841119900/Avansas.jpg' },
      { id: 'client-51', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722493828766x906684246035456300/WhatsApp%20Image%202024-07-31%20at%2017.14.49%20%286%29.jpeg' },
      { id: 'client-52', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764573279253x659404227125310900/Arvato.jpg' },
      { id: 'client-53', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722493815443x873978380320329100/WhatsApp%20Image%202024-07-31%20at%2017.14.49%20%285%29.jpeg' },
      { id: 'client-54', image: '//6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/f1764570689356x705629650223563900/alba%20kal%C4%B1p.jpg' }
    ],

    slides: [
      { id: 'slide-1', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722320577958x307883306516929500/Yeni%20Proje%20%283%29.jpg' },
      { id: 'slide-2', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722419404575x192022068818656700/template%20%283%29.jpg' },
      { id: 'slide-3', image: '//e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/f1722418855148x760511879206571000/template.jpg' }
    ],

    careers: [
      {
        id: 'career-1',
        title: 'Bizimle Çalışmak İster misiniz?',
        text: 'Gebze-Darıca-Çayırova bölgelerinde ikamet eden, Haftada 5 gün çalışacak Gezici C Sınıfı Uzman arayışımız vardır.',
        cardImage: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=384,h=128,f=auto,dpr=1.5,fit=cover/f1726642826049x171993071999559040/WhatsApp%20Image%202024-09-18%20at%2009.56.55.jpeg',
        image: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=1536,h=,f=auto,dpr=2,fit=contain/f1726642826049x171993071999559040/WhatsApp%20Image%202024-09-18%20at%2009.56.55.jpeg'
      },
      {
        id: 'career-2',
        title: 'Bizimle Çalışmak İster misiniz ?',
        text: "Engelli bireylerin iş gücüne katılımını destekliyoruz! Ekibimize katılacak, çalışabilecek durumda engelli raporu olan çalışma arkadaşı arıyoruz. Her bireyin potansiyeline değer veriyor ve fırsat eşitliğini önemsiyoruz. Eğer bu kriterlere uygun olduğunuzu...",
        cardImage: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=384,h=128,f=auto,dpr=1.5,fit=cover/f1726057516520x128112713000827060/WhatsApp%20Image%202024-09-04%20at%2018.40.24%20%281%29.jpeg',
        image: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=1536,h=,f=auto,dpr=2,fit=contain/f1726057516520x128112713000827060/WhatsApp%20Image%202024-09-04%20at%2018.40.24%20%281%29.jpeg'
      },
      {
        id: 'career-3',
        title: 'Bizimle Çalışmak İster misiniz ?',
        text: "Kocaeli, Gebze Bölgesi'nde bulunan bir firmada tercihen bayan, araç kullanabilecek, sahada çalışabilecek HEMŞİRE arayışımız bulunmaktadır.",
        cardImage: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=384,h=128,f=auto,dpr=1.5,fit=cover/f1725611241990x158209878084797800/WhatsApp%20Image%202024-09-05%20at%2019.56.25.jpeg',
        image: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=1536,h=,f=auto,dpr=2,fit=contain/f1725611241990x158209878084797800/WhatsApp%20Image%202024-09-05%20at%2019.56.25.jpeg'
      }
    ],

    documents: [
      {
        id: 'doc-1',
        title: 'Kalite Yönetim Sistemi',
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=512,h=,f=auto,dpr=2,fit=contain/f1722431838223x498434362497705200/G%C3%9CZELLER%20ISO%20BELGELER%C4%B0-1.png'
      },
      {
        id: 'doc-2',
        title: 'İş Sağlığı ve Güvenliği Yönetim Sistemi',
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=768,h=,f=auto,dpr=2,fit=contain/f1722431931627x321659103159478460/G%C3%9CZELLER%20ISO%20BELGELER%C4%B0-2.png'
      },
      {
        id: 'doc-3',
        title: 'Çevre Yönetim Sistemi',
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=768,h=,f=auto,dpr=2,fit=contain/f1722431955146x415680874004707300/G%C3%9CZELLER%20ISO%20BELGELER%C4%B0-3.png'
      },
      {
        id: 'doc-4',
        title: 'Müşteri Memnuniyeti Yönetim Sistemi',
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=768,h=,f=auto,dpr=2,fit=contain/f1722431976145x490923721757759800/G%C3%9CZELLER%20ISO%20BELGELER%C4%B0-4.png'
      },
      {
        id: 'doc-5',
        title: 'Çevre Yönetim Sistemi',
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=768,h=,f=auto,dpr=2,fit=contain/f1722432004172x871087437944418700/G%C3%9CZELLER%20ISO%20BELGELER%C4%B0-5.png'
      },
      {
        id: 'doc-6',
        title: 'Çevre Yönetim Sistemi',
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=768,h=,f=auto,dpr=2,fit=contain/f1722432061219x934005153464419800/K%C3%96SELER%20ISO%20BELGELER%C4%B0-1.png'
      },
      {
        id: 'doc-7',
        title: 'Kalite Yönetim Sistemi',
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=768,h=,f=auto,dpr=2,fit=contain/f1722432072191x936170300259501800/K%C3%96SELER%20ISO%20BELGELER%C4%B0-2.png'
      }
    ],

    news: [
      {
        id: 'news-1',
        title: "Bilkent de 'Aker' dedi!",
        text: "Türkiye'deki önemli projelerden adından başarıyla söz ettiren Gebze menşeli Aker OSGB, sınırları aşmaya devam ediyor.",
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=256,h=111,f=auto,dpr=1.5,fit=cover/f1722421242410x805500905481230600/20210621171349-hedef1.jpg'
      },
      {
        id: 'news-2',
        title: "AKER OSGB, Bilkent Üniversitesi'nde PCR testi yaptı!",
        text: "Bölgemizin gururu olan ve Türkiye'de önemli projeler imza atan Aker OSGB, bu sefer Ankara'da bulunan Bilkent Üniversitesi'ndeydi.",
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=256,h=111,f=auto,dpr=1.5,fit=cover/f1722421330039x262237209914929280/resim_2024-07-31_132208532.png'
      },
      {
        id: 'news-3',
        title: 'Aker OSGB günde 5 bin korona testi yapıyor',
        text: "Ortak Sağlık ve Güvenlik Birimi (OSGB) firması Aker OSGB, uluslararası alanda önemli bir başarıya imza atarak Gebze'de günlük 5 bin Covid-19...",
        image: 'https://e0c771e7ae3bd68159a239fb345fe0e3.cdn.bubble.io/cdn-cgi/image/w=256,h=111,f=auto,dpr=1.5,fit=cover/f1722421399098x285880894309055600/resim_2024-07-31_132318550.png'
      }
    ],

    team: [
      { id: 'team-1', name: 'EBUBEKİR KAPLAN', role: 'İSG KATİP MESUL MÜDÜR', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1737531160065x571967723020652200/ebubekir%20kablan-%C4%B1sg%20m%C3%BCd%C3%BCr.JPG' },
      { id: 'team-2', name: 'EMRE GÜLTEKİN', role: 'FİNANS UZMANI', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1755088707198x933850850577416800/EMRE%20G%C3%9CLTEK%C4%B0N%20-%20%C4%B0NSAN%20KAYNAKLARI%20SORUMLUSU%20.JPG' },
      { id: 'team-3', name: 'Süleyman Atalay', role: 'Satın Alma ve İdari İşler Müdürü', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1751369685436x834348691612600800/IMG-20250701-WA0018.jpg' },
      { id: 'team-4', name: 'TAMER ÇEKECEKER', role: 'GENEL MÜDÜR', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1755088444032x469210296282152700/tamer%20%C3%A7ekeceker.JPG' },
      { id: 'team-5', name: 'ERTUGRUL IŞIK', role: 'YÖNETİM KURUL BAŞKANI', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1755088494859x581754133190320000/ertu%C4%9Frul%20%C4%B1%C5%9F%C4%B1k.JPG' },
      { id: 'team-6', name: 'ESRA KURT', role: 'SÜREÇ YÖNETİM UZMANI', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1723615018183x902331967211155200/ESRA-kurt%20s%C3%BCre%C3%A7%20y%C3%B6netim%20.jpeg' },
      { id: 'team-7', name: 'DİLAN ŞEN', role: 'YÖNETİCİ ASİSTAN', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1723614993579x416540176751005760/dilan%20%C5%9Fen%20AS%C4%B0STAN.JPG' },
      { id: 'team-8', name: 'NURCAN ÖKTEM', role: 'İNSAN KAYNAKLAR SORUMLUSU', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1723614929365x922262479875314700/NURCAN-%C3%B6kten%20insan%20kaynaklar%C4%B1.jpeg' },
      { id: 'team-9', name: 'AHMET HAKAN YEŞİL', role: 'SATIŞ PAZARLAMA MÜDÜRÜ', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1723125925844x102429167929009920/AHMET%20HAKAN%20YE%C5%9E%C4%B0L-%20SATI%C5%9E%20PAZARLAMA%20M%C3%9CD%C3%9CR%C3%9C%20.JPG' },
      { id: 'team-10', name: 'ÖMER DEMİRCAN', role: 'BİLGİ İŞLEM SORUMLUSU', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1723615113753x440997188442415550/%C3%B6mer%20vesikal%C4%B1k.jpg' },
      { id: 'team-11', name: 'SERAP KAYA', role: 'MUHASEBE SORUMLUSU', photo: 'https://6e2d58ea2e17ae467bdf1712f1ace591.cdn.bubble.io/cdn-cgi/image/w=192,h=192,f=auto,dpr=2,fit=cover/f1723615285934x704660259109665200/serap%20budak-MUHASEBE.JPG' }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function generateId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  var Store = {
    _data: null,

    load: function () {
      if (this._data) return this._data;
      var raw = null;
      try {
        raw = JSON.parse(localStorage.getItem(DATA_KEY));
      } catch (e) {
        raw = null;
      }
      if (!raw) {
        this._data = clone(DEFAULT_DATA);
      } else {
        for (var key in DEFAULT_DATA) {
          if (!Array.isArray(raw[key])) {
            raw[key] = clone(DEFAULT_DATA[key]);
          }
        }
        this._data = raw;
      }
      return this._data;
    },

    save: function () {
      try {
        localStorage.setItem(DATA_KEY, JSON.stringify(this._data));
      } catch (e) {
        alert('Kaydedilemedi: Tarayıcı depolama alanı dolu. Lütfen daha küçük bir görsel seçin.');
      }
    },

    getAll: function (collection) {
      return this.load()[collection] || [];
    },

    getById: function (collection, id) {
      var items = this.getAll(collection);
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) return items[i];
      }
      return null;
    },

    add: function (collection, item) {
      var data = this.load();
      item.id = generateId(collection);
      data[collection].push(item);
      this.save();
      return item;
    },

    update: function (collection, id, changes) {
      var item = this.getById(collection, id);
      if (!item) return null;
      for (var key in changes) {
        if (Object.prototype.hasOwnProperty.call(changes, key)) {
          item[key] = changes[key];
        }
      }
      this.save();
      return item;
    },

    remove: function (collection, id) {
      var data = this.load();
      data[collection] = data[collection].filter(function (item) {
        return item.id !== id;
      });
      this.save();
    },

    reset: function () {
      this._data = clone(DEFAULT_DATA);
      this.save();
    }
  };

  var ApplicationsStore = {
    getAll: function () {
      var raw = null;
      try {
        raw = JSON.parse(localStorage.getItem(APPLICATIONS_KEY));
      } catch (e) {
        raw = null;
      }
      return raw || [];
    },

    add: function (application) {
      var all = this.getAll();
      application.id = generateId('app');
      application.date = new Date().toISOString();
      all.unshift(application);
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));
      return application;
    },

    remove: function (id) {
      var all = this.getAll().filter(function (item) {
        return item.id !== id;
      });
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));
    }
  };

  window.AkerStore = Store;
  window.AkerApplications = ApplicationsStore;
})(window);
