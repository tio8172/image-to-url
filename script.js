let currentImg = null;
let fileMeta = { name: "image", ext: "png" };

const Base91 = {
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~\"",
    encode: function(data) {
        let n = 0, b = 0, res = "";
        for (let i = 0; i < data.length; i++) {
            b |= (data[i] & 255) << n; n += 8;
            if (n > 13) {
                let v = b & 8191;
                if (v > 88) { b >>= 13; n -= 13; } 
                else { v = b & 16383; b >>= 14; n -= 14; }
                res += this.alphabet[v % 91] + this.alphabet[Math.floor(v / 91)];
            }
        }
        if (n > 0) { res += this.alphabet[b % 91]; if (n > 7 || b > 90) res += this.alphabet[Math.floor(b / 91)]; }
        return res;
    },
    // 추가된 디코딩 로직
    decode: function(str) {
        let v = -1, b = 0, n = 0, out = [];
        for (let i = 0; i < str.length; i++) {
            let c = this.alphabet.indexOf(str[i]);
            if (c === -1) continue;
            if (v < 0) { v = c; } 
            else {
                v += c * 91; b |= v << n; n += (v & 8191) > 88 ? 13 : 14;
                while (n >= 8) { out.push(b & 255); b >>= 8; n -= 8; }
                v = -1;
            }
        }
        if (v > -1) out.push((b | v << n) & 255);
        return new Uint8Array(out);
    }
};

const App = {
    async compressBinary(data) {
        const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("gzip"));
        return new Uint8Array(await new Response(stream).arrayBuffer());
    },
    // 추가된 압축 해제 로직
    async decompressBinary(uint8) {
        const stream = new Blob([uint8]).stream().pipeThrough(new DecompressionStream("gzip"));
        return new Uint8Array(await new Response(stream).arrayBuffer());
    }
};

// --- 인코딩 및 설정 관련 함수 ---
async function updateSettings() {
    const q = document.getElementById('qualityInput').value;
    const qDisplay = document.getElementById('qualityVal');
    if (qDisplay) qDisplay.innerText = q;
    if (currentImg) await processImage(currentImg);
}

async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    
    const lastDot = file.name.lastIndexOf('.');
    fileMeta.name = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
    fileMeta.ext = lastDot !== -1 ? file.name.substring(lastDot + 1) : "png";

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async () => {
            currentImg = img;
            await processImage(img);
            document.body.classList.add('uploaded');
            document.getElementById('resultArea').style.display = 'block';
        };
    };
    reader.readAsDataURL(file);
}

async function processImage(img) {
    const maxWidth = parseInt(document.getElementById('maxWidthInput').value) || 0;
    const maxHeight = parseInt(document.getElementById('maxHeightInput').value) || 0;
    const quality = parseFloat(document.getElementById('qualityInput').value) || 0.7;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let w = img.width, h = img.height;
    let ratio = 1;
    if (maxWidth > 0 && w > maxWidth) ratio = Math.min(ratio, maxWidth / w);
    if (maxHeight > 0 && h > maxHeight) ratio = Math.min(ratio, maxHeight / h);

    canvas.width = w * ratio;
    canvas.height = h * ratio;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        if (!blob || blob.type !== 'image/avif') {
            canvas.toBlob(async (b) => await finalize(b), 'image/webp', quality);
        } else {
            await finalize(blob);
        }
    }, 'image/avif', quality);

    // script.js 내의 finalize 함수를 아래와 같이 수정하세요
    async function finalize(blob) {
        if (!blob) return;
        const arrayBuffer = await blob.arrayBuffer();
        const compressed = await App.compressBinary(new Uint8Array(arrayBuffer));
        const hash = Base91.encode(compressed);

        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
        const params = `?n=${encodeURIComponent(fileMeta.name)}&f=${encodeURIComponent(fileMeta.ext)}`;
        const finalURL = `${baseUrl}view.html${params}#${encodeURIComponent(hash)}`;
        
        document.getElementById('urlOutput').value = finalURL;
        document.getElementById('urlOutputDisplay').innerText = finalURL;

        // --- 링크 길이 경고 로직 추가 ---
        const warningElement = document.getElementById('urlWarning');
        if (warningElement) {
            // 일반적인 브라우저 안전 한계인 2000자를 기준으로 설정
            if (finalURL.length > 100000) {
                warningElement.classList.add('show');
                warningElement.innerHTML = `⚠️ <b>Warning:</b> The link is too long (${finalURL.length} chars). It may not work in some environments. Please reduce the quality or resolution.`;
            } else {
                warningElement.classList.remove('show');
            }
        }
        // ------------------------------------------

        const preview = document.getElementById('preview');
        if (preview.src) URL.revokeObjectURL(preview.src);
        preview.src = URL.createObjectURL(blob);
    }
}

// --- 추가된 뷰어 디코딩 실행 함수 ---
async function runViewer() {
    const hashStr = window.location.hash.substring(1);
    if (!hashStr) return;

    const params = new URLSearchParams(window.location.search);
    const fileName = params.get('n') || "shared_image";
    const fileExt = params.get('f') || "png";

    try {
        // 1. Base91 디코딩
        const decoded = Base91.decode(decodeURIComponent(hashStr));
        // 2. Gzip 압축 해제
        const decompressed = await App.decompressBinary(decoded);
        // 3. Blob 생성 및 URL 변환
        const blob = new Blob([decompressed]);
        const imgUrl = URL.createObjectURL(blob);
        
        const img = document.getElementById('viewerImg');
        if (img) {
            img.src = imgUrl;
            img.onload = () => {
                img.style.display = 'block';
                document.getElementById('statusContainer').style.display = 'none';
                
                // 다운로드 버튼 설정
                const downloadBtn = document.getElementById('downloadBtn');
                if (downloadBtn) {
                    downloadBtn.style.display = 'block';
                    downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.download = `${fileName}.${fileExt}`;
                        link.href = img.src;
                        link.click();
                    };
                }
            };
        }
    } catch (e) { 
        console.error("Decode failed", e);
        document.getElementById('statusText').innerText = "Failed to decode image data.";
    }
}

function copyURL() {
    const val = document.getElementById('urlOutput').value;
    navigator.clipboard.writeText(val).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
}

// 페이지 로드 시 인덱스 페이지인지 뷰어 페이지인지 확인하여 실행
window.addEventListener('DOMContentLoaded', () => {
    // 뷰어 페이지(viewerImg 요소가 있는 경우)라면 디코딩 실행
    if (document.getElementById('viewerImg')) {
        runViewer();
    } else {
        // 업로드 페이지 로직
        const input = document.getElementById('imageInput');
        if (input) {
            input.onchange = (e) => handleFile(e.target.files[0]);

            window.addEventListener('dragover', (e) => {
                e.preventDefault();
                document.body.classList.add('drag-active');
            });

            window.addEventListener('dragleave', (e) => {
                e.preventDefault();
                if (e.relatedTarget === null) {
                    document.body.classList.remove('drag-active');
                }
            });

            window.addEventListener('drop', (e) => {
                e.preventDefault();
                document.body.classList.remove('drag-active');
                if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
            });
        }
    }
});

