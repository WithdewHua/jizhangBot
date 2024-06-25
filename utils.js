var axios = require('axios'); // Copyrigth by @miya0v0 
var mysql = require('mysql'); // Copyrigth by @miya0v0 
var adminId = [6267710310, 6027155874, 5369547957]

const request = axios.create({
    timeout: 60000,
    proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: 7890
    }
});
request('https://www.google.com').then(() => {
    console.log('网络正常');
}).catch(() => {
    console.log('网络异常');
})

var pool = mysql.createPool({
    port: 3306, //mysql端口
    user: 'root', //mysql用户名
    password: '123456', //mysql密码
    database: 'myzf', //mysql数据库
});

function query(sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {

                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}

function evaluateExpression(expression) {
    try {
        expression = expression.replace(/×/g, '*');
        const result = eval(expression);
        // 检查结果是否为有效数值
        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return null
        }
        return result;
    } catch (error) {
        return null;
    }
}

const caozuoshouce = `
<pre>1️⃣将机器人拉入群 </pre>
<pre>2️⃣输入开始执行初始化  </pre>
<pre>3️⃣添加操作人+@用户名）= 添加操作人  @前面加空格</pre>
<pre>4️⃣移除操作人+@用户名）= 移除操作人  @前面加空格</pre>
<pre>5️⃣设置汇率+值 = 设置汇率  </pre>
<pre>6️⃣z0 = 查询欧意实时价格  </pre>
<pre>7️⃣+0/-0 = 查询今/昨日账单  </pre>
<pre>8️⃣账单+日期：如账单2024-06-06 = 查询指定年月日账单  </pre>
<pre>9️⃣+/-数字：如+100/-100 = 入款  </pre>
<pre>🔟下发+/-数字u：如下发+100u/下发-100u = 按汇率下发  </pre>
<pre>1️⃣1️⃣开启计算 = 关闭计算器  </pre>
<pre>1️⃣2️⃣关闭计算 = 开启计算器  </pre>
计算功能默认开启

<code>
开始，添加操作人，移除操作人只能拉群人执行。
设置汇率，入款，下发，开关计算操作人可执行，
其余所有人都能执行
</code>

<b>提示：更改汇率时，请及时下发清账后再更改汇率！</b>
`


module.exports = {
    request,
    pool,
    adminId,
    caozuoshouce,
    evaluateExpression
}