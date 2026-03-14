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