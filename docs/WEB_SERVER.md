# 📦 프로젝트 실행 가이드 (Spring Boot + Next.js)
이 문서는 해당 프로젝트를 처음 실행하는 Person Trash 2명을 위해서 로컬 환경에서 빠르게 실행할 수 있도록 친절하게 작성되었습니다.

## 🚀 기술 스택
### Backend (Spring Boot)
- Java 21

- Spring Boot

- Gradle 또는 Maven(사용중인 빌드 툴 적기)

- JPA / Security 등(선택)

### Frontend (Next.js)

- Node.js 22.8

- npm 10.8.3

- Next.js 14 (혹은 프로젝트 버전)

# 📥 1. 프로젝트 클론
``` bash
git clone https://github.com/<your-id>/<repo-name>.git
cd <repo-name>
```

---

# ⚙️ 2. 필수 설치
## ✓ Java 21 설치
### 필수 버전: Java 21

## Windows에서 Java 21 설치 및 환경변수 설정 가이드

### 2-1-1. JDK 21 다운로드
- [Oracle JDK 21 다운로드 페이지](https://www.oracle.com/java/technologies/downloads/#java21)에서 Windows용 `.exe` 파일 다운로드

### 2-1-2. 설치
- 다운로드한 파일을 실행 후, 설치 마법사에 따라 설치합니다.
- 설치 경로는 기본 또는 원하는 곳으로 정합니다(예: `C:\Program Files\Java\jdk-21`).

### 2-1-3. 환경변수 설정
- 시스템 환경 변수 편집:
  - **JAVA_HOME** 변수 생성 또는 수정:  
    변수 이름: `JAVA_HOME`  
    변수 값: JDK가 설치된 경로 예시: `C:\Program Files\Java\jdk-21`  
  - Path 변수 편집:  
    새 항목 추가: `%JAVA_HOME%\bin`  

- 참고: 환경변수 편집 방법은 [여기](https://wikidocs.net/267595) 또는 [이 가이드](https://mi2mic.tistory.com/231)를 참고하세요.

### 2-1-4. 설치 확인
```bash
java -version
```

## Windows에서 Node.js 22.8.0 설치 가이드

### 2-2-1. Node.js 22.8.0 다운로드
- 공식 다운로드 페이지:  
  [Node.js 22.8.0 다운로드 (64-bit MSI)](https://nodejs.org/dist/v22.8.0/node-v22.8.0-x64.msi)  

### 2-2-2. 설치
- 다운로드한 `.msi` 파일을 더블 클릭하여 설치 마법사를 실행합니다.
- "Next" 버튼을 클릭하며 라이센스 동의, 설치 폴더 선택 등 설치 과정 진행
- 설치 옵션 중 "Add to PATH" 체크(기본값)로 하면 환경 변수 설정 자동 완료
- 설치 완료 후 "Finish" 클릭

### 2-2-3. 설치 확인
```bash
node -v
```

# 📂 3. 프로젝트 구조
```bash
/AP/back/web  - Spring Boot
/AP/front - Next.js
```

# 🔧 4. Backend 실행 (Spring Boot)
## 4-1 backend 디렉토리 이동
```bash
cd {프로젝트 경로}/AP/back/web
```

## 4-2 의존성 다운로드 & 빌드 (Gradle 기준)
```bash
./gradlew build
```

## 4-3 서버 실행
```bash
java -jar build/libs/*.jar

# 또는

./gradlew bootRun
```

## 4-4 Backend 기본 주소
```arduino
http://localhost:8080
```
# 🎨 5. Frontend 실행 (Next.js)
## 5-1 frontend 디렉토리 이동
```bash
cd {프로젝트 경로}/AP/front
```
## 5-2 패키지 설치
```bash
npm install
```
## 5-3 개발 서버 실행
```bash
npm run dev
```

## 5-4 Frontend 기본 주소
```arduino
http://localhost:3000
```

## 5-5 페이지 목록
- 홈
  - http://localhost:3000
- 로그인 **(초기 페이지 테스트로 인한 임시 구글로그인 기능 제외)**
  - http://localhost:3000/member/login
- 회원가입
  - http://localhost:3000/member/join
- ai 사용 **(로그인 후 사용가능)**
  - http://localhost:3000/ai/script