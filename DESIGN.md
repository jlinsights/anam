---
name: 아남 배옥영 서예 갤러리
description: 표구한 족자처럼 작품을 감싸는, 먹과 한지와 금 한 줄의 갤러리
colors:
  ink: "hsl(222.2 47.4% 11.2%)"
  ink-light: "hsl(215.4 16.3% 46.9%)"
  ink-lighter: "hsl(210 20% 65%)"
  paper: "hsl(0 0% 100%)"
  paper-warm: "hsl(30 40% 98%)"
  paper-cream: "hsl(45 25% 96%)"
  paper-aged: "hsl(40 15% 92%)"
  gold: "hsl(45 100% 50%)"
  gold-dark: "hsl(45 100% 30%)"
  stone: "hsl(210 15% 85%)"
typography:
  display:
    fontFamily: "Noto Serif KR, AppleMyungjo, Batang, serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Noto Serif KR, AppleMyungjo, Batang, serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Noto Serif KR, AppleMyungjo, Batang, serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.75
    letterSpacing: "0"
  body:
    fontFamily: "Noto Serif KR, AppleMyungjo, Batang, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
  ui:
    fontFamily: "IBM Plex Sans KR, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
  label:
    fontFamily: "IBM Plex Sans KR, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.01em"
    fontFeature: "tnum"
rounded:
  none: "0px"
spacing:
  zen-xs: "8px"
  zen-sm: "16px"
  zen-md: "32px"
  zen-lg: "64px"
  zen-xl: "128px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  input-field-focus:
    backgroundColor: "{colors.paper-warm}"
  artwork-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  artwork-mat:
    backgroundColor: "{colors.paper-warm}"
    rounded: "{rounded.none}"
    padding: "40px"
  artwork-mat-small:
    backgroundColor: "{colors.paper-warm}"
    rounded: "{rounded.none}"
    padding: "12px"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "64px 32px 40px"
---

# Design System: 아남 배옥영 서예 갤러리

## Overview

**Creative North Star: "The Mounted Scroll" (표구한 족자)**

작품 한 점 한 점을 표구하듯 다룬다. 각진 테두리 안에 작품을 앉히고, 그 둘레에 한지의 여백을 넓게 두고, 금은 족자의 비단 띠처럼 한 줄만 쓴다. 인터페이스는 표구 틀이지 그림이 아니다. 화면에서 가장 강한 것은 언제나 작품 이미지와 붓글씨다.

틀은 단단하고 곧다. 모서리는 둥글리지 않고(반지름 0), 경계는 그림자 대신 먹색 선으로 긋는다. 여백은 넉넉하게 두되 숨 쉬는 간격(8·16·32·64·128px)을 따른다. 글자는 두 목소리로 나눈다. 제목과 읽는 글은 명조(Noto Serif KR), 메뉴·버튼·작품 정보 같은 인터페이스 글자는 고딕(IBM Plex Sans KR)이다.

작품 이미지는 꾸밈 없이 바로 보여 준다. 스피너·깜빡이는 덮개·투명도 페이드 없이, 이미지가 오기 전에는 한지색 바탕만 보인다. 표구 틀은 그림이 늦게 와도 자리를 지키는 빈 액자다.

**지금 화면의 상태 (2026-11-01 운영 확인):** 작품 갤러리(`/gallery`), 작품 상세(`/gallery/[slug]`), 문의(`/contact`), 바닥글은 이 체계를 따른다. 첫 화면(`/`)의 히어로·머리띠·작품 칸은 아직 다른 언어(둥근 알약 버튼, 둥근 이미지와 번지는 그림자, 회색 Tailwind 색, 영어 메뉴)로 남아 있고, 작가 소개(`/artist`)는 배치는 맞지만 색과 모서리가 Tailwind `yellow-600`·`amber`·`gray`, `rounded-lg`, `shadow-lg` 로 남아 있다. 이 문서는 두 화면을 맞출 기준이며, 그 현재 모습을 따라 할 근거가 아니다.

**Key Characteristics:**
- 모든 틀은 각졌다 (반지름 0).
- 깊이는 그림자가 아니라 먹색 2px 선과 한지 색의 단계로 만든다. 예외는 갤러리 카드의 hover 도장 그림자 하나다.
- 금은 한 화면에 한 번, 표시가 필요한 곳에만.
- 제목·읽는 글은 명조, 인터페이스는 고딕.
- 작품은 한지 매트 위에 잘리지 않은 채 놓인다. 로딩 효과는 없다.
- 밝은 화면 하나만 쓴다. 다크 모드는 없다.

## Colors

먹과 한지 두 축에 금 한 줄을 얹은 좁은 팔레트다.

### Primary
- **먹 (Ink)**: 본문·제목 글자, 작품 카드·매트·입력창의 2px 테두리, 주 버튼 바탕, 바닥글 바탕, 상세 화면 상단 탐색 띠의 밑줄. 화면의 구조를 긋는 색이다.

### Secondary
- **표구 금 (Mounting Gold)**: 페이지 제목 아래 96×4px 띠, 입력창 포커스 테두리, 포커스 외곽선, 작품 상세의 "소장 문의 가능" 앞 8px 사각 표시. 아주 채도가 높은 호박색이라 넓은 면에 쓰면 화면을 이긴다.
- **짙은 금 (Aged Gold)**: 금이 글자 색이나 밝은 바탕 위 작은 표시로 쓰일 때의 대비용. 작가 소개의 선택된 탭·영문 이름·제목 띠는 지금 Tailwind `yellow-600`·`yellow-800` 으로 칠해져 있는데, 이 토큰으로 옮길 자리다.

### Neutral
- **흐린 먹 (Ink Light)**: 부제, 작품 수, 보조 설명, 작품 정보의 항목 이름.
- **옅은 먹 (Ink Lighter)**: 자리 표시 글자, 비활성 상태.
- **흰 한지 (Paper)**: 기본 바탕, 카드와 입력창 안쪽.
- **따뜻한 한지 (Paper Warm)**: 작품을 앉히는 매트, 입력창 포커스 바탕.
- **미색 한지 (Paper Cream)**: 작은 작품 매트의 hover 바탕, 한 단계 가라앉은 면.
- **묵은 한지 (Paper Aged)**: 두 단계 가라앉은 면.
- **돌 (Stone)**: 작품 정보 목록의 행 구분선, 아주 옅은 배경 띠.

### Named Rules
**The One Seal Rule.** 금은 한 화면에 표시 하나에만 쓴다: 제목 띠, 현재 상태, 포커스 중 하나. 글자 색이나 넓은 면을 금으로 칠하지 않는다.

**The Named Token Rule.** 색은 먹·한지·금·돌 토큰으로만 쓴다. `gray-*`, `slate-*`, `yellow-600` 같은 Tailwind 기본 회색·노랑은 이 체계 밖의 흔적이며, 새 코드에 쓰지 않는다. 지금 첫 화면(`app/page.tsx`, `HeroSection`, `MinimalHeader`)과 작가 소개(`EnhancedArtistSection`, `yellow-600`·`amber-50` 등)에 남아 있다.

**The Light Only Rule.** 화면은 밝은 한지 하나다. `globals.css` 의 `.dark` 토큰과 Tailwind `dark:` 클래스, 첫 화면 머리띠의 테마 단추는 남은 흔적이다. 단추를 눌러도 테마가 바뀌지 않는다(테마 공급자가 없다, 2026-11-01 확인). 새 코드에 `dark:` 를 더하지 않는다.

## Typography

**Display Font:** Noto Serif KR (AppleMyungjo, Batang 대체)
**Body Font:** Noto Serif KR (읽는 글), IBM Plex Sans KR (인터페이스)
**Label Font:** IBM Plex Sans KR, 숫자는 고정폭(tabular)

**Character:** 명조는 붓의 흐름과 무게를 받아 제목과 작품 해설을 맡고, 차분한 고딕은 메뉴와 정보를 정확하게 받친다. 두 글꼴 모두 한글·한자 글리프가 있어 운영체제마다 다르게 보이지 않는다. `next/font` 로 불러 `--font-noto-serif-kr`, `--font-plex-sans-kr` 변수로 쓴다.

### Hierarchy
- **Display** (400, 72px, 모바일 48px, 행간 1.15, 자간 -0.025em): 첫 화면의 작가명 하나. 바닥글의 한자 이름(芽南 裵玉永, 30–36px)도 같은 목소리다.
- **Headline** (700, 36px, 모바일 30px, 행간 1.3, 자간 -0.02em): 페이지 제목 (작품 갤러리, 작가 소개, 작품명).
- **Title** (700, 18px): 작품 카드 제목, 소제목(작품 해설, 다른 작품).
- **Body** (400, 16–18px, 행간 1.75): 작가 소개와 작품 해설. 한 줄 45–50자 안팎.
- **UI** (400–500, 16px, 행간 1.75): 메뉴, 버튼, 검색창, 선택 상자.
- **Label** (400, 14px, 자간 +0.01em, 고정폭 숫자): 제작 연도, 재료, 크기, 작품 수, "57 / 61" 같은 순번.

### Named Rules
**The Two Voices Rule.** 읽고 감상하는 글은 명조, 누르고 고르는 글은 고딕이다. 한 요소 안에서 두 글꼴을 섞지 않는다.

**The Tight Display Rule.** 24px 이상 제목은 자간을 0 이하로 둔다. 한글 큰 글자에 자간을 더하면 글자가 흩어져 보인다.

## Layout

본문은 최대 1280px(`max-w-7xl`) 가운데 정렬 틀 안에 놓인다. 간격은 숨 쉬는 단계를 따른다: 8px(미세), 16px(기본), 32px(중간), 64px(깊음), 128px(명상).

- **페이지 머리:** 제목, 부제, 금 띠를 가운데로 쌓고 아래에 넉넉한 여백을 둔다(갤러리·작가 소개).
- **작품 목록(`/gallery`):** 세로로 긴 9:16 카드 격자. 2열(모바일), 3열(태블릿), 4열(데스크톱), 5열(와이드).
- **작품 상세:** 위에 먹색 2px 밑줄을 긋는 탐색 띠(왼쪽 "작품 목록", 오른쪽 이전·순번·다음). 그 아래 데스크톱은 작품(왼쪽, 넓게)과 정보(오른쪽) 두 단, 모바일은 한 단. 맨 아래 "다른 작품" 6칸 정사각 격자.
- **작가 소개:** 왼쪽에 따라 내려오는(sticky) 작가 사진과 이름, 오른쪽 탭(작가 소개·경력 사항·작품 세계).
- **바닥글:** 12열 격자에 이름(6)·메뉴(3)·문의(3), 아래 1px 한지색 선과 저작권 줄.

## Elevation & Depth

거의 평면이다. 깊이는 먹색 선과 한지 색의 단계(흰 한지 → 따뜻한 한지 → 미색 → 묵은 한지)로 만든다. 작품 매트, 입력창, 선택 상자는 그림자 없이 2px 먹색 테두리로 바탕에서 떨어진다.

### Shadow Vocabulary
- **도장 그림자 (Seal Offset)** (`box-shadow: 8px 8px 0 hsl(var(--ink))`, Tailwind `shadow-brutal`): 작품 갤러리 카드가 hover·포커스 될 때만, 카드를 4px 왼쪽 위로 옮기며 나타난다. 번지지 않는 먹색 판이라 선의 언어 안에 있다. 쉴 때는 그림자가 없다.

### Named Rules
**The Line-Not-Shadow Rule.** 면을 띄우고 싶으면 그림자를 더하지 말고 테두리를 긋거나 한지 단계를 하나 올린다. 번지는 그림자(`shadow-soft`·`shadow-xl`·`shadow-2xl` 등)는 체계 밖이다. 지금 첫 화면 히어로 이미지·대표작 표, 홈 작품 칸 hover, 작가 사진(`shadow-lg`), 작가 소개 하단 단추(`shadow-lg`·`shadow-xl`)에 남아 있다.

## Shapes

모든 모서리는 각지다(반지름 0, 전역 `--radius: 0px`). 테두리는 2px 먹색 실선이 기본이고, 장식용 선은 1px로 한 단계 약하게 둔다(돌 색 행 구분선, 바닥글 구분선).

체계에서 벗어난 흔적: 첫 화면 히어로의 알약 버튼(반지름 9999px)과 둥근 작품 이미지·대표작 표(16px), 홈 작품 칸(`rounded-lg`), 작가 사진 틀과 작가 소개의 강조 상자(`rounded-lg`)·관련 태그(`rounded-full`), 갤러리 카드 안쪽 이미지의 작은 둥근 모서리(`rounded`). 각진 형태로 맞출 대상이다.

## Components

### Buttons
표구 틀처럼 단단하고 곧다.
- **Shape:** 각진 사각형 (0px)
- **Primary:** 먹 바탕에 흰 한지 글자, 안쪽 여백 16px 32px, 고딕 UI 글자. 예: "이 작품 문의하기", "전체 작품 보기".
- **Hover / Focus:** 0.3초에 걸쳐 바뀐다. 갤러리의 주 버튼은 바탕이 금으로, 작품 상세의 주 버튼은 바탕이 흰 한지·글자가 먹으로 뒤집힌다. 포커스는 금 외곽선(2px, 4px 띄움).
- **Secondary:** 바탕 없이 먹색 2px 테두리, 같은 여백. 바닥글에서는 흰 한지 2px 테두리, hover 에 흰 한지 바탕·먹 글자.
- **Text link:** 밑줄 4px 띄운 글자 단추. 예: "작가 소개", "큰 이미지로 보기", "전체 61점 보기".

### Cards / Containers
작품 카드는 족자의 표구 틀이다.
- **Corner Style:** 각짐 (0px)
- **Background:** 흰 한지
- **Shadow Strategy:** 쉴 때 없음, hover·포커스에 도장 그림자 (Elevation & Depth 참고)
- **Border:** 2px 먹색 실선
- **Internal Padding:** 이미지는 틀 안쪽 8px 에 앉고, 정보 영역은 16px 단위로 띄운다.

### Artwork Mat (signature)
작품 상세와 "다른 작품" 칸의 액자다.
- **큰 매트:** 2px 먹색 테두리 안 따뜻한 한지 매트, 안쪽 여백 20px(모바일)·40px(데스크톱). 작품은 잘리지 않은 원본 비율로 가운데 놓이고 화면 높이의 78% 를 넘지 않는다. 아래에 "큰 이미지로 보기" 글자 단추.
- **작은 매트:** 정사각 칸, 2px 먹색 테두리, 따뜻한 한지 매트, 안쪽 12px. 세로 족자도 칸을 늘리지 않고 매트 안에 다 들어간다(`object-contain`). hover 에 매트가 미색 한지로 한 단계 가라앉는다.

### Artwork Images
- **원본 비율을 지킨다.** 작품 전체를 보여 주는 자리에는 잘리지 않은 `NN-full.jpg`(긴 변 1800px) 또는 `NN-preview.jpg`(긴 변 800px)를 쓴다. `NN-medium`·`NN-large` 는 정사각형으로 잘린 파일이다(61점 중 41점).
- **로딩 효과가 없다.** `<img loading="lazy" decoding="async">`(첫 화면에 보이는 것만 `eager`). 스피너, 흐림, 깜빡이는 덮개, 투명도 페이드를 쓰지 않는다. 오기 전에는 매트의 한지색이 보인다.
- **실패하면 말로 알린다.** 작은 파일로 한 번 바꿔 보고, 그래도 안 되면 "이미지를 불러올 수 없습니다"와 "다시 시도"를 흐린 먹 글자로 보여 준다.

### Inputs / Fields
- **Style:** 2px 먹색 테두리, 흰 한지 바탕, 각진 모서리, 안쪽 여백 16px 32px, 고딕 UI 글자. 검색창과 연도 선택 상자가 같은 모양이다.
- **Focus:** 테두리가 금으로, 바탕이 따뜻한 한지로 바뀌고 금 20% 링이 생긴다.

### Artwork Facts List
- 작품 상세 오른쪽의 정의 목록. 왼쪽 6rem 열에 흐린 먹 항목 이름(제작 연도·재료·크기·소장), 오른쪽에 고정폭 숫자 값. 행마다 1px 돌 색 밑줄.
- 값이 없는 항목은 줄째 빠진다. "소장 문의 가능"은 데이터의 `available` 이 참일 때만, 8px 금 사각 표시와 함께 나온다.

### Navigation
- **작품 상세 탐색 띠:** 먹색 2px 밑줄. 왼쪽 "← 작품 목록", 오른쪽 "←  57 / 61  →"(고정폭 숫자).
- **첫 화면 머리띠:** 바탕 없이 가볍게 놓이고 스크롤하면 바탕이 생긴다. 모바일에서는 "메뉴 열기" 단추로 접힌다. 지금은 영어 메뉴(Gallery·Artist·Exhibition·Contact)와 동작하지 않는 테마 단추가 있다 — 맞출 대상.

### Footer
- 먹 바탕에 흰 한지 글자. 위 64px·아래 40px 여백, 12열 격자. 왼쪽에 명조 한자 이름(芽南 裵玉永)과 한 줄 소개, 가운데 메뉴(작품·작가·전시 이력·문의), 오른쪽에 "문의 양식 열기 →" 테두리 단추. 맨 아래 1px 흰 한지 선과 저작권·협회 링크.

### Title Rule (signature)
- 페이지 제목과 부제 아래 가운데에 놓인 96×4px 금 띠. 이 화면의 금은 이것 하나다.

## Do's and Don'ts

### Do:
- **Do** 작품 이미지와 붓글씨를 화면에서 가장 크고 강하게 둔다.
- **Do** 작품은 따뜻한 한지 매트 위에 잘리지 않은 원본 비율로 앉힌다 (`NN-full`·`NN-preview`).
- **Do** 틀과 입력창은 2px 먹색 테두리와 0px 모서리로 만든다.
- **Do** 금은 한 화면에 표시 하나에만 쓴다 (The One Seal Rule).
- **Do** 제목과 읽는 글은 Noto Serif KR, 인터페이스와 정보는 IBM Plex Sans KR로 쓴다.
- **Do** 숫자 정보(연도, 크기, 작품 수, 순번)는 고정폭 숫자로 맞춘다.
- **Do** 움직임은 위치(`x`·`y`)와 색 전환으로만 준다.

### Don't:
- **Don't** 모서리를 둥글리지 않는다. 알약 버튼, 둥근 카드, 둥근 이미지는 체계 밖이다.
- **Don't** 번지는 그림자로 면을 띄우지 않는다. 그림자는 갤러리 카드 hover 의 먹색 도장 그림자 하나뿐이다.
- **Don't** `gray-*`, `slate-*`, `yellow-600` 같은 Tailwind 기본 색이나 `dark:` 클래스를 새로 쓰지 않는다.
- **Don't** 작품 이미지에 스피너·흐림·깜빡이는 덮개·투명도 페이드를 넣지 않는다.
- **Don't** 글자가 든 요소의 투명도를 움직이지 않는다(스크롤 연동 포함). 색 대비가 떨어진다.
- **Don't** 정사각형으로 잘린 `NN-medium`·`NN-large` 를 작품 전체를 보여 줄 자리에 쓰지 않는다.
- **Don't** 24px 이상 한글 제목에 자간을 더하지 않는다.
- **Don't** 금을 글자 색이나 넓은 바탕으로 쓰지 않는다.
