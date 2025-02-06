## My personal site 

Hello, this is the repo for my personal site at dylanlafont.com.  WIP.  
Don't expect production quality - the intention here is mostly for things I use myself and code with that intent.

## Getting Started

This is a [Next.js](https://nextjs.org) app

### TTS
You will need to download piper tts binary and place it into /piper along with the Joe english voice.
You will also need ffmpeg.

### .ENV File
You will need a AUTH_SECRET and postgres DATABASE_URL

### Database
This project uses Drizzle orm, after setting the DATABASE_URL you can run 
```bash
npx drizzle-kit migrate
```
to migrate the db.  There is also important seed data containing ZIP codes for the weather section. Run
```bash
npx tsx src/db/seeds/zips.ts
```

### Weather
Unfortunately due to nivo line not being updated, you have to --force the npm install

### Running
First, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The page auto-updates as you edit the file.