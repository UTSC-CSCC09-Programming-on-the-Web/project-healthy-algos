# ISim

## Members
- Donghyun (Eric) Kweon | eric.kweon@mail.utoronto.ca | kweondo1
- Samuel Mantilla | samuel.mantilla@mail.utoronto.ca | mantil11

## Deployed URL
- [i-sim.app](https://i-sim.app/)

## Description
A sandbox-style simulation with 4 autonomous AI agents and a player that co-exist and interact in real-time on a 2D plane. 
Bots behave realistically with respect to unique personalities and perform actions at intervals, controlled by a language model. 
Players will be able to talk to, and influence the bots using communication mechanisms.

## Frontend Framework
- ReactJs + react router

## Additional Requirements
- AI movement and player movement will be updated live without the need to refresh
- A parallel task queue will calculate AI decisions and actions
- If time allows, we will implement proximity-based voice chat to converse with the AI

## Version Milestones
- Alpha: aim to complete user login and stripe, as well as a basic plane and agent sprites (and potentially player movement)
- Beta: implement basic task queue and AI powered agents (polling task queue in intervals of 30 seconds) with a LLM API and communication mechanism
- Final: increase AI action choices and increase dynamic player interaction + deployment

## Starting the application
1. `cd backend`
2. `npm install`
3. `npm run start:dev` or `nodemon app.js`

## Starting the frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
