# 📚 Smart Lecture Companion (MVP)

**Smart Lecture Companion** is an AI-powered tool that listens to lectures, captures screen content, and automatically generates concise bullet-point notes, quizzes, and real-time audio/text responses.  
Built for rapid note-taking and interactive learning.

🔗 **Live Demo:** https://smart-lecture-companion.vercel.app/

---

## 🚀 MVP Features

### 1. 🔴 Live Screen Capture
- Browser-based screen sharing  
- Uses **WebRTC**  
- Sends frames to backend (approx. 1 frame every 2 seconds)

### 2. 🎙️ Real-time Speech-to-Text
- Captures microphone audio  
- Whisper API / Google Speech API  
- Converts speech → text in chunks  
- Stores transcripts temporarily  

### 3. 🤖 AI Lecture Understanding
AI receives both:
- Screen frame  
- Transcript  

AI tasks:
- Topic extraction  
- Key points  
- Short summary (2–3 lines max)  
- Auto quiz generation  

### 4. 📝 Live Notes Display
UI shows:
- Current topic  
- Bullet-point notes *(no mini paragraphs)*  
- Timestamp  
- Updates every 10–15 seconds  

Example:


### 5. 📄 Download Notes as PDF
- One-click export  
- Saves current session notes  

### 6. 🧠 Quiz Compartment
- User selects number of questions  
- AI generates corresponding quiz items  
- Based on lecture history and current notes  

### 7. 🔊 Bi-Directional Microphone Conversation
- User speaks  
- AI responds with audio or text  
- Enables interactive lecture assistance  

### 8. 🗃️ History Compartment
- Stores session-wise notes  
- Allows users to revisit old lectures  

---

## 🧱 Architecture Overview

### Frontend (React)
- Screen capture  
- Mic capture  
- Live notes display  
- Quiz UI  
- PDF export  
- History view  
- Audio playback  

### Backend (Flask)
- Receives frames + transcript  
- AI summarization (Gemini 2.0 Vision / GPT-4o)  
- Quiz generation  
- Sends structured results  

### Database (Firebase)
- (Optional for MVP)  
- Stores session notes and history  

---

## 📦 Tech Stack

**Frontend**
- React  
- WebRTC  
- Web Audio API  
- Tailwind CSS  

**Backend**
- Flask  
- Python  

**AI**
- OpenAI GPT-4o / Gemini 2.0 Vision  
- Whisper or Google Speech API  

**Storage**
- Firebase  

**Deployment**
- Vercel (Frontend)  
- Render / Railway / EC2 (Backend)  

---

## 🧪 MVP Testing

Test with a **2-minute recorded lecture**.

Check:
- Screen capture (1 frame/second)  
- Audio transcription accuracy  
- Latency < 3 seconds  
- Notes update frequency  
- PDF export working  

---

## 🥇 MVP Success Criteria

The MVP is successful if it can:

✔ Watch a shared screen  
✔ Listen to audio  
✔ Generate bullet-point notes every few seconds  
✔ Create quizzes based on lecture content  
✔ Allow bi-directional mic conversation  
✔ Respond via audio or text  
✔ Store session-wise notes  
✔ Export notes as PDF  

---

## ▶️ Running Locally

### 1. Clone Repo
```sh
git clone https://github.com/<user>/smart-lecture-companion.git
cd smart-lecture-companion

