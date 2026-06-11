
# LifeOS Production Documentation Package v1.0

# README

## Vision
LifeOS is an AI-powered personal operating system that helps users understand where they are today, define where they want to go, and receive actionable guidance across goals, finance, career, and health.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk
- Prisma
- PostgreSQL (Supabase)
- OpenAI
- Vercel
- Vitest
- React Testing Library

## Demo Flow
1. User signs up
2. User completes guided assessment
3. AI generates Life Blueprint
4. Dashboard displays personalized roadmap
5. User updates progress
6. AI Coach recommends next actions

---

# AGENTS.md

## Project Lead
Owns onboarding, blueprint generation, goals, milestones.

## Jordan
Owns finance widgets and savings goals.

## Kit
Owns career widgets, skills, and job applications.

## Summer
Owns health, habits, mood tracking, AI coach, and Life Score.

## Shared
Authentication, Prisma, deployment, dashboard integration, testing.

## Agent Rules
1. Read PRD first.
2. Read Architecture second.
3. Follow backlog priorities.
4. Follow TDD policy.
5. Never skip tests.

---

# PRD

## Problem Statement
Users manage goals, finances, career growth, and wellness across disconnected systems. LifeOS unifies these domains and provides AI-guided recommendations.

## Target Users
- Students
- Professionals
- Career changers
- Parents
- Retirees
- Justice-impacted individuals
- Personal development seekers

## Core Value Proposition
LifeOS helps people who do not know where to start by using guided assessment and AI coaching to create a personalized life blueprint.

## MVP Features

### Authentication
- Register
- Login
- Logout
- Protected routes

### Guided Assessment
- Life stage
- Current situation
- Biggest challenge
- Career goals
- Financial goals
- Health goals
- Personal growth goals
- Optional free-form context

### AI Life Blueprint
Outputs:
- Personal summary
- Recommended goals
- Milestones
- Daily focus
- Coaching message

### Dashboard
- Life Score
- Goals summary
- Finance summary
- Career summary
- Health summary
- AI Coach

### Goals
- Create goals
- Edit goals
- Delete goals
- Milestones
- Progress tracking

### Finance
- Savings goals
- Progress tracking

### Career
- Skills tracking
- Job applications

### Health
- Habits
- Mood tracking
- Streaks

### AI Coach
Cross-module recommendations.

## Excluded Features
- Vision boards
- Bucket lists
- Resume vault
- Budget manager
- Subscription tracker
- Debt planner
- Calendar integration
- Weather integration

## Success Criteria
A user can:
1. Register
2. Complete onboarding
3. Generate blueprint
4. View dashboard
5. Track progress
6. Receive AI recommendations

---

# ARCHITECTURE

## Folder Structure

/app
  /dashboard
  /onboarding
  /blueprint
  /goals
  /finance
  /career
  /health

/components
/actions
/lib
/prisma
/tests

## Core Models

UserProfile
LifeBlueprint
Goal
Milestone
Habit
SavingsGoal
JobApplication

## OpenAI Flow

Assessment
-> OpenAI
-> Structured Blueprint
-> Database
-> Dashboard

## Deployment

Frontend: Vercel
Database: Neon PostgreSQL

---

# DATABASE SCHEMA

UserProfile
- id
- clerkUserId
- name
- lifeStage
- currentSituation
- biggestChallenge
- futureVision

LifeBlueprint
- id
- userId
- content
- summary

Goal
- id
- userId
- title
- category
- progress

Milestone
- id
- goalId
- title
- completed

Habit
- id
- userId
- title
- streak

SavingsGoal
- id
- userId
- title
- targetAmount
- currentAmount

JobApplication
- id
- userId
- company
- role
- status

---

# BACKLOG

Epic 1: Foundation & Authentication
Epic 2: Guided Assessment
Epic 3: AI Blueprint
Epic 4: Dashboard
Epic 5: Goals
Epic 6: Finance
Epic 7: Career
Epic 8: Health

---

# TDD STANDARD

All work follows:

1. Write failing test
2. Implement feature
3. Pass test
4. Refactor

Required test areas:
- Goal progress
- Milestone completion
- Savings calculations
- Application status transitions
- Habit streaks
- Life Score calculations
- Blueprint validation

Definition of Done:
- Acceptance criteria met
- Tests written
- Tests passing
- TypeScript passing
- Build passing
- Deployed

---

# ENVIRONMENT VARIABLES

DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=

---

# TEAM OWNERSHIP

Goals + Blueprint:
- Assessment
- Blueprint
- Goals
- Milestones

Finance:
- Savings
- Finance widget

Career:
- Skills
- Applications

Health:
- Habits
- Mood
- Streaks
- AI Coach
- Life Score

---

# DEMO SCRIPT

1. Sign Up
2. Complete Assessment
3. Generate Blueprint
4. Review Goals
5. Open Dashboard
6. Update Progress
7. Show AI Recommendation
8. Explain Life Score
