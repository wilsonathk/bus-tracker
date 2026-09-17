async function searchBus() {
    const stopId = document.getElementById('stopId').value.trim();
    const resultDiv = document.getElementById('result');
    
    if (!stopId) {
        resultDiv.innerHTML = '<p class="error">請輸入巴士站編號</p>';
        return;
    }

    resultDiv.innerHTML = '<p>查詢中...</p>';

    // 使用城巴/新巴的公開 API (相對開放，不易被擋)
    // 注意：這裡使用的是 DATA.GOV.HK 的城巴資源
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://rt.data.gov.hk/v2/transport/citybus/route-stop/' + stopId)}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`伺服器錯誤: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            resultDiv.innerHTML = '<p>找不到該站點的資料，請確認站號是否正確 (此工具目前支援城巴/新巴站號)。</p>';
            return;
        }

        let html = '';
        // 顯示前 5 班車
        data.slice(0, 5).forEach(bus => {
            const route = bus.route || '未知路線';
            const dest = bus.dest_tc || '未知方向';
            const eta = bus.eta ? new Date(bus.eta).toLocaleTimeString() : '即將到達';
            
            html += `
                <div class="bus-item">
                    <strong>路線: ${route}</strong> (${dest})<br>
                    預計到達: ${eta}
                </div>
            `;
        });

        resultDiv.innerHTML = html;

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<p class="error">查詢失敗: ${error.message}<br>提示：可能是 CORS 限制或站號不屬於城巴系統。</p>`;
    }
}
