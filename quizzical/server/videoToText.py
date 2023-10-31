import moviepy.editor
import whisper
from sys import argv
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

#Separate video from audio
video=moviepy.editor.VideoFileClip(argv[1])
audio=video.audio
audio.write_audiofile("video.mp3")

#Parse audio file to gather text using OpenAI's Whisper AI
model = whisper.load_model("base")
result = model.transcribe("video.mp3")

with open("transcription.txt", "w") as f:
    f.write(result["text"])

