# Build Complete Web Game: マイカイジュウ (My Kaiju)

You are a senior full-stack engineer.

Create a complete project using:

* Frontend: HTML5 + Vanilla JavaScript + CSS
* Backend API: Vercel Serverless Functions
* AI Image Generation: Gemini 2.5 Flash Image
* No React
* No Framework
* Mobile-first responsive design
* Japanese game-style UI

---

# Project Name

マイカイジュウ (My Kaiju)

Tagline:

声でカイジュウに名前をつけ、
AI画像生成で即座にオリジナルキャラクターを作成。

English:

Name your own Kaiju with your voice and instantly generate an original monster card.

---

# Gameplay Flow

Step 1

User chooses language:

* English
* Japanese

Display as:

🇯🇵 日本語
🇺🇸 English

---

Step 2

Voice Input

Use Web Speech API.

If Japanese selected:

language = ja-JP

If English selected:

language = en-US

Provide:

* Start Recording button
* Stop Recording button

After speech recognition:

show recognized text inside editable textbox.

Example:

ゴジラマル

or

Thunderfang

---

Step 3

Editable Name

Display:

Monster Name

[textbox]

Requirements:

* user can edit
* user can clear
* user can type manually

---

Step 4

Generate Monster Button

Button:

「カイジュウ生成」
Generate Kaiju

When clicked:

POST

/api/generate

body:

{
"monsterName":"Thunderfang",
"language":"en"
}

---

# Gemini Image Prompt Creation

Backend must automatically build a professional image prompt.

Example:

Monster name:
Thunderfang

Generated Prompt:

Create a unique original kaiju monster character named Thunderfang.

Style:
Japanese monster encyclopedia,
collectible trading card artwork,
high quality fantasy creature design,
full body,
dynamic pose,
cute but powerful,
detailed scales,
glowing eyes,
clean background,
official creature concept art,
highly detailed,
masterpiece quality.

Show entire creature.

No text.
No watermark.
No logo.

---

# Gemini API

Use:

gemini-2.5-flash-image

Environment variable:

GEMINI_API_KEY

Generate image and return base64 image.

---

# Monster Card System

After image generation:

Display collectible card.

Card size:

Trading card style

Aspect Ratio:

2.5 : 3.5

---

# Front Side Card

Show:

Generated Monster Image

Monster Name

Random Generated Stats

HP
ATK
DEF
SPD
INT

Generate random values:

20-100

Card rarity:

Common
Rare
Epic
Legendary

Randomized.

Beautiful fantasy card design.

---

# Back Side Card

Automatically create card back.

Display:

* Monster silhouette
* マイカイジュウ logo
* QR-style decoration
* Fantasy pattern

Looks like official trading card back.

---

# Card Flip

Click card

Flip animation

Front ↔ Back

3D transform

Smooth animation

---

# Save Feature

Buttons:

Save PNG

Download Card

Save Front

Save Back

Use html2canvas.

Export high resolution PNG.

---

# Gallery

Store generated monsters in localStorage.

Display gallery below.

Each item shows:

* Thumbnail
* Name
* Date Created

User can reopen cards.

---

# UI Theme

Japanese indie game style.

Dark mode.

Colors:

#0f172a
#111827
#7c3aed
#06b6d4
#f59e0b

Rounded corners.

Glassmorphism.

Beautiful animations.

---

# Project Structure

/project

index.html

/styles
style.css

/js
app.js
speech.js
card.js
gallery.js

/api
generate.js

/vercel.json

---

# API Requirements

generate.js

Responsibilities:

1. Receive monster name
2. Build Gemini prompt
3. Call Gemini 2.5 Flash Image
4. Return image
5. Handle errors

Response:

{
success:true,
image:"data:image/png;base64,..."
}

---

# Extra Features

Generate random:

* Monster Element

  * Fire
  * Water
  * Earth
  * Wind
  * Thunder
  * Light
  * Dark

* Monster Type

  * Dragon
  * Beast
  * Kaiju
  * Spirit
  * Machine
  * Demon

Display on card.

---

# Deliverables

Generate all code files completely.

Do not provide pseudo code.

Output:

1. Folder structure
2. Full source code for every file
3. Installation steps
4. Vercel deployment steps
5. Environment variable setup
6. Gemini API integration code
7. Production-ready implementation
