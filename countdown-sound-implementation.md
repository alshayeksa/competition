# إضافة صوت عد تنازلي للمسابقة

## الخطوات المطلوبة:

### 1. إضافة ملف صوتي
أنشئ مجلد `public/sounds/` وأضف ملفات الصوت:
- `countdown-start.mp3` (صوت بداية العد)
- `countdown-tick.mp3` (صوت كل ثانية)
- `countdown-end.mp3` (صوت نهاية الوقت)

### 2. إنشاء مكون Timer مع الصوت

```jsx
// src/components/TimerWithSound.jsx
import React, { useState, useEffect, useRef } from 'react';

const TimerWithSound = ({ initialTime = 30, onTimeEnd, questionStarted }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const audioRef = useRef(null);
  const tickAudioRef = useRef(null);
  const endAudioRef = useRef(null);

  // تحميل الأصوات
  useEffect(() => {
    audioRef.current = new Audio('/sounds/countdown-start.mp3');
    tickAudioRef.current = new Audio('/sounds/countdown-tick.mp3');
    endAudioRef.current = new Audio('/sounds/countdown-end.mp3');
  }, []);

  // تشغيل صوت بداية السؤال
  useEffect(() => {
    if (questionStarted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [questionStarted]);

  // العد التنازلي
  useEffect(() => {
    if (timeLeft <= 0) {
      if (endAudioRef.current) {
        endAudioRef.current.play().catch(e => console.log('End audio failed:', e));
      }
      onTimeEnd();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
      
      // تشغيل صوت التيك كل ثانية (عدا الثانية الأخيرة)
      if (timeLeft > 1 && tickAudioRef.current) {
        tickAudioRef.current.currentTime = 0;
        tickAudioRef.current.play().catch(e => console.log('Tick audio failed:', e));
      }
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, onTimeEnd]);

  // إعادة التعيين عند سؤال جديد
  useEffect(() => {
    if (questionStarted) {
      setTimeLeft(initialTime);
    }
  }, [questionStarted, initialTime]);

  return (
    <div className="timer-container">
      <div className={`timer-display ${timeLeft <= 10 ? 'warning' : ''} ${timeLeft <= 5 ? 'danger' : ''}`}>
        ⏱️ {timeLeft} ثانية
      </div>
      <div className="timer-progress">
        <div 
          className="timer-progress-bar" 
          style={{ width: `${(timeLeft / initialTime) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default TimerWithSound;
```

### 3. CSS إضافي

```css
/* أضف في ملف CSS الخاص بالمشروع */
.timer-container {
  margin: 20px 0;
  text-align: center;
}

.timer-display {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  transition: color 0.3s;
}

.timer-display.warning {
  color: #ff9800;
  animation: pulse 1s infinite;
}

.timer-display.danger {
  color: #f44336;
  animation: pulse 0.5s infinite;
}

.timer-progress {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.timer-progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 1s linear, background-color 0.3s;
}

.timer-progress-bar.warning {
  background-color: #ff9800;
}

.timer-progress-bar.danger {
  background-color: #f44336;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
```

### 4. كيفية الاستخدام في مكون السؤال

```jsx
// في مكون السؤال الرئيسي
import TimerWithSound from './components/TimerWithSound';

const QuestionComponent = ({ question, onAnswer }) => {
  const [currentQuestion, setCurrentQuestion] = useState(question);
  const [questionStarted, setQuestionStarted] = useState(false);

  const handleTimeEnd = () => {
    // الوقت انتهى، انتقل للسؤال التالي
    onAnswer(null); // إجابة فارغة
  };

  const startQuestion = () => {
    setQuestionStarted(true);
  };

  useEffect(() => {
    // عند تغيير السؤال، ابدأ العد التنازلي
    startQuestion();
  }, [currentQuestion]);

  return (
    <div className="question-container">
      <h2>{currentQuestion.text}</h2>
      
      <TimerWithSound 
        initialTime={30}
        onTimeEnd={handleTimeEnd}
        questionStarted={questionStarted}
      />
      
      {/* خيارات الإجابة */}
      {currentQuestion.options.map((option, index) => (
        <button key={index} onClick={() => onAnswer(option)}>
          {option}
        </button>
      ))}
    </div>
  );
};
```

### 5. مصادر لأصوات مجانية

1. **Freesound.org** - ابحث عن:
   - "countdown beep"
   - "timer tick"
   - "time up alarm"

2. **Zapsplat.com** - أصوات احترافية مجانية

3. **استخدام توليد صوت عبر JavaScript** (بدون ملفات):

```javascript
// بديل: توليد أصوات عبر Web Audio API
function playBeep(frequency = 800, duration = 200) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}
```

### 6. النشر على Netlify

```bash
# تأكد من إضافة ملفات الصوت
git add public/sounds/

# commit ونشر
git commit -m "إضافة أصوات عد تنازلي للمسابقة"
git push

# النشر التلقائي على Netlify
```

## ملاحظات مهمة:
1. اختبر الصوت على أجهزة مختلفة (موبايل، كمبيوتر)
2. بعض المتصفحات تمنع تشغيل الصوت تلقائياً - يحتاج المستخدم للنقر أولاً
3. أضف زر "تشغيل/إيقاف الصوت" للتحكم
4. استخدم `useEffect` للتنظيف: `return () => { if(audioRef.current) audioRef.current.pause(); }`
