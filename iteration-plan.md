# Iteration Plan

## Iteration-1
### Goal
Create initial project structure

### Tasks
- Create web app folders
- Define folder structure following web development best practices

## Iteration-2
### Goal
Add a fully functional metronome to the top of the page

### Tasks
- Add metronome to the top of the page
- Make metronome BPM changeable (slider + manual input)
- Add a visual beat indicator for every beat
- Add tap tempo feature
- Make metronome sound changeable (add at least 5 different sounds/tones e.g. click, woodblock, hi-hat, rimshot, beep)

## Iteration-3
### Goal
Build the rudiment library page

### Tasks
- Create a `data/rudiments.json` file with rudiment definitions (name, description, notation hints)
- Build a rudiment listing page that reads from the JSON file
- Display each rudiment with its name, category, and description
- Add basic filtering/search by category (e.g. single strokes, double strokes, paradiddles)

## Iteration-4
### Goal
Add practice exercises and drills

### Tasks
- Create a `data/drills.json` file with drill definitions (name, description, BPM range, difficulty)
- Build a drills/exercises page that reads from the JSON file
- Link drills to the metronome (pre-fill recommended BPM when opening a drill)
- Add difficulty level indicators (beginner / intermediate / advanced)


## Iteration-5
### Goal
Adding example youtube videos for rudiments and drills.
Apply small improvements

### Tasks
- Add youtube video links for rudimens and drills. If you can not find matching videos you can skip drills
- Add filter to filter beginner, intermediate and advanced rudiments and drills

## Iteration-6
### Goal
Improvement for drills

### Tasks
- When user press practise button on drills start bpm with advised bpm in drill description.
- If drill has time advice in description, user can start practice with the bpm that described in the drill description.
- Timer can be add to next to the metronome

## Iteration-7
### Goal
- Improve Rudiments section.
### Tasks
- There are 40 rudiments that accepted by everyone. (PAS 40)
- Add all these 40 rudiments to rudiments section.

## Iteration-8
### Goal
- Make this app also runnable on ios platform.
### Tasks
- https://capacitorjs.com/docs/ios via following the instructions of capacitor web site make this application runnable on ios.

## Iteration-9
### Goal
- Adding more time signatures to metronome.
### Tasks
- Add below time signatures for metronome.
	•	4/4 (default)
	•	3/4
	•	2/4
	•	6/8
	•	12/8
- User can select these signatures via using dropdown.
- We can add more time signatures in the future that is why make desing expandable.

## Iteration-10
### Goal
- Adding Turkish language support
### Tasks
- Add Turkish language option for the app.
- It should be centralized and can be expandable for the future to support more languages.

## Iteration-11
### Goal
- Add hand signs on the beat dots
### Tasks
- Add start exercise button for rudiments also. 
- If user starts a exercise, hand signs needs to be visible on the beat dots according to exercise.
- It should be syncronised with the metronome and etc..

## Iteration-12
### Goal
- Rebuild the foundation after a long pause: modules, build, tests, persistence.
### Tasks
- Move all JavaScript to native ES modules (no globals, no script-order dependence). Still no frameworks.
- Replace the rsync build with a small Node script that copies only the web app files into `www/`.
- Add `npm start` (local static server), `npm run build`, `npm test` (Node built-in test runner, no dependencies).
- Persist user settings in localStorage: theme, language, BPM, sound, time signature, subdivision, timer duration.
- Apply the saved theme before first paint (no light-mode flash in dark mode).
- Remove manual `?v=N` cache busting.

## Iteration-13
### Goal
- Rewrite the metronome engine.
### Tasks
- Add subdivisions: off, 8ths, triplets, 16ths. Subdivision clicks are quieter than the beat.
- Drive visuals from the audio clock with `requestAnimationFrame` instead of `setTimeout` (no drift, no flashes after stop).
- Show accent beats correctly for every time signature (e.g. 6/8 and 12/8).
- Sounds take three levels: accent, beat, subdivision.
- Fix keyboard shortcuts (Space / T) so they work after editing the BPM and do not fire inside selects.
- Single source of truth for BPM limits and BPM/UI sync.

## Iteration-14
### Goal
- Finish Iteration 11 properly: rudiment exercise mode.
### Tasks
- Define a sticking notation and a parser: `R`/`L` strokes, lowercase grace notes (`lR` flam, `ll R` drag), `>` accent, `~` buzz, `/` separates right-lead and left-lead versions.
- Review rudiment data against PAS 40: fix wrong stickings, add accents, add subdivision per rudiment.
- Starting an exercise sets the metronome subdivision and a recommended BPM for the rudiment.
- Show a sticking lane under the beat dots with the current stroke highlighted in sync with the audio. Show the hand on the beat dots.
- Show the active exercise name, allow choosing lead hand, and keep the exercise when the metronome stops and starts again.
- Unit tests for the sticking parser.

## Iteration-15
### Goal
- Tempo trainer and drill improvements (completes Iteration 6).
### Tasks
- Add a tempo trainer: increase BPM by N every X seconds until a target BPM.
- Drills can define a tempo ramp; the Practise button pre-fills the trainer from the drill.
- Drill rudiment tags open the matching rudiment.

## Iteration-16
### Goal
- Complete localisation (completes Iteration 10).
### Tasks
- Persist the selected language and update `<html lang>`.
- Translate categories, sound names, time-signature and subdivision labels, and all aria-labels.
- Rudiment names stay in English (standard drumming terminology).

## Iteration-17
### Goal
- Videos, offline support and iOS polish.
### Tasks
- Rudiments and drills without a curated video get a "Find on YouTube" search link.
- Add a web app manifest and a service worker for offline use (web only, not inside Capacitor).
- Keep the screen awake while the metronome plays (Screen Wake Lock API).
- Play metronome audio even when the iOS silent switch is on (`navigator.audioSession`).
- Upgrade Capacitor.
