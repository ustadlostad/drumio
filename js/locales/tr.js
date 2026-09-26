/** Turkish strings. Missing keys fall back to English. */
export default {
  // Header
  'nav.aria':         'Bölümler',
  'nav.metronome':    'Metronom',
  'nav.rudiments':    'Rudimentler',
  'nav.drills':       'Egzersizler',
  'lang.aria':        'Dil',
  'theme.toggleAria': 'Karanlık modu değiştir',

  // Metronome
  'metronome.timeSig':     'Ölçü',
  'metronome.subdivision': 'Bölünme',
  'metronome.sliderAria':  'BPM kaydırıcısı',
  'metronome.soundAria':   'Metronom sesi',
  'metronome.tapTempo':    'Tempo Vur',
  'metronome.start':       'Başlat',
  'metronome.stop':        'Durdur',
  'metronome.shortcuts':   'Boşluk: başlat / durdur · T: tempo vur',

  'subdivision.1': 'Kapalı',
  'subdivision.2': 'Sekizlik',
  'subdivision.3': 'Triole',
  'subdivision.4': 'Onaltılık',

  'sound.click':     'Klik',
  'sound.woodblock': 'Tahta Blok',
  'sound.hihat':     'Hi-Hat',
  'sound.rimshot':   'Rimshot',
  'sound.beep':      'Bip',

  // Rudiment exercise
  'exercise.label':     'Egzersiz',
  'exercise.end':       'Bitir',
  'exercise.leadRight': 'Sağ elle başla',
  'exercise.leadLeft':  'Sol elle başla',

  // Tempo trainer
  'trainer.title':   'Tempo Antrenörü',
  'trainer.enable':  'Tempo antrenörünü aç',
  'trainer.step':    'Artış',
  'trainer.every':   'Her',
  'trainer.seconds': 'sn',
  'trainer.target':  'Hedef',
  'trainer.return':  'Sonra geri in',
  'trainer.hint':    'Tempo ölçü başında değişir.',
  'trainer.now':     (bpm) => `Şu an ${bpm} BPM`,
  'trainer.done':    'Hedefe ulaşıldı. Devam!',

  // Timer
  'timer.title':       'Çalışma Zamanlayıcısı',
  'timer.setDuration': 'Süre Ayarla',
  'timer.presetsAria': 'Hazır süreler',
  'timer.presetLabel': (m) => `${m} dk`,
  'timer.custom':      'Özel',
  'timer.minutesAria': 'Dakika',
  'timer.secondsAria': 'Saniye',
  'timer.hint':        'Metronom ile senkronize — otomatik başlar ve durur',
  'timer.done':        'Süre doldu. Eline sağlık!',

  // Filters
  'filter.all':            'Tümü',
  'filter.allLevels':      'Tüm Seviyeler',
  'filter.beginner':       'Başlangıç',
  'filter.intermediate':   'Orta',
  'filter.advanced':       'İleri',
  'filter.categoryAria':   'Kategoriye göre filtrele',
  'filter.difficultyAria': 'Zorluğa göre filtrele',

  // Categories
  'category.single-strokes':        'Tek Vuruşlar',
  'category.multiple-bounce-rolls': 'Çoklu Sekme Rulolar',
  'category.double-strokes':        'Çift Vuruşlar',
  'category.paradiddles':           'Paradiddle',
  'category.flams':                 'Flam',
  'category.drags':                 'Drag',
  'category.warm-up':               'Isınma',
  'category.technique':             'Teknik',
  'category.stick-control':         'Baget Kontrolü',
  'category.speed-endurance':       'Hız ve Dayanıklılık',
  'category.flam-exercises':        'Flam Egzersizleri',
  'category.drag-exercises':        'Drag Egzersizleri',
  'category.independence':          'Bağımsızlık',

  // Rudiments
  'rudiments.search':       'Rudiment ara…',
  'rudiments.count':        (n, total) => `${total} rudimentten ${n} tanesi`,
  'rudiments.empty':        'Filtrelerinizle eşleşen rudiment bulunamadı.',
  'rudiments.error':        'Rudimentler yüklenemedi. Sayfayı yenilemeyi deneyin.',
  'rudiments.practise':     'Egzersiz Başlat',
  'rudiments.practiseAria': (name) => `${name} için egzersiz başlat`,

  // Drills
  'drills.search':       'Egzersiz ara…',
  'drills.count':        (n, total) => `${total} egzersizden ${n} tanesi`,
  'drills.empty':        'Filtrelerinizle eşleşen egzersiz bulunamadı.',
  'drills.error':        'Egzersizler yüklenemedi. Sayfayı yenilemeyi deneyin.',
  'drills.startAt':      (bpm) => `${bpm} BPM ile başla`,
  'drills.ramp':         (step, secs) => `· her ${secs} sn'de +${step}`,
  'drills.practise':     'Pratik Yap',
  'drills.practiseAria': (name, bpm) => `${name} egzersizini ${bpm} BPM ile çalış`,
  'drills.toast':        (bpm) => `Metronom ${bpm} BPM olarak ayarlandı`,

  // Videos
  'video.watch':      'İzle',
  'video.watchAria':  (name) => `${name} videosunu izle`,
  'video.search':     "YouTube'da Bul",
  'video.searchAria': (name) => `YouTube'da ${name} ara`,

  // Modal
  'modal.openYoutube': "↗ YouTube'da Aç",
  'modal.closeAria':   'Videoyu kapat',
  'modal.playerAria':  'Video oynatıcı',

  // Footer
  'footer.tagline': 'Ritmi koru.',
};
