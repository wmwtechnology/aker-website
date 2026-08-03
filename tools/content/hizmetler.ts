// =========================================================
// Hizmet sayfalarının içeriği
// =========================================================
// Her kayıt bir /hizmetlerimiz/<slug> sayfası üretir.
// intro: giriş paragrafı, sections: h2 blokları, faq: SSS şeması.
// Mevzuat süreleri 6331 sayılı İş Sağlığı ve Güvenliği Kanunu ve
// ilgili yönetmeliklere dayanır; yayına almadan önce güncel
// mevzuata karşı doğrulanmalıdır.
// =========================================================

export interface FaqEntry {
  q: string;
  a: string;
}

export interface ServiceSection {
  h2: string;
  p?: string[];
  list?: string[];
}

export interface Service {
  /** URL parçası: /hizmetlerimiz/<slug> */
  slug: string;
  /** Menü ve kartlarda görünen kısa ad. */
  nav: string;
  h1: string;
  title: string;
  description: string;
  /** img/ altındaki ikon dosyasının uzantısız adı. */
  icon: string;
  /** Kart altındaki tek cümlelik özet. */
  short: string;
  intro: string;
  sections: ServiceSection[];
  faq?: FaqEntry[];
  /** İlgili hizmetlerin slug listesi. */
  related?: string[];
}

export const SERVICES: Service[] = [
  // -------------------------------------------------------
  {
    slug: 'is-guvenligi-uzmanligi',
    nav: 'İş Güvenliği Uzmanlığı',
    h1: 'İş Güvenliği Uzmanlığı Hizmeti',
    title: 'İş Güvenliği Uzmanlığı Hizmeti | Gebze ve Kocaeli | AKER OSGB',
    description:
      'A, B ve C sınıfı iş güvenliği uzmanı görevlendirmesi. Gebze, Dilovası ve Kocaeli genelinde İSG-KATİP sözleşmesi, saha denetimi ve yasal raporlama. AKER OSGB.',
    icon: 'ikon-is-guvenligi-uzmanligi',
    short: 'Tehlike sınıfınıza uygun A, B veya C sınıfı iş güvenliği uzmanı görevlendirmesi ve düzenli saha denetimi.',
    intro:
      '6331 sayılı İş Sağlığı ve Güvenliği Kanunu, çalışan sayısına bakılmaksızın bütün işyerlerine iş güvenliği uzmanı görevlendirme yükümlülüğü getirir. AKER OSGB, 2012’den bu yana Gebze, Dilovası ve Kocaeli genelindeki üretim tesisleri, organize sanayi bölgeleri, lojistik merkezleri ve hizmet işletmeleri için iş güvenliği uzmanı görevlendirmesi yapar.',
    sections: [
      {
        h2: 'İşyeriniz hangi sınıf uzman görevlendirmek zorunda?',
        p: [
          'Görevlendirilecek uzmanın sınıfı, işyerinin NACE koduna göre belirlenen tehlike sınıfına bağlıdır. Az tehlikeli sınıftaki işyerlerinde en az C sınıfı, tehlikeli sınıfta en az B sınıfı, çok tehlikeli sınıfta ise A sınıfı belgeye sahip iş güvenliği uzmanı görevlendirilir.',
          'Görevlendirme İSG-KATİP sistemi üzerinden yapılan sözleşme ile resmiyet kazanır. Sözleşme onaylanmadan yapılan saha çalışmaları yasal olarak görevlendirme sayılmaz.',
        ],
        list: [
          'Az tehlikeli sınıf: en az C sınıfı uzman, çalışan başına ayda en az 10 dakika',
          'Tehlikeli sınıf: en az B sınıfı uzman, çalışan başına ayda en az 20 dakika',
          'Çok tehlikeli sınıf: A sınıfı uzman, çalışan başına ayda en az 40 dakika',
        ],
      },
      {
        h2: 'İş güvenliği uzmanımız sahada ne yapar?',
        p: [
          'Uzman görevlendirmesi, ayda birkaç saatlik imza atma işi değildir. AKER OSGB uzmanları işyerine planlı ziyaretler yapar, tespitleri yazılı olarak kayda geçirir ve işverene süreli aksiyon listesi bırakır.',
        ],
        list: [
          'Saha turu, tehlike tespiti ve uygunsuzlukların fotoğraflı raporlanması',
          'Risk değerlendirmesi ekibinin yönetilmesi ve dokümanın güncel tutulması',
          'Acil durum planı, tatbikat ve ekiplerin organizasyonu',
          'Çalışan İSG eğitimlerinin planlanması ve kayıt altına alınması',
          'İş kazası ve ramak kala incelemesi, kök neden analizi',
          'İSG kurulu toplantılarına katılım ve karar takibi',
          'Onaylı defterin düzenli işlenmesi, yasal bildirimlerin takibi',
        ],
      },
      {
        h2: 'Neden dışarıdan OSGB ile çalışılır?',
        p: [
          'İşveren, yeterli niteliğe sahip personeli bünyesinde bulundurmuyorsa hizmeti Ortak Sağlık ve Güvenlik Birimi’nden alır. Bu, hem yasal yükümlülüğün en pratik karşılanma yoludur hem de tek bir uzmanın deneyimi yerine kurumsal bir ekibin bilgi birikimini sahaya taşır.',
          'AKER OSGB’de uzman izinli veya raporlu olduğunda hizmet kesintiye uğramaz; yerine aynı sınıf belgeye sahip başka bir uzman görevlendirilir.',
        ],
      },
    ],
    faq: [
      {
        q: 'Tek çalışanı olan işyeri de iş güvenliği uzmanı görevlendirmek zorunda mı?',
        a: '6331 sayılı Kanun kapsamındaki işyerleri için çalışan sayısı alt sınırı yoktur. Bir çalışanı bulunan işyeri de tehlike sınıfına uygun iş güvenliği uzmanı görevlendirmekle yükümlüdür.',
      },
      {
        q: 'İş güvenliği uzmanı ayda kaç saat işyerinde bulunur?',
        a: 'Asgari süre çalışan sayısı ve tehlike sınıfına göre hesaplanır: az tehlikelide çalışan başına ayda 10 dakika, tehlikelide 20 dakika, çok tehlikelide 40 dakikadır. Toplam süre, işyerinin çalışan sayısıyla çarpılarak bulunur.',
      },
      {
        q: 'Sözleşme İSG-KATİP’e ne zaman işlenir?',
        a: 'Hizmet sözleşmesi imzalandıktan sonra görevlendirme İSG-KATİP üzerinden tanımlanır ve uzman tarafından onaylanır. Onay tamamlanmadan yasal görevlendirme başlamış sayılmaz.',
      },
    ],
    related: ['risk-degerlendirmesi', 'isg-egitimleri', 'acil-durum-plani'],
  },

  // -------------------------------------------------------
  {
    slug: 'isyeri-hekimligi',
    nav: 'İşyeri Hekimliği',
    h1: 'İşyeri Hekimliği Hizmeti',
    title: 'İşyeri Hekimliği Hizmeti | Gebze ve Kocaeli | AKER OSGB',
    description:
      'İşyeri hekimi görevlendirmesi, periyodik muayene, işe giriş muayenesi ve sağlık gözetimi. Gebze, Dilovası ve Kocaeli genelinde AKER OSGB güvencesiyle.',
    icon: 'ikon-isyeri-hekimligi',
    short: 'İşyeri hekimi görevlendirmesi, sağlık gözetimi, periyodik muayene ve işe giriş muayeneleri.',
    intro:
      'İşyeri hekimi, çalışanların sağlığını işin niteliğine göre izleyen, meslek hastalıklarını erken safhada yakalamayı hedefleyen görevlidir. AKER OSGB, işyeri hekimliği belgesine sahip hekimlerle Gebze ve Kocaeli genelinde sağlık gözetimi hizmeti verir.',
    sections: [
      {
        h2: 'İşyeri hekimi görevlendirme süreleri',
        p: [
          'İşyeri hekiminin işyerinde bulunması gereken asgari süre, iş güvenliği uzmanında olduğu gibi tehlike sınıfı ve çalışan sayısına göre hesaplanır.',
        ],
        list: [
          'Az tehlikeli sınıf: çalışan başına ayda en az 5 dakika',
          'Tehlikeli sınıf: çalışan başına ayda en az 10 dakika',
          'Çok tehlikeli sınıf: çalışan başına ayda en az 15 dakika',
        ],
      },
      {
        h2: 'Sağlık gözetimi kapsamında yapılan işler',
        list: [
          'İşe giriş ve periyodik sağlık muayeneleri',
          'İş değişikliği, iş kazası veya uzun süreli devamsızlık sonrası muayene',
          'Çalışma ortamı gözetimi ve maruziyet değerlendirmesi',
          'Meslek hastalığı ön tanısı ve sevk süreci',
          'Aşılama, hijyen ve sağlığı geliştirme programları',
          'Sağlık kayıtlarının mevzuata uygun tutulması ve saklanması',
        ],
      },
      {
        h2: 'Periyodik muayene aralıkları',
        p: [
          'Periyodik muayeneler, işyerinin tehlike sınıfına göre en geç belirli aralıklarla tekrarlanır: az tehlikeli sınıfta beş yılda bir, tehlikeli sınıfta üç yılda bir, çok tehlikeli sınıfta yılda bir. İşyeri hekimi, maruziyet durumuna göre bu aralıkları kısaltabilir.',
          'Gürültü, toz, kimyasal veya titreşim maruziyeti bulunan işlerde odyometri, solunum fonksiyon testi ve laboratuvar tetkikleri muayeneye eklenir. AKER OSGB bu tetkikleri mobil sağlık aracıyla işyerinizde yapabilir.',
        ],
      },
    ],
    faq: [
      {
        q: 'İşyeri hekimi olmadan işe giriş raporu alınabilir mi?',
        a: 'İşe giriş sağlık raporu, işyeri hekimliği yetkisi bulunan hekim tarafından düzenlenir. İşyerinde görevli hekim yoksa OSGB üzerinden görevlendirilen işyeri hekimi bu raporu düzenler.',
      },
      {
        q: 'Periyodik muayene ne sıklıkla tekrarlanır?',
        a: 'En geç, az tehlikeli sınıfta beş yılda bir, tehlikeli sınıfta üç yılda bir, çok tehlikeli sınıfta yılda bir tekrarlanır. Maruziyet durumuna göre işyeri hekimi daha sık muayene isteyebilir.',
      },
      {
        q: 'Çalışan sağlık kayıtları ne kadar saklanır?',
        a: 'Sağlık gözetimi kayıtları, çalışanın işten ayrılmasından sonra da mevzuatta öngörülen süre boyunca saklanır ve talep halinde çalışana verilir.',
      },
    ],
    related: ['ise-giris-saglik-raporu', 'diger-saglik-personeli', 'mobil-saglik-hizmetleri'],
  },

  // -------------------------------------------------------
  {
    slug: 'diger-saglik-personeli',
    nav: 'Diğer Sağlık Personeli',
    h1: 'Diğer Sağlık Personeli (İşyeri Hemşiresi) Hizmeti',
    title: 'Diğer Sağlık Personeli ve İşyeri Hemşiresi | AKER OSGB',
    description:
      'Çok tehlikeli sınıftaki işyerleri için diğer sağlık personeli görevlendirmesi. İşyeri hemşiresi, revir hizmeti ve sağlık kayıt yönetimi. Gebze ve Kocaeli.',
    icon: 'ikon-diger-saglik-personeli',
    short: 'Çok tehlikeli sınıf işyerleri için işyeri hemşiresi ve diğer sağlık personeli görevlendirmesi.',
    intro:
      'Diğer sağlık personeli; işyeri hemşiresi, sağlık memuru, acil tıp teknisyeni veya çevre sağlığı teknisyeni belgesine sahip, işyeri hekimiyle birlikte çalışan görevlidir. Çok tehlikeli sınıfta yer alan ve 10’dan fazla çalışanı olan işyerleri için görevlendirme zorunludur.',
    sections: [
      {
        h2: 'Görevlendirme koşulu ve süresi',
        p: [
          'Çok tehlikeli sınıfta yer alan ve 10’dan fazla çalışanı bulunan işyerlerinde, çalışan başına ayda en az 10 dakika olacak şekilde diğer sağlık personeli görevlendirilir. Bu süre işyeri hekiminin süresine ek olarak hesaplanır.',
        ],
      },
      {
        h2: 'İşyerinde üstlendiği görevler',
        list: [
          'İşyeri hekiminin muayenelerine ve sağlık taramalarına destek',
          'Revirde ilk müdahale ve acil durum desteği',
          'Sağlık kayıtlarının düzenli tutulması ve arşivlenmesi',
          'İlk yardım malzemelerinin ve dolapların takibi',
          'Periyodik muayene randevularının planlanması ve takibi',
          'Sağlığı geliştirme ve hijyen eğitimlerine katkı',
        ],
      },
    ],
    faq: [
      {
        q: 'Diğer sağlık personeli her işyerinde zorunlu mu?',
        a: 'Hayır. Zorunluluk, çok tehlikeli sınıfta yer alan ve 10’dan fazla çalışanı olan işyerleri için geçerlidir. Diğer işyerleri isteğe bağlı olarak görevlendirme yapabilir.',
      },
      {
        q: 'İşyeri hemşiresi işyeri hekiminin yerine geçer mi?',
        a: 'Geçmez. Diğer sağlık personeli, işyeri hekiminin gözetiminde ve ona destek olacak şekilde çalışır; muayene ve rapor yetkisi hekime aittir.',
      },
    ],
    related: ['isyeri-hekimligi', 'mobil-saglik-hizmetleri'],
  },

  // -------------------------------------------------------
  {
    slug: 'risk-degerlendirmesi',
    nav: 'Risk Değerlendirmesi',
    h1: 'Risk Değerlendirmesi Hazırlama Hizmeti',
    title: 'Risk Değerlendirmesi Hazırlama | Gebze ve Kocaeli | AKER OSGB',
    description:
      'İşyeri risk değerlendirmesi hazırlama, güncelleme ve aksiyon takibi. Fine-Kinney ve L tipi matris yöntemleriyle saha odaklı çalışma. AKER OSGB Gebze.',
    icon: 'ikon-risk-degerlendirmesi',
    short: 'Sahada yapılan tehlike tespitiyle risk değerlendirmesi hazırlama, güncelleme ve aksiyon takibi.',
    intro:
      'Risk değerlendirmesi, İSG sisteminin temel belgesidir; diğer bütün çalışmalar bu dokümandan beslenir. Kanun, her işverene işyerindeki tehlikeleri tespit etme, riskleri değerlendirme ve önlem alma yükümlülüğü getirir. AKER OSGB risk değerlendirmesini masa başında değil, sahada, çalışanların katılımıyla hazırlar.',
    sections: [
      {
        h2: 'Risk değerlendirmesi ne zaman yenilenir?',
        p: [
          'Doküman, tehlike sınıfına göre belirli aralıklarla yenilenir. Ayrıca işyeri taşınması, üretim yönteminin değişmesi, yeni makine alınması, iş kazası veya meslek hastalığı meydana gelmesi durumunda yenilenmesi gerekir.',
        ],
        list: [
          'Az tehlikeli sınıf: en geç 6 yılda bir',
          'Tehlikeli sınıf: en geç 4 yılda bir',
          'Çok tehlikeli sınıf: en geç 2 yılda bir',
        ],
      },
      {
        h2: 'Çalışma adımlarımız',
        list: [
          'Risk değerlendirme ekibinin kurulması (işveren, uzman, hekim, çalışan temsilcisi, destek elemanı)',
          'Saha turu ile tehlike ve kaynak tespiti',
          'Fine-Kinney veya L tipi matris yöntemiyle risk puanlaması',
          'Önleme hiyerarşisine göre kontrol tedbirlerinin belirlenmesi',
          'Sorumlu ve termin atanmış aksiyon planı',
          'Aksiyonların kapanış takibi ve doküman revizyonu',
        ],
      },
      {
        h2: 'Sık karşılaşılan eksik: aksiyon takibi',
        p: [
          'Denetimlerde en çok karşılaşılan uygunsuzluk, risk değerlendirmesinin var olması ama içindeki tedbirlerin uygulanmamış olmasıdır. Doküman tek başına yasal koruma sağlamaz; alınan kararların uygulandığının kayıtla ispatlanması gerekir. AKER OSGB, her ziyarette açık aksiyonları işverene yazılı olarak hatırlatır.',
        ],
      },
    ],
    faq: [
      {
        q: 'Risk değerlendirmesini kim imzalar?',
        a: 'Risk değerlendirme ekibi imzalar. Ekipte işveren veya vekili, iş güvenliği uzmanı, işyeri hekimi, çalışan temsilcisi ve destek elemanları yer alır.',
      },
      {
        q: 'İş kazası olursa risk değerlendirmesi yenilenmeli mi?',
        a: 'Evet. İş kazası, meslek hastalığı veya ramak kala olayı yaşanması, sürenin dolmasını beklemeden risk değerlendirmesinin gözden geçirilmesini gerektirir.',
      },
      {
        q: 'Hazır şablon risk değerlendirmesi geçerli olur mu?',
        a: 'Risk değerlendirmesi işyerine özgüdür. Başka bir işyerinden alınan şablon, sahadaki gerçek tehlikeleri yansıtmadığı için denetimde uygunsuzluk oluşturur.',
      },
    ],
    related: ['is-guvenligi-uzmanligi', 'acil-durum-plani', 'isg-egitimleri'],
  },

  // -------------------------------------------------------
  {
    slug: 'acil-durum-plani',
    nav: 'Acil Durum Planı',
    h1: 'Acil Durum Planı ve Tatbikat Hizmeti',
    title: 'Acil Durum Planı Hazırlama ve Tatbikat | AKER OSGB',
    description:
      'Acil durum planı hazırlama, acil durum ekiplerinin kurulması, tahliye tatbikatı ve yangın tatbikatı organizasyonu. Gebze, Dilovası ve Kocaeli.',
    icon: 'ikon-acil-durum-plani',
    short: 'Acil durum planı hazırlama, ekiplerin kurulması ve yılda en az bir tatbikatın yürütülmesi.',
    intro:
      'Acil durum planı; yangın, deprem, kimyasal sızıntı, sel ve sabotaj gibi olaylarda kimin ne yapacağını önceden yazan belgedir. Kanun, bütün işyerlerine acil durum planı hazırlama, ekipleri kurma ve tatbikat yapma yükümlülüğü verir.',
    sections: [
      {
        h2: 'Plan ne sıklıkla yenilenir?',
        list: [
          'Az tehlikeli sınıf: en geç 6 yılda bir',
          'Tehlikeli sınıf: en geç 4 yılda bir',
          'Çok tehlikeli sınıf: en geç 2 yılda bir',
          'İşyerinde yapısal değişiklik veya yeni acil durum ortaya çıkması halinde derhal',
        ],
      },
      {
        h2: 'Acil durum ekipleri ve ilkyardımcı sayısı',
        p: [
          'İşyerinde arama-kurtarma-tahliye, yangınla mücadele, ilk yardım ve haberleşme görevleri için destek elemanı görevlendirilir. İlkyardımcı sayısı tehlike sınıfına göre belirlenir.',
        ],
        list: [
          'Az tehlikeli sınıf: her 20 çalışana en az 1 ilkyardımcı',
          'Tehlikeli sınıf: her 15 çalışana en az 1 ilkyardımcı',
          'Çok tehlikeli sınıf: her 10 çalışana en az 1 ilkyardımcı',
        ],
      },
      {
        h2: 'Tatbikat organizasyonu',
        p: [
          'Yılda en az bir kez tatbikat yapılması ve tatbikat sonrası değerlendirme raporunun hazırlanması gerekir. AKER OSGB tatbikat senaryosunu işyerinizin gerçek risklerine göre yazar, tahliye süresini ölçer ve aksayan noktaları rapora işler.',
          'Tatbikat kaydı; katılımcı listesi, fotoğraf, süre ölçümü ve iyileştirme maddelerini içerir. Bu kayıt denetimde acil durum yükümlülüğünün ispatıdır.',
        ],
      },
    ],
    faq: [
      {
        q: 'Tatbikat yılda kaç kez yapılmalı?',
        a: 'Hazırlanan acil durum planları kapsamında yılda en az bir kez tatbikat yapılması gerekir. Tatbikat sonrası değerlendirme raporu düzenlenir ve saklanır.',
      },
      {
        q: 'Küçük ofisler de acil durum planı hazırlamak zorunda mı?',
        a: 'Evet. Çalışan sayısına bakılmaksızın bütün işyerleri acil durum planı hazırlamak, ekipleri belirlemek ve tatbikat yapmakla yükümlüdür.',
      },
    ],
    related: ['risk-degerlendirmesi', 'isg-egitimleri', 'is-guvenligi-uzmanligi'],
  },

  // -------------------------------------------------------
  {
    slug: 'isg-egitimleri',
    nav: 'İSG Eğitimleri',
    h1: 'İş Sağlığı ve Güvenliği Eğitimleri',
    title: 'İSG Eğitimleri ve İş Güvenliği Eğitimi | AKER OSGB Gebze',
    description:
      'Temel İSG eğitimi, yenileme eğitimi ve işe özgü eğitimler. Az tehlikeli 8, tehlikeli 12, çok tehlikeli 16 saat. Belgeli, kayıtlı ve işyerinde eğitim.',
    icon: 'ikon-isg-egitimi',
    short: 'Temel ve yenileme İSG eğitimleri, işe özgü eğitimler; katılım kayıtları ve belgelendirme dahil.',
    intro:
      'İşveren, her çalışanına işe başlamadan önce ve düzenli aralıklarla iş sağlığı ve güvenliği eğitimi verdirmekle yükümlüdür. Eğitimin süresi ve tekrar sıklığı işyerinin tehlike sınıfına göre değişir. AKER OSGB eğitimleri işyerinizde, vardiya düzeninize göre planlar.',
    sections: [
      {
        h2: 'Temel eğitim süreleri ve yenileme aralıkları',
        list: [
          'Az tehlikeli sınıf: en az 8 saat, en geç 3 yılda bir yenileme',
          'Tehlikeli sınıf: en az 12 saat, en geç 2 yılda bir yenileme',
          'Çok tehlikeli sınıf: en az 16 saat, yılda bir yenileme',
        ],
        p: [
          'Eğitim; genel konular, sağlık konuları ve teknik konular başlıklarını kapsar. Eğitimin verildiği, katılım tutanağı ve düzenlenen belge ile kayıt altına alınır.',
        ],
      },
      {
        h2: 'İşe özgü ve tamamlayıcı eğitimler',
        list: [
          'Yüksekte çalışma ve düşme koruma',
          'Kapalı alanda çalışma',
          'Sıcak iş, kaynak ve yangın güvenliği',
          'Forklift, transpalet ve istif makinesi kullanımı',
          'Kimyasal maruziyeti ve güvenlik bilgi formu okuma',
          'Elektrikle çalışmalarda güvenlik ve LOTO (etiketle-kilitle)',
          'Ergonomi ve elle taşıma',
          'İlk yardım ve yangın söndürme uygulaması',
        ],
      },
      {
        h2: 'Eğitim kaydı neden önemli?',
        p: [
          'İş kazası sonrası açılan davalarda işverenin eğitim yükümlülüğünü yerine getirdiğini ispatlaması gerekir. İmzalı katılım tutanağı, eğitim içeriği, süresi ve eğiticinin belgesi bu ispatın parçasıdır. AKER OSGB her eğitim için bu dosyayı eksiksiz teslim eder.',
        ],
      },
    ],
    faq: [
      {
        q: 'İSG eğitimi çalışma saatleri içinde mi verilmeli?',
        a: 'Eğitimler çalışma süresinden sayılır ve maliyeti çalışana yansıtılamaz. Eğitim süresinin ücretini işveren karşılar.',
      },
      {
        q: 'Yeni işe giren çalışana ne zaman eğitim verilir?',
        a: 'Çalışan işe başlamadan önce temel İSG eğitimini almış olmalıdır. İş değişikliği veya yeni ekipman kullanımı durumunda ek eğitim verilir.',
      },
      {
        q: 'Eğitimi online yapmak mümkün mü?',
        a: 'Mevzuatın izin verdiği kapsam ve saat sınırları içinde uzaktan eğitim yapılabilir; uygulamalı konular yüz yüze yürütülür. Planlamayı işyerinizin tehlike sınıfına göre birlikte yaparız.',
      },
    ],
    related: ['is-guvenligi-uzmanligi', 'acil-durum-plani', 'risk-degerlendirmesi'],
  },

  // -------------------------------------------------------
  {
    slug: 'ise-giris-saglik-raporu',
    nav: 'İşe Giriş Sağlık Raporu',
    h1: 'İşe Giriş ve Periyodik Sağlık Raporu',
    title: 'İşe Giriş Sağlık Raporu | Gebze ve Kocaeli | AKER OSGB',
    description:
      'İşe giriş sağlık raporu, periyodik muayene ve gerekli tetkikler. İşyeri hekimi tarafından düzenlenen mevzuata uygun rapor. Gebze, Dilovası, Kocaeli.',
    icon: 'ikon-ise-giris-saglik-raporu',
    short: 'İşe giriş ve periyodik muayeneler, tetkikler ve mevzuata uygun sağlık raporu düzenlenmesi.',
    intro:
      'İşe giriş sağlık raporu, çalışanın yapacağı işe fiziken uygun olup olmadığını ortaya koyan belgedir. Rapor olmadan işe başlatma, hem idari yaptırım hem de kaza sonrası ağır sorumluluk doğurur.',
    sections: [
      {
        h2: 'Raporu kim düzenler?',
        p: [
          'İşe giriş ve periyodik muayene raporları, işyeri hekimliği yetkisi bulunan hekim tarafından düzenlenir. Aile hekiminden alınan genel sağlık raporu, işe giriş sağlık raporu yerine geçmez.',
          'Çok tehlikeli ve tehlikeli sınıftaki işlerde raporun, yapılacak işe özgü tetkiklerle desteklenmesi gerekir.',
        ],
      },
      {
        h2: 'Sık istenen tetkikler',
        list: [
          'Akciğer grafisi',
          'Solunum fonksiyon testi (SFT)',
          'Odyometri (işitme testi)',
          'Göz muayenesi ve görme keskinliği',
          'Kan ve idrar tetkikleri, biyolojik maruziyet göstergeleri',
          'Portör muayenesi (gıda ile temaslı işlerde)',
        ],
      },
      {
        h2: 'Periyodik muayene takvimi',
        p: [
          'Periyodik muayeneler en geç; az tehlikeli sınıfta 5 yılda bir, tehlikeli sınıfta 3 yılda bir, çok tehlikeli sınıfta yılda bir tekrarlanır. Gürültü, toz veya kimyasal maruziyeti olan işlerde işyeri hekimi bu aralığı kısaltır.',
        ],
      },
    ],
    faq: [
      {
        q: 'İşe giriş raporunu aile hekimi verebilir mi?',
        a: 'Hayır. İşe giriş sağlık raporu işyeri hekimliği yetkisi olan hekim tarafından düzenlenir.',
      },
      {
        q: 'Rapor masrafını kim öder?',
        a: 'Sağlık gözetiminden doğan maliyetler işverene aittir; çalışana yansıtılamaz.',
      },
      {
        q: 'Tetkikler işyerinde yapılabilir mi?',
        a: 'Evet. Mobil sağlık aracımızla akciğer grafisi, odyometri ve solunum fonksiyon testi gibi tetkikleri işyerinizde yapabiliriz; üretim duruşu en aza iner.',
      },
    ],
    related: ['isyeri-hekimligi', 'mobil-saglik-hizmetleri', 'diger-saglik-personeli'],
  },

  // -------------------------------------------------------
  {
    slug: 'mobil-saglik-hizmetleri',
    nav: 'Mobil Sağlık Hizmetleri',
    h1: 'Mobil Sağlık Taraması ve Yerinde Ambulans Hizmeti',
    title: 'Mobil Sağlık Taraması ve Yerinde Ambulans | AKER OSGB',
    description:
      'İşyerinde mobil sağlık taraması, akciğer grafisi, odyometri, SFT ve etkinlik/şantiye için yerinde ambulans hizmeti. Gebze, Dilovası ve Kocaeli.',
    icon: 'ikon-yerinde-ambulans',
    short: 'İşyerinizde toplu sağlık taraması ve şantiye, fabrika, etkinlikler için yerinde ambulans desteği.',
    intro:
      'Sağlık taraması için çalışanların gruplar hâlinde dışarı çıkması üretimi aksatır. AKER OSGB mobil sağlık aracıyla tetkikleri işyerinizin sahasında yapar; ayrıca riskli operasyonlar, şantiyeler ve etkinlikler için yerinde ambulans ve sağlık personeli görevlendirir.',
    sections: [
      {
        h2: 'Mobil sağlık aracıyla işyerinde yapılan tetkikler',
        list: [
          'Akciğer grafisi',
          'Solunum fonksiyon testi',
          'Odyometri',
          'Görme taraması',
          'Kan ve idrar numunesi alımı',
          'İşyeri hekimi muayenesi ve rapor düzenlenmesi',
        ],
      },
      {
        h2: 'Yerinde ambulans hizmeti',
        p: [
          'Yüksek riskli bakım-onarım işleri, kapalı alan çalışmaları, şantiye faaliyetleri, spor organizasyonları ve kalabalık etkinlikler için ambulans ve sağlık personeli görevlendirmesi yapılır.',
          'Hizmet; olay yerinde ilk müdahale, gerektiğinde nakil ve olay kaydının tutulmasını kapsar. Süre ve personel bileşimi operasyonun riskine göre planlanır.',
        ],
      },
      {
        h2: 'Planlama nasıl yapılır?',
        p: [
          'Çalışan sayısı, vardiya düzeni ve gerekli tetkik listesi üzerinden takvim çıkarılır. Tarama günü işyerinde alan hazırlığı yapılır, sonuçlar işyeri hekimi tarafından değerlendirilip sağlık dosyalarına işlenir.',
        ],
      },
    ],
    faq: [
      {
        q: 'Mobil taramada kaç kişi tarayabiliyorsunuz?',
        a: 'Kapasite; istenen tetkik seti, vardiya düzeni ve saha koşullarına göre değişir. Çalışan sayınızı ve tetkik listenizi ilettiğinizde gün bazlı planı birlikte çıkarırız.',
      },
      {
        q: 'Ambulans hizmeti sadece sanayi tesisleri için mi?',
        a: 'Hayır. Şantiye, spor müsabakası, konser ve kurumsal etkinlikler için de yerinde ambulans ve sağlık personeli görevlendirmesi yapılır.',
      },
    ],
    related: ['ise-giris-saglik-raporu', 'isyeri-hekimligi', 'diger-saglik-personeli'],
  },
];

export const SERVICE_BY_SLUG = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
