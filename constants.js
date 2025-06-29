// 常量配置文件
module.exports = {
    // 操作手册
    caozuoshouce: `
<pre>1️⃣ 将机器人拉入群 </pre>
<pre>2️⃣ 输入开始执行初始化  </pre>
<pre>3️⃣ 添加操作人+@用户名）= 添加操作人  @前面加空格</pre>
<pre>4️⃣ 移除操作人+@用户名）= 移除操作人  @前面加空格</pre>
<pre>5️⃣ 设置汇率+值 = 设置汇率  </pre>
<pre>6️⃣ z0 = 查询欧意实时价格  </pre>
<pre>7️⃣ +0/-0 = 查询今/昨日账单  </pre>
<pre>8️⃣ 账单+日期：如账单2024-06-06 = 查询指定年月日账单  </pre>
<pre>9️⃣ +/-数字：如 +100/-100 = 入款  </pre>
<pre>🔟 下发+/-数字u：如下发+100u/下发-100u = 按汇率下发  </pre>
<pre>1️⃣1️⃣ 开启/关闭计算 = 开启/关闭计算器  </pre>
<pre>1️⃣2️⃣ 上课/下课 = 解除/开启禁言  </pre>
<pre>1️⃣3️⃣ 显示汇率 = 查看当前汇率  </pre>
<pre>1️⃣4️⃣ 显示操作人 = 查看当前所有操作人  </pre>

计算功能默认开启

<code>
开始，添加操作人，移除操作人只能拉群人执行。
设置汇率，入款，下发，开关计算操作人可执行，
其余所有人都能执行
</code>

<b>提示：更改汇率时，请及时下发清账后再更改汇率！</b>
`,

    // 键盘配置
    keyboard: [
        [{ text: '🚀开始使用' }, { text: "📕使用说明" }],
        [{ text: "🏦KK 支付导航", url: 'https://t.me/iKunPayNotify' }]
    ],

    // HTTP 请求头
    requestHeaders: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Priority': 'u=0, i',
        'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
    }
};
