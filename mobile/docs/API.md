# Proposed API contract

`src/data/contracts.ts` is the application-facing contract. `httpApi.ts` is a replaceable implementation, not an assertion about an existing server. All calls time out after 15 seconds. Authenticated requests send `Authorization: Bearer <token>`. Public environment variables contain only mode/base URL, never secrets.

| Method/path                           | Request                  | Response                   |
| ------------------------------------- | ------------------------ | -------------------------- |
| POST `/v1/sessions`                   | `{ email, password }`    | `Session`                  |
| GET `/v1/session`                     | bearer token             | `Session`                  |
| DELETE `/v1/session`                  | bearer token             | 204 or successful response |
| GET `/v1/study`                       | bearer token             | `Study`                    |
| GET `/v1/check-ins/:id/questionnaire` | encoded check-in ID      | `Questionnaire`            |
| POST `/v1/check-ins/:id/submissions`  | `Submission`             | `Receipt`                  |
| PATCH `/v1/participant/preferences`   | `{ reminders: boolean }` | `Participant`              |
| GET `/v1/insights`                    | bearer token             | `Insight[]`                |

Models are defined in `src/domain/models.ts`. JSON responses must match those shapes; `decoders.ts` checks required fields, enums, unique IDs/options, valid day bounds and nonempty questionnaire steps. Empty study/check-in and insight arrays are legitimate; an empty questionnaire is an error.

`Submission` contains check-in ID, questionnaire version, answers keyed by question ID and an idempotency key. The server must atomically enforce unique completion per participant/check-in, validate option IDs/values and questionnaire version, enforce availability, and return the original receipt for unchanged retries. The current client uses display strings as option values; a production questionnaire should provide stable localized option IDs through an updated model/adapter.

401 expires the local session; 409 becomes a conflict; other unsuccessful statuses show a generic request error. Backend response bodies are not displayed. Invalid payloads fail with a safe configuration message. Transport tests use a fake fetch implementation; no backend endpoints have been verified.

Native tokens are stored in SecureStore; browser preview tokens are kept in memory. Passwords are not stored. Local logout clears the stored token before leaving the authenticated stack; a remote revocation failure is explicitly reported. Token refresh, OAuth/OIDC, enrollment, upload/outbox behavior and notification registration must be designed with the actual backend. No network requests are made in default mock mode.

Check-in time preferences: PATCH `/v1/participant/preferences` accepts `{ "checkInTimes": { "morning": "08:00", "afternoon": "13:00", "evening": "20:00" } }` and returns Participant including `checkInTimes`. Values are local HH:MM in first/second/third sequence within a 24-hour cycle, allowing midnight rollover. Legacy API keys morning/afternoon/evening map to First/Second/Third check-in; they do not impose daypart restrictions. Server must validate study-allowed windows and timezone/DST rules and reschedule actual reminders; the demo only updates uncompleted fixture times. Existing participant responses may omit the field, in which case the UI uses 08:00 / 13:00 / 20:00 defaults.
