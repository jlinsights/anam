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
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "32px 0"
---

# Design System: 아남 배옥영 서예 갤러리

## Overview

**Creative North Star: "The Mounted Scroll" (표구한 족자)**

작품 한 점 한 점을 표구하듯 다룬다. 각진 테두리 안에 작품을 앉히고, 그 둘레에 한지의 여백을 넓게 두고, 금은 족자의 비단 띠처럼 한 줄만 쓴다. 인터페이스는 표구 틀이지 그림이 아니다. 화면에서 가장 강한 것은 언제나 작품 이미지와 붓글씨다.

틀은 단단하고 곧다. 모서리는 둥글리지 않고(반지름 0), 경계는 그림자 대신 먹색 선으로 긋는다. 여백은 넉넉하게 두되 숨 쉬는 간격(8·16·32·64·128px)을 따른다. 글자는 두 목소리로 나눈다. 제목과 읽는 글은 명조(Noto Serif KR), 메뉴·버튼·작품 정보 같은 인터페이스 글자는 고딕(IBM Plex Sans KR)이다.

**Key Characteristics:**
- 모든 틀은 각졌다 (반지름 0).
- 깊이는 그림자가 아니라 먹색 2px 선과 한지 색의 단계로 만든다.
- 금은 한 화면에 한 번, 표시가 필요한 곳에만.
- 제목·읽는 글은 명조, 인터페이스는 고딕.

## Colors

먹과 한지 두 축에 금 한 줄을 얹은 좁은 팔레트다.

### Primary
- **먹 (Ink)**: 본문·제목 글자, 작품 카드와 입력창의 2px 테두리, 주 버튼 바탕, 바닥글 바탕. 화면의 구조를 긋는 색이다.

### Secondary
- **표구 금 (Mounting Gold)**: 페이지 제목 아래 96×4px 띠, 입력창 포커스 테두리, 주 버튼 hover. 아주 채도가 높은 호박색이라 넓은 면에 쓰면 화면을 이긴다.
- **짙은 금 (Aged Gold)**: 금이 글자 색이나 밝은 바탕 위 작은 표시로 쓰일 때의 대비용.

### Neutral
- **흐린 먹 (Ink Light)**: 부제, 작품 수, 보조 설명.
- **옅은 먹 (Ink Lighter)**: 자리 표시 글자, 비활성 상태.
- **흰 한지 (Paper)**: 기본 바탕, 카드와 입력창 안쪽.
- **따뜻한 한지 (Paper Warm)**: 입력창 포커스 바탕, 살짝 띄워야 하는 면.
- **미색 한지 (Paper Cream)**, **묵은 한지 (Paper Aged)**: 한 단계·두 단계 가라앉은 면.
- **돌 (Stone)**: 아주 옅은 구분선과 배경 띠.

### Named Rules
**The One Seal Rule.** 금은 한 화면에 표시 하나에만 쓴다: 제목 띠, 현재 상태, 포커스 중 하나. 글자 색이나 넓은 면을 금으로 칠하지 않는다.

**The Named Token Rule.** 색은 먹·한지·금·돌 토큰으로만 쓴다. `gray-*`, `slate-*`, `yellow-600` 같은 Tailwind 기본 회색·노랑은 이 체계 밖의 흔적이며, 새 코드에 쓰지 않는다.

## Typography

**Display Font:** Noto Serif KR (AppleMyungjo, Batang 대체)
**Body Font:** Noto Serif KR (읽는 글), IBM Plex Sans KR (인터페이스)
**Label Font:** IBM Plex Sans KR, 숫자는 고정폭(tabular)

**Character:** 명조는 붓의 흐름과 무게를 받아 제목과 작품 해설을 맡고, 차분한 고딕은 메뉴와 정보를 정확하게 받친다. 두 글꼴 모두 한글·한자 글리프가 있어 운영체제마다 다르게 보이지 않는다.

### Hierarchy
- **Display** (400, 72px, 모바일 48px, 행간 1.15, 자간 -0.025em): 첫 화면의 작가명 하나.
- **Headline** (700, 36px, 모바일 30px, 행간 1.3, 자간 -0.02em): 페이지 제목 (작품 갤러리, 작가 소개, 작품명).
- **Title** (700, 18px): 작품 카드 제목, 소제목.
- **Body** (400, 16–18px, 행간 1.75): 작가 소개와 작품 해설. 한 줄 45–50자 안팎.
- **UI** (400–500, 16px, 행간 1.75): 메뉴, 버튼, 검색창, 선택 상자.
- **Label** (400, 14px, 자간 +0.01em, 고정폭 숫자): 제작 연도, 재료, 크기, 작품 수.

### Named Rules
**The Two Voices Rule.** 읽고 감상하는 글은 명조, 누르고 고르는 글은 고딕이다. 한 요소 안에서 두 글꼴을 섞지 않는다.

**The Tight Display Rule.** 24px 이상 제목은 자간을 0 이하로 둔다. 한글 큰 글자에 자간을 더하면 글자가 흩어져 보인다.

## Layout

본문은 최대 1280px(`max-w-7xl`) 가운데 정렬 틀 안에 놓인다. 간격은 숨 쉬는 단계를 따른다: 8px(미세), 16px(기본), 32px(중간), 64px(깊음), 128px(명상). 페이지 머리는 제목, 부제, 금 띠를 가운데로 쌓고 아래에 128px 여백을 둔다. 작품 목록은 세로로 긴 9:16 카드 격자이며 너비에 따라 2열(모바일), 3열(태블릿), 4열(데스크톱), 5열(와이드)로 늘어난다.

## Elevation & Depth

평면이다. 깊이는 그림자가 아니라 먹색 선과 한지 색의 단계(흰 한지 → 따뜻한 한지 → 미색 → 묵은 한지)로 만든다. 작품 카드, 입력창, 선택 상자는 그림자 없이 2px 먹색 테두리로 바탕에서 떨어진다.

### Named Rules
**The Line-Not-Shadow Rule.** 면을 띄우고 싶으면 그림자를 더하지 말고 테두리를 긋거나 한지 단계를 하나 올린다.

## Shapes

모든 모서리는 각지다(반지름 0, 전역 `--radius: 0px`). 테두리는 2px 먹색 실선이 기본이고, 장식용 선은 1px로 한 단계 약하게 둔다. 첫 화면 히어로의 둥근 알약 버튼(반지름 9999px), 16px로 둥근 작품 이미지, 회색 테두리는 이 체계에서 벗어난 흔적이며 각진 형태로 맞출 대상이다.

## Components

### Buttons
표구 틀처럼 단단하고 곧다.
- **Shape:** 각진 사각형 (0px)
- **Primary:** 먹 바탕에 흰 한지 글자, 안쪽 여백 16px 32px, 고딕 UI 글자.
- **Hover / Focus:** 0.3초에 걸쳐 바탕이 금으로 바뀐다. 포커스는 금 테두리와 금 20% 링.
- **Secondary:** 바탕 없이 먹색 2px 테두리, 같은 여백.

### Cards / Containers
작품 카드는 족자의 표구 틀이다.
- **Corner Style:** 각짐 (0px)
- **Background:** 흰 한지
- **Shadow Strategy:** 없음 (Elevation & Depth 참고)
- **Border:** 2px 먹색 실선
- **Internal Padding:** 이미지는 틀 안쪽에 바로 앉고, 정보 영역은 16px 단위로 띄운다.

### Inputs / Fields
- **Style:** 2px 먹색 테두리, 흰 한지 바탕, 각진 모서리, 안쪽 여백 16px 32px, 고딕 UI 글자.
- **Focus:** 테두리가 금으로, 바탕이 따뜻한 한지로 바뀌고 금 20% 링이 생긴다.

### Navigation
- 바탕 없이 가볍게 놓인 머리띠. 글자는 고딕 UI. 모바일에서는 메뉴 단추로 접힌다.

### Footer
- 먹 바탕에 흰 한지 글자, 위아래 32px 여백, 가운데 정렬.

### Title Rule (signature)
- 페이지 제목과 부제 아래 가운데에 놓인 96×4px 금 띠. 이 화면의 금은 이것 하나다.

## Do's and Don'ts

### Do:
- **Do** 작품 이미지와 붓글씨를 화면에서 가장 크고 강하게 둔다.
- **Do** 틀과 입력창은 2px 먹색 테두리와 0px 모서리로 만든다.
- **Do** 금은 한 화면에 표시 하나에만 쓴다 (The One Seal Rule).
- **Do** 제목과 읽는 글은 Noto Serif KR, 인터페이스와 정보는 IBM Plex Sans KR로 쓴다.
- **Do** 숫자 정보(연도, 크기, 작품 수)는 고정폭 숫자로 맞춘다.

### Don't:
- **Don't** 모서리를 둥글리지 않는다. 알약 버튼, 둥근 카드, 둥근 이미지는 체계 밖이다.
- **Don't** 그림자로 면을 띄우지 않는다.
- **Don't** `gray-*`, `slate-*`, `yellow-600` 같은 Tailwind 기본 색을 새로 쓰지 않는다.
- **Don't** 24px 이상 한글 제목에 자간을 더하지 않는다.
- **Don't** 금을 글자 색이나 넓은 바탕으로 쓰지 않는다.
