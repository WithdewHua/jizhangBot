// 配置文件
module.exports = {
    // Telegram Bot 配置
    tgToken: '',  // 请填入你的 Telegram Bot Token
    adminId: 6027155874,
    
    // 环境配置
    isProd: 1,  // 1 为生产环境，0 为开发环境
    
    // 代理配置（开发环境使用）
    proxy: {
        url: 'http://127.0.0.1:7890',
        settings: {
            protocol: 'http',
            host: '127.0.0.1',
            port: 7890
        }
    },
    
    // 数据库配置
    database: {
        port: 3306,
        user: 'root',
        password: 'jizhangbot',
        database: 'jizhang'
    },
    
    // HTTP 请求配置
    request: {
        timeout: 60000
    }
};
