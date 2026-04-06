# 국가유산 디지털 체험관

> 8개의 인터랙티브 국가유산 체험 모듈 · GitHub Pages + Vercel 배포

## 🚀 빠른 시작 (Quick Start)

### 1. GitHub 레포지토리 설정

```bash
# 레포 생성 후
git init
git add .
git commit -m "feat: 국가유산 체험관 초기 배포"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heritage-site.git
git push -u origin main
```

### 2. GitHub Pages 활성화

1. GitHub 레포 → **Settings** → **Pages**
2. Source: **GitHub Actions** 선택
3. `main` 브랜치에 push 시 자동 배포

배포 URL: `https://YOUR_USERNAME.github.io/heritage-site/`

---

## 📁 파일 구조

```
heritage-site/
├── index.html              # 메인 홈화면 (웹캠 + CRT 로딩 + 메뉴)
├── modules/
│   ├── crt.html            # ② 국가유산 CRT (MediaPipe + Three.js)
│   ├── music.html          # ④ 전통악기 박스 (Tone.js 시퀀서)
│   ├── conservation.html   # ⑦ 보존과학 체험 (2D 게임)
│   ├── mudra.html          # ③ 색즉시OO즉시색 (수인 인식)
│   ├── photo.html          # ⑤ 전통문양 인생네컷
│   └── sillok.html         # ⑥ 사관 LLM
├── assets/
│   ├── images/             # ← 단청 이미지, 전통문양 이미지 여기에
│   └── models/             # ← 국가유산 3D GLTF 파일 여기에
├── api/                    # Vercel 서버리스 함수
│   ├── sillok.js           # 사관 LLM API
│   └── generate.js         # 이미지 생성 API
├── .github/workflows/
│   └── deploy.yml          # CI/CD 파이프라인
└── README.md
```

---

## 🎮 각 모듈 기능

| # | 모듈 | 상태 | 필요 파일 |
|---|------|------|-----------|
| 01 | 단청 물결 | 이미지 파일 필요 | `assets/images/dancheong-*.png` |
| **02** | **국가유산 CRT** | **✅ 완성** | 3D GLTF 선택 (없어도 기본 모델) |
| 03 | 색즉시OO즉시색 | ✅ 완성 | - |
| **04** | **전통악기 박스** | **✅ 완성** | - |
| 05 | 전통문양 인생네컷 | 기본 구현 | `assets/images/pattern-*.png` |
| 06 | 사관 LLM | Vercel 필요 | Anthropic API 키 |
| **07** | **보존과학 체험** | **✅ 완성** | - |
| 08 | 인터랙티브 국가유산 | Vercel 필요 | 이미지 생성 API |

---

## 🔧 이미지/3D 파일 연결 방법

### 단청 이미지 (모듈 01)
```
assets/images/dancheong-1.png
assets/images/dancheong-2.png
...
```
`modules/dancheong.html`에서 경로 수정

### 3D GLTF 모델 (모듈 02)
```
assets/models/bulkuksa.glb
assets/models/cheomseongdae.glb
```
`modules/crt.html`에서 Three.js GLTFLoader로 로드

---

## 🌐 Vercel 백엔드 설정 (모듈 06, 08)

```bash
npm install -g vercel
vercel login
vercel
```

환경변수 설정:
```
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here (이미지 생성용)
FIREBASE_PROJECT_ID=your_project
```

---

## 🌍 다국어 지원

홈화면에서 우상단 KO/EN/JA/ZH 버튼으로 전환

---

## 📱 브라우저 요구사항

- Chrome 88+ (권장)
- Firefox 85+
- Safari 14+
- 웹캠 접근 권한 필요
- HTTPS 환경 필요 (MediaPipe, 웹캠)

---

*Built with ❤️ for Korean Cultural Heritage*
