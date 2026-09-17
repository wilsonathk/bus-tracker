async function searchBus() {
    const stopId = document.getElementById('stopId').value.trim();
    const resultDiv = document.getElementById('result');

    if (!stopId) {
        resultDiv.innerHTML = '<p class="error">请输入巴士站编号</p>';
        return;
    }

    resultDiv.innerHTML = '<p>查询中...</p>';

    // 1. 换用更稳定的 corsproxy.io 代理
    // 2. 使用 encodeURIComponent 确保特殊字符不会导致链接断裂
    const targetUrl = `https://rt.data.gov.hk/v2/transport/citybus/route-stop/${stopId}`;
    const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // 如果是 404，说明站号不存在；如果是其他，说明网络问题
            if (response.status === 404) {
                throw new Error('找不到该站号资料');
            }
            throw new Error(`伺服器错误: ${response.status}`);
        }

        const data = await response.json();

        // 检查数据是否为空
        if (!data || data.length === 0) {
            resultDiv.innerHTML = '<p>此站号下没有城巴/新巴路线资料。<br>提示：这可能是九巴站点，或者输入有误。</p>';
            return;
        }

        let html = '<ul class="bus-list">';
        // 只显示前 5 班车
        data.slice(0, 5).forEach(bus => {
            const route = bus.route || '未知路线';
            const dest = bus.dest_tc || '未知终点';
            // 计算预计时间（简单处理）
            const eta = bus.eta ? new Date(bus.eta).toLocaleTimeString() : '即将到达';

            html += `
                <li class="bus-item">
                    <span class="route-num">${route}</span>
                    <span class="dest">${dest}</span>
                    <span class="time">${eta}</span>
                </li>
            `;
        });
        html += '</ul>';

        resultDiv.innerHTML = html;

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<p class="error">查询失败: ${error.message}<br>提示：可能是网络拥堵，请稍后再试。</p>`;
    }
}
}
