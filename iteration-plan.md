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
