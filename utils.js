var axios = require('axios'); // Copyrigth by @miya0v0 
var mysql = require('mysql2'); // Copyrigth by @miya0v0 
const config = require('./config');

// 从配置文件获取配置
const { adminId, tgToken, isProd, proxy, database, request: requestConfig } = config;

const request = isProd ? axios.create({
    timeout: requestConfig.timeout,
}) : axios.create({
    timeout: requestConfig.timeout,
    proxy: proxy.settings
})

// 异步检查网络连接
async function checkNetwork() {
    try {
        await request.get('https://www.google.com');
        console.log('网络正常');
        return true;
    } catch (error) {
        console.log('网络异常:', error.message);
        return false;
    }
}

// 调用网络检查（使用正确的异步方式）
checkNetwork().catch(console.error);

var pool = mysql.createPool({
    port: database.port,
    user: database.user,
    password: database.password,
    database: database.database,
});

// 改进的查询函数，增加错误处理
function query(sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('数据库连接错误:', err);
                reject(err);
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        console.error('SQL查询错误:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    });
}

function evaluateExpression(expression) {
    try {
        // 安全的表达式验证
        const safeExpression = expression.replace(/×/g, '*');
        
        // 只允许数字、运算符和括号
        if (!/^[\d+\-*×/().\s]+$/.test(safeExpression)) {
            return null;
        }
        
        const result = eval(safeExpression);
        // 检查结果是否为有效数值
        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return null;
        }
        return result;
    } catch (error) {
        console.error('表达式计算错误:', error.message);
        return null;
    }
}

module.exports = {
    request,
    pool,
    query,
    adminId,
    evaluateExpression,
    isProd,
    tgToken,
    checkNetwork
};