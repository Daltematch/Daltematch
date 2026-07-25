dalte-match/
│
├── app/
│   ├── page.tsx              // 홈
│   ├── participants/         // 참가자
│   ├── matches/              // 대진
│   ├── ranking/              // 랭킹
│   ├── tournament/           // 랭킹전
│   └── settings/             // 설정
│
├── components/
│   ├── ParticipantTable.tsx
│   ├── MatchCard.tsx
│   ├── CourtBoard.tsx
│   └── ScoreInput.tsx
│
├── lib/
│   ├── scheduler.ts          // 자동 대진 알고리즘
│   ├── ranking.ts
│   └── utils.ts
│
└── database/
    └── schema.sql
