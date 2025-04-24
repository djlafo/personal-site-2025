## My personal site 

Hello, this is the repo for my personal site at dylanlafont.com

## Getting Started

This is a [Next.js](https://nextjs.org) app

### TTS
You will need to download piper tts binary and place it into /piper along with the Joe english voice.
You will also need ffmpeg.

### GPT
This uses my own voice which I won't publish, so it will break unless tweaked to a different model

### .ENV File
* AUTH_SECRET for the JWT
* GPT_KEY for chatGPT
* DATABASE_URL for postgres
* AWS_BUCKET for the AWS bucket name for files.  Also need the ~/.aws/credentials file
* WS_ENDPOINT for the localhost address of the websocket project
* TWILIO_ACCOUNT, TWILIO_AUTH_TOKEN, 
* TWILIO_NUMBER in +15551231234 format 
* TWILIO_ENDPOINT being the remote address for this server pointing to the twilio sms endpoint /api/sms

### Database
This project uses Drizzle orm, after setting the DATABASE_URL you can run 
```bash
npx drizzle-kit migrate
```
to migrate the db.  There is also important seed data containing ZIP codes for the weather section. Run
```bash
npx tsx src/db/seeds/zips.ts
```
