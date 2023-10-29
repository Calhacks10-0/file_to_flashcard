import moviepy.editor
import whisper


video=moviepy.editor.VideoFileClip('Biden_Ad_Pd4.mp4')
audio=video.audio
audio.write_audiofile('Biden_Ad.mp3')

#Run whisper part after mp3 has been formed




model = whisper.load_model("base")
result = model.transcribe("Biden_Ad.mp3")

with open("transcription.txt", "w") as f:
    f.write(result["text"])

