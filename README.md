# [Image to URL](https://tio8172.github.io/Image-to-URL/)

A simple, client-side tool that encodes images into highly compressed data strings and stores them directly within the URL. No database or server-side storage is required.

## ✨ Features
* **Serverless Storage**: Images are converted to data strings and stored in the URL hash.
* **High Compression**: Uses Gzip and Base91 encoding to keep URLs as short as possible.
* **Real-time Preview**: Adjust resolution and quality settings to see the link update instantly.
* **Privacy Focused**: All processing happens locally in your browser.

## 🚀 How it Works
1. **Select** or **Drag & Drop** an image.
2. **Adjust** the Max Width, Max Height, or Quality to optimize the URL length.
3. **Copy** the generated link and share it.
4. The recipient opens the link to **decode** and view the original image.

## 🛠 Tech Stack
* HTML5 / CSS3 (Inter font)
* Vanilla JavaScript
* CompressionStream API
* Base91 Encoding
