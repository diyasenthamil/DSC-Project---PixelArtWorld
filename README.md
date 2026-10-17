# DSC-Project---PixelArtWorld
# 🌍 Tiny World

> A little pixel world where the doodles you draw come to life, wander around, and make friends.

**🔗 Live demo:** https://github.com/diyasenthamil/DSC-Project---PixelArtWorld

Tiny World – World screen <img width="1915" height="903" alt="image" src="https://github.com/user-attachments/assets/86881147-d9bf-4408-bbc7-6f2653bd4dea" />

---

## 👋 About this project

Hi, I'm Diya, a first-year BTech CSBS student at Sathyabama University. I'm also a self-taught traditional and digital artist, so when I had to pick something to build for the Google Student Developers Club, I wanted it to combine the two things I love: drawing and coding.

Tiny World started from a simple thought: *what if my tiny doodles didn't just sit on a page, but actually lived somewhere?* So I built an app where you draw a little character on a pixel grid, add it to a world, and watch it wander around the grass, bob along, and pop a heart when it meets another doodle.

I kept it small on purpose. I'd rather build something I fully understand than something huge that I can't explain.

---

## ✨ What it can do

### ✏️ Draw screen
- Draw on a pixel grid (8x8, 16x16 or 32x32)
- Tools: pencil, eraser, fill bucket and eyedropper
- A color palette plus a custom color picker
- Undo, clear, and a live preview at actual doodle size
- "Add to World" gives your doodle a name and sends it into the world

### 🌿 World screen
- Doodles wander around on their own and bounce off the edges
- A little walking bob so they look alive
- 💕 Hearts pop up when two doodles get close (my favorite part)
- Click a doodle to see its name or remove it
- ☀️ Day mode and 🌙 Night mode (with stars and a moon)
- Your world is saved, so your doodles are still there when you come back

---

## 📸 Screenshots


Draw screen <img width="1917" height="906" alt="image" src="https://github.com/user-attachments/assets/d8b5191b-8ee4-4a1a-ab64-e1ffb75a5b8b" />
World (day) <img width="1917" height="903" alt="image" src="https://github.com/user-attachments/assets/850b971f-434b-4383-b831-0d8b6caa83fe" />
 


Hearts when doodles meet <img width="1917" height="903" alt="image" src="https://github.com/user-attachments/assets/9ea9e3ce-cf95-4a0c-b2ba-16576665e3d5" />
World (night) <img width="1917" height="908" alt="image" src="https://github.com/user-attachments/assets/223781a2-03e2-4d22-a74d-bea873440b7c" />
 

---

## 🛠️ Technologies used

- **HTML**: the structure of both screens
- **CSS**: the dark editor look, pastel world look, and responsive layout
- **JavaScript (vanilla)**: all the logic
- **Canvas API**: drawing the grid and the animated world

No frameworks, no libraries, no build tools. Just three files: `index.html`, `style.css` and `script.js`.

---

## 🧠 How it works (what I learned)

**1. A drawing is just a 2D array.**
The grid is stored as an array of rows, and each cell holds a color (like `"#ff8fab"`) or `null` if it's empty. Drawing a pixel means changing one value in the array, then redrawing the canvas. Understanding this made everything else click for me.

**2. The fill bucket uses a queue.**
The fill tool starts at the clicked cell and spreads to matching neighbors, one layer at a time. This is called breadth-first search (BFS). By using a queue ("first come, first served"), the color spreads outward evenly in all directions—just like a ripple in water!

**3. Animation runs on `requestAnimationFrame`.**
The world redraws itself about 60 times a second. Each time, every doodle moves a tiny bit, and the loop calls itself again. I learned this is better than `setInterval` because it matches the screen's refresh rate and pauses when the tab is hidden.

**4. Doodles bob using `Math.sin()`.**
Each doodle has a number that keeps increasing, and `Math.sin()` turns it into a smooth up-and-down wave. That's what makes them look like they're walking.

**5. Hearts appear using a distance check.**
Every frame, the code measures the distance between each pair of doodles. If they're closer than a set number of pixels, a heart is created above them that floats up and fades.

**6. `localStorage` remembers my world.**
The doodles are saved in the browser as text and loaded again when the page opens, so nothing disappears when I refresh.

---

## 🧪 Things I changed myself while learning

I wanted to be sure I understood the code, so I experimented with it:

- I changed the bobbing height from 3.5 to 6 and the doodles started jumping like bunnies
- I changed the heart distance from 65 to 90 and hearts appeared much more often
- I changed the wandering speed and my doodles started running

---

## 😅 Challenges I faced

- Getting Git and GitHub to work for the first time. I didn't know where my files were saved or how to upload them.
- Understanding how the fill bucket works
- Understanding problems in code and which language or part it most likely lies in 

---

## 🤖 How I built it

I built this using Antigravity as a coding assistant, in four stages: layout, drawing, tools and saving doodles, then the living world. After each stage I tested it, read through the code, and tried changing things to understand how it worked. Every time a part of the code didn't perform as required, i went back and prompted changes.

---

## 🚀 How to run it

**Easiest:** open the live demo link above.

**On your computer:**
1. Download or clone this repository
2. Open `index.html` in your browser

That's it. Nothing to install.

---

## 🔮 Ideas for the future

- Doodles that react differently to each other (some shy, some friendly)
- Sound effects
- Letting you drag doodles around
- Exporting your world as an image
- Animated doodles with more than one frame (I'm interested in animation, so this one is close to my heart)

---

## 💌 Thank you

Thanks to the Google Student Developers Club for the chance to build something creative, and to everyone who looked at my doodles and said "aww."

**Made by Diya** 🎨💻
