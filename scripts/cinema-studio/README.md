# W1 Capital / LexisPredict · Creative Studio

Video editing workspace, not a generative face-swap engine. Uses the same three actual Gemini clips in their original 0–10, 10–20, 20–30 seconds order. All personal footage and voice data live in the local assets folder; **never commit them to this public repository**.

## Install
Requires Node >=22.18, git, Python3, and FFmpeg/FFprobe. From this folder:

```bash
bash scripts/install-tools.sh
bash scripts/fetch-upstreams.sh
npm test
npx openfilm open .
```

The CLI setup installs **OpenFilm, HyperFrames, Remotion, faster-whisper (Whisper inference), yt-dlp**, and tests a real one-second H.264/AAC FFmpeg export.

Source code of OpenFilm, Open-Higgsfield, 3 Genjutsu repositories, VoiceStudio, HyperFrames and Remotion is cloned into git-ignored `upstream/`. Those projects are not identical: cloning source and running smoke tests does NOT mean their paid generative model backends or GPU checkpoints are installed. OpenFilm supports editing real video locally; video generation and cloning require their own model runtimes.

Keep audio stems separate: the source clip audio is muted, the voice-to-voice track lives at `assets/voice_track_master.wav`. Preserve original phrase boundaries; don't over-speed speech. Use `ffprobe` and audio listening before publishing.

The user-provided video inputs are only placed in the downloadable local workspace bundle, not in GitHub. Read local README for usage.
