# Federated Data Lakes and Intelligent Healthcare Management for Pakistan — Hospital Platform

This is the hospital platform component of a larger Final Year Project on
federated data lakes and AI-assisted tooling for healthcare in Pakistan. The
overall system is split into three workstreams: data
federation layer, AI components (audio transcription of consultations and
patient history summarization), and this component — the hospital-facing
web application that doctors, patients, receptionists, lab technicians and
pathologists actually use day to day, along with the admin panel and the
backend services behind them. This repository covers that hospital
platform: backend, frontend, admin panel and supporting microservices. 

## What the platform does

It's a role-based hospital management system covering the operational side
of a hospital:

- Patient registration, onboarding and profile management.
- Doctor, receptionist, lab technician and pathologist accounts, each with
  their own portal.
- Department and doctor-schedule management, appointment slots, and both
  walk-in and online appointment booking.
- Digital checkups — vitals, symptoms, diagnosis, prescriptions and
  recommended lab tests recorded per visit.
- Lab test templates, ordering lab tests from a checkup, and recording
  results.
- Drug/medication catalog used when prescribing.
- An admin panel for managing departments, doctors, receptionists, lab
  technicians, pathologists, drugs, patients and lab test templates.
- A symptom-to-specialty doctor search on the patient portal: patient-entered
  symptoms are matched against specialty descriptions using a small
  in-browser embedding model ([@xenova/transformers](https://github.com/xenova/transformers.js)), so a query like "memory loss"
  can surface neurologists without a hand-written keyword map.
- Optional AI-assisted features on the checkup flow — audio consultation
  transcription/insight extraction and patient history summarization — which
  call an external service over HTTP; see [AI mock service](#ai-mock-service) below.

## How this fits into the wider FYP

The hospital platform is the data-producing side of the overall system:
patient records, checkups, prescriptions and lab results generated here are
what the data federation layer draws on, and the AI service the checkup flow
calls into (transcription, history summarization) is the AI workstream of
the same FYP. Within this repository, `hospital-backend` is the single
entry point the frontends talk to; it owns the core hospital domain (auth,
users, departments, doctors, patients, drugs) and proxies checkup- and
lab-test-related requests to two dedicated microservices rather than having
the browser call them directly.

## Authentication and authorization

Auth is JWT-based, issued by `hospital-backend` on login (`passport-jwt` for
verifying incoming requests, `bcryptjs` for password hashing) and reused as
a bearer token by both the hospital frontend and the admin panel. A `User`
can hold multiple `Role`s (admin, doctor, receptionist, lab technician,
pathologist, patient) through a join table, and route access is enforced
with a roles guard plus a `@Roles()` decorator on controllers — a route
declared for `doctor` rejects a token that only carries the `patient` role,
regardless of what the frontend shows. Request payloads are validated with
`class-validator`/`class-transformer` DTOs before hitting any service logic.
`checkups-microservice` and `labtests-microservice` trust the same JWT
secret, so a token issued by `hospital-backend` is valid across all three
without a separate login per service — `hospital-backend` is just the only
one the browser is allowed to call directly.

## Data model

All three backend services share one Prisma schema (kept as an identical
copy in each service's `prisma/` folder) describing roughly two dozen
models across a few natural groups:

- **Identity** — `User`, `Role`, `UserRole`, and the per-role profile tables
  (`Doctor`, `Patient`, `Receptionist`, `LabTechnician`, `Pathologist`).
- **Hospital structure** — `StandardDepartment`/`Department`, and drug data
  (`Drug`).
- **Scheduling** — `DoctorSchedule` and `AppointmentSlot` generate bookable
  slots, which `Appointment` (with `WalkinAppointment`/`OnlineAppointment`
  specializations) consumes.
- **Clinical record** — `Checkup` ties a patient visit to a doctor, with
  `CheckupAudio` (the recorded/transcribed consultation),
  `Prescription`/`Medication`, and `CheckupTestRecommendation` linking a
  checkup to `RecommendedLabTest` entries.
- **Lab workflow** — `LabTest`/`LabTestTemplate` define what can be ordered,
  and `PatientLabTest` tracks an ordered test through to its result.

Since the three services point at the same database rather than owning
disjoint slices of it, `hospital-backend`'s proxy layer is what keeps a
single logical API surface for the frontends even though the underlying
writes land in tables the microservices manage.

## Repository contents

| Path | What it is |
|---|---|
| [`hospital-backend/`](hospital-backend) | NestJS API gateway — auth, users, departments, doctors, patients, receptionists, lab technicians, pathologists, drugs, and a proxy layer that forwards checkup/lab-test requests to the microservices below. |
| [`hospital-frontend/`](hospital-frontend) | Next.js app — patient, doctor, receptionist, lab technician and pathologist portals. |
| [`admin-panel/`](admin-panel) | Next.js app — hospital administration (departments, doctors, drugs, receptionists, lab technicians, pathologists, patients, lab test templates). |
| [`checkups-microservice/`](checkups-microservice) | NestJS service — doctor schedules, appointment slots, walk-in/online appointments, checkups, and audio-consultation processing. |
| [`labtests-microservice/`](labtests-microservice) | NestJS service — lab test templates, ordered lab tests and results. |
| [`audio-mock-server/`](audio-mock-server) | Mock stand-in for the AI transcription/summarization service, see below. |
| `docker-compose.yml`, `Makefile` | Local environment setup. |

`checkups-microservice`, `labtests-microservice` and `hospital-backend` each
carry a full copy of the same Prisma schema and, in this local setup, connect
to a single shared PostgreSQL database — the schema is one relational model
split across services by responsibility, not partitioned data per service.

## AI mock service

The checkup flow supports two AI-assisted features built as part of the AI
workstream of the FYP: transcribing a recorded doctor-patient consultation
(with extracted symptoms/diagnosis/prescription and a "gap analysis" against
what the doctor typed manually), and generating a natural-language summary
of a patient's medical history. `checkups-microservice` calls out to that AI
service over a plain HTTP endpoint (`AUDIO_ANALYSIS_SERVICE_URL`).

`audio-mock-server/` is a mock implementation of that endpoint's contract —
it returns realistic, hardcoded responses (including a sample Urdu
transcription) after a simulated delay, instead of running real speech
transcription or an LLM. It's a small Express app: `/api/transcribe`
accepts an uploaded audio file (via Multer) and returns the transcription
plus extracted symptoms/diagnosis/prescription, and
`/api/summarize-history` returns the medical-history summary text. It
exists so the checkup UI and backend integration can be developed and
tested end to end without depending on the real AI service being deployed
and reachable. It is not the AI system built for the FYP — just a local
double for it.

## Architecture at a glance

```
hospital-frontend (3000)  ─┐
admin-panel (3001)         ├──▶ hospital-backend (3002) ── auth, users, departments,
                            │                              doctors, patients, drugs, ...
                            │        │
                            │        ├──▶ checkups-microservice (3003) ──▶ audio-mock-server (3005)
                            │        │      (appointments, checkups, audio processing)
                            │        │
                            │        └──▶ labtests-microservice (3004)
                            │               (lab test templates, results)
                            │
                            └──────────────▶ shared PostgreSQL database (5435)
```

`hospital-backend` is the only API the frontends talk to directly; it proxies
checkup- and lab-test-related routes to the two microservices rather than
having the browser call them directly.

## Technologies used

- **Backend:** NestJS 11, Prisma ORM, PostgreSQL, Passport/JWT authentication.
- **Frontend:** Next.js 15/16 (App Router), React 19, Tailwind CSS, Radix UI,
  Axios. Patient specialty search uses `@xenova/transformers` for in-browser
  embeddings.
- **AI mock:** Express + Multer (audio upload handling).
- **Infra:** Docker / Docker Compose locally; in production each NestJS
  service runs on Heroku from its own `Procfile` (`prisma db push` on boot,
  then `node dist/main`) against a shared Neon (serverless Postgres)
  database, with the frontend and admin panel deployed separately.

## Running locally

Requirements: Docker and Docker Compose.

```bash
make up
```

This builds and starts every service in this repository: PostgreSQL, the
hospital backend, both microservices, the audio mock server, the hospital
frontend and the admin panel — one command instead of starting each piece by
hand. On first start, `hospital-backend` pushes the Prisma schema to the
database and seeds it with demo departments, staff, patients and checkups
(seeding clears and re-populates that data, so it's safe to restart).
`checkups-microservice` and `labtests-microservice` push the same schema
before starting.

| Service | URL |
|---|---|
| Hospital frontend | http://localhost:3000 |
| Admin panel | http://localhost:3001 |
| Hospital backend (API) | http://localhost:3002 |
| Checkups microservice | http://localhost:3003 |
| Lab tests microservice | http://localhost:3004 |
| Audio mock server | http://localhost:3005 |
| PostgreSQL | localhost:5435 |

Demo logins (seeded by `hospital-backend`, password `12345678` unless noted)
are pre-filled as quick-login buttons on the frontend/admin login pages:
`doctor@hospital.com`, `receptionist@hospital.com`, `labtechnician@hospital.com`,
`pathologist@hospital.com`, and admin `admin@hospital.com` / `admin123456`.

Other Makefile commands:

```bash
make up-d      # start in the background
make down      # stop and remove containers
make logs      # follow logs for every service
make ps        # container status
make db-push   # re-push the Prisma schema without restarting containers
make seed      # re-run the demo data seed
```

The project does not use Prisma migration files — schema changes are applied
with `prisma db push`, consistent with how each service is deployed.
