import moviepy.editor
import whisper
from sys import argv


video=moviepy.editor.VideoFileClip(argv[1])
audio=video.audio
audio.write_audiofile("video.mp3")

#Run whisper part after mp3 has been formed




model = whisper.load_model("base")
result = model.transcribe("video.mp3")

with open("transcription.txt", "w") as f:
    f.write(result["text"])

