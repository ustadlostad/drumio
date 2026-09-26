/** English strings. Function values take interpolation arguments. */
export default {
  // Header
  'nav.aria':         'Sections',
  'nav.metronome':    'Metronome',
  'nav.rudiments':    'Rudiments',
  'nav.drills':       'Drills',
  'lang.aria':        'Language',
  'theme.aria.system': 'Theme: follow system',
  'theme.aria.light':  'Theme: light — tap for dark',
  'theme.aria.dark':   'Theme: dark — tap to follow system',

  // Metronome
  'metronome.timeSig':        'Time Signature',
  'metronome.subdivision':    'Subdivision',
  'metronome.sliderAria':     'BPM slider',
  'metronome.soundAria':      'Metronome sound',
  'metronome.tapTempo':       'Tap Tempo',
  'metronome.start':          'Start',
  'metronome.stop':           'Stop',
  'metronome.shortcuts':      'Space: start / stop · T: tap tempo',
  'metronome.editHint':       'Tap to edit',
  'metronome.settingsToggle': 'Settings',
  'metronome.focusAria':      'Focus mode',
  'metronome.focusExitAria':  'Exit focus mode',

  'subdivision.1': 'Off',
  'subdivision.2': '8th notes',
  'subdivision.3': 'Triplets',
  'subdivision.4': '16th notes',

  'sound.click':     'Click',
  'sound.woodblock': 'Woodblock',
  'sound.hihat':     'Hi-Hat',
  'sound.rimshot':   'Rimshot',
  'sound.beep':      'Beep',

  // Rudiment exercise
  'exercise.label':          'Exercise',
  'exercise.end':            'End',
  'exercise.leadRight':      'Right lead',
  'exercise.leadLeft':       'Left lead',
  'exercise.leadAria':       'Lead hand',
  'exercise.openRudimentAria': (name) => `Open ${name} in rudiments`,

  // Tempo trainer
  'trainer.title':          'Tempo Trainer',
  'trainer.enable':         'Enable tempo trainer',
  'trainer.step':           'Increase by',
  'trainer.every':          'Every',
  'trainer.seconds':        'sec',
  'trainer.target':         'Up to',
  'trainer.return':         'Then back down',
  'trainer.hint':           'Tempo changes at the start of a bar.',
  'trainer.now':            (bpm) => `Now at ${bpm} BPM`,
  'trainer.done':           'Target reached. Keep going!',
  'trainer.badgeTarget':    (bpm) => `🎯 Target ${bpm} BPM`,
  'trainer.reverted':       (bpm) => `Tempo reset to ${bpm} BPM`,
  'trainer.disabledByDrill': 'Tempo trainer turned off for this drill',

  // Timer
  'timer.title':        'Practice Timer',
  'timer.setDuration':  'Set duration',
  'timer.presetsAria':  'Preset durations',
  'timer.presetLabel':  (m) => `${m} min`,
  'timer.custom':       'Custom',
  'timer.minutesAria':  'Minutes',
  'timer.secondsAria':  'Seconds',
  'timer.hint':         'Syncs with metronome — starts & stops automatically',
  'timer.hintManual':   'Runs on its own — use Start and Reset above.',
  'timer.done':         'Time is up. Nice work!',
  'timer.startBtn':     'Start',
  'timer.pauseBtn':     'Pause',
  'timer.resetBtn':     'Reset',
  'timer.linkToggle':   'Sync with metronome',

  // Filters (shared between rudiments & drills)
  'filter.all':            'All',
  'filter.allLevels':      'All Levels',
  'filter.beginner':       'Beginner',
  'filter.intermediate':   'Intermediate',
  'filter.advanced':       'Advanced',
  'filter.categoryAria':   'Filter by category',
  'filter.difficultyAria': 'Filter by difficulty',
  'filter.clear':          'Clear filters',

  // Categories (keys are slugs of the English names in the data files)
  'category.single-strokes':        'Single Strokes',
  'category.multiple-bounce-rolls': 'Multiple Bounce Rolls',
  'category.double-strokes':        'Double Strokes',
  'category.paradiddles':           'Paradiddles',
  'category.flams':                 'Flams',
  'category.drags':                 'Drags',
  'category.warm-up':               'Warm Up',
  'category.technique':             'Technique',
  'category.stick-control':         'Stick Control',
  'category.speed-endurance':       'Speed & Endurance',
  'category.flam-exercises':        'Flam Exercises',
  'category.drag-exercises':        'Drag Exercises',
  'category.independence':          'Independence',

  // Rudiments
  'rudiments.search':       'Search rudiments…',
  'rudiments.count':        (n, total) => `${n} of ${total} rudiment${total !== 1 ? 's' : ''}`,
  'rudiments.empty':        'No rudiments match your filters.',
  'rudiments.error':        'Could not load rudiments. Try refreshing.',
  'rudiments.practise':     'Start Exercise',
  'rudiments.practiseAria': (name) => `Start exercise for ${name}`,

  // Drills
  'drills.search':       'Search drills…',
  'drills.count':        (n, total) => `${n} of ${total} drill${total !== 1 ? 's' : ''}`,
  'drills.empty':        'No drills match your filters.',
  'drills.error':        'Could not load drills. Try refreshing.',
  'drills.startAt':      (bpm) => `Start at ${bpm} BPM`,
  'drills.ramp':         (step, secs) => `· +${step} every ${secs}s`,
  'drills.practise':     'Practice',
  'drills.practiseAria': (name, bpm) => `Practice ${name} at ${bpm} BPM`,
  'drills.toast':        (bpm) => `Metronome set to ${bpm} BPM`,

  // Videos
  'video.watch':      'Watch',
  'video.watchAria':  (name) => `Watch ${name} video`,
  'video.search':     'Find on YouTube',
  'video.searchAria': (name) => `Search YouTube for ${name}`,

  // Modal
  'modal.openYoutube': '↗ Open on YouTube',
  'modal.closeAria':   'Close video',
  'modal.playerAria':  'Video player',

  // Footer
  'footer.tagline': 'Keep the beat.',
};
