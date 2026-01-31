# 🌌 Image to URL Share (Serverless Image Sharing)

A lightweight, serverless web tool that converts images into data-encoded URLs. By leveraging client-side compression, this tool embeds image data directly into the URL hash, allowing for instant sharing without the need for servers or databases.



## ✨ Key Features
- **No Server/No DB:** Image data is compressed and stored entirely within the URL hash.
- **Privacy-Focused:** Your images are never uploaded to any server. All processing happens locally in your browser.
- **Instant Sharing:** Generate a link, copy it, and send it. The recipient's browser decodes and displays the image instantly.
- **Smart Compression:** Utilizes [LZ-String](https://pieroxy.net/lua/lz-string/) and Canvas optimization to minimize URL length while maintaining image quality.
- **Sleek UI:** A modern Cyberpunk-inspired design featuring deep gradients and Glassmorphism.

## 🚀 How to Use
1. **Upload:** Click the **"SELECT IMAGE"** button to choose a photo from your device.
2. **Compress:** The app automatically processes the image into a highly compressed data string.
3. **Copy:** Click the generated URL box to copy the link to your clipboard.
4. **Share:** Send the link to anyone! When they open it, the image will be reconstructed on their screen.

## 🛠 Technical Stack
- **Language:** HTML5, CSS3 (Modern Flexbox & Animations), JavaScript (ES6+)
- **Library:** [LZ-String](https://pieroxy.net/lua/lz-string/) (For URL-safe LZW data compression)
- **Design:** CSS Glassmorphism with Backdrop-filter and Deep Radial Gradients.

## 🎨 Technical Insights: How it Works
This project explores the limits of client-side data handling:
1. **Canvas Resizing:** Large images are intelligently scaled to balance quality and URL length.
2. **Encoding:** The image is converted to a Base64-encoded string.
3. **Compression:** The LZ-String algorithm reduces the character count by up to 60-70%.
4. **Fragment Identifier:** The compressed string is stored after the `#` in the URL, which is never sent to the server.



## ⚠️ Limitations & Notes
- **Browser URL Limits:** Some browsers or messaging apps may not support extremely long URLs (typically > 2,000 characters). 
- **Recommendation:** Best suited for screenshots, small icons, or thumbnails to ensure maximum compatibility.

---
*Created for lightweight, cost-free image sharing and exploring client-side data handling.*
