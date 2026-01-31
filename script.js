const imageInput = document.getElementById('imageInput');
const urlOutput = document.getElementById('urlOutput');
const preview = document.getElementById('preview');
const resultArea = document.getElementById('resultArea');
const viewerImg = document.getElementById('viewerImg');
const statusText = document.getElementById('statusText');
const toast = document.getElementById('toast');

// 업로드 로직
if (imageInput) {
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 스마트 스케일링 (해상도 유지 정책)
                const MAX_SIZE = 1700; 
                let width = img.width;
                let height = img.height;

                if (width > MAX_SIZE || height > MAX_SIZE) {
                    const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                // 선명도 최적화 설정
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height); 

                // [핵심] JPEG 대신 WebP 사용, 화질은 0.85 정도로 타협 (육안상 무손실 수준)
                // 1.0은 데이터 팽창이 너무 심하므로 0.85~0.9를 강력 추천합니다.
                let optimizedData = canvas.toDataURL('image/webp', 0.85);

                // 만약 브라우저가 WebP를 지원하지 않으면 JPEG로 백업
                if (optimizedData.length < 100) {
                    optimizedData = canvas.toDataURL('image/jpeg', 0.85);
                }

                const compressed = LZString.compressToEncodedURIComponent(optimizedData);
                
                // UI 업데이트 로직
                const currentURL = window.location.href.split('#')[0];
                const directory = currentURL.substring(0, currentURL.lastIndexOf('/'));
                
                urlOutput.value = directory + '/view.html#' + compressed;
                preview.src = optimizedData;
                resultArea.style.display = 'block';
            };
        };
    });
}

// Viewer Logic Update
if (viewerImg) {
    const decode = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            try {
                const data = LZString.decompressFromEncodedURIComponent(hash);
                if (data) {
                    viewerImg.src = data;
                    viewerImg.style.display = 'block';
                    if (statusText) statusText.style.display = 'none';
                }
            } catch (e) {
                if (statusText) statusText.innerText = "Error: Failed to decode image.";
            }
        }
    };
    window.onload = decode;
    viewerImg.onclick = () => viewerImg.classList.toggle('zoomed');
}


// 복사 함수 (토스트 알림)
function copyURL() {
    if (!urlOutput.value) return;
    navigator.clipboard.writeText(urlOutput.value).then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
}