const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const urlOutput = document.getElementById('urlOutput');

// 1. 이미지를 선택하면 실행
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        const base64String = reader.result;
        // 데이터 압축 (URL 길이를 줄이기 위함)
        const compressed = LZString.compressToEncodedURIComponent(base64String);
        
        // 현재 페이지 주소 뒤에 압축 데이터 붙이기
        const shareURL = window.location.origin + window.location.pathname + '#' + compressed;
        
        urlOutput.value = shareURL;
        preview.src = base64String;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

// 2. 페이지 로드 시 URL에 데이터가 있는지 확인
window.onload = () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        // 압축 해제 후 이미지 복구
        const decompressed = LZString.decompressFromEncodedURIComponent(hash);
        if (decompressed) {
            preview.src = decompressed;
            preview.style.display = 'block';
            urlOutput.value = window.location.href;
        }
    }
};

function copyURL() {
    urlOutput.select();
    document.execCommand('copy');
    alert('URL이 복사되었습니다!');
}
